/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../../node_modules/gl-matrix-ts/dist/index.d.ts" />
/// <reference path="../../../../node_modules/gl-matrix-ts/dist/mat4.d.ts" />
/// <reference path="../../../../node_modules/@types/arcgis-js-api/index.d.ts" />
/// <reference path="../../../../node_modules/@types/dojo/index.d.ts" />
/// <reference path="../../../../node_modules/@types/gl-matrix/index.d.ts" />
/// <reference path="../../../../node_modules/dojo-typings/custom/dgrid/1.1/dgrid.d.ts" />
/// <reference path="../../../../node_modules/dojo-typings/custom/dstore/1.1/dstore.d.ts" />

import { renderable, tsx } from "esri/widgets/support/widget";
import Collection =  require("esri/core/Collection");
import FeatureSet = require("esri/tasks/support/FeatureSet");

import Accessor = require("esri/core/Accessor");
import { whenOnce } from "esri/core/watchUtils";
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as Graphic from "esri/Graphic";
import * as IdentifyResult from "esri/tasks/support/IdentifyResult";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as Point from "esri/geometry/Point";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as Array from "dojo/_base/array";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as domAttr from "dojo/dom-attr";
import * as all from "dojo/promise/all";
import * as Deferred from "dojo/Deferred";
import * as on from "dojo/on";
import * as FeatureLayerView from "esri/views/layers/FeatureLayerView";
import * as Expand from "esri/widgets/Expand";
import * as Grid from "dgrid/Grid"
import * as Memory from "dstore/Memory";
import * as rendererJsonUtils from "esri/renderers/support/jsonUtils";
import * as UniqueValueRenderer from "esri/renderers/UniqueValueRenderer";
import * as SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import * as PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import * as Polygon from "esri/geometry/Polygon";
import * as Color from "esri/Color";
import * as Symbol from "esri/symbols/Symbol";
import * as FillSymbol3DLayer from "esri/symbols/FillSymbol3DLayer";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import { SimpleRenderer } from "esri/renderers";
import { ExtrudeSymbol3DLayer } from "esri/symbols";

export interface ObstructionResultsParams {
  scene: WebScene;
  view: SceneView;
}

export interface ObstructionResultsInputs {
  x: number;
  y: number;
  msl: number;
  agl: number;
  modifiedBase: boolean;
  layerResults3d: LayerResultsModel;
  layerResults2d: LayerResultsModel;
  dem_source: string;
  ground_elevation: number;
  elevation_change: number;
}

export interface ObstructionSettings {
  layerResults3d: LayerResultsModel; 
  layerResults2d: LayerResultsModel;
  dem_source: string;
  ground_elevation: number;
}

export interface LayerResultsModel {
  displayFieldName: string; 
  features: [Graphic];
}

export interface LayerVisibilityModel {
  id: string;
  def_visible: boolean;
  def_exp: string;
}

interface ValueInfo {
  value: string | number;
  symbol: Symbol | PolygonSymbol3D;
  label: string;
}

@subclass("widgets.App.ObstructionViewModel")
class ObstructionResultsViewModel extends declared(Accessor) {

  @renderable()
  @property() name: string;

  @renderable()
  @property() x: number;

  @renderable()
  @property() y: number;

  @renderable()
  @property() msl: number;

  @renderable()
  @property() agl: number;

  @renderable()
  @property() ground_elevation: number;

  @renderable()
  @property() elevation_change: number;

  @renderable()
  @property() dem_source: string;

  @renderable()
  @property() layerResults3d: LayerResultsModel;

  @renderable()
  @property() layerResults2d: LayerResultsModel;

  @renderable()
  @property() count_3d: Number;

  @renderable()
  @property() count_2d: Number;

  @renderable()
  @property() results3d_grid: Grid;

  @renderable()
  @property() results2d_grid: Grid;

  @renderable()
  @property() selected_feature_visibility: {};

  @property() modifiedBase: boolean;

  @property() scene: WebScene;

  @property() view: SceneView;

  @property() defaultLayerVisibility: LayerVisibilityModel[];

  @property() expand: Expand;

  @property() store3d = new Memory({data: []});

  @property() store2d = new Memory({data: []});

  // this highlight event on the feature layer is not accessible outside the dgrid select/deselect events so we save it here to remove when needed
  @property() highlight2d: any;

  // these events are removed and added each time the grids are updated with an array
  @property() grid3d_select: any;

  @property() grid3d_deselect: any;

  @property() grid2d_select: any;

  @property() grid2d_deselect: any;

  constructor(params?: Partial<ObstructionResultsParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }


  private onload() {
    
  }

