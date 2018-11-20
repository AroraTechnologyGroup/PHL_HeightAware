/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../node_modules/gl-matrix-ts/dist/index.d.ts" />
/// <reference path="../../../node_modules/gl-matrix-ts/dist/mat4.d.ts" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />
/// <reference path="../../../node_modules/@types/dojo/index.d.ts" />
/// <reference path="../../../node_modules/@types/gl-matrix/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/custom/dgrid/1.1/dgrid.d.ts" />

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
import * as aspect from "dojo/aspect";
import * as Deferred from "dojo/Deferred";
import * as query from "dojo/query";
import * as Array from "dojo/_base/array";
import * as declare from "dojo/_base/declare";
import * as domConstruct from "dojo/dom-construct";
import * as domClass from "dojo/dom-class";
import * as domAttr from "dojo/dom-attr";
import * as all from "dojo/promise/all";
import * as watchUtils from "esri/core/watchUtils";
import * as CoordinateConversion from "esri/widgets/CoordinateConversion";
import * as CoordinateConversionViewModel from "esri/widgets/CoordinateConversion/CoordinateConversionViewModel";
import * as Expand from "esri/widgets/Expand";
import * as Grid from "dgrid/Grid";
import * as ColumnHider from "dgrid/extensions/ColumnHider";
import * as Selection from "dgrid/Selection";
import * as Memory from "dstore/Memory";

import ObstructionResultsViewModel, { ObstructionResultsParams, LayerResultsModel, LayerVisibilityModel } from "./viewModels/ObstructionResultsViewModel";
interface PanelProperties extends ObstructionResultsParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";
import { fromValues } from "../../../node_modules/gl-matrix-ts/dist/vec3";
import { len } from "gl-matrix/src/gl-matrix/vec4";

@subclass("app.widgets.obstructionResults")
export class ObstructionResults extends declared(Widget) {
    @property() viewModel = new ObstructionResultsViewModel();
    
    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;
    
    @aliasOf("viewModel.x") x = 0

    @aliasOf("viewModel.y") y = 0;

    @aliasOf("viewModel.agl") agl = 0;

    @aliasOf("viewModel.msl") msl = 0;

    @aliasOf("viewModel.name") name = "Obstruction Results";

    @aliasOf("viewModel.groundElevation") groundElevation = 0;

    @aliasOf("viewModel.modifiedBase") modifiedBase = false;

    @aliasOf("viewModel.dem_source") dem_source: string;

    @aliasOf("viewModel.layerResults3d") layerResults3d:  LayerResultsModel;

    @aliasOf("viewModel.layerResults2d") layerResults2d: LayerResultsModel;

    @aliasOf("viewModel.count_3d") count_3d = 0;

    @aliasOf("viewModel.count_2d") count_2d = 0;

    @aliasOf("viewModel.expand") expand: Expand;

    @aliasOf("viewModel.results3d_grid") results3d_grid: Grid;

    @aliasOf("viewModel.results2d_grid") results2d_grid: Grid;

    @aliasOf("viewModel.store3d") store3d = new Memory({data: []});

    @aliasOf("viewModel.store2d") store2d = new Memory({data: []});

    @aliasOf("viewModel.defaultLayerVisibility") defaultLayerVisibility: LayerVisibilityModel[] = [];

    @aliasOf("viewModel.selected_feature_visibility") selected_feature_visibility = {};

    @aliasOf("viewModel.highlight2d") highlight2d: any;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
        const handle1 = this.watch("layerResults3d", (newValue: LayerResultsModel, oldValue: LayerResultsModel, property: String, object: this) => {
          this.count_3d = newValue.features.length;
          const array3D = this.viewModel.create3DArray(newValue.features, this.groundElevation, this.agl);
          console.log(array3D);
          this.results3d_grid.set("collection", this.store3d.data);
          this.results3d_grid.refresh();
          this.results3d_grid.renderArray(this.store3d.data);
          this.results3d_grid.resize();
        });

