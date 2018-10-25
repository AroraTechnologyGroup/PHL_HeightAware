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
import * as Grid from "dgrid/Grid"
import * as Selection from "dgrid/Selection";
import * as Memory from "dstore/Memory";

import ObstructionResultsViewModel, { ObstructionResultsParams, LayerResultsModel } from "./viewModels/ObstructionResultsViewModel";
interface PanelProperties extends ObstructionResultsParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";
import { fromValues } from "../../../node_modules/gl-matrix-ts/dist/vec3";

@subclass("app.widgets.obstructionResults")
export class ObstructionResults extends declared(Widget) {
    @property() viewModel = new ObstructionResultsViewModel();
    
    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;
    
    @aliasOf("viewModel.x") x = 0

    @aliasOf("viewModel.y") y = 0;

    @aliasOf("viewModel.peak") peak = 0;

    @aliasOf("viewModel.name") name = "Obstruction Results";

    @aliasOf("viewModel.groundElevation") groundElevation = 0;

    @aliasOf("viewModel.modifiedBase") modifiedBase: boolean;

    @aliasOf("viewModel.dem_source") dem_source: string;

    @aliasOf("viewModel.layerResults3d") layerResults3d:  LayerResultsModel;

    @aliasOf("viewModel.layerResults2d") layerResults2d: LayerResultsModel;

    @aliasOf("viewModel.count_3d") count_3d = 0;

    @aliasOf("viewModel.count_2d") count_2d = 0;

    @aliasOf("viewModel.expand") expand: Expand;

    @aliasOf("viewModel.results3d_grid") results3d_grid: Grid;

    @aliasOf("viewModel.results2d_grid") results2d_grid: Grid;

    @aliasOf("viewModel.meta3d") meta3d: Grid;

    @aliasOf("viewModel.meta2d") meta2d: Grid;

    @aliasOf("viewModel.store3d") store3d = new Memory({data: []});

    @aliasOf("viewModel.store2d") store2d = new Memory({data: []});

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
        const handle1 = this.watch("layerResults3d", (newValue: LayerResultsModel, oldValue: LayerResultsModel, property: String, object: this) => {
          this.count_3d = newValue.features.length;
          const array3D = this.viewModel.create3DArray(newValue.features, this.groundElevation, this.peak);
          console.log(array3D);
          this.results3d_grid.renderArray(array3D);
          this.meta3d.renderArray(array3D);
        });

        const handle2 = this.watch("layerResults2d", (newValue: LayerResultsModel, oldValue: LayerResultsModel, property: String, object: this) => {
          this.count_2d = newValue.features.length;
          const array2D = this.viewModel.create2DArray(newValue.features);
          console.log(array2D);
          this.results2d_grid.renderArray(array2D);
          this.meta2d.renderArray(array2D);
        });

        this.own([handle1, handle2]);
      // let table_rows: [[HTMLElement, HTMLElement]];
      // array3D.forEach((obj) => {
      //     const tr = domConstruct.create("tr", {class: "3d-results-row", id: obj.oid + "_3d_result_row"});
          
      //     // set the layer name as a data attribute on the domNode
      //     domAttr.set(tr, "data-layername", obj.layerName);

      //     // create the visibility toggle
      //     const viz = domConstruct.create("label", {class: "toggle-switch"});
      //     const viz_input = domConstruct.create("input", {type: "checkbox", class: "toggle-switch-input", id: obj.oid + "_3d_result_switch"});

      //     if (table_rows && table_rows.length) {
      //         table_rows.push([viz_input, tr]);
      //     } else {
      //         table_rows = [[viz_input, tr]];
      //     }
        

      //     const viz_span = domConstruct.create("span", {class: "toggle-switch-track margin-right-1"});
      
      //     domConstruct.place(viz_input, viz);
      //     domConstruct.place(viz_span, viz);

      //     const td = domConstruct.create("td", {class: "vis-field"});
      //     domConstruct.place(viz, td);

      //     const td1 = domConstruct.create("td", {innerHTML: obj.clearance, class: "data-field"});
      //     const td2 = domConstruct.create("td", {innerHTML: obj.surface, class: "data-field"});
      //     const td3 = domConstruct.create("td", {innerHTML: obj.type, class: "data-field"});
      //     const td4 = domConstruct.create("td", {innerHTML: obj.condition, class: "data-field"});
      //     const td5 = domConstruct.create("td", {innerHTML: obj.runway, class: "data-field"});
      //     const td6 = domConstruct.create("td", {innerHTML: obj.elevation, class: "data-field"});
      //     const td7 = domConstruct.create("td", {innerHTML: obj.height, class: "data-field"});
          
