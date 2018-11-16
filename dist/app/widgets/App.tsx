/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";

import * as SpatialReference from "esri/geometry/SpatialReference";
import * as Graphic from "esri/Graphic";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as FeatureSet from "esri/tasks/support/FeatureSet";
import * as EsriWebScene from "esri/WebScene";
import * as PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import * as SceneView from "esri/views/SceneView";
import * as LayerList from "esri/widgets/LayerList";
import * as DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D";
import * as Popup from "esri/widgets/Popup";
import * as PopupTemplate from "esri/PopupTemplate";
import * as Extent from "esri/geometry/Extent";
import * as Query from "esri/tasks/support/Query";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as dom from "dojo/dom";
import * as Legend from "esri/widgets/Legend";

import AppViewModel, { AppParams } from "./viewModels/AppViewModel";

import { CameraPane } from "./CameraPane";
import { ObstructionPane } from "./ObstructionPane";
import { Disclaimer } from "./Disclaimer";

interface AppViewParams extends AppParams, esri.WidgetProperties {}


@subclass("app.widgets.sceneview")
export default class App extends declared(Widget) {
  @property() viewModel = new AppViewModel();

  @aliasOf("viewModel.scene") scene: EsriWebScene;

  @aliasOf("viewModel.view") view: __esri.SceneView;

  @aliasOf("viewModel.obstructionPane") obstructionPane: ObstructionPane;

  @aliasOf("viewModel.layerList") layerList: LayerList;

  @aliasOf("viewModel.legend") legend: Legend;

  @aliasOf("viewModel.cameraPane") cameraPane: CameraPane;

  constructor(params: Partial<AppViewParams>) {
    super(params);
  }

  render() {
 
    return (
      <div class="calcite-map calcite-map-absolute">
        <div id="map" bind={this} afterCreate={this.onAfterCreate}></div>
      </div>
    );
  }

  private onAfterCreate(element: HTMLDivElement) {
    import("../data/app").then(({ scene }) => {
      this.scene = scene;
      const zoomOutAction = {
        // This text is displayed as a tool tip
        title: "Zoom out",
        id: "zoom-out",
        // An icon font provided by the API
        className: "esri-icon-zoom-out-magnifying-glass"
      };
      
      const zoomInAction = {
        title: "Zoom in",
        id: "zoom-in",
        className: "esri-icon-zoom-in-magnifying-glass"
      };

      const scene_Popup = new Popup({
          actions: [zoomOutAction, zoomInAction],
          dockEnabled: true,
          spinnerEnabled: true,
          autoCloseEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: "bottom-right"
          }
      });

      this.view = new SceneView({
        map: this.scene,
        container: element,
        viewingMode: "local",
        camera: {
          position: {
            latitude: 199790.871,
            longitude: 2679814.346,
            z: 1794.0,
            spatialReference: new SpatialReference({
              wkid: 6565
            })
          },
          tilt: 77.623,
          heading: 318.096
        },
        popup: scene_Popup
      });

      this.view.popup.on("trigger-action", (event) => {
      
        if (event.action.id === "zoom-out") {
          this.view.goTo({
            center: this.view.center,
            zoom: this.view.zoom - 2
          });
        } else if (event.action.id === "zoom-in") {
          // get the obstuction feature from view ui and zoom to
          this.view.goTo({
            center: this.view.center,
            zoom: this.view.zoom + 2
          });
        } 
      });

    });
  }
}
