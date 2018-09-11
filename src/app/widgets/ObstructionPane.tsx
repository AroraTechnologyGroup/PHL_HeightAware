/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../node_modules/gl-matrix-ts/dist/index.d.ts" />
/// <reference path="../../../node_modules/gl-matrix-ts/dist/mat4.d.ts" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />
/// <reference path="../../../node_modules/@types/dojo/index.d.ts" />
/// <reference path="../../../node_modules/@types/gl-matrix/index.d.ts" />


import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import Collection =  require("esri/core/Collection");
import FeatureSet = require("esri/tasks/support/FeatureSet");

import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as PopupTemplate from "esri/PopupTemplate";
import * as IdentifyTask from "esri/tasks/IdentifyTask";
import * as IdentifyResult from "esri/tasks/support/IdentifyResult";
import * as IdentifyParameters from "esri/tasks/support/IdentifyParameters";
import * as Point from "esri/geometry/Point";
import * as Polygon from "esri/geometry/Polygon";
import * as Polyline from "esri/geometry/Polyline";
import * as LabelClass from  "esri/layers/support/LabelClass";
import * as geometryEngine from "esri/geometry/geometryEngine";
import * as SpatialReference from "esri/geometry/SpatialReference";
import * as Graphic from "esri/Graphic";
import * as PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import * as Query from "esri/tasks/support/Query";
import * as GraphicsLayer from "esri/layers/GraphicsLayer";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as FeatureLayerView from "esri/views/layers/FeatureLayerView";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as SimpleRenderer from "esri/renderers/SimpleRenderer";
import * as PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import * as on from "dojo/on";
import * as dom from "dojo/dom";
import * as Deferred from "dojo/Deferred";
import * as query from "dojo/query";
import * as Array from "dojo/_base/array";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as domAttr from "dojo/dom-attr";
import * as all from "dojo/promise/all";
import * as watchUtils from "esri/core/watchUtils";

import ObstructionViewModel, { ObstructionParams } from "./viewModels/ObstructionViewModel";
interface PanelProperties extends ObstructionParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";
import { calculateW } from "gl-matrix-ts/dist/quat";

interface LayerResultsModel {
    displayFieldName: string; 
    features: [Graphic];
}

interface LayerVisibilityModel {
    id: string;
    def_visible: boolean;
    def_exp: string;
}

// this map service is only used to query elevations from surface rasters
const CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/MapServer";
const idTask = new IdentifyTask({
    url: CEPCT
});
const idParams = new IdentifyParameters();
idParams.tolerance = 1;
idParams.returnGeometry = true;
idParams.layerOption = "all";

const sr = new SpatialReference({
    wkid: 2272
});

const intersectionMarker = {
    type: "web-style",  // autocasts as new WebStyleSymbol()
    styleName: "EsriThematicShapesStyle",
    name: "Centered Sphere"
};

const intersectionGraphic = new Graphic({
    symbol: intersectionMarker
});

const intersectionLabelClass = new LabelClass({
    labelExpressionInfo: { expression: "$feature.surfaceName" },
    labelPlacement: "right",
    symbol: {
      type: "text",  // autocasts as new TextSymbol()
      color: "black",
      haloSize: 1,
      haloColor: "white"
    }
  });

const intersection_layer = new FeatureLayer({
    id: "surface_intersection",
    title: "Surface Intersection Point",
    visible: false,
    fields: [
    {
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
    },
    {
        name: "surfaceName",
        alias: "Surface Name",
        type: "text"
    }
    ],
    objectIdField: "ObjectID",
    geometryType: "point",
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    source: [],
    legendEnabled: false,
    renderer: {
        type: "simple",
        symbol: intersectionMarker
    },
    labelingInfo: [intersectionLabelClass],
    labelsVisible: true,
    popupEnabled: true
});

const pointerTracker = new Graphic({
    symbol: {
        type: "point-3d",  // autocasts as new PointSymbol3D()
        symbolLayers: [{
          type: "object",  // autocasts as new ObjectSymbol3DLayer()
          width: 50,    // diameter of the object from east to west in meters
          height: 50,  // height of object in meters
          depth: 50,   // diameter of the object from north to south in meters
          resource: { primitive: "cube" },
          material: { color: "red" }
        }],
        verticalOffset: {
            screenLength: "124px",
            maxWorldLength: 1000,
            minWorldLength: 250
        },
        callout: {
            type: "line",  // autocasts as new LineCallout3D()
            size: 1.5,
            color: [150, 150, 150],
            border: {
              color: [50, 50, 50]
            }
          }
    }
});		

const obstruction_base =  new FeatureLayer({
    id: "obstruction_base",
    title: "Placed Obstruction",
    opacity: .50,
    fields: [
    {
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
    }, {
        name: "baseElevation",
        alias: "Base Elevation",
        type: "double"
    }, {
        name: "obstacleHeight",
        alias: "Obstacle Height",
        type: "double"
    }],
    objectIdField: "ObjectID",
    geometryType: "polygon",
    spatialReference: sr,
    elevationInfo: {
        mode: "on-the-ground"
    },
    source: [],
    legendEnabled: false,
    // listMode: "hide",
    renderer: new SimpleRenderer({
        symbol: new PolygonSymbol3D({
            symbolLayers: [{
                type: "extrude",
                width: 5,
                depth: 5,
                resource: {primitive: "cylinder"},
                material: { color: "blue" }
                }]
        }),
        visualVariables: [{
            type: "size",
            field: "obstacleHeight",
            valueUnit: "feet"
        }]
    })
});

