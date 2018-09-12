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
import * as Legend from "esri/widgets/Legend";
import * as Popup from "esri/widgets/Popup";
import * as PopupTemplate from "esri/PopupTemplate";
import * as Extent from "esri/geometry/Extent";
import * as Query from "esri/tasks/support/Query";
import * as domConstruct from "dojo/dom-construct";

import AppViewModel, { AppParams } from "./viewModels/AppViewModel";

import { CameraPane } from "./CameraPane";
import { FilePane } from "./FilePane";
import { LegendPane } from "./LegendPane";
import { MeasurePane } from "./MeasurePane";
import { ObstructionPane } from "./ObstructionPane";
import { RunwayPane } from "./RunwayPane";
import { Polygon } from "esri/geometry";



interface AppViewParams extends AppParams, esri.WidgetProperties {}


@subclass("app.widgets.sceneview")
export default class App extends declared(Widget) {
  @property() viewModel = new AppViewModel();

  @aliasOf("viewModel.scene") map: EsriWebScene;

  @aliasOf("viewModel.view") view: __esri.SceneView;

  @property() obstructionPane = new ObstructionPane();

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

  private  defineActions(event: any) {
    const item = event.item;
    if (item.layer.type === "group") {
      item.actionsSections = [[{
          title: "Increase opacity",
          className: "esri-icon-up",
          id: "increase-opacity"
        }, {
          title: "Decrease opacity",
          className: "esri-icon-down",
          id: "decrease-opacity"
        }
      ]];
    } else {
      item.actionsSections = [
        [{
        title: "Zoom To",
        className: "esri-icon-zoom-in-magnifying-glass",
        id: "zoom-to-layer"
      }, {
        title: "Increase opacity",
        className: "esri-icon-up",
        id: "increase-opacity"
      }, {
        title: "Decrease opacity",
        className: "esri-icon-down",
        id: "decrease-opacity"
      }, {
        title: "Metadata Link",
        className: "esri-icon-link",
        id: "metadata-link"
      }]
    ];
    }
  }

  private onAfterCreate(element: HTMLDivElement) {
    import("../data/app").then(({ scene }) => {
      this.map = scene;
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

      const metadataAction = {
        title: "Metadata",
        id: "metadata-panel",
        className: "esri-icon-question"
      };

      const obstructionAction = {
        title: "Obstruction Results",
        id: "obstruction-results",
        className: "esri-icon-table"
      };

      const scene_Popup = new Popup({
          actions: [zoomOutAction, zoomInAction, metadataAction, obstructionAction],
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
        map: this.map,
        container: element,
        viewingMode: "local",
        camera: {
          position: {
            latitude: 198089.119,
            longitude: 2663822.827,
            z: 1633.2,
            spatialReference: new SpatialReference({
              wkid: 2272
            })
          },
          tilt: 79.392,
          heading: 42.114
        },
        popup: scene_Popup
      });

      this.view.popup.on("trigger-action", (event) => {
        const table3d = [document.getElementById("results3d"), document.getElementById("results3d_meta")];
        const table2d = [document.getElementById("results2d"), document.getElementById("results2d_meta")];

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
        } else if (event.action.id === "metadata-panel") {
          console.log(event);
          const obs_settings = this.obstructionPane.obstruction_settings;
          const results2d = obs_settings.layerResults2d;
          const results3d = obs_settings.layerResults3d;
          const peak_height = obs_settings.peak_height;
          const base_height = obs_settings.base_height;
          const meta_article2d = this.obstructionPane.generateMetaGrid2D(results2d);
          const meta_article3d = this.obstructionPane.generateMetaGrid3D(results3d, base_height, peak_height);
          table3d.forEach((obj: HTMLDataElement) => {
            domConstruct.empty(obj);
            if (obj.id.indexOf("meta") !== -1) {
              domConstruct.place(meta_article3d, obj);
            } 
          });

          table2d.forEach((obj: HTMLDataElement) => {
            const empty_obj = domConstruct.empty(obj);
            if (obj.id.indexOf("meta") !== -1) {
              domConstruct.place(meta_article2d, obj);
            }
          });

        } else if (event.action.id === "obstruction-results") {
          console.log(event);
          const obs_settings = this.obstructionPane.obstruction_settings;
          const results2d = obs_settings.layerResults2d;
          const results3d = obs_settings.layerResults3d;
          const peak_height = obs_settings.peak_height;
          const base_height = obs_settings.base_height;
          const article2d = this.obstructionPane.generateResultsGrid2D(results2d);
          const article3d = this.obstructionPane.generateResultsGrid3D(results3d, base_height, peak_height);
          

          table2d.forEach((obj: HTMLDataElement) => {
            domConstruct.empty(obj);
            if (obj.id.indexOf("meta") === -1) {
              domConstruct.place(article2d, obj);
            }
          });
          table3d.forEach((obj: HTMLDataElement) => {
            domConstruct.empty(obj);
            if (obj.id.indexOf("meta") === -1) {
              domConstruct.place(article3d, obj);
            }
          });
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
          const layer_type = event.item.layer.geometryType;

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
          } else if (id === "zoom-to-layer") {
            // zoomTo the layer extent. Point Layers dont have an extent
            if (layer_type === "point") {
              event.item.layerView.queryFeatures().then((feats: FeatureSet) => {
                this.view.goTo({
                  target: feats.features[0],
                  tilt: this.view.camera.tilt
                });
              });
            } else {
              if (event.item.layer.id === "obstruction_base") {
                event.item.layerView.queryFeatures().then((feats: FeatureSet) => {
                  this.view.goTo({
                    target: feats.features[0],
                    tilt: this.view.camera.tilt
                  });
                });
              } else {
                const ext = event.item.layer.fullExtent;
                this.view.goTo({
                  target: new Polygon({
                    spatialReference: this.view.spatialReference,
                    rings: [
                      [
                        [ext.xmin, ext.ymin],
                        [ext.xmin, ext.ymax],
                        [ext.xmax, ext.ymax],
                        [ext.xmax, ext.ymin],
                        [ext.xmin, ext.ymin]
                      ]
                    ]
                  }),
                  tilt: this.view.camera.tilt
                });
              }
            }
          } else if (id === "metadata-link") {
            // display the metadata from the GIS Server
            console.log(event);
            const url = event.item.layer.url + "/info/metadata";
            open(url, "_blank");
          }
        });
        this.view.ui.add(layerList, "bottom-left");

        // add the Obstruction Analysis Widget to the View

        const obstruction_pane = this.obstructionPane = new ObstructionPane({
          scene: this.map,
          view: this.view
        });
        this.view.ui.add(obstruction_pane, "top-right");

        // const measure_pane = new MeasurePane({
        //   scene: this.map,
        //   view: this.view
        // });
        // this.view.ui.add(measure_pane, "top-right");

        // const runway_pane = new RunwayPane({
        //   scene: this.map,
        //   view: this.view
        // });
        // this.view.ui.add(runway_pane, "top-right");

        // const legend_pane = new LegendPane({
        //   scene: this.map,
        //   view: this.view
        // });
        // this.view.ui.add(legend_pane, "top-right");

        // const file_pane = new FilePane({
        //   scene: this.map,
        //   view: this.view
        // });
        // this.view.ui.add(file_pane, "top-right");

        const camera_pane = new CameraPane({
          scene: this.map,
          view: this.view
        });
        this.view.ui.add(camera_pane, "top-right");

    });

    });
  }

}
