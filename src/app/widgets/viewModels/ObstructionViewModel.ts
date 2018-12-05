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
import * as Field from "esri/layers/support/Field";
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
import * as Geoprocessor from "esri/tasks/Geoprocessor";
import * as Array from "dojo/_base/array"
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as domAttr from "dojo/dom-attr";
import * as all from "dojo/promise/all";
import * as Deferred from "dojo/Deferred";
import * as on from "dojo/on";
import * as FeatureLayerView from "esri/views/layers/FeatureLayerView";
import * as CoordinateConversion from "esri/widgets/CoordinateConversion";
import * as CoordinateConversionViewModel from "esri/widgets/CoordinateConversion/CoordinateConversionViewModel";
import * as Conversion from "esri/widgets/CoordinateConversion/support/Conversion";
import * as Format from "esri/widgets/CoordinateConversion/support/Format";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import * as Color from "esri/Color";
import * as Symbol from "esri/symbols/Symbol";
import * as FillSymbol3DLayer from "esri/symbols/FillSymbol3DLayer";

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

interface ValueInfo {
    value: string | number;
    symbol: Symbol | PolygonSymbol3D;
    label: string;
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
    labelPlacement: "above-after",
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

  @renderable()
  @property() demGroundElevation: number;

  @renderable()
  @property() userGroundElevation: number;

  @property() obstructionHeight: number;

  @property() x_coordinate: number;

  @property() y_coordinate: number;

  @property() activated: boolean;

  @property() layerVisibility: [LayerVisibilityModel];

  @property() modifiedBase: boolean;

  @property() ccWidget: CoordinateConversion;

  @property() results: ObstructionResults;

  @property() mouse_track: any;

  @property() view_click: any;

  constructor(params?: Partial<ObstructionParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }

  public toggleActivation(event: MouseEvent): void {
    // when clicking the Activate button perform this method
    domClass.toggle(event.srcElement, "btn-clear");
    if (!this.activated) {
        this.activated = true;
    } else {
        this.activated = false;
    }
  }

  private async clearLayers() {
    const crit_3d = this.scene.findLayerById("critical_3d") as GroupLayer;
    const part77 = this.scene.findLayerById("part_77_group") as GroupLayer;
    const crit_2d = this.scene.findLayerById("critical_2d_surfaces") as FeatureLayer;
    const intersect_points = this.scene.findLayerById("surface_intersection") as FeatureLayer;

    if (crit_3d) {
        crit_3d.visible = false;
        crit_3d.layers.forEach((layer: FeatureLayer) => {
            layer.definitionExpression = "OBJECTID IS NULL";
            layer.visible = false;
        });
    }
    if (part77) {
        part77.visible = false;
        part77.layers.forEach((layer: FeatureLayer) => {
            layer.definitionExpression = "OBJECTID IS NULL";
            layer.visible = false;
        });
    }
    if (intersect_points) {
        intersect_points.source.removeAll();
        this.scene.remove(intersect_points);
    }        
    if (crit_2d) {
        crit_2d.visible = false;
        crit_2d.definitionExpression = "OBJECTID IS NULL";
    }
    // // remove the previously placed obstactle
    // obstruction_base.source.removeAll();
    // remove the highlighted 2d features
    if (this.results.highlight2d) {
        this.results.highlight2d.remove();
    }
  
 }

  public activate(): void {
    this.clearLayers();

    if (this.ccWidget) {
        this.ccWidget.mode = "live";
    }
    this.disableSubmitPanel();
    const ground_node: HTMLInputElement = document.getElementById("groundLevel") as HTMLInputElement;
    const obsHeight_node: HTMLInputElement = document.getElementById("obsHeight") as HTMLInputElement;

    const mouse_track = this.mouse_track = this.view.on("pointer-move", (e) => {
        let map_pnt = this.view.toMap({
            x: e.x,
            y: e.y
        });
        if (map_pnt) {
            this.scene.ground.queryElevation(map_pnt).then((result: any) => {
                const _z = result.geometry.z;
                ground_node.value = _z.toFixed(2);
            });
        }
    });

    const view_click = this.view_click = this.view.on("click", (e) => {
        this.activated = false;
        // switch the Coordinate Conversion to capture mode
        e.stopPropagation();
         // Make sure that there is a valid latitude/longitude
        if (e && e.mapPoint) {
            // set/reset the modified switch value to false
            this.modifiedBase = false;
            // query the ground elevation using the map point and use as elevation value passed with the map point
            this.scene.ground.queryElevation(e.mapPoint).then((result: any) => {
                const _x = result.geometry.x;
                const _y = result.geometry.y;
                const _z = result.geometry.z;
                this.demGroundElevation = _z;
                this.submit(new Point({
                    x: _x,
                    y: _y,
                    z: _z
                })).then((arr) => {
                    // enable the Submit button
                    this.enableSubmitPanel();
                });
            });
        }
    });
  }

