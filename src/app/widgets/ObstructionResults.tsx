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
import * as GeometryService from "esri/tasks/GeometryService";
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
import * as CoordinateConversion from "esri/widgets/CoordinateConversion";
import * as CoordinateConversionViewModel from "esri/widgets/CoordinateConversion/CoordinateConversionViewModel";

import ObstructionResultsViewModel, { ObstructionResultsParams, ObstructionSettings } from "./viewModels/ObstructionResultsViewModel";
interface PanelProperties extends ObstructionResultsParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";

@subclass("app.widgets.obstructionResults")
export class ObstructionResults extends declared(Widget) {
    @property() viewModel = new ObstructionResultsViewModel();
    
    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;
    
    @aliasOf("viewModel.x") x: number;

    @aliasOf("viewModel.y") y: number;

    @aliasOf("viewModel.peak") peak: number;

    @aliasOf("viewModel.name") name = "Obstruction Results";

    @aliasOf("viewModel.groundElevation") groundElevation: number;

    @aliasOf("viewModel.modifiedBase") modifiedBase: boolean;

    @aliasOf("viewModel.dem_source") dem_source: string;

    @aliasOf("viewModel.obstructionSettings") obstructionSettings: ObstructionSettings;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    private _2dClick(element: HTMLElement) {
      if (!domClass.contains(element, "is-active")) {
        const link3D = document.getElementById("3d_tab");
        const article1 = document.getElementById("results3d");
        const article1_meta = document.getElementById("results3d_meta");
        const link2D = document.getElementById("2d_tab");
        const article2 = document.getElementById("results2d")
        const article2_meta = document.getElementById("results2d_meta");

        domClass.add(link3D, "is-active");
        domClass.add(article1, "is-active");
        domClass.add(article1_meta, "is-active");
        domClass.remove(link2D, "is-active");
        domClass.remove(article2, "is-active");
        domClass.remove(article2_meta, "is-active");
      }
    }

    private _3dClick(element: HTMLElement) {
      if (!domClass.contains(element, "is-active")) {
        const link3D = document.getElementById("3d_tab");
        const article1 = document.getElementById("results3d");
        const article1_meta = document.getElementById("results3d_meta");
        const link2D = document.getElementById("2d_tab");
        const article2 = document.getElementById("results2d")
        const article2_meta = document.getElementById("results2d_meta");

        domClass.add(link3D, "is-active");
        domClass.add(article1, "is-active");
        domClass.add(article1_meta, "is-active");
        domClass.remove(link2D, "is-active");
        domClass.remove(article2, "is-active");
        domClass.remove(article2_meta, "is-active");
      }
    }

    render() {

      return (
        <div>
          <div>
            <b>x:</b>{this.x}<br></br>
            <b>y:</b>{this.y}<br></br>
            <b>Ground Elevation:</b>{this.obstructionSettings.groundElevation} feet MSL <i>source:{this.obstructionSettings.dem_source}</i><br></br>
            <b>Obstruction Height:</b>{this.peak} feet<br></br>
          </div>
          <div class="trailer-2 js-tab-group">
            <nav class="tab-nav">
              <a id="3d_tab" class="tab-title is-active js-tab" onClick={this._3dClick} bind={this}>3D Surfaces ({this.obstructionSettings.layerResults3d.features.length})</a>
              <a id="2d_tab" class= "tab-title js-tab" onClick={this._2dClick}>2D Surfaces ({this.obstructionSettings.layerResults2d.features.length})</a>
            </nav>
            <section class="tab-contents">
              <article id="results3d" class="results_panel tab-section js-tab-section is-active"></article>
              <article id="results2d" class="results_panel tab-section js-tab-section"></article>
              <article id="results3d_meta" class="results_panel-meta tab-section js-tab-section"></article>
              <article id="results2d_meta" class="results_panel-meta tab-section js-tab-section"></article>
            </section>
          </div>
        </div>
      );
    }
}
  