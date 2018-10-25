/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../../node_modules/gl-matrix-ts/dist/index.d.ts" />
/// <reference path="../../../../node_modules/gl-matrix-ts/dist/mat4.d.ts" />
/// <reference path="../../../../node_modules/@types/arcgis-js-api/index.d.ts" />
/// <reference path="../../../../node_modules/@types/dojo/index.d.ts" />
/// <reference path="../../../../node_modules/@types/gl-matrix/index.d.ts" />

import { renderable, tsx } from "esri/widgets/support/widget";
import Collection =  require("esri/core/Collection");
import FeatureSet = require("esri/tasks/support/FeatureSet");

import Accessor = require("esri/core/Accessor");
import { whenOnce } from "esri/core/watchUtils";
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as Graphic from "esri/Graphic";
import * as IdentifyTask from "esri/tasks/IdentifyTask";
import * as IdentifyResult from "esri/tasks/support/IdentifyResult";
import * as IdentifyParameters from "esri/tasks/support/IdentifyParameters";
import * as SpatialReference from "esri/geometry/SpatialReference";
import * as LabelClass from  "esri/layers/support/LabelClass";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as SimpleRenderer from "esri/renderers/SimpleRenderer";
import * as PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import * as Polygon from "esri/geometry/Polygon";
import * as Point from "esri/geometry/Point";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as geometryEngine from "esri/geometry/geometryEngine";
import * as Polyline from "esri/geometry/Polyline";
import * as Query from "esri/tasks/support/Query";
import * as GeometryService from "esri/tasks/GeometryService";
import * as Array from "dojo/_base/array";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as domAttr from "dojo/dom-attr";
import * as all from "dojo/promise/all";
import * as Deferred from "dojo/Deferred";
import * as on from "dojo/on";
import * as FeatureLayerView from "esri/views/layers/FeatureLayerView";
import * as CoordinateConversionViewModel from "esri/widgets/CoordinateConversion/CoordinateConversionViewModel";
import * as Conversion from "esri/widgets/CoordinateConversion/support/Conversion";
import * as Format from "esri/widgets/CoordinateConversion/support/Format";
import { ObstructionResults } from "../ObstructionResults";
import ObstructionResultsViewModel, { ObstructionResultsInputs, ObstructionSettings, LayerResultsModel, LayerVisibilityModel} from "./ObstructionResultsViewModel";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import { PointCloudRGBRenderer } from "esri/pointCloudRenderers";

export interface ObstructionParams {
  scene: WebScene;
  view: SceneView;
  results: ObstructionResults;
}

// this map service is only used to query elevations from surface rasters
const CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/MapServer";

const sr = new SpatialReference({
    wkid: 103142
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
    labelsVisible: false,
    popupEnabled: true
});