  private disableSubmitPanel(): void {
    const submit_btn = document.getElementById("obs_submit") as HTMLElement;
    domClass.add(submit_btn, "btn-disabled");
  }

  private enableSubmitPanel(): void {
    const submit_btn = document.getElementById("obs_submit") as HTMLElement;
    domClass.remove(submit_btn, "btn-disabled");
  }

  public deactivate(): void {
    // TODO - show the layers that were turned off when activated

    if (this.mouse_track) {
        this.mouse_track.remove();
    }
    if (this.view_click) {
        this.view_click.remove();
    }
    
    if (this.ccWidget) {
        this.ccWidget.mode = "capture";
    }
  }

//   public ccXY() {
//     var deferred = new Deferred();
   
//     // get the x / y coords from the first conversion and if not basemap convert to basemap and return x,y
//     const conv = this.ccWidgetViewModel.get("conversions") as Collection<Conversion>;
//     const first_conversion = conv.getItemAt(0);
//     let x;
//     let y;
//     if (first_conversion.format.name === "basemap") {
//         x = first_conversion.position.location.x;
//         y = first_conversion.position.location.y;
//         deferred.resolve({x: x, y: y});
//     } else {
//         // convert the first conversion to basemap
//         this.ccWidgetViewModel.reverseConvert(first_conversion.position.coordinate, first_conversion.format).then((point: Point) => {
//             // create a new Point
//             deferred.resolve({x: point.x, y: point.y});
//         });
//     }
//     return deferred.promise;
//   }

  private submit(point: Point) {
    // obstruction points can be submitted by clicking on the map or by clicking submit in the Input Widget
    const main_deferred = new Deferred();
    const obsHeight = document.getElementById("obsHeight") as HTMLInputElement;
    // const groundLevel = document.getElementById("groundLevel") as HTMLInputElement;

    // set the panel values from the passed in point either through a mouse click or a panel submit
    // const z_fixed = point.z.toFixed(2);
    // groundLevel.value = z_fixed;

    // saving these coordinates is required for submitting the panel with user values
    const y_fixed = point.y.toFixed(2);
    this.y_coordinate = parseFloat(y_fixed);

    const x_fixed = point.x.toFixed(2);
    this.x_coordinate = parseFloat(x_fixed);
    
    // set default height if empty
    let height = parseFloat(obsHeight.value);
    if (!height) {
        if (this.modifiedBase) {
            height = 200 - this.userGroundElevation;
        } else {
            height = 200 - this.demGroundElevation;
        }
        // calculate default height as 200 msl
        obsHeight.value = height.toFixed(2);
    }
   
    this.obstructionHeight = parseFloat(parseFloat(obsHeight.value).toFixed(2));

    // add the obstruction graphic to the map
    const graphic = this.addObstructionGraphic(point.x, point.y, point.z, this.obstructionHeight);
    this.performQuery(graphic).then((arr) => {
        main_deferred.resolve(arr);
    });

    return main_deferred.promise;
  }

  private addObstructionGraphic(_x: number, _y: number, _z: number, _height: number) {
    // create graphic and add to the obstruction base layer
    const pnt = new Point({
        x: _x,
        y: _y,
        z: _z,
        spatialReference: sr
    });

    const ptBuff = geometryEngine.buffer(pnt, 25, "feet") as Polygon;

    // if modifiedBase, add difference between demElevation and userElevation to the height.  obstacle is extruded from the ground surface in feet
    let obstHeight = _height;
    if (this.modifiedBase) {
        const diff = this.userGroundElevation - this.demGroundElevation;
        obstHeight = _height + diff;
    }

    const graphic = new Graphic();
    graphic.attributes = {
        "ObjectID": 0,
        "baseElevation": _z,
        "obstacleHeight": obstHeight
    };
    graphic.geometry = ptBuff;

    graphic.geometry.spatialReference = sr;

    obstruction_base.source.removeAll();
    obstruction_base.source.add(graphic);
    this.scene.add(obstruction_base);
    this.scene.add(intersection_layer);
    return graphic;
  }