      //     if (obj.clearance <= 0) {
      //         domClass.add(td1, "negative");
      //     }
      //     domConstruct.place(td, tr);
      //     domConstruct.place(td1, tr);
      //     domConstruct.place(td2, tr);
      //     domConstruct.place(td3, tr);
      //     domConstruct.place(td4, tr);
      //     domConstruct.place(td5, tr);
      //     domConstruct.place(td6, tr);
      //     domConstruct.place(td7, tr);
        
      //     domConstruct.place(tr, tbody);

      // });

      // domConstruct.place(tbody, table3D);
      // domConstruct.place(table3D, div_wrapper);

      // if (table_rows) {
      //     this.build3dTableConnections(tbody, table_rows);
      // }
        // });
       
    }

    private Click3d(element: HTMLElement) {
      if (!domClass.contains(element, "is-active")) {
        const link3D = document.getElementById("tab_3d");
        const link3D_meta = document.getElementById("tab-meta_3d");
        const article1 = document.getElementById("results3d");
        const article1_meta = document.getElementById("results3d_meta");
        const link2D = document.getElementById("tab_2d");
        const link2D_meta = document.getElementById("tab-meta_2d");
        const article2 = document.getElementById("results2d")
        const article2_meta = document.getElementById("results2d_meta");

        domClass.add(link3D, "is-active");
        domClass.add(article1, "is-active");

        domClass.remove(link3D_meta, "is-active");
        domClass.remove(link2D_meta, "is-active");
        domClass.remove(article1_meta, "is-active");
        domClass.remove(link2D, "is-active");
        domClass.remove(article2, "is-active");
        domClass.remove(article2_meta, "is-active");
      }
    }

    private Click2d(element: HTMLElement) {
      if (!domClass.contains(element, "is-active")) {
        const link3D = document.getElementById("tab_3d");
        const link3D_meta = document.getElementById("tab-meta_3d");
        const article1 = document.getElementById("results3d");
        const article1_meta = document.getElementById("results3d_meta");
        const link2D = document.getElementById("tab_2d");
        const link2D_meta = document.getElementById("tab-meta_2d");
        const article2 = document.getElementById("results2d")
        const article2_meta = document.getElementById("results2d_meta");

        domClass.add(link2D, "is-active");
        domClass.add(article2, "is-active");
       
        domClass.remove(link3D_meta, "is-active");
        domClass.remove(link2D_meta, "is-active:);")
        domClass.remove(article2_meta, "is-active");
        domClass.remove(link3D, "is-active");
        domClass.remove(article1, "is-active");
        domClass.remove(article1_meta, "is-active");
      }
    }

    private Click3dMeta(element: HTMLElement) {
      if (!domClass.contains(element, "is-active")) {
        const link3D = document.getElementById("tab_3d");
        const link3D_meta = document.getElementById("tab-meta_3d");
        const article1 = document.getElementById("results3d");
        const article1_meta = document.getElementById("results3d_meta");
        const link2D = document.getElementById("tab_2d");
        const link2D_meta = document.getElementById("tab-meta_2d");
        const article2 = document.getElementById("results2d")
        const article2_meta = document.getElementById("results2d_meta");

        domClass.add(link3D_meta, "is-active");
        domClass.add(article1_meta, "is-active");

        domClass.remove(link3D, "is-active");
        domClass.remove(article1, "is-active");
        domClass.remove(link2D, "is-active");
        domClass.remove(article2, "is-active");
        domClass.remove(link2D_meta, "is-active");
        domClass.remove(article2_meta, "is-active");
      }
    }

    private Click2dMeta(element: HTMLElement) {
      if (!domClass.contains(element, "is-active")) {
        const link3D = document.getElementById("tab_3d");
        const link3D_meta = document.getElementById("tab-meta_3d");
        const article1 = document.getElementById("results3d");
        const article1_meta = document.getElementById("results3d_meta");
        const link2D = document.getElementById("tab_2d");
        const link2D_meta = document.getElementById("tab-meta_2d");
        const article2 = document.getElementById("results2d")
        const article2_meta = document.getElementById("results2d_meta");

        
        domClass.add(article2_meta, "is-active");
        domClass.add(link2D_meta, "is-active");

        domClass.remove(article2, "is-active");
        domClass.remove(link2D, "is-active");
        domClass.remove(link3D, "is-active");
        domClass.remove(link3D_meta, "is-active");
        domClass.remove(article1, "is-active");
        domClass.remove(article1_meta, "is-active");
      }
    }

    private buildResults3d(element: HTMLElement) {
      
      const columns = {
        clearance: {
          label: "Clearance (+ / - ft.)",
          className: "data-field"
        },
        name: {
          label: "Surface Name",
          className: "data-field"
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
          label: "Elevation Above Sea Level (ft.)",
          className: "data-field"
        },
        height: {
          label: "Height Above Ground (ft.)",
          className: "data-field"
        }
      };

      const grid = this.results3d_grid = new (declare([Grid, Selection])) ({
        columns: columns,
        className: "dgrid-autoheight"
      }, element);
  
      grid.startup();
    }

    private buildResults2d(element: HTMLElement) {
      
      const columns = {
        name: {
          label: "Surface Name"
        },
        desc: {
          label: "Description"
        }
      };

      const grid = this.results2d_grid = new (declare([Grid, Selection])) ({
        columns: columns,
        className: "dgrid-autoheight"
      }, element);

      grid.startup();
      // pass these function to the watch event on layerResults2D
      // const array2D = this.create2DArray(features2D);

      // let highlight: any;
      // array2D.forEach((obj) => {
      //     const tr = domConstruct.create("tr");
      //     // set the layer name as a data attribute on the domNode
      //     domAttr.set(tr, "data-layername", obj.layerName);

      //     const td = domConstruct.create("td", {innerHTML: obj.name});
      //     const td2 = domConstruct.create("td", {innerHTML: obj.description});
      //     domConstruct.place(td, tr);
      //     domConstruct.place(td2, tr);
      //     domConstruct.place(tr, tbody);

      //     // when hovering over row, obtain the target layer and highlight the layer view
      //     on(tr, "mouseover", (evt) => {
      //         // use data-attributes to assign layer name to the dom node, then look up layer in scene to get layerView
      //         highlight = this.highlight2DRow(evt, obj, highlight);
      //     });
      // });

      // // when leaving the table, remove the highlight
      // on(tbody, "mouseleave", (evt) => {
      //     if (highlight) {
      //         highlight.remove();
      //     }
      // });

      // domConstruct.place(tbody, table2D);
      // domConstruct.place(table2D, div_wrapper);
      // return div_wrapper;
    }

    private build3dMeta(element: HTMLElement) {
      
      const columns = {
        clearance: {
          label: "Clearance (+ / - ft.)",
          className: "data-field"
        },
        guidance: {
          label: "Approach Guidance",
          className: "metadata-field"
        },
        date: {
          label: "Date Acquired",
          className: "metadata-field"
        },
        desc: {
          label: "Description",
          className: "metadata-field"
        },
        regulation: {
          label: "Safety Regulation",
          className: "metadata-field"
        },
        zone: {
          label: "Zone Use",
          className: "metadata-field"
        }
      };

      const grid = this.meta3d = new (declare([Grid, Selection])) ({
        columns: columns,
        className: "dgrid-autoheight"
      }, element);
      
      grid.startup();

      // assign these function to the watch event on the layerResults3d
      // const array3D = this.create3DArray(features3D, base_height, peak_height);
      // array3D.forEach((obj) => {
      //     const tr = domConstruct.create("tr");
      //     // set the layer name as a data attribute on the domNode
      //     domAttr.set(tr, "data-layername", obj.layerName);

      //     const td = domConstruct.create("td", {innerHTML: obj.clearance, class: "data-field"});
      //     const td2 = domConstruct.create("td", {innerHTML: obj.guidance, class: "metadata-field"});
      //     const td3 = domConstruct.create("td", {innerHTML: obj.date_acquired, class: "metadata-field"});
      //     const td4 = domConstruct.create("td", {innerHTML: obj.description, class: "metadata-field"});
      //     const td5 = domConstruct.create("td", {innerHTML: obj.regulation, class: "metadata-field"});
      //     const td6 = domConstruct.create("td", {innerHTML: obj.zone_use, class: "metadata-field"});
      //     if (obj.clearance <= 0) {
      //         domClass.add(td, "negative");
      //     }
      //     domConstruct.place(td, tr);
      //     domConstruct.place(td2, tr);
      //     domConstruct.place(td3, tr);
      //     domConstruct.place(td4, tr);
      //     domConstruct.place(td5, tr);
      //     domConstruct.place(td6, tr);

      //     // when hovering over row, set single feature visible hide other layers
      //     on(tr, "mouseover", (evt) => {
      //         const layerName = domAttr.get(evt.currentTarget, "data-layername");
      //         const layerID = layerName.toLowerCase().replace(" ", "_");
      //         const target_layer = this.scene.findLayerById(layerID) as FeatureLayer;
      //         target_layer.definitionExpression = "OBJECTID = " + obj.oid; 
      //         this.setSingleLayerVisible(target_layer);
      //     });

      //     domConstruct.place(tr, tbody);
      // });

      // // when leaving the table, reset the layer visibility back to the default
      // on(tbody, "mouseleave", (evt) => {
      //     this.getDefaultLayerVisibility();
      // });

      // domConstruct.place(tbody, table3D);
      // domConstruct.place(table3D, div_wrapper);
      // return div_wrapper;
    }

    private build2dMeta(element: HTMLElement) {
    
      const columns = {
        date: {
          label: "Date Acquired"
        },
        source: {
          label: "Data Source"
        },
        updated: {
          label: "Last Update"
        }
      };

      const grid = this.meta2d = new (declare([Grid, Selection])) ({
        columns: columns,
        className: "dgrid-autoheight"
      }, element);

      grid.startup();

      // assign these functions to the watch events on the layerResults2D
      // const array2D = this.create2DArray(features2D);

      // let highlight: any;
      // array2D.forEach((obj) => {
      //     const tr = domConstruct.create("tr");

      //     // set the layer name as a data attribute on the domNode
      //     domAttr.set(tr, "data-layername", obj.layerName);

      //     const td = domConstruct.create("td", {innerHTML: obj.date_acquired, class: "metadata-field"});
      //     const td2 = domConstruct.create("td", {innerHTML: obj.data_source, class: "metadata-field"});
      //     const td3 = domConstruct.create("td", {innerHTML: obj.last_update, class: "metadata-field"});
      //     domConstruct.place(td, tr);
      //     domConstruct.place(td2, tr);
      //     domConstruct.place(td3, tr);
          
      //     // when hovering over row, highlight feature in the scene
      //     on(tr, "mouseover", (evt) => {
      //         highlight = this.highlight2DRow(evt, obj, highlight);
      //     });

      //     domConstruct.place(tr, tbody);
      // });

      // // when leaving the table, remove the highlight
      // on(tbody, "mouseleave", (evt) => {
      //     if (highlight) {
      //         highlight.remove();
      //     }
      // });

      // domConstruct.place(tbody, table2D);
      // domConstruct.place(table2D, div_wrapper);
      // return div_wrapper;
    }

    render() {

      return (
        <div id="obstructionResults">
          <h2>{this.name}</h2>
          <div>
            <b>x:</b>{this.x}<br></br>
            <b>y:</b>{this.y}<br></br>
            <b>Ground Elevation:</b>{this.groundElevation} feet MSL <i>source:{this.dem_source}</i><br></br>
            <b>Obstruction Height:</b>{this.peak} feet<br></br>
          </div>
          <div class="trailer-2 js-tab-group">
            <nav class="tab-nav">
              <a id="tab_3d" class="tab-title is-active" onclick={this.Click3d.bind(this)}>3D Surfaces ({this.count_3d})</a>
              <a id="tab-meta_3d" class= "tab-title" onclick={this.Click3dMeta.bind(this)}> - metadata</a>
              <a id="tab_2d" class= "tab-title" onclick={this.Click2d.bind(this)}>2D Surfaces ({this.count_2d})</a>
              <a id="tab-meta_2d" class= "tab-title" onclick={this.Click2dMeta.bind(this)}> - metadata</a>
            </nav>
            <section class="tab-contents claro">
              <article id="results3d" class="results_panel tab-section js-tab-section is-active">
                <div afterCreate={this.buildResults3d.bind(this)}></div>
              </article>
              <article id="results2d" class="results_panel tab-section js-tab-section">
                <div afterCreate={this.buildResults2d.bind(this)}></div>
              </article>
              <article id="results3d_meta" class="results_panel-meta tab-section js-tab-section">
                <div afterCreate={this.build3dMeta.bind(this)}></div>
              </article>
              <article id="results2d_meta" class="results_panel-meta tab-section js-tab-section">
                <div afterCreate={this.build2dMeta.bind(this)}></div>
              </article>
            </section>
          </div>
        </div>
      );
    }
}
  