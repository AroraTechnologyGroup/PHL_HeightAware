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

import ObstructionViewModel, { ObstructionParams } from "./viewModels/ObstructionViewModel";
interface PanelProperties extends ObstructionParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";
import { calculateW } from "gl-matrix-ts/dist/quat";

@subclass("app.widgets.obstructionPane")
export class ObstructionPane extends declared(Widget) {
    @property() viewModel = new ObstructionViewModel();
    
    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    @aliasOf("viewModel.name") name = "Obstruction Panel";

    @aliasOf("viewModel.activated") activated = false;

    @aliasOf("viewModel.ground_elevation") ground_elevation: number;

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

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }


    render() {
        return (
        <div id="obstructionPanel">
            <div id="headingObstruction">
                <div class="panel-title">
                    <span class="icon-ui-organization" aria-hidden="true"></span><span class="panel-label">{this.name}</span>
                </div>
            </div>
            <div id="collapseObstruction">
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
                        <div id="activate_target" onclick={ (e: MouseEvent) => this.viewModel.activate(e)} class="btn btn-transparent">{this.status}</div>
                        <div id="deactivate_target" onclick={ (e: MouseEvent) => this.viewModel.deactivate(e)} class="btn btn-transparent">Deactivate</div>
                        <div id="obs_submit" onclick={ (e: MouseEvent) => this.viewModel.submitPanel(e)} class="btn btn-transparent">Submit</div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}