  private performQuery(_graphic: Graphic) {
    const main_deferred = new Deferred();
    const first_deferred = new Deferred();
    const second_deferred = new Deferred();

    const _z = _graphic.attributes.baseElevation;
    let _agl = _graphic.attributes.obstacleHeight;
    const polygon = _graphic.geometry as Polygon;
    let _x = polygon.centroid.x;
    let _y = polygon.centroid.y;
    // polyline is used to query surfaces visible in the app
    const line = new Polyline({
        paths: [[
            [_x, _y, _z],
            [_x + 1, _y + 1, _agl]
        ]],
        spatialReference: sr,
        hasZ: true
    });

    const promise = this.doIdentify(_x, _y);
    promise.then((response: [IdentifyResult]) => {
        if (response) {
            const obstructionSettings = this.buildObstructionSettings(response) as ObstructionSettings;
            let ground_elevation: number;
            let elevation_change: number;
            // If the ground Elevation was not overridden in the input widget update the values to reflect the Dem value returned by the server
            if (!this.modifiedBase) {
                const groundElevation = obstructionSettings.ground_elevation;
                if (groundElevation !== this.demGroundElevation) {
                    console.log("ground elevation in buildObstructionSettings not completed properly");
                }
                const input = document.getElementById("groundLevel") as HTMLInputElement;
                input.value = groundElevation.toFixed(2);
                ground_elevation = groundElevation;
            } else {
                // the ground elevation from the server Identify Task is ignored and the initial value passed from the input is passed onto the results widget
                if (this.userGroundElevation) {
                    ground_elevation = this.userGroundElevation;
                    elevation_change = ground_elevation - this.demGroundElevation;
                } else {
                    console.log("user ground elevation not set with a modified Base");
                }
            }

            const _msl = Number((ground_elevation + _agl).toFixed(2));
            _agl = Number(_agl.toFixed(2));
            _x = Number(_x.toFixed(2));
            _y = Number(_y.toFixed(2));
            const params = {
                x: _x,
                y: _y,
                msl: _msl,
                agl: _agl,
                modifiedBase: this.modifiedBase,
                layerResults3d: obstructionSettings.layerResults3d,
                layerResults2d: obstructionSettings.layerResults2d,
                ground_elevation: ground_elevation,
                elevation_change: elevation_change,
                dem_source: obstructionSettings.dem_source
            } as ObstructionResultsInputs;

            this.results.set(params);
            this.results.expand.expand();
            second_deferred.resolve(params);

        } else {
            console.log("No results from server :: " + response);
            second_deferred.resolve(false);
        }
    });

    // Perform a Query in the browser using a 3d line.  All features within the vertical column are returned
    // TODO - this includes surfaces not impacted which are removed from the default visibility property
    this.querySurfaces(line).then(() => {
        // TODO - Pass a 2d point with height as elevation to a GP Service and return the intersection Points
        this.view.whenLayerView(obstruction_base).then((lyrView: FeatureLayerView) => {
            lyrView.highlight(_graphic);
            this.view.goTo(_graphic.geometry.extent.center);
            // the initial results from the filtering of the surfaces is saved onto the widget
            // this is needed by the results widget which interacts with the visibility of the layers in the map so that they can reset when needed
            const number_of_visibilityModel: number = this.setDefault3DLayerVisibility();
            // set the default visibility for the layers onto the results widget that has a watcher
            this.results.defaultLayerVisibility = this.layerVisibility;
            first_deferred.resolve(_graphic);
        });
    });

    all([first_deferred, second_deferred]).then((arr: any) => {
        // TODO - work with the results from the server to modify this.layerVisibility, then set on the results widget
        main_deferred.resolve(arr);
    });
    return main_deferred.promise;
  }