@subclass("app.widgets.obstructionPane")
export class ObstructionPane extends declared(Widget) {
    @property() viewModel = new ObstructionViewModel();
    
    @renderable()
    @property() name = "Obstruction Placement";

    @property()
    @renderable() activated = false;

    @property() layer_visibility: [LayerVisibilityModel];

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    get status(): string {
        let d: string;
        if (this.activated) {
            d = "Activated";
        } else {
            d = "Activate";
        }
        return d;
    }

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    private activate(event: any): void {
        // when clicking the Activate button perform this method
        this.activated = true;
        const crit_3d = this.scene.findLayerById("critical_3d") as GroupLayer;
        const part77 = this.scene.findLayerById("part_77_group") as GroupLayer;
        const crit_2d = this.scene.findLayerById("critical_2d_surfaces") as FeatureLayer;
        const intersect_points = this.scene.findLayerById("surface_intersection") as FeatureLayer;

        if (crit_3d) {
            crit_3d.visible = false;
        }
        if (part77) {
            part77.visible = false;
        }
        if (intersect_points) {
            intersect_points.source.removeAll();
            this.scene.remove(intersect_points);
        }        
        if (crit_2d) {
            crit_2d.visible = false;
            crit_2d.definitionExpression = "OBJECTID IS NULL";
        }

        const ground_node: HTMLInputElement = dom.byId("groundLevel") as HTMLInputElement;
        const northing_node: HTMLInputElement = dom.byId("northing") as HTMLInputElement;
        const easting_node: HTMLInputElement = dom.byId("easting") as HTMLInputElement;
        const obsHeight_node: HTMLInputElement = dom.byId("obsHeight") as HTMLInputElement;

        const mouse_track = this.view.on("pointer-move", (e) => {
            let map_pnt = this.view.toMap({
                x: e.x,
                y: e.y
            });
            const graphic = pointerTracker.clone();
            graphic.geometry = map_pnt;
            this.view.graphics.removeAll();
            this.view.graphics.push(graphic);

            if (map_pnt) {
                this.scene.ground.queryElevation(map_pnt).then(function(result: any) {
                    const x = result.geometry.x;
                    const y = result.geometry.y;
                    const z = result.geometry.z;
                    ground_node.value = z.toFixed(1);
                    northing_node.value = y.toFixed(3);
                    easting_node.value = x.toFixed(3);
                });
            }
        });

        const view_click = this.view.on("click", (e) => {
            this.activated = false;
            e.stopPropagation();
             // Make sure that there is a valid latitude/longitude
            if (e && e.mapPoint) {
                // the values needed for the query are already populated into the OAP through on-move event
                if (mouse_track) {
                    mouse_track.remove();
                    this.view.graphics.removeAll();
                }
                view_click.remove();
                //we are clearing the move values with the clicked point
                this.submit(e.mapPoint);
            }
        });
    }

    private submit(point: Point) {
        const main_deferred = new Deferred();
        const obsHeight = dom.byId("obsHeight") as HTMLInputElement;
        const groundLevel = dom.byId("groundLevel") as HTMLInputElement;
        const northingNode = dom.byId("northing") as HTMLInputElement;
        const eastingNode = dom.byId("easting") as HTMLInputElement;
        // set the panel values from the passed in point
        groundLevel.value = point.z.toFixed(1);
        northingNode.value = point.y.toFixed(3);
        eastingNode.value = point.x.toFixed(3);

        let height = parseFloat(obsHeight.value);
        if (!height) {
            // calculate default height as the intersection height with the horizontal surface
            height = 200 - Number(groundLevel.value);
            obsHeight.value = height.toFixed(2);
        }
        const z = parseFloat(groundLevel.value);
        const y = parseFloat(northingNode.value);
        const x = parseFloat(eastingNode.value);
        this.performQuery(x, y, z, height).then((graphic) => {
            main_deferred.resolve(graphic);
        });
        return main_deferred.promise;
    }

    private submitPanel(event: MouseEvent) {
        const obsHeight = dom.byId("obsHeight") as HTMLInputElement;
        const groundLevel = dom.byId("groundLevel") as HTMLInputElement;
        const northingNode = dom.byId("northing") as HTMLInputElement;
        const eastingNode = dom.byId("easting") as HTMLInputElement;


        // get the point location from the vertical feature and reapply to panel
        const panelPoint = new Point({
            x: parseFloat(eastingNode.value),
            y: parseFloat(northingNode.value),
            z: parseFloat(groundLevel.value),
            spatialReference: sr
        });
        this.submit(panelPoint);
    }

    private performQuery(_x: number, _y: number, _z: number, _height: number) {
        // create graphic and add to the obstruction base layer
        const main_deferred = new Deferred();
        const pnt = new Point({
            x: _x,
            y: _y,
            z: _z,
            spatialReference: sr
        });

        const ptBuff = geometryEngine.buffer(pnt, 25, "feet") as Polygon;
        // add ground elevation and the obstacle height to get peak height in absolute elevation
        const peak = _z + _height;
        const graphic = new Graphic();
        graphic.attributes = {
            "ObjectID": 0,
            "baseElevation": _z,
            "obstacleHeight": peak
        };
        graphic.geometry = ptBuff;
        graphic.geometry.spatialReference = sr;

        // this peak is for creating a vertical, the x -y  is slightly offset to prevent a vertical line
        // the Geometry layers are not honoring units of feet with absolute height
        const line = new Polyline({
            paths: [[
                [_x, _y, _z],
                [_x + 1, _y + 1, peak]
            ]],
            spatialReference: sr,
            hasZ: true
        });

        obstruction_base.source.removeAll();
        obstruction_base.source.add(graphic);
        this.scene.add(obstruction_base);
        this.scene.add(intersection_layer);

        const promise = this.doIdentify(_x, _y);
        promise.then((response: [IdentifyResult]) => {
            if (response) {
                this.addToMap(response);
            } else {
                console.log("No results from server :: " + response);
            }
        });

        this.querySurfaces(line).then(() => {
            this.view.whenLayerView(obstruction_base).then((lyrView: FeatureLayerView) => {
                lyrView.highlight(graphic);
                this.view.goTo(graphic.geometry.extent.center);
                this.setDefaultLayerVisibility();
                main_deferred.resolve(graphic);
            });
        });

        return main_deferred.promise;

    }

