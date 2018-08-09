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
import * as EsriWebScene from "esri/WebScene";
import * as PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import * as SceneView from "esri/views/SceneView";
import * as LayerList from "esri/widgets/LayerList";
import * as Legend from "esri/widgets/Legend";

import AppViewModel, { AppParams } from "./viewModels/AppViewModel";

import { CameraPane } from "./CameraPane";
import { FilePane } from "./FilePane";
import { LegendPane } from "./LegendPane";
import { MeasurePane } from "./MeasurePane";
import { ObstructionPane } from "./ObstructionPane";
import { RunwayPane } from "./RunwayPane";



interface AppViewParams extends AppParams, esri.WidgetProperties {}


@subclass("app.widgets.sceneview")
export default class App extends declared(Widget) {
  @property() viewModel = new AppViewModel();

  @aliasOf("viewModel.scene") map: EsriWebScene;

  @aliasOf("viewModel.view") view: __esri.SceneView;

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

  private  defineActions(event:any) {
    const item = event.item;
    item.actionsSections = [
      [{
        title: "Increase opacity",
        className: "esri-icon-up",
        id: "increase-opacity"
      }, {
        title: "Decrease opacity",
        className: "esri-icon-down",
        id: "decrease-opacity"
      }]
    ];
  }

  private onAfterCreate(element: HTMLDivElement) {
    import("../data/app").then(({ scene }) => {
      this.map = scene;
      this.view = new SceneView({
        map: this.map,
        container: element,
        viewingMode: "local",
        // attribution: false,
        camera: {
          position: {
            latitude: 189581.02732170673,
            longitude: 2662132.296885337,
            z: 6475.013010584819,
            spatialReference: new SpatialReference({
              wkid: 2272
            })
          },
          tilt: 67.99509223958297,
          heading: 24.319623182568122
        },
        popup: {
          actions: [],
          title: "Results of Obstruction Analysis",
          dockEnabled: true,
          spinnerEnabled: true,
          dockOptions: {
            buttonEnabled: true,
            breakpoint: false,
            position: "bottom-right"
          }
        }
      });

      this.view.when(() => {
        
        // add the Layer List to the View
        const layerList = new LayerList({
            view: this.view,
            listItemCreatedFunction: this.defineActions.bind(this)
        });
        layerList.on("trigger-action", (event) => {
          // The layer visible in the view at the time of the trigger.
          // Capture the action id.
          const id = event.action.id;
          if (id === "increase-opacity") {

            // If the increase-opacity action is triggered, then
            // increase the opacity of the GroupLayer by 0.25.

            if (event.item.layer.opacity < 1) {
              event.item.layer.opacity += 0.10;
            }
          } else if (id === "decrease-opacity") {

            // If the decrease-opacity action is triggered, then
            // decrease the opacity of the GroupLayer by 0.25.

            if (event.item.layer.opacity > 0) {
              event.item.layer.opacity -= 0.10;
            }
          }
        });
        this.view.ui.add(layerList, "bottom-left");

        // add the Obstruction Analysis Widget to the View

        const obstruction_pane = new ObstructionPane();
        this.view.ui.add(obstruction_pane, "top-right");

        const measure_pane = new MeasurePane();
        this.view.ui.add(measure_pane, "top-right");

        const runway_pane = new RunwayPane();
        this.view.ui.add(runway_pane, "top-right");

        const legend_pane = new LegendPane();
        this.view.ui.add(legend_pane, "top-right");

        const file_pane = new FilePane();
        this.view.ui.add(file_pane, "top-right");

        const camera_pane = new CameraPane();
        this.view.ui.add(camera_pane, "top-right");

    });

    });
  }

}