  public submitPanel(event: MouseEvent) {
    // fired when the user clicks submit on the Panel possible after modifying values
    const obsHeight = document.getElementById("obsHeight") as HTMLInputElement;
    const groundLevel = document.getElementById("groundLevel") as HTMLInputElement;

    this.clearLayers();

    const base_level = parseFloat(parseFloat(groundLevel.value).toFixed(2));
    this.userGroundElevation = base_level

    // set the modied_base to true if the submitted ground elevation does not match the value queried from the dem sources and previously saved on the widget
    if (this.userGroundElevation !== this.demGroundElevation) {
        this.modifiedBase = true;
    } else {
        if (this.modifiedBase) {
            // the base had been modified but set back to the original value
            console.log("the base has already been modified once");
            this.modifiedBase = false;
        } else {
            // set the false so it is not undefined or if the user sets the value back to the original value
            this.modifiedBase = false;
        }
    }
   
    // use the XY coordinates saved on the widget when the first obstacle was created
    const _x = this.x_coordinate;
    const _y = this.y_coordinate;
    // use the user elevation from the panel, while saving the dem base elevation on the widget for future comparisons
    const _z = this.userGroundElevation;

    // get the point location from the vertical feature and reapply to panel
    const panelPoint = new Point({
        x: _x,
        y: _y,
        z: _z,
        spatialReference: sr
    });
    this.submit(panelPoint);
  }