  public create3DArray(features: [Graphic], base_height: number, obsHt: number) {
    // the features are an array of surface polygons with the Elev attribute equal to the cell value at the obstruction x-y location
    // let limiter = 99999;
    // TODO - write test to confirm that the object keys match the field names present in the grid itself
    const results = features.map((feature) => {
        const surface_msl: number = feature.attributes.Elev;
        let surface_agl: number;
        let clearance: number;
      
        surface_agl = Number((surface_msl - base_height).toFixed(1));
        clearance = Number((surface_agl - obsHt).toFixed(1));
        // if (clearance < limiter) {
            // as the features are iterated, the smallest clearance value is maintained as the limiter value
            // limiter = clearance;
        // }
        return  {
            oid: feature.attributes.OBJECTID,
            // the layerName is populated with the layer name from the mxd map service
            name: feature.attributes.layerName,
            type: feature.attributes["OIS Surface Type"],
            condition: feature.attributes["OIS Surface Condition"],
            runwayend: feature.attributes["Runway End Designator"],
            runway: feature.attributes["Runway Designator"], 
            elevation: surface_msl, 
            height: surface_agl, 
            clearance: clearance,
            guidance: feature.attributes["Approach Guidance"],
            dateacquired: feature.attributes["Date Data Acquired"],
            description: feature.attributes.Description,
            regulation: feature.attributes["Safety Regulation"],
            zoneuse: feature.attributes["Zone Use"]
        };
        
    });

    // sort the results by the clearance values
    const sorted_array = results.slice(0);
    sorted_array.sort((leftSide, rightSide): number => {
        if (leftSide.clearance < rightSide.clearance) {return -1; }
        if (leftSide.clearance > rightSide.clearance) {return 1; }
        return 0;
    });
    this.store3d.setData(sorted_array);
    return sorted_array;
  }

  public create2DArray(features: [Graphic]) {
    // TODO - write test to confirm that the object keys match the field names present in the grid itself
    const results = features.map((feature) => {
        return({
            oid: feature.attributes.OBJECTID,
            layerName: feature.attributes.layerName,
            name: feature.attributes.Name,
            description: feature.attributes.Description, 
            date: feature.attributes["Date Data Acquired"],
            datasource: feature.attributes["Data Source"],
            lastupdate: feature.attributes["Last Update"]
        });
    });
    // sort the results by the name in alphabetical order
    const sorted_array = results.slice(0);
    sorted_array.sort((leftSide, rightSide): number => {
        if (leftSide.name < rightSide.name) {return 1; }
        if (leftSide.name > rightSide.name) {return -1; }
        return 0;
    });
    this.store2d.setData(sorted_array);
    return sorted_array;
  }

  public enableGrid3dEvents() {
    this.grid3d_select = this.results3d_grid.on("dgrid-select", (evt: any) => {
      console.log(evt);
      // update the selected_feature_visibility property with the selected oids
      evt.rows.forEach((obj: any) => {
        const layer_name: string = obj.data.name.toLowerCase();
        const oid: number = parseInt(obj.data.oid);
        // load the oid of the feature into the selected feature visiblity object
        if (Object.keys(this.selected_feature_visibility).indexOf(layer_name) !== -1) {
          const arr = this.selected_feature_visibility[layer_name];
          if (arr.indexOf(oid) === -1) {
            // only add the oid if it is not already in the list
            arr.push(oid);
          }
        } else {
          console.log("layer not initially set in the selected feature visibility object after watching the default layer visibility");
          this.selected_feature_visibility[layer_name] = [oid];
        }
      });
      this.updateFeatureDef();
    });

    this.grid3d_deselect = this.results3d_grid.on("dgrid-deselect", (evt: any) => {
      console.log(evt);
      // remove the selected oids from the selected_feature_visibility property
      evt.rows.forEach((obj: any) => {
        const layer_name: string = obj.data.name.toLowerCase();
        const oid: number = parseInt(obj.data.oid);
        if (Object.keys(this.selected_feature_visibility).indexOf(layer_name) !== -1) {
          const arr = this.selected_feature_visibility[layer_name];
          const ind = arr.indexOf(oid);
          if (ind !== -1) {
            const removed = arr.splice(ind, 1);
            if (arr.indexOf(oid) !== -1) {
              console.log("The object id was not removed from the list");
            } else {
              console.log(`The object id ${oid} was removed`);
            }
          }
        } 
      });
      this.updateFeatureDef();
    });

  }

  public removeGrid3dEvents() {
    if (this.grid3d_select) {
      this.grid3d_select.remove();
    }
    if (this.grid3d_deselect) {
      this.grid3d_deselect.remove();
    }
    
  }

  public enableGrid2dEvents() {
    this.grid2d_select = this.results2d_grid.on("dgrid-select", (evt: any) => {
      console.log(evt);
      evt.rows.forEach((obj: any) => {
        const layer_name: string = obj.data.layerName.toLowerCase();
        const oid: number = parseInt(obj.data.oid);
        const layer = this.scene.findLayerById(layer_name);
        this.view.whenLayerView(layer).then((layer_view: FeatureLayerView) => {
          if (this.highlight2d) {
            this.highlight2d.remove();
          } 
          this.highlight2d = layer_view.highlight(oid);
        });
      });
    });

    this.grid2d_deselect = this.results2d_grid.on("dgrid-deselect", (evt: any) => {
      console.log(evt);
      evt.rows.forEach((obj: any) => {
        if (this.highlight2d) {
          this.highlight2d.remove();
        }
      });
    });
  }

