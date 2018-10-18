/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../../node_modules/gl-matrix-ts/dist/index.d.ts" />
/// <reference path="../../../../node_modules/gl-matrix-ts/dist/mat4.d.ts" />
/// <reference path="../../../../node_modules/@types/arcgis-js-api/index.d.ts" />
/// <reference path="../../../../node_modules/@types/dojo/index.d.ts" />
/// <reference path="../../../../node_modules/@types/gl-matrix/index.d.ts" />

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

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface ObstructionResultsParams {
  scene: WebScene;
  view: SceneView;
  x: number;
  y: number;
  modifiedBase: boolean;
}

export interface ObstructionSettings {
  layerResults3d: LayerResultsModel; 
  layerResults2d: LayerResultsModel;
  dem_source: string;
  groundElevation: number;
  peak_height: number;
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
  @property() peak: number;

  @renderable()
  @property() groundElevation: number;

  @renderable()
  @property() dem_source: string;

  @renderable()
  @property() obstructionSettings: ObstructionSettings;

  @property() modifiedBase: boolean;

  @property() scene: WebScene;

  @property() view: SceneView;

  @property() displayMode: string;

  @property() layerVisibility: [LayerVisibilityModel];

  @property() rowHoverEvts: [];

  @property() tableLeaveEvt: any;

  @property() idResults: [IdentifyResult];

  constructor(params?: Partial<ObstructionResultsParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }


  private onload() {
    
  }

  private buildPopup(layerResults3d: LayerResultsModel, layerResults2d: LayerResultsModel, base_height: number, peak_height: number, x: number, y: number) {

    let obsHt = 0;
    if (peak_height) {
        obsHt = peak_height;
    }
    const features3D: [Graphic] = layerResults3d.features;
    const features2D: [Graphic] = layerResults2d.features;
    
    const table3D = this.generateResultsGrid3D(layerResults3d, base_height, peak_height);
    domConstruct.place(table3D, article1);

    const table2D = this.generateResultsGrid2D(layerResults2d);
    domConstruct.place(table2D, article2);
    return popup_container;
  }

  private row_hover_funct(evt: any, id: string) {
    const layerName = domAttr.get(evt.currentTarget, "data-layername");
    const layerID = layerName.toLowerCase().replace(" ", "_");
    const target_layer = this.scene.findLayerById(layerID) as FeatureLayer;
    target_layer.definitionExpression = "OBJECTID = " + id; 
    this.setSingleLayerVisible(target_layer);
  }