  private querySurfaces(vertical_line: Polyline) {
    const map = this.scene;
    const main_deferred = new Deferred();
    const first = new Deferred();
    const second = new Deferred();
    const third = new Deferred();

    const crit_3d = map.findLayerById("critical_3d") as GroupLayer;
    const crit_3d_layers = crit_3d.layers as Collection<FeatureLayer>;
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

    const viz = Array.map(crit_3d_layers.items, (lyr: FeatureLayer) => {
        const deferred = new Deferred();
        lyr.queryFeatures(query).then((e: FeatureSet) => {
            // this initial query returns all features that interect in 2d
            if (e.features.length) {
                // iterate through each feature and build def query from ObjectID
                const oids = e.features.map((value: Graphic) => {
                    return value.attributes["OBJECTID"];
                });
                if (oids.length > 1) {
                    lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                    lyr.visible = true;
                } else if (oids.length === 1 && oids[0] !== undefined) {
                    lyr.definitionExpression = "OBJECTID = " + oids[0];
                    lyr.visible = true;
                } else {
                    lyr.definitionExpression = "OBJECTID IS NULL";
                    lyr.visible = false;
                }
                deferred.resolve(oids);

            } else {
                lyr.definitionExpression = "OBJECTID IS NULL";
                lyr.visible = false;
                deferred.resolve(false);
            }
            this.results.viewModel.set3DSymbols(lyr, false);
        }, (err) => {
            console.log(err);
            crit_3d.visible = false;
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
                // iterate through each feature and build def query from ObjectID
                const oids = e.features.map((value: Graphic) => {
                    return value.attributes["OBJECTID"];
                }); 
                
                if (oids) {
                    if (oids.length > 1) {
                        lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                        lyr.visible = true;
                    } else if (oids.length === 1 && oids[0] !== undefined) {
                        lyr.definitionExpression = "OBJECTID = " + oids[0];
                        lyr.visible = true;
                    } else {
                        lyr.definitionExpression = "OBJECTID IS NULL";
                        lyr.visible = false;
                    }
                    deferred.resolve(oids);
                } else {
                    lyr.definitionExpression = "OBJECTID IS NULL";
                    lyr.visible = false;
                    deferred.resolve(false);
                }
            } else {
                lyr.definitionExpression = "OBJECTID IS NULL";
                lyr.visible = false;
                deferred.resolve(false);
            }
            this.results.viewModel.set3DSymbols(lyr, false);
        }, (err) => {
            console.log(err);
            part77.visible = false;
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
                return obj.attributes["OBJECTID"];
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

//   private getIntersectionPoint(_polygon: Graphic, _line: Polyline) {
//     const deferred = new Deferred();
//     const peak_height = _line.paths[0][1][2];
//     const poly_geo = _polygon.geometry as Polygon;
//     const base_point = new Point({
//         x: _line.paths[0][0][0],
//         y: _line.paths[0][0][1],
//         spatialReference: sr
//     });

//     // const geo_service = new GeometryService({
//     //     url: "https://gis.aroraengineers.com/arcgis/rest/services/Utilities/Geometry/GeometryServer"
//     // });

//     const geo_service = new Geoprocessor({
//        url:  "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Intersect3DLineWithOIS/GPServer/Intersect%203D%20Line%20With%20Multipatch"
//     });

//     // create a Graphic from _line and pass into FeatureSet to pass into the GP service
//     const graphic = new Graphic({
//         geometry: base_point,
//         attributes: [{
//             "OBJECTID": 0
//         }, {
//             "SHAPE_Length": line_length
//         }]
//     });
//     const fset = new FeatureSet();
//     fset.geometryType = "polyline";
//     // fset.fields = [
//     //     {
//     //         name: "OBJECTID",
//     //         alias: "OBJECTID",
//     //         type: "oid"
//     //     }, {
//     //         name: "SHAPE_Length",
//     //         alias: "SHAPE_Length",
//     //         type: "double"
//     //     }
//     // ];
//     fset.features = [graphic];
//     geo_service.execute({
//         in_line_features: fset,
//         in_multipatch_features: "OIS"
//     }).then((out: any) => {
//         console.log(out);
//         deferred.resolve(out);
//     }, (err) => {
//         console.log(err);
//         deferred.resolve(false);
//     });
    

//     // geo_service.intersect([poly_geo], base_point).then((resp) => {
//     //     const point = resp[0] as Point;
//     //     deferred.resolve({
//     //         x: point.x,
//     //         y: point.y,
//     //         z: point.z
//     //     });
//     // });
//     return deferred.promise;

//   } 

//   private filterSurfaces3D(_graphics: FeatureSet, _line: Polyline) {
//     // return a promise with an array of oids
//     const main_deferred = new Deferred();
//     const height = _line.paths[0][1][2];
//     const oids = Array.map(_graphics.features, (e: Graphic) => {
//         const deferred = new Deferred();
//         this.getIntersectionPoint(e, _line).then((pnt: Point) => {
//             // if a point is returned, check that point is on the vertical line representing the obstruction
//             if (pnt && pnt.z <= height) {
//                 // add the intersection Point to the map and return the object id
//                 const interectGraph: Graphic = intersectionGraphic.clone();
//                 const inPoint = new Point(pnt);
//                 inPoint.spatialReference = sr;
//                 interectGraph.geometry = inPoint;
//                 interectGraph.attributes = {
//                     surfaceName: e.attributes.NAME
//                 };
//                 intersection_layer.source.add(interectGraph);

//                 deferred.resolve(e.attributes.OBJECTID);
                
//             } else {
//                 deferred.resolve();
//             }
//         }, (err) => {
//             console.log(err);
//             deferred.resolve();
//         });
//         return deferred.promise;
//     });

//     all(oids).then((list: [number]) => {
//         main_deferred.resolve(list);
//     });

//     return main_deferred.promise;
//   }

  private doIdentify(x: number, y: number) {
    const map = this.scene;
    const view = this.view;
    const deferred = new Deferred();
    const x_coord = x;
    const y_coord = y;

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

  private setDefault3DLayerVisibility() {
    let i = 0;
    // grab the visible 3d airpsace surfaces layer ids and add to layerVisibilityModel list for control through table
    const group_layers = ["critical_3d", "part_77_group"];
    group_layers.forEach((layer_id: string) => {
        const first_deferred = new Deferred();
        const group_layer = this.scene.findLayerById(layer_id) as GroupLayer;
        group_layer.layers.forEach((lyr: FeatureLayer) => {
            if (lyr.type === "feature") {
                if (lyr.visible) {
                    const default_visibility: LayerVisibilityModel = {
                        id: lyr.id,
                        def_visible: lyr.visible,
                        def_exp: lyr.definitionExpression
                    };
                    // only save the visible layers to the default viz configuration
                    if (!i) {
                        this.layerVisibility = [default_visibility];
                        i += 1;
                    } else {
                        if (this.layerVisibility.length) {
                            this.layerVisibility.push(default_visibility);
                        }
                    } 
                }
            }
        });
    });
    return this.layerVisibility.length;
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
            let rnwy_designator = idResult.feature.attributes["Runway Designator"].replace("/", "_"); 
            const objectID = idResult.feature.attributes.OBJECTID;
            const feat = idResult.feature.clone();

            // assigning the layer allows highlighting after results are rendered
            feat.attributes.layerName = idResult.layerName;
            // assigning Elevation from surface raster allows calculating clearance
            feat.attributes.Elev = undefined;
            // clean null values 
            const runway = idResult.feature.attributes["Runway Designator"];
            if (runway === "Null") {
                feat.attributes["Runway Designator"] = "n/a";
            }
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
                    this.demGroundElevation = parseFloat(parseFloat(raster_val).toFixed(2));
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
        ground_elevation: this.demGroundElevation
    };
    return settings;
  }

  onload() {
    
  }
}

export default ObstructionViewModel;
