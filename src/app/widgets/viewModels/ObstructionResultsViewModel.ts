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

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

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
  groundElevation: number;
}

export interface ObstructionSettings {
  layerResults3d: LayerResultsModel; 
  layerResults2d: LayerResultsModel;
  dem_source: string;
  groundElevation: number;
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
  @property() groundElevation: number;

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
  @property() meta3d: Grid;

  @renderable()
  @property() meta2d: Grid;

  @renderable()
  @property() selected_visibility_3d: {};

  @renderable()
  @property() selected_visibility_2d: {};

  @property() modifiedBase: boolean;

  @property() scene: WebScene;

  @property() view: SceneView;

  @property() displayMode: string;

  @property() defaultLayerVisibility: LayerVisibilityModel[];

  @property() rowHoverEvts: [];

  @property() tableLeaveEvt: any;

  @property() expand: Expand;

  @property() store3d = new Memory({data: []});

  @property() store2d = new Memory({data: []});

  // this highlight event on the feature layer is not accessible outside the dgrid select/deselect events so we save it here to remove when needed
  @property() highlight2d: any;

  constructor(params?: Partial<ObstructionResultsParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }


  private onload() {
    
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

  public create3DArray(features: [Graphic], base_height: number, obsHt: number) {
    // the features are an array of surface polygons with the Elev attribute equal to the cell value at the obstruction x-y location
    // let limiter = 99999;
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
            runway: feature.attributes["Runway Designator"], 
            elevation: surface_msl, 
            height: surface_agl, 
            clearance: clearance,
            guidance: feature.attributes["Approach Guidance"],
            date_acquired: feature.attributes["Date Data Acquired"],
            description: feature.attributes.Description,
            regulation: feature.attributes["Safety Regulation"],
            zone_use: feature.attributes["Zone Use"]
        };
        
    });

    // sort the results by the clearance values
    const sorted_array = results.slice(0);
    sorted_array.sort((leftSide, rightSide): number => {
        if (leftSide.clearance < rightSide.clearance) {return 1; }
        if (leftSide.clearance > rightSide.clearance) {return -1; }
        return 0;
    });
    this.store3d.setData(sorted_array);
    return sorted_array;
  }

  public create2DArray(features: [Graphic]) {
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
    this.store2d.setData(sorted_array);
    return sorted_array;
  }

  public getDefaultLayerVisibility() {
      // the default layer visibility is set on widget creation
      this.defaultLayerVisibility.forEach((obj: LayerVisibilityModel) => {
          const target_layer = this.scene.findLayerById(obj.id) as FeatureLayer;
          target_layer.visible = obj.def_visible;
          target_layer.definitionExpression = obj.def_exp;
      });
  }

}

export default ObstructionResultsViewModel;