  public removeGrid2dEvents() {
    if (this.grid2d_select) {
      this.grid2d_select.remove();
    }
    if (this.grid2d_deselect) {
      this.grid2d_deselect.remove();
    }
  }

  public updateFeatureDef() {
    const selViz = this.selected_feature_visibility;
    // the keys for the selected feature visibility object must match the layer names in the default layer visibility object
    let sel_pop = false;
    Object.keys(selViz).forEach((key: string | null) => {
      const layer = this.scene.findLayerById(key.toLowerCase()) as FeatureLayer;
      if (selViz[key].length) {
        // the value is an array of object ids
        const oid_string = selViz[key].join(",");
        const def_string = `OBJECTID IN (${oid_string})`;
        layer.definitionExpression = def_string;
        this.set3DSymbols(layer, true);
        layer.visible = true;
        sel_pop = true;
      } else {
        // set the definition query to hide all OIDS
        const def_string = 'OBJECTID IS NULL';
        layer.definitionExpression = def_string;
        layer.visible = false;
      }
    });
    if (!sel_pop) {
      // all of the oids value arrays are empty
      this.getDefaultLayerVisibility();
    }
  }

  public getDefaultLayerVisibility() {
      // the default layer visibility is set on widget creation after results returned from GIS Server
      this.defaultLayerVisibility.forEach((obj: LayerVisibilityModel) => {
          const target_layer = this.scene.findLayerById(obj.id) as FeatureLayer;
          target_layer.visible = obj.def_visible;
          target_layer.definitionExpression = obj.def_exp;
          this.set3DSymbols(target_layer, false);
      });
  }

  public set3DSymbols(layer: FeatureLayer, fill: boolean)  {
    const renderer_type = layer.renderer.type;
    let current_renderer: SimpleRenderer | UniqueValueRenderer;
    let symbol_fill = new Color({
      r: 0,
      g: 0,
      b: 0,
      a: 0
    });

    if (renderer_type === "simple") {
      let outline_color: Color;
      current_renderer = layer.renderer as SimpleRenderer;
      const symbol = current_renderer.symbol as SimpleFillSymbol | PolygonSymbol3D;
      if (symbol.type === "simple-fill") {
        // all graphics are initiall renderer using 2d simple fill from the Map Service.  
        // This allows the color of the layers to be controlled by the mxd
        outline_color = symbol.outline.color;
        if (fill) {
          symbol_fill = outline_color;
        }
      } else {
        // polygon 3d symbol
        const first_layer = symbol.symbolLayers.getItemAt(0) as FillSymbol3DLayer;
        outline_color = first_layer.outline.color;
        if (fill) {
          symbol_fill = outline_color;
        }
      }
      const new_renderer = {
        type: "simple",
        symbol : {
          type: "polygon-3d",
          symbolLayers: [{
            type: "fill",
            material: {color: symbol_fill},
            outline: {color: outline_color, size: "5px"}
          }]
        }
      };
      layer.set("renderer", new_renderer);

    } else if (renderer_type === "unique-value") {
      
      current_renderer = layer.renderer as UniqueValueRenderer;
      const infos = current_renderer.uniqueValueInfos;

      // check whether the symbols have been converted to polygon3D
      const is3D = infos.some((info: ValueInfo) => {
        const current_symbol = info.symbol as SimpleFillSymbol | PolygonSymbol3D;
        const current_type = current_symbol.type;
        if (current_type === "polygon-3d") {
          return true;
        }
      });

      // create new unique value infos array
      const new_infos: ValueInfo[] = [];
      let outline_color: Color;

      infos.forEach((info: ValueInfo) => {
        const value = info.value;
        if (!is3D) {
          // simple fill 2d symbol
          const current_symbol = info.symbol as SimpleFillSymbol;
          outline_color = current_symbol.outline.color as Color;
          if (fill) {
            symbol_fill = outline_color
          }
        } else {
          // polygon 3d symbol
          const current_symbol = info.symbol as PolygonSymbol3D;
          const first_layer = current_symbol.symbolLayers.getItemAt(0) as FillSymbol3DLayer;
          outline_color = first_layer.outline.color;
          if (fill) {
            symbol_fill = outline_color;
          }
        }


        const info_symbol = new PolygonSymbol3D({
          symbolLayers: [new FillSymbol3DLayer({
            material: {color: symbol_fill},
            outline: {color: outline_color, size: "5px"}
          })]
        });

        new_infos.push({
          value: value,
          symbol: info_symbol,
          label: info.label
        });
      });

      const new_renderer = {
        type: "unique-value",
        field: current_renderer.field,
        defaultSymbol: current_renderer.defaultSymbol,
        uniqueValueInfos: new_infos
      }
      layer.set("renderer", new_renderer);
    }

    if (fill) {
      layer.opacity = 0.75;
    } else {
      layer.opacity = 1;
    }
    return layer;
  }

}

export default ObstructionResultsViewModel;