    private querySurfaces(vertical_line: Polyline) {
        const map = this.scene;
        const main_deferred = new Deferred();
        const first = new Deferred();
        const second = new Deferred();
        const third = new Deferred();

        const crit_3d = map.findLayerById("critical_3d") as GroupLayer;
        const crid_3d_layers: Collection = crit_3d.layers as Collection<FeatureLayer>;
        const part77 = map.findLayerById("part_77_group") as GroupLayer;
        const part77_layers: Collection = part77.layers as Collection<FeatureLayer>;

        // query the 2d surface feature layer within the group layer
        const crit_2d_layer = map.findLayerById("runwayhelipaddesignsurface") as FeatureLayer;
        
        function isFalse(element: any, index: number, array: []) {
            if (!element) {
                return true;
            } else {
                return false;
            }
        }

        const query = new Query({
            geometry: vertical_line,
            units: "feet",
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
            returnZ: true
        });

        const viz = Array.map(crid_3d_layers.items, (lyr: FeatureLayer) => {
            const deferred = new Deferred();
            lyr.queryFeatures(query).then((e: FeatureSet) => {
                // this initial query returns all features that interect in 2d
                if (e.features.length) {
                    // iterate through each geometry and get the oid if it intersect the vertical geomtery in 3d
                    this.filterSurfaces3D(e, vertical_line).then((oids: number[]) => {
                        if (oids.length > 1) {
                            lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                        } else if (oids.length === 1 && oids[0] !== undefined) {
                            lyr.definitionExpression = "OBJECTID = " + oids[0];
                        } else {
                            lyr.definitionExpression = "OBJECTID IS NULL";
                        }
                        deferred.resolve(oids);
                    }, (err) => {
                        console.log(err);
                        deferred.resolve(false);
                    });
                } else {
                    lyr.definitionExpression = "OBJECTID IS NULL";
                    deferred.resolve(false);
                }
            }, (err) => {
                console.log(err);
                deferred.resolve(false);
            });
            return deferred.promise;
        });

        all(viz).then(function(e: []) {
            if (e.every(isFalse)) {
                crit_3d.visible = false;
                first.resolve(false);
            } else {
                crit_3d.visible = true;
                first.resolve(true);
            }
            
        });
        
        const viz2 = Array.map(part77_layers.items, (lyr: FeatureLayer) => {
            const deferred = new Deferred();
            lyr.queryFeatures(query).then((e: FeatureSet) => {
                if (e.features.length) {
                    this.filterSurfaces3D(e, vertical_line).then((oids: number[]) => {
                        if (oids) {
                            if (oids.length > 1) {
                                lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                            } else if (oids.length === 1 && oids[0] !== undefined) {
                                lyr.definitionExpression = "OBJECTID = " + oids[0];
                            } else {
                                lyr.definitionExpression = "OBJECTID IS NULL";
                            }
                            deferred.resolve(oids);
                        } else {
                            lyr.definitionExpression = "OBJECTID IS NULL";
                            deferred.resolve(false);
                        }
                    }, (err) => {
                        console.log(err);
                        deferred.resolve(false);
                    });
                } else {
                    lyr.definitionExpression = "OBJECTID IS NULL";
                    deferred.resolve(false);
                }
            }, (err) => {
                console.log(err);
                deferred.resolve(false);
            });
            return deferred.promise;
        });

        all(viz2).then((e: []) => {
            if (e.every(isFalse)) {
                part77.visible = false;
                second.resolve(false);
            } else {
                part77.visible = true;
                second.resolve(true);
            }
            
        });

        
        crit_2d_layer.queryFeatures(query).then((e: FeatureSet) => {
            if (e.features.length) {
                const oids = e.features.map((obj) => {
                    return obj.attributes.OBJECTID;
                });
                crit_2d_layer.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                crit_2d_layer.visible = true;
                third.resolve(true);
            } else {
                crit_2d_layer.definitionExpression = "OBJECTID IS NULL";
                crit_2d_layer.visible = false;
                third.resolve(false);
            }
        }, (err) => {
            console.log(err);
            crit_2d_layer.visible = false;
            third.resolve(false);
        });

        all([first, second, third]).then((e: boolean[]) => {
            if (e[0] || e[1] || e[2]) {
                main_deferred.resolve(true);
            } else {
                main_deferred.resolve(false);
            }  
        });
        return main_deferred.promise;
    }