        const handle2 = this.watch("layerResults2d", (newValue: LayerResultsModel, oldValue: LayerResultsModel, property: String, object: this) => {
          this.count_2d = newValue.features.length;
          const array2D = this.viewModel.create2DArray(newValue.features);
          console.log(array2D);
          this.results2d_grid.set("collection", this.store2d.data);
          this.results2d_grid.refresh();
          this.results2d_grid.renderArray(this.store2d.data);
          this.results2d_grid.resize();
        });

        const handle3 = this.watch("defaultLayerVisibility", (newValue: LayerVisibilityModel[]) => {
          // build the keys for the selected visibility objects from the layer ids
          newValue.forEach((obj: LayerVisibilityModel) => {
            this.selected_feature_visibility[obj.id] = [];
          });
        })
        this.own([handle1, handle2, handle3]);
    }

    private Click3d(event: any) {
      if (!domClass.contains(event.target, "is-active")) {
        const link3D = document.getElementById("tab_3d");
        const article1 = document.getElementById("results3d");
        const link2D = document.getElementById("tab_2d");
        const article2 = document.getElementById("results2d")

        domClass.add(link3D, "is-active");
        domClass.add(article1, "is-active");

        domClass.remove(link2D, "is-active");
        domClass.remove(article2, "is-active");
        
      }

      this.results3d_grid.resize();
    }

    private Click2d(event: any) {
      if (!domClass.contains(event.target, "is-active")) {
        const link3D = document.getElementById("tab_3d");
        const article1 = document.getElementById("results3d");
        const link2D = document.getElementById("tab_2d");
        const article2 = document.getElementById("results2d")
        
        domClass.add(link2D, "is-active");
        domClass.add(article2, "is-active");
       
        domClass.remove(link3D, "is-active");
        domClass.remove(article1, "is-active");
        
      }
      this.results2d_grid.resize();
    }

    private buildResults3d(element: HTMLElement) {
      
      const columns = {
        oid: {
          label: "Object ID",
          hidden: true
        },
        clearance: {
          label: "Clearance (+ / - ft.)",
          className: "data-field",
          unhideable: true
        },
        name: {
          label: "Surface Name",
          className: "data-field",
          unhideable: true
        },
        type: {
          label: "Type",
          className: "data-field"
        },
        condition: {
          label: "Condition",
          className: "data-field"
        },
        runway: {
          label: "Runway",
          className: "data-field"
        },
        elevation: {
          label: "MSL (ft.)",
          className: "data-field"
        },
        height: {
          label: "AGL (ft.)",
          className: "data-field"
        },
        guidance: {
          label: "Approach Guidance",
          className: "metadata-field",
          hidden: true
        },
        date: {
          label: "Date Acquired",
          className: "metadata-field",
          hidden: true
        },
        desc: {
          label: "Description",
          className: "metadata-field",
          hidden: true
        },
        regulation: {
          label: "Safety Regulation",
          className: "metadata-field",
          hidden: true
        },
        zone: {
          label: "Zone Use",
          className: "metadata-field",
          hidden: true
        }
      };

      const grid = this.results3d_grid = new (declare([Grid, Selection, ColumnHider])) ({
        columns: columns,
        deselectOnRefresh: true
      }, element);
  
      aspect.after(grid, "renderRow", (row: HTMLElement, args: any) => {
        try {
          if (parseFloat(args[0].clearance) <= 0) {
            const clearance_cell = query(".dgrid-cell.field-clearance", row);
            if (clearance_cell.length) {
              domClass.add(clearance_cell[0], "negative");
            }
          }
        } catch (err) {
          console.log(err);
        }

        return row;
      });
      
      grid.on("dgrid-select", (evt: any) => {
        console.log(evt);
        evt.rows.forEach((obj: any) => {
          const layer_name: string = obj.data.name
          const oid: number = parseInt(obj.data.oid);
          // pass the oids onto the widget property which has a watcher
          if (Object.keys(this.selected_feature_visibility).indexOf(layer_name) !== -1) {
            const arr = this.selected_feature_visibility[layer_name];
            if (arr.indexOf(oid) === -1) {
              // only add the oid if it is not already in the list
              arr.push(oid);
            }
          } else {
            this.selected_feature_visibility[layer_name] = [oid];
          }
        });
        this.viewModel.updateFeatureDef();
      });

      grid.on("dgrid-deselect", (evt: any) => {
        console.log(evt);
        evt.rows.forEach((obj: any) => {
          const layer_name: string = obj.data.name
          const oid: number = parseInt(obj.data.oid);
          // pass the oids onto the widget property which has a watcher
          if (Object.keys(this.selected_feature_visibility).indexOf(layer_name) !== -1) {
            const arr = this.selected_feature_visibility[layer_name];
            if (arr.indexOf(oid) !== -1) {
              const ind = arr.indexOf(oid);
              const removed = arr.splice(ind, 1);
              if (arr.indexOf(oid) !== -1) {
                console.log("The object id was not removed from the list");
              }
            }
          } 
        });
        this.viewModel.updateFeatureDef();
      });

      grid.startup();
    }

    private buildResults2d(element: HTMLElement) {
      // only one feature in the map can be highlighted at a time
      const columns = {
        oid: {
          label: "Object ID",
          hidden: true
        },
        layerName: {
          label: "Layer Name",
          hidden: true
        },
        name: {
          label: "Surface Name",
          unhideable: true,
          className: "data-field"
        },
        desc: {
          label: "Description",
          className: "data-field"
        },
        date: {
          label: "Date Acquired",
          className: "metadata-field",
          hidden: true
        },
        source: {
          label: "Data Source",
          className: "metadata-field",
          hidden: true
        },
        updated: {
          label: "Last Update",
          className: "metadata-field",
          hidden: true
        }
      };

      const grid = this.results2d_grid = new (declare([Grid, Selection, ColumnHider])) ({
        columns: columns,
        selectionMode: "single",
        deselectOnRefresh: true
      }, element);

      grid.on("dgrid-select", (evt: any) => {
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

      grid.on("dgrid-deselect", (evt: any) => {
        console.log(evt);
        evt.rows.forEach((obj: any) => {
          if (this.highlight2d) {
            this.highlight2d.remove();
          }
        });
      });
      grid.startup();
    }

    private toggleMetadata(event: any) {
      // toggle the fields based on their inital visibility
      const fields_3d = ["type", "condition", "runway", "elevation", "height", "guidance", "date", "desc", "regulation", "zone"];
      const fields_2d = ["desc", "date", "source", "updated"];
      fields_3d.forEach((field_id: string) => {
        this.results3d_grid.toggleColumnHiddenState(field_id);
      });
      fields_2d.forEach((field_id: string) => {
        this.results2d_grid.toggleColumnHiddenState(field_id);
      });
      domClass.toggle(event.target, "metadata-selected");
    }

    render() {

      return (
        <div id="obstructionResults" class="esri-widget">
          <span class="icon-ui-organization" aria-hidden="true"></span><span class="panel-label"><b>{this.name}</b></span>
          <div class="obstruction-params">
            <b>x:</b> {this.x} feet<br></br>
            <b>y:</b> {this.y} feet<br></br>
            <b>Ground Elevation:</b> {this.groundElevation} feet MSL <i>source:{this.dem_source}</i><br></br>
            <b>Obstruction Height AGL:</b> {this.agl} feet<br></br>
            <b>Obstruction Elevation MSL:</b> {this.msl} feet<br></br>
          </div>
          <div class="js-tab-group">
            <nav class="tab-nav">
              <a id="tab_3d" class="tab-title is-active" onclick={this.Click3d.bind(this)}>3D Surfaces ({this.count_3d})</a>
              <a id="tab_2d" class="tab-title" onclick={this.Click2d.bind(this)}>2D Surfaces ({this.count_2d})</a>
              <a id="metadata" class="tab-title" onclick={this.toggleMetadata.bind(this)}>metadata fields</a>
            </nav>
            <section class="tab-contents">
              <article id="results3d" class="results_panel tab-section js-tab-section is-active">
                <div afterCreate={this.buildResults3d.bind(this)}></div>
              </article>
              <article id="results2d" class="results_panel tab-section js-tab-section">
                <div afterCreate={this.buildResults2d.bind(this)}></div>
              </article>
            </section>
          </div>
        </div>
      );
    }
}
  