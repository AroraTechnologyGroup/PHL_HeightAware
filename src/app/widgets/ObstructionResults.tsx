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

    @aliasOf("viewModel.agl") agl = 0;

    @aliasOf("viewModel.msl") msl = 0;

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
          const array3D = this.viewModel.create3DArray(newValue.features, this.groundElevation, this.agl);
          console.log(array3D);
          this.results3d_grid.set("collection", this.store3d.data);
          this.results3d_grid.refresh();
          this.results3d_grid.renderArray(this.store3d.data);
          this.results3d_grid.resize();
          this.meta3d.set("collection", this.store3d.data);
          this.meta3d.refresh()
          this.meta3d.renderArray(this.store3d.data);
          this.meta3d.resize();
        });

        const handle2 = this.watch("layerResults2d", (newValue: LayerResultsModel, oldValue: LayerResultsModel, property: String, object: this) => {
          this.count_2d = newValue.features.length;
          const array2D = this.viewModel.create2DArray(newValue.features);
          console.log(array2D);
          this.results2d_grid.set("collection", this.store2d.data);
          this.results2d_grid.refresh();
          this.results2d_grid.renderArray(this.store2d.data);
          this.results2d_grid.resize();
          this.meta2d.set("collection", this.store2d.data);
          this.meta2d.refresh();
          this.meta2d.renderArray(this.store2d.data);
          this.meta2d.resize();
        });

        this.own([handle1, handle2]);
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
      this.meta3d.resize();
      this.results3d_grid.resize();
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
      this.meta2d.resize();
      this.results2d_grid.resize();
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
      this.meta3d.resize();
      this.results3d_grid.resize();
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
      this.meta2d.resize();
      this.results2d_grid.resize();
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
        columns: columns
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
        columns: columns
      }, element);

      grid.startup();
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
        columns: columns
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

      grid.startup();
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
        columns: columns
      }, element);

      grid.startup();
    }

    render() {

      return (
        <div id="obstructionResults">
          <h2>{this.name}</h2>
          <div>
            <b>x:</b>{this.x}<br></br>
            <b>y:</b>{this.y}<br></br>
            <b>Ground Elevation:</b>{this.groundElevation} feet MSL <i>source:{this.dem_source}</i><br></br>
            <b>Obstruction Height AGL:</b>{this.agl} feet<br></br>
            <b>Obstruction Elevation MSL:</b>{this.msl} feet<br></br>
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
  