    private getIntersectionPoint(_polygon: Graphic, _line: Polyline) {
        const peak_height = _line.paths[0][1][2];
        const poly_geo = _polygon.geometry as Polygon;
        const base_point = new Point({
            x: _line.paths[0][0][0],
            y: _line.paths[0][0][1],
            spatialReference: sr
        });

        if (geometryEngine.intersects(poly_geo, base_point)) {
            // deferred.resolve(_polygon.attributes["OBJECTID"]);
            // get a flat array of 3 non-collinear points in the polygon
            // we will use these points for the plane equation
            // !! need to determine if the basepoint intersects the triangle created by the three points
            const planePoints = this.getNonCollinearPoints(poly_geo);

            //get a flat array of 2 points that define the line
            const linePoints = [].concat.apply([], _line.paths[0]);

            // return intersection of the plane and line
            if (planePoints) {
                return this.intersect(planePoints, linePoints);
            } else {
                console.error("Polygon ", poly_geo, "doesn't have non-collinear points.");
            }
        }
        return null;
    }

    private intersect(planePoints: number[], linePoints: number[]) {
        // 3 points defining the plane
        const x1 = planePoints[0];
        const y1 = planePoints[1];
        const z1 = planePoints[2];
        const x2 = planePoints[3];
        const y2 = planePoints[4]; 
        const z2 = planePoints[5];
        const x3 = planePoints[6];
        const y3 = planePoints[7]; 
        const z3 = planePoints[8];

        // 2 points defining the line
        const x4 = linePoints[0];
        const y4 = linePoints[1];
        const z4 = linePoints[2];
        const x5 = linePoints[3];
        const y5 = linePoints[4];
        const z5 = linePoints[5];

        // calculate intersection based on http://mathworld.wolfram.com/Line-PlaneIntersection.html
        const mat1 = mat4.fromValues(1, 1, 1, 1, x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4);
        const mat2 = mat4.fromValues(1, 1, 1, 0, x1, x2, x3, x5 - x4, y1, y2, y3, y5 - y4, z1, z2, z3, z5 - z4);
        const det1 = mat4.determinant(mat1);
        const det2 = mat4.determinant(mat2);

        if (det2 !== 0) {
            const t = - det1 / det2;
            const intersectionPoint = {
                x: x4 + (x5 - x4) * t,
                y: y4 + (y5 - y4) * t,
                z: z4 + (z5 - z4) * t
            };
            return intersectionPoint;
        }
        return null;
    }

    private getNonCollinearPoints(_polygon: Polygon) {
        // set the first two non-collinear points in the polygon
        try {
            const x1: any = _polygon.rings[0][0][0];
            const y1: any = _polygon.rings[0][0][1];
            const z1: any = _polygon.rings[0][0][2];

            const x2: any = _polygon.rings[0][1][0];
            const y2: any = _polygon.rings[0][1][1];
            const z2: any = _polygon.rings[0][1][2];
            
            // find the third non-collinear point in the polygon
            for (let i = 2; i <= _polygon.rings[0].length; i++) {
                let x3: any = _polygon.rings[0][i][0];
                let y3: any = _polygon.rings[0][i][1];
                let z3: any = _polygon.rings[0][i][2];
                if ((x3 - x1) / (x2 - x1) !== (y3 - y1) / (y2 - y1) || (x3 - x1) / (x2 - x1) !== (z3 - z1) / (z2 - z1)) {
                    return [x1, y1, z1, x2, y2, z2, x3, y3, z3];
                }
            }
        } catch (e) {
                console.log(e);
            }
        return null;
    }

