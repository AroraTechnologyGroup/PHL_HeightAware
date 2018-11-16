/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import esri = __esri;

import Accessor =  require("esri/core/Accessor");
import { whenOnce } from "esri/core/watchUtils";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as EsriScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as LayerList from "esri/widgets/LayerList";
import * as Expand from "esri/widgets/Expand";
import * as Legend from "esri/widgets/Legend";
import * as Home from "esri/widgets/Home";
import * as CoordinateConversion from "esri/widgets/CoordinateConversion";
import * as FeatureSet from "esri/tasks/support/FeatureSet";

import { CameraPane } from "../CameraPane";
import { Polygon } from "esri/geometry";
import { ObstructionPane } from "../ObstructionPane";
import { ObstructionResults } from "../ObstructionResults";
import { Disclaimer } from "../Disclaimer";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface AppParams {
  scene: EsriScene;
  view: SceneView;
}

@subclass("widgets.App.AppViewModel")
class AppViewModel extends declared(Accessor) {

  @property() scene: EsriScene;

  @property() view: SceneView;

  @property() obstructionPane: ObstructionPane;

  @property() disclaimer: Disclaimer;

  @property() layerList: LayerList;

  @property() legend: Legend;

  @property() cameraPane: CameraPane;
  
  constructor(params?: Partial<AppParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
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

  onload() {
    // show the user disclaimer window on initial load, then make it avaialable through the App's Menu
    const disclaimer = this.disclaimer = new Disclaimer({
      view: this.view
    });

    const disclaimerExpand = new Expand({
      expandIconClass: "esri-icon-description",
      expandTooltip: "Expand Site Description",
      view: this.view,
      content: disclaimer
    });
    this.view.ui.add(disclaimerExpand, "bottom-left");
    
    // create the widgets to load into the app
    // add the Layer List to the View
    const layerList = this.layerList = new LayerList({
      container: document.createElement("div"),
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

    const layerListExpand = new Expand({
      expandIconClass: "esri-icon-layer-list",
      expandTooltip: "Expand LayerList",
      view: this.view,
      content: layerList
    });
    this.view.ui.add(layerListExpand, "bottom-left");

    // add the Obstruction Analysis Widget to the View
    const obstruction_results = new ObstructionResults({
      view: this.view,
      id: "ObstructionResults",
      scene: this.scene
    });

    const obstruction_pane = this.obstructionPane = new ObstructionPane({
      scene: this.scene,
      view: this.view,
      results: obstruction_results
    });

    const obstructionExpand = new Expand({
      expandIconClass: "esri-icon-organization",
      expandTooltip: "Expand Obstruction Input",
      view: this.view,
      content: obstruction_pane
    });
    this.view.ui.add(obstructionExpand, "top-right");
    obstructionExpand.expand();
    
    const resultsExpand = new Expand({
      expandIconClass: "esri-icon-organization",
      expandTooltip: "Expand Obsruction Results",
      view: this.view,
      content: obstruction_results
    });
    this.view.ui.add(resultsExpand, "bottom-right");
    
    obstruction_results.expand = resultsExpand;

    const legend_pane = this.legend = new Legend({
      view: this.view
    });
    const legendExpand = new Expand({
      expandIconClass: "esri-icon-key",
      expandTooltip: "Expand LayerLegend",
      view: this.view,
      content: legend_pane
    });
    this.view.ui.add(legendExpand, "bottom-left");

    const camera_pane = this.cameraPane = new CameraPane({
      scene: this.scene,
      view: this.view
    });
    const cameraExpand = new Expand({
      expandIconClass: "esri-icon-mobile",
      expandTooltip: "Expand Camera Location",
      view: this.view,
      content: camera_pane
    });
    this.view.ui.add(cameraExpand, "bottom-left");

    const home_btn = new Home({
      view: this.view
    });
    this.view.ui.add(home_btn, "top-left");

  }

}

export default AppViewModel;