  private build3dTableConnections(table_body: HTMLElement, table_rows: [[HTMLElement, HTMLElement]]) {
    console.log(table_rows);
  
    // set the events for the hover mode
    if (this.displayMode === "hover") {

        if (!this.tableLeaveEvt) {
            this.tableLeaveEvt = on(table_body, "mouseleave", (evt) => {
                this.getDefaultLayerVisibility();
            });
        }
        
        table_rows.forEach((arr: [HTMLElement, HTMLElement]) => {
            const row = arr[1];
            const _switch = arr[0];

            const row_hover = on(row, "mouseenter", (evt) => {
                const id = evt.target.id.split("_")[0];
                this.row_hover_funct(evt, id);
            });

            if (!this.rowHoverEvts) {
                this.set("rowHoverEvts", [row_hover]);
            } else {
                this.rowHoverEvts.push(row_hover);
            }                

            on(_switch, "click", (evt) => {
                // enable toggle mode
                if (evt.target.checked) {
                    this.set("display_mode", "toggle");
                    this.build3dTableConnections(table_body, table_rows);
                } else {
                    // check if there are any other checked switches if not change the mode to toggle
                    const any_checked = Array.some(table_rows, (arr: [HTMLElement, HTMLElement]) => {
                        const _switch = arr[0];
                        if (_switch.checked) {
                            return true;
                        }
                    });
                    if (!any_checked) {
                        this.set("display_mode", "hover");
                        this.build3dTableConnections(table_body, table_rows);
                    }
                }
            });
        });
    }

    // set the events for the toggle mode
    else if (this.displayMode === "toggle") {
        // remove the table leave event
        if (this.tableLeaveEvt) {
            this.tableLeaveEvt.remove();
            this.tableLeaveEvt = undefined;
        }
        // remove all of the row hover events
        this.rowHoverEvts.forEach((obj) => {
            obj.remove();
        });
        this.rowHoverEvts = [];

    }
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

  public generateMetaGrid3D(layerResults3d: LayerResultsModel, base_height: number, peak_height: number) {
    const features3D: [Graphic] = layerResults3d.features; 
    const div_wrapper = domConstruct.create("div", {class: "overflow-auto table-div"});

    const table3D = domConstruct.create("table", {class: "table meta-table"});
    const thead = domConstruct.create("thead");
    const header_row = domConstruct.create("tr");
    const h1 = domConstruct.create("th", {innerHTML: "Clearance (+ / - ft.)", class: "data-field"});
    const h2 = domConstruct.create("th", {innerHTML: "Approach Guidance", class: "metadata-field"});
    const h3 = domConstruct.create("th", {innerHTML: "Date Acquired", class: "metadata-field"});
    const h4 = domConstruct.create("th", {innerHTML: "Description", class: "metadata-field"});
    const h5 = domConstruct.create("th", {innerHTML: "Safety Regulation", class: "metadata-field"});
    const h6 = domConstruct.create("th", {innerHTML: "Zone Use", class: "metadata-field"});
    domConstruct.place(h1, header_row);
    domConstruct.place(h2, header_row);
    domConstruct.place(h3, header_row);
    domConstruct.place(h4, header_row);
    domConstruct.place(h5, header_row);
    domConstruct.place(h6, header_row);
    domConstruct.place(header_row, thead);
    domConstruct.place(thead, table3D);

    const tbody = domConstruct.create("tbody");
    const array3D = this.create3DArray(features3D, base_height, peak_height);
    array3D.forEach((obj) => {
        const tr = domConstruct.create("tr");
        // set the layer name as a data attribute on the domNode
        domAttr.set(tr, "data-layername", obj.layerName);

        const td = domConstruct.create("td", {innerHTML: obj.clearance, class: "data-field"});
        const td2 = domConstruct.create("td", {innerHTML: obj.guidance, class: "metadata-field"});
        const td3 = domConstruct.create("td", {innerHTML: obj.date_acquired, class: "metadata-field"});
        const td4 = domConstruct.create("td", {innerHTML: obj.description, class: "metadata-field"});
        const td5 = domConstruct.create("td", {innerHTML: obj.regulation, class: "metadata-field"});
        const td6 = domConstruct.create("td", {innerHTML: obj.zone_use, class: "metadata-field"});
        if (obj.clearance <= 0) {
            domClass.add(td, "negative");
        }
        domConstruct.place(td, tr);
        domConstruct.place(td2, tr);
        domConstruct.place(td3, tr);
        domConstruct.place(td4, tr);
        domConstruct.place(td5, tr);
        domConstruct.place(td6, tr);

        // when hovering over row, set single feature visible hide other layers
        on(tr, "mouseover", (evt) => {
            const layerName = domAttr.get(evt.currentTarget, "data-layername");
            const layerID = layerName.toLowerCase().replace(" ", "_");
            const target_layer = this.scene.findLayerById(layerID) as FeatureLayer;
            target_layer.definitionExpression = "OBJECTID = " + obj.oid; 
            this.setSingleLayerVisible(target_layer);
        });

        domConstruct.place(tr, tbody);
    });

    // when leaving the table, reset the layer visibility back to the default
    on(tbody, "mouseleave", (evt) => {
        this.getDefaultLayerVisibility();
    });

    domConstruct.place(tbody, table3D);
    domConstruct.place(table3D, div_wrapper);
    return div_wrapper;
  }

  public generateResultsGrid2D(layerResults2d: LayerResultsModel) {
    const div_wrapper = domConstruct.create("div", {class: "overflow-auto table-div"});
    const features2D: [Graphic] = layerResults2d.features;
    
    const table2D = domConstruct.create("table", {class: "table"});
    const thead = domConstruct.create("thead");
    const header_row = domConstruct.create("tr");
    const h1 = domConstruct.create("th", {innerHTML: "Surface Name"});
    const h2 = domConstruct.create("th", {innerHTML: "Description"});
    domConstruct.place(h1, header_row);
    domConstruct.place(h2, header_row);
    domConstruct.place(header_row, thead);
    domConstruct.place(thead, table2D);

    const tbody = domConstruct.create("tbody");
    const array2D = this.create2DArray(features2D);

    let highlight: any;
    array2D.forEach((obj) => {
        const tr = domConstruct.create("tr");
        // set the layer name as a data attribute on the domNode
        domAttr.set(tr, "data-layername", obj.layerName);

        const td = domConstruct.create("td", {innerHTML: obj.name});
        const td2 = domConstruct.create("td", {innerHTML: obj.description});
        domConstruct.place(td, tr);
        domConstruct.place(td2, tr);
        domConstruct.place(tr, tbody);

        // when hovering over row, obtain the target layer and highlight the layer view
        on(tr, "mouseover", (evt) => {
            // use data-attributes to assign layer name to the dom node, then look up layer in scene to get layerView
            highlight = this.highlight2DRow(evt, obj, highlight);
        });
    });

    // when leaving the table, remove the highlight
    on(tbody, "mouseleave", (evt) => {
        if (highlight) {
            highlight.remove();
        }
    });

    domConstruct.place(tbody, table2D);
    domConstruct.place(table2D, div_wrapper);
    return div_wrapper;
  }

  private highlight2DRow(evt: any, _obj: any,  _highlight: any) {
    // use data-attributes to assign layer name to the dom node, then look up layer in scene to get layerView
    const layerName = domAttr.get(evt.currentTarget, "data-layername");
    const layerID = layerName.toLowerCase().replace(" ", "_");
    const target_layer = this.scene.findLayerById(layerID) as FeatureLayer;
    let highlight = _highlight;
    this.view.whenLayerView(target_layer).then((lyrView: FeatureLayerView) => {
        if (highlight) {
            highlight.remove();
        }
        highlight = lyrView.highlight(Number(_obj.oid));
    });
    return highlight;
  }

  public generateMetaGrid2D(layerResults2d: LayerResultsModel) {
    const div_wrapper = domConstruct.create("div", {class: "overflow-auto table-div"});
    const features2D: [Graphic] = layerResults2d.features;
    const crit_2d_layer = this.scene.findLayerById("runwayhelipaddesignsurface") as FeatureLayer;
    const aoa = this.scene.findLayerById("airoperationsarea") as FeatureLayer;

    const table2D = domConstruct.create("table", {class: "table meta-table"});
    const thead = domConstruct.create("thead");
    const header_row = domConstruct.create("tr");
    const h1 = domConstruct.create("th", {innerHTML: "Date Acquired"});
    const h2 = domConstruct.create("th", {innerHTML: "Data Source"});
    const h3 = domConstruct.create("th", {innerHTML: "Last Update"});
    domConstruct.place(h1, header_row);
    domConstruct.place(h2, header_row);
    domConstruct.place(h3, header_row);
    domConstruct.place(header_row, thead);
    domConstruct.place(thead, table2D);

    const tbody = domConstruct.create("tbody");
    const array2D = this.create2DArray(features2D);

    let highlight: any;
    array2D.forEach((obj) => {
        const tr = domConstruct.create("tr");

        // set the layer name as a data attribute on the domNode
        domAttr.set(tr, "data-layername", obj.layerName);

        const td = domConstruct.create("td", {innerHTML: obj.date_acquired, class: "metadata-field"});
        const td2 = domConstruct.create("td", {innerHTML: obj.data_source, class: "metadata-field"});
        const td3 = domConstruct.create("td", {innerHTML: obj.last_update, class: "metadata-field"});
        domConstruct.place(td, tr);
        domConstruct.place(td2, tr);
        domConstruct.place(td3, tr);
        
        // when hovering over row, highlight feature in the scene
        on(tr, "mouseover", (evt) => {
            highlight = this.highlight2DRow(evt, obj, highlight);
        });

        domConstruct.place(tr, tbody);
    });

    // when leaving the table, remove the highlight
    on(tbody, "mouseleave", (evt) => {
        if (highlight) {
            highlight.remove();
        }
    });

    domConstruct.place(tbody, table2D);
    domConstruct.place(table2D, div_wrapper);
    return div_wrapper;
  }

  private create3DArray(features: [Graphic], base_height: number, obsHt: number) {
    // the features are an array of surface polygons with the Elev attribute equal to the cell value at the obstruction x-y location
    // let limiter = 99999;
    const results = features.map((feature) => {
        const surface_elevation: number = feature.attributes.Elev;
        let height_agl: number;
        let clearance: number;
      
        height_agl = Number((surface_elevation - base_height).toFixed(1));
        clearance = Number((height_agl - obsHt).toFixed(1));
        // if (clearance < limiter) {
            // as the features are iterated, the smallest clearance value is maintained as the limiter value
            // limiter = clearance;
        // }
        return({
            oid: feature.attributes.OBJECTID,
            layerName: feature.attributes.layerName,
            surface: feature.attributes.Name,
            type: feature.attributes["OIS Surface Type"],
            condition: feature.attributes["OIS Surface Condition"],
            runway: feature.attributes["Runway Designator"], 
            elevation: surface_elevation, 
            height: height_agl, 
            clearance: clearance,
            guidance: feature.attributes["Approach Guidance"],
            date_acquired: feature.attributes["Date Data Acquired"],
            description: feature.attributes.Description,
            regulation: feature.attributes["Safety Regulation"],
            zone_use: feature.attributes["Zone Use"]
        });
    });

    // sort the results by the clearance values
    const sorted_array = results.slice(0);
    sorted_array.sort((leftSide, rightSide): number => {
        if (leftSide.clearance < rightSide.clearance) {return 1; }
        if (leftSide.clearance > rightSide.clearance) {return -1; }
        return 0;
    });
    return sorted_array;
  }

  private create2DArray(features: [Graphic]) {
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
    return sorted_array;
  }

  private getDefaultLayerVisibility() {
      const default_vis = this.layerVisibility;
      this.layerVisibility.forEach((obj: LayerVisibilityModel) => {
          const target_layer = this.scene.findLayerById(obj.id) as FeatureLayer;
          target_layer.visible = obj.def_visible;
          target_layer.definitionExpression = obj.def_exp;
      });
  }

  public generateResultsGrid3D(layerResults3d: LayerResultsModel, base_height: number, peak_height: number) {
    const features3D: [Graphic] = layerResults3d.features;
  
    const div_wrapper = domConstruct.create("div", {class: "overflow-auto table-div"});

    const table3D = domConstruct.create("table", {class: "table"});
    const thead = domConstruct.create("thead");
    const header_row = domConstruct.create("tr");
    
    const h = domConstruct.create("th", {innerHTML: "Visibility Lock", class: "vis-field"});
    const h1 = domConstruct.create("th", {innerHTML: "Clearance (+ / - ft.)", class: "data-field"});
    const h2 = domConstruct.create("th", {innerHTML: "Surface Name", class: "data-field"});
    const h3 = domConstruct.create("th", {innerHTML: "Type", class: "data-field"});
    const h4 = domConstruct.create("th", {innerHTML: "Condition", class: "data-field"});
    const h5 = domConstruct.create("th", {innerHTML: "Runway", class: "data-field"});
    const h6 = domConstruct.create("th", {innerHTML: "Elevation Above Sea Level (ft.)", class: "data-field"});
    const h7 = domConstruct.create("th", {innerHTML: "Height Above Ground (ft.)", class: "data-field"});
    
    domConstruct.place(h, header_row);
    domConstruct.place(h1, header_row);
    domConstruct.place(h2, header_row);
    domConstruct.place(h3, header_row);
    domConstruct.place(h4, header_row);
    domConstruct.place(h5, header_row);
    domConstruct.place(h6, header_row);
    domConstruct.place(h7, header_row);
    domConstruct.place(header_row, thead);
    domConstruct.place(thead, table3D);

    const tbody = domConstruct.create("tbody");
   
    const array3D = this.create3DArray(features3D, base_height, peak_height);
  
    let table_rows: [[HTMLElement, HTMLElement]];
    array3D.forEach((obj) => {
        const tr = domConstruct.create("tr", {class: "3d-results-row", id: obj.oid + "_3d_result_row"});
        
        // set the layer name as a data attribute on the domNode
        domAttr.set(tr, "data-layername", obj.layerName);

        // create the visibility toggle
        const viz = domConstruct.create("label", {class: "toggle-switch"});
        const viz_input = domConstruct.create("input", {type: "checkbox", class: "toggle-switch-input", id: obj.oid + "_3d_result_switch"});

        if (table_rows && table_rows.length) {
            table_rows.push([viz_input, tr]);
        } else {
            table_rows = [[viz_input, tr]];
        }
       

        const viz_span = domConstruct.create("span", {class: "toggle-switch-track margin-right-1"});
    
        domConstruct.place(viz_input, viz);
        domConstruct.place(viz_span, viz);

        const td = domConstruct.create("td", {class: "vis-field"});
        domConstruct.place(viz, td);

        const td1 = domConstruct.create("td", {innerHTML: obj.clearance, class: "data-field"});
        const td2 = domConstruct.create("td", {innerHTML: obj.surface, class: "data-field"});
        const td3 = domConstruct.create("td", {innerHTML: obj.type, class: "data-field"});
        const td4 = domConstruct.create("td", {innerHTML: obj.condition, class: "data-field"});
        const td5 = domConstruct.create("td", {innerHTML: obj.runway, class: "data-field"});
        const td6 = domConstruct.create("td", {innerHTML: obj.elevation, class: "data-field"});
        const td7 = domConstruct.create("td", {innerHTML: obj.height, class: "data-field"});
        
        if (obj.clearance <= 0) {
            domClass.add(td1, "negative");
        }
        domConstruct.place(td, tr);
        domConstruct.place(td1, tr);
        domConstruct.place(td2, tr);
        domConstruct.place(td3, tr);
        domConstruct.place(td4, tr);
        domConstruct.place(td5, tr);
        domConstruct.place(td6, tr);
        domConstruct.place(td7, tr);
      
        domConstruct.place(tr, tbody);

    });

    domConstruct.place(tbody, table3D);
    domConstruct.place(table3D, div_wrapper);

    if (table_rows) {
        this.build3dTableConnections(tbody, table_rows);
    }
    return div_wrapper;
  }

}

export default ObstructionResultsViewModel;