const pointerTracker = new Graphic({
    symbol: {
        type: "point-3d",  // autocasts as new PointSymbol3D()
        symbolLayers: [{
          type: "object",  // autocasts as new ObjectSymbol3DLayer()
          width: 5,    // diameter of the object from east to west in meters
          height: 100,  // height of object in meters
          depth: 5,   // diameter of the object from north to south in meters
          resource: { primitive: "cylinder" },
          material: { color: "blue" }
        }]
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

@subclass("widgets.App.ObstructionViewModel")
class ObstructionViewModel extends declared(Accessor) {

  @property() scene: WebScene;

  @property() view: SceneView;

  @renderable()
  @property() name: string;

  @property() groundElevation: number;

  @property() activated: boolean;

  @property() layerVisibility: [LayerVisibilityModel];

  @property() modifiedBase: boolean;

  @property() ccWidgetViewModel: CoordinateConversionViewModel;

  @property() results: ObstructionResults;

  constructor(params?: Partial<ObstructionParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }

  public activate(event: any): void {
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

    const ground_node: HTMLInputElement = document.getElementById("groundLevel") as HTMLInputElement;
    const obsHeight_node: HTMLInputElement = document.getElementById("obsHeight") as HTMLInputElement;

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
                const z = result.geometry.z;
                ground_node.value = z.toFixed(1);
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
            // save the ground elevation on the widget to compare against to tell if the user modifies the ground elevation
            this.groundElevation = parseFloat(ground_node.value);
            // set/reset the modified switch value to false
            this.modifiedBase = false;
            //we are clearing the move values with the clicked point
            this.submit(e.mapPoint);
        }
    });
  }

  public deactivate(event: any): void {
    console.log(event);
  }

  public ccXY() {
    var deferred = new Deferred();
   
    // get the x / y coords from the first conversion and if not basemap convert to basemap and return x,y
    const conv = this.ccWidgetViewModel.get("conversions") as Collection<Conversion>;
    const first_conversion = conv.getItemAt(0);
    let x;
    let y;
    if (first_conversion.format.name === "basemap") {
        x = first_conversion.position.location.x;
        y = first_conversion.position.location.y;
        deferred.resolve({x: x, y: y});
    } else {
        // convert the first conversion to basemap
        this.ccWidgetViewModel.reverseConvert(first_conversion.position.coordinate, first_conversion.format).then((point: Point) => {
            // create a new Point
            deferred.resolve({x: point.x, y: point.y});
        });
    }
    return deferred.promise;
  }

  private submit(point: Point) {
    const main_deferred = new Deferred();
    const obsHeight = document.getElementById("obsHeight") as HTMLInputElement;
    const groundLevel = document.getElementById("groundLevel") as HTMLInputElement;

    // set the panel values from the passed in point
    groundLevel.value = point.z.toFixed(1);

    let height = parseFloat(obsHeight.value);
    if (!height) {
        // calculate default height as the intersection height with the horizontal surface
        height = 200 - Number(groundLevel.value);
        obsHeight.value = height.toFixed(2);
    }
    const z = parseFloat(groundLevel.value);
   
    this.ccXY().then((coord: {x: number, y: number})=>{
        this.performQuery(coord.x, coord.y, z, height).then((graphic) => {
            main_deferred.resolve(graphic);
        });
    });

    
    return main_deferred.promise;
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
    // // add ground elevation and the obstacle height to get peak height in absolute elevation
    const peak = _z + _height;
    const graphic = new Graphic();
    graphic.attributes = {
        "ObjectID": 0,
        "baseElevation": _z,
        "obstacleHeight": peak
    };
    graphic.geometry = ptBuff;

    graphic.geometry.spatialReference = sr;

    // // this peak is for creating a vertical, the x -y  is slightly offset to prevent a vertical line
    // // the Geometry layers are not honoring units of feet with absolute height
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
            const obstructionSettings = this.buildObstructionSettings(response) as ObstructionSettings;
            // get the obstruction Settings widget from the UI and update with data
            const params = {
                x: _x,
                y: _y,
                peak: peak,
                modifiedBase: this.modifiedBase,
                layerResults3d: obstructionSettings.layerResults3d,
                layerResults2d: obstructionSettings.layerResults2d,
                groundElevation: obstructionSettings.groundElevation,
                dem_source: obstructionSettings.dem_source
            } as ObstructionResultsInputs;
            // Object.keys(params).forEach((key: string) => {
            //     this.results[key] = params[key];
            // });
            this.results.set(params);

            // update values into the input widget if the groundElevation was updated by the phl dem in the map service
            if (!this.modifiedBase) {
                const input = document.getElementById("groundLevel") as HTMLInputElement;
                input.value = obstructionSettings.groundElevation.toString();
            }
            this.results.expand.expand();

        } else {
            console.log("No results from server :: " + response);
        }
    });

    this.querySurfaces(line).then(() => {
        this.view.whenLayerView(obstruction_base).then((lyrView: FeatureLayerView) => {
            lyrView.highlight(graphic);
            this.view.goTo(graphic.geometry.extent.center);
            // the initial results from the filtering of the surfaces is saved onto the widget
            // this is needed by the results widget which interacts with the visibility of the layers in the map
            this.setDefaultLayerVisibility();
            main_deferred.resolve(graphic);
        });
    });

    return main_deferred.promise;
  }

  public submitPanel(event: MouseEvent) {
    // fired when the user clicks submit on the Panel possible after modifying values
    const obsHeight = document.getElementById("obsHeight") as HTMLInputElement;
    const groundLevel = document.getElementById("groundLevel") as HTMLInputElement;

    const base_level = parseFloat(groundLevel.value);

    // set the modied_base to true if the submitted ground elevation does not match the value queried from the dem sources and placed in the dom
    if (base_level !== this.groundElevation) {
        this.modifiedBase = true;
    } else {
        this.modifiedBase = false;
    }

    this.ccXY().then(([_x, _y]) => {
        const _z = parseFloat(groundLevel.value)

        // get the point location from the vertical feature and reapply to panel
        const panelPoint = new Point({
            x: _x,
            y: _y,
            z: _z,
            spatialReference: sr
        });
        this.submit(panelPoint);
    });
    
  }

  private querySurfaces(vertical_line: Polyline) {
    const map = this.scene;
    const main_deferred = new Deferred();
    const first = new Deferred();
    const second = new Deferred();
    const third = new Deferred();

    const crit_3d = map.findLayerById("critical_3d") as GroupLayer;
    const crid_3d_layers = crit_3d.layers as Collection<FeatureLayer>;
    const part77 = map.findLayerById("part_77_group") as GroupLayer;
    const part77_layers = part77.layers as Collection<FeatureLayer>;

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
    const deferred = new Deferred();
    const peak_height = _line.paths[0][1][2];
    const poly_geo = _polygon.geometry as Polygon;
    const base_point = new Point({
        x: _line.paths[0][0][0],
        y: _line.paths[0][0][1],
        spatialReference: sr
    });

    const geo_service = new GeometryService({
        url: "https://gis.aroraengineers.com/arcgis/rest/services/Utilities/Geometry/GeometryServer"
    });

    geo_service.intersect([poly_geo], base_point).then((resp) => {
        const point = resp[0] as Point;
        deferred.resolve({
            x: point.x,
            y: point.y,
            z: point.z
        });
    });
    return deferred.promise;

    // if (geometryEngine.intersects(poly_geo, base_point)) {
    //     // get a flat array of 3 non-collinear points in the polygon
    //     // we will use these points for the plane equation
    //     // !! need to determine if the basepoint intersects the triangle created by the three points
    //     const planePoints = this.getNonCollinearPoints(poly_geo);

    //     //get a flat array of 2 points that define the line
    //     const linePoints = [].concat.apply([], _line.paths[0]);

    //     // return intersection of the plane and line
    //     if (planePoints) {
    //         return this.intersect(planePoints, linePoints);
    //     } else {
    //         console.error("Polygon ", poly_geo, "doesn't have non-collinear points.");
    //     }
    // }
    // return null;
  } 

  // private intersect(planePoints: number[], linePoints: number[]) {
    //     // 3 points defining the plane
    //     const x1 = planePoints[0];
    //     const y1 = planePoints[1];
    //     const z1 = planePoints[2];
    //     const x2 = planePoints[3];
    //     const y2 = planePoints[4]; 
    //     const z2 = planePoints[5];
    //     const x3 = planePoints[6];
    //     const y3 = planePoints[7]; 
    //     const z3 = planePoints[8];

    //     // 2 points defining the line
    //     const x4 = linePoints[0];
    //     const y4 = linePoints[1];
    //     const z4 = linePoints[2];
    //     const x5 = linePoints[3];
    //     const y5 = linePoints[4];
    //     const z5 = linePoints[5];

    //     // calculate intersection based on http://mathworld.wolfram.com/Line-PlaneIntersection.html
    //     const mat1 = mat4.fromValues(1, 1, 1, 1, x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4);
    //     const mat2 = mat4.fromValues(1, 1, 1, 0, x1, x2, x3, x5 - x4, y1, y2, y3, y5 - y4, z1, z2, z3, z5 - z4);
    //     const det1 = mat4.determinant(mat1);
    //     const det2 = mat4.determinant(mat2);

    //     if (det2 !== 0) {
    //         const t = - det1 / det2;
    //         const intersectionPoint = {
    //             x: x4 + (x5 - x4) * t,
    //             y: y4 + (y5 - y4) * t,
    //             z: z4 + (z5 - z4) * t
    //         };
    //         return intersectionPoint;
    //     }
    //     return null;
    // }

    // private getNonCollinearPoints(_polygon: Polygon) {
    //     // set the first two non-collinear points in the polygon
    //     try {
    //         const x1: any = _polygon.rings[0][0][0];
    //         const y1: any = _polygon.rings[0][0][1];
    //         const z1: any = _polygon.rings[0][0][2];

    //         const x2: any = _polygon.rings[0][1][0];
    //         const y2: any = _polygon.rings[0][1][1];
    //         const z2: any = _polygon.rings[0][1][2];
            
    //         // find the third non-collinear point in the polygon
    //         for (let i = 2; i <= _polygon.rings[0].length; i++) {
    //             let x3: any = _polygon.rings[0][i][0];
    //             let y3: any = _polygon.rings[0][i][1];
    //             let z3: any = _polygon.rings[0][i][2];
    //             if ((x3 - x1) / (x2 - x1) !== (y3 - y1) / (y2 - y1) || (x3 - x1) / (x2 - x1) !== (z3 - z1) / (z2 - z1)) {
    //                 return [x1, y1, z1, x2, y2, z2, x3, y3, z3];
    //             }
    //         }
    //     } catch (e) {
    //             console.log(e);
    //         }
    //     return null;
    // }
  
  private filterSurfaces3D(_graphics: FeatureSet, _line: Polyline) {
    // return a promise with an array of oids
    const main_deferred = new Deferred();
    const height = _line.paths[0][1][2];
    const oids = Array.map(_graphics.features, (e: Graphic) => {
        const deferred = new Deferred();
        this.getIntersectionPoint(e, _line).then((pnt: Point) => {
            // if a point is returned, check that point is on the line
            if (pnt && pnt.z <= height) {
                // add the intersection Point to the map and return the object id
                const interectGraph: Graphic = intersectionGraphic.clone();
                const inPoint = new Point(pnt);
                inPoint.spatialReference = sr;
                interectGraph.geometry = inPoint;
                interectGraph.attributes = {
                    surfaceName: e.attributes.NAME
                };
                intersection_layer.source.add(interectGraph);

                deferred.resolve(e.attributes.OBJECTID);
                
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    });

    all(oids).then((list: [number]) => {
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

    const idTask = new IdentifyTask({
        url: CEPCT
    });
    
    const idParams = new IdentifyParameters();
    idParams.tolerance = 1;
    idParams.returnGeometry = true;
    idParams.layerOption = "all";
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
                this.layerVisibility = [default_visibility];
                i += 1;
            } else {
                if (this.layerVisibility) {
                    this.layerVisibility.push(default_visibility);
                } else {
                    this.layerVisibility = [default_visibility];
                }
            } 
        }
    });
  }

  private buildObstructionSettings(idResults: [IdentifyResult]) {
      // build the inputs to the results widget
    
    let features_3d = [];
    let features_2d = [];
    let server_dem_bool = false;
    for (let i = 0, il = idResults.length; i < il; i++) {
        const idResult = idResults[i];
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
            for (b = 0, bl = idResults.length; b < bl; b++) {
                if (idResults[b].layerName === whichRaster) {
                    // the elevation from the raster is added as an attribute to the cloned object returned
                    const pixel_value = idResults[b].feature.attributes["Pixel Value"];
                    if (pixel_value === "NoData") {
                        console.log(whichRaster);
                        // feat.attributes.Elev = parseFloat(point_elev); 
                        // features_3d.push(feat);
                    } else {
                        const point_elev = parseFloat(pixel_value).toFixed(1);
                        feat.attributes.Elev = parseFloat(point_elev); 
                        features_3d.push(feat);
                    }
                }
            }
        }
        
        if ([10, 11].indexOf(idResult.layerId) !== -1) {
            // layer is a 2D surface from the Runway Helipad Design Group Feature Class
            const feat = idResult.feature.clone();
            feat.attributes.layerName = idResult.layerName;
            features_2d.push(feat);
        }

        if (idResult.layerId === 82) {
            // layer is the ground DEM provided by PHL
            const raster_val = idResult.feature.attributes["Pixel Value"];
            if (!this.modifiedBase) {
                // the default value is taken from the html value in the dom, if not modified process the raster
                if (raster_val === "NoData") {
                    // set the ground elevation from the obstruction settings, it was not within the extent of the PHL DEM
                    server_dem_bool = false;
                } else {
                    this.groundElevation = parseFloat(parseFloat(raster_val).toFixed(1));
                    server_dem_bool = true;
                }
            } else {
                server_dem_bool = false;
            }
            
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

    // set the results as propertes of an object assigned to the widget properties
    let dem_source: string;
    if (server_dem_bool) {
        dem_source = "PHL DEM";
    } else {
        if (this.modifiedBase) {
            dem_source = "Manual Override";
        } else {
            dem_source = "USGS DEM";
        }
    }
    const settings: ObstructionSettings = {
        layerResults2d: Results2d,
        layerResults3d: Results3d,
        dem_source: dem_source,
        groundElevation: this.groundElevation
    };
    return settings;
  }

  onload() {
   
  }
}

export default ObstructionViewModel;
