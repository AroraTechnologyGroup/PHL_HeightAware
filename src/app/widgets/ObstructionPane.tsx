/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../node_modules/gl-matrix-ts/dist/index.d.ts" />
/// <reference path="../../../node_modules/gl-matrix-ts/dist/mat4.d.ts" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />
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

interface LayerResultsModel {
    displayFieldName: string; 
    features: [Graphic];
}

const CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/CEPCT/MapServer";
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
//$feature[\"surfaceName\"] + 
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
    labelsVisible: true
});

const pointerTracker = new Graphic({
    symbol: new PictureMarkerSymbol({
        url: "app/assets/reticle.png",
        width: 40,
        height: 40
    })
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
        mode: "absolute-height"
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
    @property() name = "Obstruction Analysis";

    @property()
    @renderable() activated = false;

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    private activate(event: any): void {
        // hide the 3d layers
        const crit_3d = this.scene.findLayerById("critical_3d") as GroupLayer;
        const part77 = this.scene.findLayerById("part_77_group") as GroupLayer;
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

    private submit(point: Point): void {
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
            // default set obstacle height can be set here
            height = 200;
            obsHeight.value = "200";
        }
        const z = parseFloat(groundLevel.value);
        const y = parseFloat(northingNode.value);
        const x = parseFloat(eastingNode.value);
        this.performQuery(x, y, z, height);
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


        const promise = this.doIdentify(_x, _y);
        promise.then((response: [IdentifyResult]) => {
            if (response) {
                this.addToMap(response);
            } else {
                console.log("No results from server :: " + response);
            }
        });

        this.querySurfaces(line).then(() => {
            this.scene.add(intersection_layer);
            this.view.whenLayerView(obstruction_base).then((lyrView: FeatureLayerView) => {
                lyrView.highlight(graphic);
                this.view.goTo(graphic);
                const endAnim = watchUtils.whenTrue(this.view, "animation", () => {
                    this.scene.remove(obstruction_base);
                    endAnim.remove();
                });
            });
        });
    }

    private querySurfaces(vertical_line: Polyline) {
        const map = this.scene;
        const main_deferred = new Deferred();
        const first = new Deferred();
        const last = new Deferred();

        const crit_3d = map.findLayerById("critical_3d") as GroupLayer;
        const crid_3d_layers: Collection = crit_3d.layers as Collection<FeatureLayer>;
        const part77 = map.findLayerById("part_77_group") as GroupLayer;
        const part77_layers: Collection = part77.layers as Collection<FeatureLayer>;

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
                        } else {
                            lyr.definitionExpression = "OBJECTID = " + oids[0];
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

        function isFalse(element: any, index: number, array: []) {
            if (!element) {
                return true;
            } else {
                return false;
            }
        }

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
                            } else {
                                lyr.definitionExpression = "OBJECTID = " + oids[0];
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
                last.resolve(false);
            } else {
                part77.visible = true;
                last.resolve(true);
            }
            
        });

        all([first, last]).then((e: boolean[]) => {
            if (e[0] || e[1]) {
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
            if (idResult.layerId === 2) {
                whichRaster = "Raster_" + idResult.feature.attributes.OBJECTID;
                for (b = 0, bl = _result.length; b < bl; b++) {
                    if (_result[b].layerName === whichRaster) {
                        idResult.feature.attributes.Elev = _result[b].feature.attributes["Pixel Value"];
                        features_3d.push(idResult.feature);
                    }
                }
            }

            if (idResult.layerId === 3) {
                whichRaster = "Raster_" + idResult.feature.attributes.RWY;
                for (b = 0; b < _result.length; b++) {
                    if (_result[b].layerName === whichRaster) {
                        idResult.feature.attributes.Elev = _result[b].feature.attributes["Pixel Value"];
                        features_3d.push(idResult.feature);
                    }
                }
            }
                
            
            if (idResult.layerId === 0 || idResult.layerId === 4) {
                features_2d.push(idResult.feature);
            }

            // if (idResult.layerId === 58) {
            //     groundElev = parseInt(idResult.feature.attributes["Pixel Value"], 10);
            // }
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

        const tab_content1: string = this.layerTabContent(Results3d, "bldgResults", groundElev, obst_height, x_value, y_value);
        const tab_content2: string = this.layerTabContent(Results2d, "parcelResults", groundElev, obst_height, x_value, y_value);

        
        const outputContent = tab_content1 + "<br>" + tab_content2.substr(tab_content2.indexOf("2D/Ground surfaces affected"));
        
        // query for the anchor nodes and attach an event publisher that passes the feature list name and the index

        const anchors = query(".show_link");
        if (anchors) {
            anchors.forEach((e: HTMLElement) => {
                on(e, "click", (evt) => {
                    evt.preventDefault();
                    const id = evt.target.id;

                    const start = id.lastIndexOf("_");
                    const length = id.length;
                    // the index is the number after the last underscore in the id
                    const index = parseInt(id.substring(start + 1, length), 10);
                    let feature;
                    if (id.indexOf("bldgResults") !== -1) {
                        feature = Results3d.features[index];
                    } else if (id.indexOf("parcelResults") !== -1) {
                        feature = Results2d.features[index];
                    }
                    if (feature) {
                        this.showFeature(feature);
                    } else {
                        console.log("Neither bldgResults or parcelResults were found in the dom id");
                    }
                });
            });
        }

        
        view.popup.content = outputContent;
        view.popup.open();
    }

    private replaceStrings (content: HTMLElement, limiter: number) {
        let str_content = content.innerHTML;
        str_content = str_content.replace("feet MSL", "feet MSL<br><b>Critical Height: </b>" + limiter.toFixed(3) + " feet AGL");

        str_content = str_content.replace("No data feet MSL", "No data");
        str_content = str_content.replace("NaN feet MSL", "No data");
        str_content = str_content.replace("99999 feet AGL", "No data");
        str_content = str_content.replace("NaN", "No data");
        return str_content;
    }

    private layerTabContent (layerResults: LayerResultsModel, layerName: string, base_height: number, peak_height: number, x: number, y: number) {
        let content: HTMLElement;
        let limiter = 99999;
        let obsHt = 0;
        if (peak_height) {
            obsHt = peak_height;
        }
        let i;
        let il;
        const features: [Graphic] = layerResults.features;
        switch (layerName) {
            case "bldgResults":
                content = domConstruct.create("div");
                const heights = domConstruct.toDom("<b>x:</b> " + x.toFixed(3) + " <b>y:</b> " + y.toFixed(3) + "<br><b>Ground Elevation:</b> " + base_height + " feet MSL<br><b>Obstruction Height: </b>" + obsHt + " feet<br>");
                const sum = domConstruct.toDom("<i>3D surfaces affected: " + features.length + "</i>");
                domConstruct.place(heights, content);
                domConstruct.place(sum, content);
                
                const bldg_table = domConstruct.create("table", {"border": 1}, content);
                const _row = domConstruct.create("tr", {}, bldg_table);
                const h_cell1 = domConstruct.create("th", {"innerHTML": "Surface"}, _row);
                const h_cell2 = domConstruct.create("th", {"innerHTML": "Elevation MSL"}, _row);
                const h_cell3 = domConstruct.create("th", {"innerHTML": "Height AGL"}, _row);
                const h_cell4 = domConstruct.create("th", {"innerHTML": "Clearance"}, _row);
                
                for (i = 0, il = features.length; i < il; i++) {
                    const feature = features[i];
                    const str_elevation: string = feature.attributes.Elev;
                    let surface_elev: number;
                    let msl_value: number;
                    let clearance: number;
                    if (str_elevation !== "NoData") {
                        surface_elev = Number(Number(str_elevation).toFixed(3));
                        msl_value = surface_elev - base_height;
                        clearance = msl_value - obsHt;
                        if (clearance < limiter) {
                            limiter = clearance;
                        }
                    } else {
                        surface_elev = 0;
                        msl_value = 0;
                        clearance = 0;
                    }
                    const _row2 = domConstruct.create("tr", {}, bldg_table);
                    const text = feature.attributes.RWY + " " + feature.attributes.Layer;
                    const r_cell1 = domConstruct.create("td", {"innerHTML": text}, _row2);
                    domConstruct.create("td", {"innerHTML": str_elevation}, _row2);
                    
                    // these may be replaced below with data
                    domConstruct.create("td", {"innerHTML": msl_value.toFixed(3)}, _row2);
                    const r_cell4 = domConstruct.create("td", {"innerHTML": clearance.toFixed(3)}, _row2);

                    if (clearance < 0) {
                           domClass.add(r_cell4, "negative");
                           domAttr.set(r_cell4, "data-rwy", feature.attributes.RWY);
                           domAttr.set(r_cell4, "data-surface", feature.attributes.Layer);
                    } 
                }
                return this.replaceStrings(content, limiter);

            case "parcelResults":
                content = domConstruct.create("div");
                const info = domConstruct.toDom("<br><i>2D/Ground surfaces affected: " + features.length + "</i>");
                domConstruct.place(info, content);

                const table = domConstruct.create("table", {"border": 1}, content);
                const header_row = domConstruct.create("tr", {}, table);
                domConstruct.create("th", {"innerHTML": "Surface"}, header_row);
                
                for (i = 0; i < features.length; i++) {
                    if (features[i].attributes.RWY) {
                        const _row_ = domConstruct.create("tr", {}, table);
                        const _td = domConstruct.create("td", {"innerHTML": features[i].attributes.RWY + " " + features[i].attributes.Layer}, _row_);
                       
                    } else if (features[i].attributes.NAME) {
                        const row = domConstruct.create("tr", {}, table);
                        const td = domConstruct.create("td", {"innerHTML": features[i].attributes.NAME + " TSA"}, row);
                       
                    }
                }
                return this.replaceStrings(content, limiter);
        }

        return "Error with layerName";
    }

    private showFeature(_feat: Graphic) {
        const view = this.view;
        view.graphics.removeAll();
        view.graphics.add(_feat);
        view.goTo(_feat);
    }

    private togglePopup(event: MouseEvent) {
        if (this.view.popup.visible) {
            this.view.popup.close();
        } else {
            this.view.popup.open();
        }
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
                        <div>
                            <div>Height of obstruction</div>
                            <input id="obsHeight" type="number" placeholder="in feet"></input>
                        </div>
                        <div>
                            <div>+/- Ground Elevation</div>
                            <input id="groundLevel" type="number" placeholder="feet above or below"></input>
                        </div>
                    </div>
                    <div class="obstruction-inputs">
                        <div id="xandy">
                            <div>
                                <div>X: Easting</div>
                                <input id="easting" type="number" placeHolder="Easting"></input>
                            </div>
                            <div>
                                <div>Y: Northing</div>
                                <input id="northing" type="number" placeHolder="Northing"></input>
                            </div>
                        </div>
                    </div>
                    <div id="target_btns">
                        <div id="activate_target" onclick={ (e: MouseEvent) => this.activate(e)} class="btn btn-transparent">Activate</div>
                        <div id="obs_submit" onclick={ (e: MouseEvent) => this.submitPanel(e)} class="btn btn-transparent">Submit</div>
                        <div id="open_results" onclick={ (e: MouseEvent) => this.togglePopup(e)} class="esri-icon-table"></div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}