    private filterSurfaces3D(_graphics: FeatureSet, _line: Polyline) {
        // return a promise with an array of oids
        const main_deferred = new Deferred();
        const height = _line.paths[0][1][2];
        const oids = Array.map(_graphics.features, (e: Graphic) => {
            const deferred = new Deferred();
            const intersectionPoint = this.getIntersectionPoint(e, _line);
            
            // if a point is returned, check that point is on the line
            if (intersectionPoint && intersectionPoint.z <= height) {
                // add the intersection Point to the map and return the object id
                const interectGraph: Graphic = intersectionGraphic.clone();
                const inPoint = new Point(intersectionPoint);
                inPoint.spatialReference = sr;
                interectGraph.geometry = inPoint;
                interectGraph.attributes = {
                    surfaceName: e.attributes.Layer
                };
                intersection_layer.source.add(interectGraph);

                deferred.resolve(e.attributes.OBJECTID);
                
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        });

        all(oids).then(function(list) {
            main_deferred.resolve(list);
        });

        return main_deferred.promise;
    }

    private doIdentify(x: number, y: number) {
        const map = this.scene;
        const view = this.view;
        const deferred = new Deferred();
        const x_coord = x;
        const y_coord = y;

        // a vertical line gets passed as the query geometry
        const vert_line = new Polyline({
            spatialReference: sr,
            hasZ: true,
            paths: [[
                [x_coord, y_coord, 0],
                [x_coord, y_coord, 1000]
            ]]
        });

        idParams.mapExtent = view.extent;
        idParams.geometry = new Point({
            x: x_coord,
            y: y_coord,
            spatialReference: sr
        });

        idTask.execute(idParams).then((response: any) => {
            const results: [IdentifyResult] = response.results;
            console.log(results);
            deferred.resolve(results);
        }, function(err) {
            console.log(err);
        });

        return deferred.promise;
    }

    private addToMap(_result: [IdentifyResult]) {
        const map = this.scene;
        const view = this.view;
        const obst_height_node = dom.byId("obsHeight") as HTMLInputElement;
        const ground_elev_node = dom.byId("groundLevel") as HTMLInputElement;
        const obst_height = parseFloat(obst_height_node.value);
        let groundElev = parseFloat(ground_elev_node.value);

        let features_3d = [];
        let features_2d = [];
        for (let i = 0, il = _result.length; i < il; i++) {
            const idResult = _result[i];
            let whichRaster;
            let b;
            let bl;

            // The layerId refers to the index of the layers within the MapServer.  Consult the REST Endpoint for descriptions as to which layer each index represents
            if ([1, 2, 3, 4, 6, 7, 8].indexOf(idResult.layerId) !== -1) {
                // layer is a 3D surface from the Obstruction ID Surface Feature Class
                const name = idResult.feature.attributes.Name;
                const rnwy_designator = idResult.feature.attributes["Runway Designator"].replace("/", "_"); 
                const objectID = idResult.feature.attributes.OBJECTID;
                const feat = idResult.feature.clone();

                // assigning the layer allows highlighting after results are rendered
                feat.attributes.layerName = idResult.layerName;
                // assigning Elevation from surface raster allows calculating clearance
                feat.attributes.Elev = undefined;

                // locate the raster that corresponds to the NAME_RunwayDesignator_OID
                whichRaster = `${name}_${rnwy_designator}_${objectID}`;
                for (b = 0, bl = _result.length; b < bl; b++) {
                    if (_result[b].layerName === whichRaster) {
                        // the elevation from the raster is added as an attribute to the cloned object returned
                        const pixel_value = _result[b].feature.attributes["Pixel Value"];
                        const point_elev = parseFloat(pixel_value).toFixed(1);
                        feat.attributes.Elev = parseFloat(point_elev); 
                        features_3d.push(feat);
                    }
                }
            }
            
            if ([10, 11].indexOf(idResult.layerId) !== -1) {
                // layer is a 2D surface from the Runway Helipad Design Group Feature Class
                const feat = idResult.feature.clone();
                feat.attributes.layerName = idResult.layerName;
                features_2d.push(feat);
            }

            if (idResult.layerId === 86) {
                // layer is the ground DEM provided by PHL
                groundElev = parseFloat(parseFloat(idResult.feature.attributes["Pixel Value"]).toFixed(1));
            }
        }

        let Results3d = {
            displayFieldName: "Name",
            features: features_3d
        } as LayerResultsModel;

        let Results2d = {
            displayFieldName: "Name",
            features: features_2d
        } as LayerResultsModel;

        const idParams_geo = idParams.geometry as Point;
        const x_value = idParams_geo.x;
        const y_value = idParams_geo.y;

      
        view.popup.content = this.buildPopup(Results3d, Results2d, groundElev, obst_height, x_value, y_value);

        view.popup.title = "Obstruction Analysis Results";
        
        view.popup.open();
       
    }

    private buildPopup(layerResults3d: LayerResultsModel, layerResults2d: LayerResultsModel, base_height: number, peak_height: number, x: number, y: number) {
    
        let obsHt = 0;
        if (peak_height) {
            obsHt = peak_height;
        }
        const features3D: [Graphic] = layerResults3d.features;
        const features2D: [Graphic] = layerResults2d.features;
        
        const popup_container = domConstruct.create("div");
        const summary_content = domConstruct.toDom("<b>x:</b> " + x.toFixed(3) + " <b>y:</b> " + y.toFixed(3) + "<br><b>Ground Elevation:</b> " + base_height + " feet MSL<br><b>Obstruction Height: </b>" + obsHt + " feet<br>");
        domConstruct.place(summary_content, popup_container);

        const tab_div = domConstruct.create("div", {class: "trailer-2 js-tab-group"});
        const nav_group = domConstruct.create("nav", {class: "tab-nav"});

        const link3D = domConstruct.create("a", {id: "3d_tab", class: "tab-title is-active js-tab", innerHTML: `3D Surfaces (${features3D.length})`});
        const link2D = domConstruct.create("a", {id: "2d_tab", class: "tab-title js-tab", innerHTML: `2D Surfaces (${features2D.length})`});
        const tab_content = domConstruct.create("section", {class: "tab-contents"});
        const article1 = domConstruct.create("article", {id: "results3d", class: "results_panel tab-section js-tab-section is-active"});
        const article2 = domConstruct.create("article", {id: "results2d", class: "results_panel tab-section js-tab-section"});
        const article1_meta = domConstruct.create("article", {id: "results3d_meta", class: "results_panel-meta tab-section js-tab-section"});
        const article2_meta = domConstruct.create("article", {id: "results2d_meta", class: "results_panel-meta tab-section js-tab-section"});
        
        on(link3D, "click", (evt) => {
            if (!domClass.contains(link3D, "is-active")) {
                domClass.add(link3D, "is-active");
                domClass.add(article1, "is-active");
                domClass.add(article1_meta, "is-active");
                domClass.remove(link2D, "is-active");
                domClass.remove(article2, "is-active");
                domClass.remove(article2_meta, "is-active");
            }
        });

        on(link2D, "click", (evt) => {
            if (!domClass.contains(link2D, "is-active")) {
                domClass.add(link2D, "is-active");
                domClass.add(article2, "is-active");
                domClass.add(article2_meta, "is-active");
                domClass.remove(link3D, "is-active");
                domClass.remove(article1, "is-active");
                domClass.remove(article1_meta, "is-active");
            }
        });

        domConstruct.place(article1, tab_content);
        domConstruct.place(article1_meta, tab_content);
        domConstruct.place(article2, tab_content);
        domConstruct.place(article2_meta, tab_content);
        domConstruct.place(link3D, nav_group);
        domConstruct.place(link2D, nav_group);
        domConstruct.place(nav_group, tab_div);
        domConstruct.place(tab_content, tab_div);
        domConstruct.place(tab_div, popup_container);

        const table3D = this.generateResultsGrid3D(layerResults3d, base_height, peak_height);
        domConstruct.place(table3D, article1);

        const table2D = this.generateResultsGrid2D(layerResults2d);
        domConstruct.place(table2D, article2);
        return popup_container;
    }

    private generateResultsGrid3D(layerResults3d: LayerResultsModel, base_height: number, peak_height: number) {
        const features3D: [Graphic] = layerResults3d.features;
      
        const div_wrapper = domConstruct.create("div", {class: "overflow-auto"});

        const table3D = domConstruct.create("table", {class: "table"});
        const thead = domConstruct.create("thead");
        const header_row = domConstruct.create("tr");
        
        const h1 = domConstruct.create("th", {innerHTML: "Clearance (+ / - ft.)", class: "data-field"});
        const h2 = domConstruct.create("th", {innerHTML: "Surface Name", class: "data-field"});
        const h3 = domConstruct.create("th", {innerHTML: "Type", class: "data-field"});
        const h4 = domConstruct.create("th", {innerHTML: "Condition", class: "data-field"});
        const h5 = domConstruct.create("th", {innerHTML: "Runway", class: "data-field"});
        const h6 = domConstruct.create("th", {innerHTML: "Elevation Above Sea Level (ft.)", class: "data-field"});
        const h7 = domConstruct.create("th", {innerHTML: "Height Above Ground (ft.)", class: "data-field"});
        
        domConstruct.place(h1, header_row);
        domConstruct.place(h2, header_row);
        domConstruct.place(h3, header_row);
        domConstruct.place(h4, header_row);
        domConstruct.place(h5, header_row);
        domConstruct.place(h6, header_row);
        domConstruct.place(h7, header_row);
        domConstruct.place(header_row, thead);
        domConstruct.place(thead, table3D);

        const tbody = domConstruct.create("tbody");
        const array3D = this.create3DArray(features3D, base_height, peak_height);
      
        array3D.forEach((obj) => {
            const tr = domConstruct.create("tr");
            // set the layer name as a data attribute on the domNode
            domAttr.set(tr, "data-layername", obj.layerName);
            const td = domConstruct.create("td", {innerHTML: obj.clearance, class: "data-field"});
            const td2 = domConstruct.create("td", {innerHTML: obj.surface, class: "data-field"});
            const td3 = domConstruct.create("td", {innerHTML: obj.type, class: "data-field"});
            const td4 = domConstruct.create("td", {innerHTML: obj.condition, class: "data-field"});
            const td5 = domConstruct.create("td", {innerHTML: obj.runway, class: "data-field"});
            const td6 = domConstruct.create("td", {innerHTML: obj.elevation, class: "data-field"});
            const td7 = domConstruct.create("td", {innerHTML: obj.height, class: "data-field"});
            
            if (obj.clearance <= 0) {
                domClass.add(td, "negative");
            }
            domConstruct.place(td, tr);
            domConstruct.place(td2, tr);
            domConstruct.place(td3, tr);
            domConstruct.place(td4, tr);
            domConstruct.place(td5, tr);
            domConstruct.place(td6, tr);
            domConstruct.place(td7, tr);
          
            // when hovering over row, set single feature visible hide other layers
            on(tr, "mouseover", (evt) => {
                const layerName = domAttr.get(evt.currentTarget, "data-layername");
                const layerID = layerName.toLowerCase().replace(" ", "_");
                const target_layer = this.scene.findLayerById(layerID) as FeatureLayer;
                target_layer.definitionExpression = "OBJECTID = " + obj.oid; 
                this.setSingleLayerVisible(target_layer);
            });

            domConstruct.place(tr, tbody);

        });

        // when leaving the table, reset the layer visibility back to the default
        on(tbody, "mouseleave", (evt) => {
           this.getDefaultLayerVisibility();
        });

        domConstruct.place(tbody, table3D);
        domConstruct.place(table3D, div_wrapper);
        return div_wrapper;
    }

    private setSingleLayerVisible(visible_layer: FeatureLayer) {
        const part77_group = this.scene.findLayerById("part_77_group") as GroupLayer;
        const critical_3d = this.scene.findLayerById("critical_3d") as GroupLayer;
        visible_layer.visible = true;
        critical_3d.layers.forEach((lyr) => {
            if (lyr.id !== visible_layer.id) {
                lyr.visible = false;
            }
        });
        part77_group.layers.forEach((lyr) => {
            if (lyr.id !== visible_layer.id) {
                lyr.visible = false;
            }
        });
    }

    private generateMetaGrid3D(layerResults3d: LayerResultsModel, base_height: number, peak_height: number) {
        const features3D: [Graphic] = layerResults3d.features; 
        const div_wrapper = domConstruct.create("div", {class: "overflow-auto"});

        const table3D = domConstruct.create("table", {class: "table"});
        const thead = domConstruct.create("thead");
        const header_row = domConstruct.create("tr");
        const h1 = domConstruct.create("th", {innerHTML: "Clearance (+ / - ft.)", class: "data-field"});
        const h2 = domConstruct.create("th", {innerHTML: "Approach Guidance", class: "metadata-field"});
        const h3 = domConstruct.create("th", {innerHTML: "Date Acquired", class: "metadata-field"});
        const h4 = domConstruct.create("th", {innerHTML: "Description", class: "metadata-field"});
        const h5 = domConstruct.create("th", {innerHTML: "Safety Regulation", class: "metadata-field"});
        const h6 = domConstruct.create("th", {innerHTML: "Zone Use", class: "metadata-field"});
        domConstruct.place(h1, header_row);
        domConstruct.place(h2, header_row);
        domConstruct.place(h3, header_row);
        domConstruct.place(h4, header_row);
        domConstruct.place(h5, header_row);
        domConstruct.place(h6, header_row);
        const tbody = domConstruct.create("tbody");
        const array3D = this.create3DArray(features3D, base_height, peak_height);
        array3D.forEach((obj) => {
            const tr = domConstruct.create("tr");
            const td = domConstruct.create("td", {innerHTML: obj.clearance, class: "data-field"});
            const td2 = domConstruct.create("td", {innerHTML: obj.guidance, class: "metadata-field"});
            const td3 = domConstruct.create("td", {innerHTML: obj.date_acquired, class: "metadata-field"});
            const td4 = domConstruct.create("td", {innerHTML: obj.description, class: "metadata-field"});
            const td5 = domConstruct.create("td", {innerHTML: obj.regulation, class: "metadata-field"});
            const td6 = domConstruct.create("td", {innerHTML: obj.zone_use, class: "metadata-field"});
            if (obj.clearance <= 0) {
                domClass.add(td, "negative");
            }
            domConstruct.place(td, tr);
            domConstruct.place(td2, tr);
            domConstruct.place(td3, tr);
            domConstruct.place(td4, tr);
            domConstruct.place(td5, tr);
            domConstruct.place(td6, tr);
            // when hovering over row, highlight feature in the scene
            // on(tr, "mouseover", (evt) => {
            //     console.log(obj.layer);
            // });

            domConstruct.place(tr, tbody);
        });
        domConstruct.place(tbody, table3D);
        domConstruct.place(table3D, div_wrapper);
        return div_wrapper;
        
    }

    private generateResultsGrid2D(layerResults2d: LayerResultsModel) {
        const features2D: [Graphic] = layerResults2d.features;
        
        const table2D = domConstruct.create("table", {class: "table"});
        const thead = domConstruct.create("thead");
        const header_row = domConstruct.create("tr");
        const h1 = domConstruct.create("th", {innerHTML: "Surface Name"});
        const h2 = domConstruct.create("th", {innerHTML: "Description"});
        domConstruct.place(h1, header_row);
        domConstruct.place(h2, header_row);
        domConstruct.place(header_row, thead);
        domConstruct.place(thead, table2D);

        const tbody = domConstruct.create("tbody");
        const array2D = this.create2DArray(features2D);

        let highlight: any;
        array2D.forEach((obj) => {
            const tr = domConstruct.create("tr");
            // set the layer name as a data attribute on the domNode
            domAttr.set(tr, "data-layername", obj.layerName);

            const td = domConstruct.create("td", {innerHTML: obj.name});
            const td2 = domConstruct.create("td", {innerHTML: obj.description});
            domConstruct.place(td, tr);
            domConstruct.place(td2, tr);
            domConstruct.place(tr, tbody);

            // when hovering over row, obtain the target layer and highlight the layer view
            on(tr, "mouseover", (evt) => {
                // use data-attributes to assign layer name to the dom node, then look up layer in scene to get layerView
                highlight = this.highlight2DRow(evt, obj, highlight);
            });
        });

        // when leaving the table, remove the highlight
        on(tbody, "mouseleave", (evt) => {
            if (highlight) {
                highlight.remove();
            }
        });

        domConstruct.place(tbody, table2D);

        return table2D;
    }

    private highlight2DRow(evt: any, _obj: any,  _highlight: any) {
        // use data-attributes to assign layer name to the dom node, then look up layer in scene to get layerView
        const layerName = domAttr.get(evt.currentTarget, "data-layername");
        const layerID = layerName.toLowerCase().replace(" ", "_");
        const target_layer = this.scene.findLayerById(layerID) as FeatureLayer;
        let highlight = _highlight;
        this.view.whenLayerView(target_layer).then((lyrView: FeatureLayerView) => {
            if (highlight) {
                highlight.remove();
            }
            highlight = lyrView.highlight(Number(_obj.oid));
        });
        return highlight;
    }

    private generateMetaGrid2D(layerResults2d: LayerResultsModel) {
        const features2D: [Graphic] = layerResults2d.features;
        const crit_2d_layer = this.scene.findLayerById("critical_2d_surfaces") as FeatureLayer;
        const aoa = this.scene.findLayerById("aoa") as FeatureLayer;

        const table2D = domConstruct.create("table", {class: "table"});
        const thead = domConstruct.create("thead");
        const header_row = domConstruct.create("tr");
        const h1 = domConstruct.create("th", {innerHTML: "Date Acquired"});
        const h2 = domConstruct.create("th", {innerHTML: "Data Source"});
        const h3 = domConstruct.create("th", {innerHTML: "Last Update"});
        domConstruct.place(h1, header_row);
        domConstruct.place(h2, header_row);
        domConstruct.place(h3, header_row);
        domConstruct.place(header_row, thead);
        domConstruct.place(thead, table2D);

        const tbody = domConstruct.create("tbody");
        const array2D = this.create2DArray(features2D);

        let highlight: any;
        array2D.forEach((obj) => {
            const tr = domConstruct.create("tr");
            const td = domConstruct.create("td", {innerHTML: obj.name});
            const td2 = domConstruct.create("td", {innerHTML: obj.description});
            domConstruct.place(td, tr);
            domConstruct.place(td2, tr);
            domConstruct.place(tr, tbody);

            // when hovering over row, highlight feature in the scene
            on(tr, "mouseover", (evt) => {
                highlight = this.highlight2DRow(evt, obj, highlight);
            });
        });

        // when leaving the table, remove the highlight
        on(tbody, "mouseleave", (evt) => {
            if (highlight) {
                highlight.remove();
            }
        });

        domConstruct.place(tbody, table2D);

        return table2D;

    }

    private create3DArray(features: [Graphic], base_height: number, obsHt: number) {
        // the features are an array of surface polygons with the Elev attribute equal to the cell value at the obstruction x-y location
        // let limiter = 99999;
        const results = features.map((feature) => {
            const surface_elevation: number = feature.attributes.Elev;
            let height_agl: number;
            let clearance: number;
          
            height_agl = Number((surface_elevation - base_height).toFixed(1));
            clearance = Number((height_agl - obsHt).toFixed(1));
            // if (clearance < limiter) {
                // as the features are iterated, the smallest clearance value is maintained as the limiter value
                // limiter = clearance;
            // }
            return({
                oid: feature.attributes.OBJECTID,
                layerName: feature.attributes.layerName,
                surface: feature.attributes.Name,
                type: feature.attributes["OIS Surface Type"],
                condition: feature.attributes["OIS Surface Condition"],
                runway: feature.attributes["Runway Designator"], 
                elevation: surface_elevation, 
                height: height_agl, 
                clearance: clearance,
                guidance: feature.attributes["Approach Guidance"],
                date_acquired: feature.attributes["Date Data Acquired"],
                description: feature.attributes.Description,
                regulation: feature.attributes["Safety Regulation"],
                zone_use: feature.attributes["Zone Use"]
            });
        });

        // sort the results by the clearance values
        const sorted_array = results.slice(0);
        sorted_array.sort((leftSide, rightSide): number => {
            if (leftSide.clearance < rightSide.clearance) {return 1; }
            if (leftSide.clearance > rightSide.clearance) {return -1; }
            return 0;
        });
        return sorted_array;
    }

    private create2DArray(features: [Graphic]) {
        const results = features.map((feature) => {
            return({
                oid: feature.attributes.OBJECTID,
                layerName: feature.attributes.layerName,
                name: feature.attributes.Name,
                description: feature.attributes.Description, 
                date_acquired: feature.attributes["Date Data Acquired"],
                data_source: feature.attributes["Data Source"],
                last_update: feature.attributes["Last Update"]
            });
        });
        // sort the results by the name in alphabetical order
        const sorted_array = results.slice(0);
        sorted_array.sort((leftSide, rightSide): number => {
            if (leftSide.name < rightSide.name) {return 1; }
            if (leftSide.name > rightSide.name) {return -1; }
            return 0;
        });
        return sorted_array;
    }


    private togglePopup(event: MouseEvent) {
        if (this.view.popup.visible) {
            this.view.popup.close();
        } else {
            this.view.popup.open();
        }
    }

    private setDefaultLayerVisibility() {
        let i = 0;
        this.scene.allLayers.forEach((lyr: FeatureLayer) => {
            if (lyr.type === "feature") {
                const default_visibility: LayerVisibilityModel = {
                    id: lyr.id,
                    def_visible: lyr.visible,
                    def_exp: lyr.definitionExpression
                };
                if (!i) {
                    this.layer_visibility = [default_visibility];
                    i += 1;
                } else {
                    if (this.layer_visibility) {
                        this.layer_visibility.push(default_visibility);
                    } else {
                        this.layer_visibility = [default_visibility];
                    }
                } 
            }
        });
    }

    private getDefaultLayerVisibility() {
        const default_vis = this.layer_visibility;
        this.layer_visibility.forEach((obj: LayerVisibilityModel) => {
            const target_layer = this.scene.findLayerById(obj.id) as FeatureLayer;
            target_layer.visible = obj.def_visible;
            target_layer.definitionExpression = obj.def_exp;
        });
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget

    }

    render() {
        return (
        <div id="obstructionPanel" class="panel collapse in">
            <div id="headingObstruction" class="panel-heading" role="tab">
                <div class="panel-title">
                    <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseObstruction" aria-expanded="true" aria-controls="collapseObstruction"><span class="glyphicon glyphicon-plane" aria-hidden="true"></span><span class="panel-label">{this.name}</span></a> 
                    <a class="panel-close" role="button" data-toggle="collapse" tabindex="0" href="#obstructionPanel"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a> 
                </div>
            </div>
            <div id="collapseObstruction" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingObstruction">
                <div class="body-light" id="obstruction-flex">
                    <div class="obstruction-inputs">
                        <label>
                            <input id="obsHeight" type="number" placeholder="Height of Obstruction" title="Height of Obstruction in feet"></input>
                        </label>
                        <label>
                            <input id="groundLevel" type="number" placeholder="+/- Ground Elevation" title="+/- Ground Elevation in feet"></input>
                        </label>
                    </div>
                    <div class="obstruction-inputs">
                        <div id="xandy">
                            <label>
                                <input id="easting" type="number" placeHolder="X: Easting" title="X: Easting in feet"></input>
                            </label>
                            <label>
                                <input id="northing" type="number" placeHolder="Y: Northing" title="Y: Northing in feet"></input>
                            </label>
                        </div>
                    </div>
                    <div id="target_btns">
                        <div id="activate_target" onclick={ (e: MouseEvent) => this.activate(e)} class="btn btn-transparent">{this.status}</div>
                        <div id="obs_submit" onclick={ (e: MouseEvent) => this.submitPanel(e)} class="btn btn-transparent">Submit</div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}


