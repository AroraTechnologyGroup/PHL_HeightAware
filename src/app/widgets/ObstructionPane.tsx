/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />

import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as IdentifyTask from "esri/tasks/IdentifyTask";
import * as IdentifyParameters from "esri/tasks/support/IdentifyParameters";
import * as Point from "esri/geometry/Point";
import * as Polygon from "esri/geometry/Polygon";
import * as Polyline from "esri/geometry/Polyline";
import * as geometryEngine from "esri/geometry/geometryEngine";
import * as SpatialReference from "esri/geometry/SpatialReference";
import * as Graphic from "esri/Graphic";
import * as PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import * as Query from "esri/tasks/support/Query";
import * as GraphicsLayer from "esri/layers/GraphicsLayer";
import * as FeatureLayer from "esri/layers/FeatureLayer";
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

import ObstructionViewModel, { ObstructionParams } from "./viewModels/ObstructionViewModel";
interface PanelProperties extends ObstructionParams, esri.WidgetProperties {}

import { renderable, tsx } from "esri/widgets/support/widget";

const CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/CEPCT/MapServer";
const idTask = new IdentifyTask({
    url: CEPCT
});
const idParams = new IdentifyParameters();
idParams.tolerance = 1;
idParams.returnGeometry = true;
idParams.layerOption = "all";

const sr = new SpatialReference({
    wkid: 2272
});

const pointerTracker = new Graphic({
    symbol: new PictureMarkerSymbol({
        url: "app/assets/reticle.png",
        width: 40,
        height: 40
    })
});		

const obstruction_base =  new FeatureLayer({
    id: "obstruction_base",
    title: "Placed Obstruction",
    fields: [
    {
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
    }, {
        name: "baseElevation",
        alias: "Base Elevation",
        type: "double"
    }, {
        name: "obstacleHeight",
        alias: "Obstacle Height",
        type: "double"
    }],
    objectIdField: "ObjectID",
    geometryType: "polygon",
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    source: [pointerTracker],
    legendEnabled: false,
    listMode: "hide",
    renderer: new SimpleRenderer({
        symbol: new PolygonSymbol3D({
            symbolLayers: [{
                type: "extrude",
                width: 5,
                depth: 5,
                resource: {primitive: "cylinder"},
                material: { color: "blue" }
                }]
        }),
        visualVariables: [{
            type: "size",
            field: "obstacleHeight",
            valueUnit: "feet"
        }]
    })
});

@subclass("app.widgets.obstructionPane")
export class ObstructionPane extends declared(Widget) {
    @property() viewModel = new ObstructionViewModel();
    
    @renderable()
    @property() name = "Obstruction Analysis";

    @property()
    @renderable() activated = false;

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    private activate(event: any): void {
        // hide the 3d layers
        const crit_3d = this.scene.findLayerById("critical_3d");
        const part77 = this.scene.findLayerById("part_77_group");
        crit_3d.visible = false;
        part77.visible = false;

        const ground_node: HTMLInputElement = dom.byId("groundLevel") as HTMLInputElement;
        const northing_node: HTMLInputElement = dom.byId("northing") as HTMLInputElement;
        const easting_node: HTMLInputElement = dom.byId("easting") as HTMLInputElement;
        const obsHeight_node: HTMLInputElement = dom.byId("obsHeight") as HTMLInputElement;

        const mouse_track = this.view.on("pointer-move", (e) => {
            let map_pnt = this.view.toMap({
                x: e.x,
                y: e.y
            });
            const graphic = pointerTracker.clone();
            graphic.geometry = map_pnt;
            this.view.graphics.removeAll();
            this.view.graphics.push(graphic);

            this.scene.ground.queryElevation(map_pnt).then(function(result: any) {
                const x = result.geometry.x;
                const y = result.geometry.y;
                const z = result.geometry.z;
                ground_node.value = z.toFixed(3);
                northing_node.value = y.toFixed(3);
                easting_node.value = x.toFixed(3);
            });
        });

        const view_click = this.view.on("click", (e) => {
            view_click.remove();
            e.stopPropagation();
            if (mouse_track) {
                mouse_track.remove();
                this.view.graphics.removeAll();
                // Make sure that there is a valid latitude/longitude
                if (e && e.mapPoint) {
                    const position = e.mapPoint;
                    this.scene.ground.queryElevation(position).then((result) => {
                        const geo = result.geometry as Point;
                        const height = parseFloat(obsHeight_node.value);
                        const x = geo.x;
                        const y = geo.y;
                        const z = geo.z;
                        
                        this.performQuery(x, y, z, height);

                    }, function(err) {
                        console.log(err);
                    });
                }
            }

        });
    }

    private submit(event: any): void {
        const obsHeight = dom.byId("obsHeight") as HTMLInputElement;
        const groundLevel = dom.byId("groundLevel") as HTMLInputElement;
        const northingNode = dom.byId("northing") as HTMLInputElement;
        const eastingNode = dom.byId("easting") as HTMLInputElement;
        let height = parseFloat(obsHeight.value);
        if (!height) {
            height = 25;
            obsHeight.value = "25";
        }
        const z = parseFloat(groundLevel.value);
        const y = parseFloat(northingNode.value);
        const x = parseFloat(eastingNode.value);
        this.performQuery(x, y, z, height);
    }

    private performQuery(_x: number, _y: number, _z: number, _height: number) {
        // create graphic and add to the obstruction base layer
        
        const pnt = new Point({
            x: _x,
            y: _y,
            z: _z,
            spatialReference: sr
        });

        const ptBuff = geometryEngine.buffer(pnt, 25, "feet") as Polygon;
        const peak = _z + _height;
        const graphic = new Graphic();
        graphic.attributes = {
            "ObjectID": 0,
            "baseElevation": _z,
            "obstacleHeight": peak
        };
        graphic.geometry = ptBuff;

        // this peak is for creating a vertical, the x -y  is slightly offset to prevent a vertical line
        // the Geometry layers are not honoring units of feet with absolute height
        const line = new Polyline({
            paths: [[
                [_x, _y, _z],
                [_x + 1, _y + 1, peak]
            ]],
            spatialReference: sr,
            hasZ: true
        });

        obstruction_base.source.removeAll();
        obstruction_base.source.add(graphic);
        this.scene.add(obstruction_base);

        this.doIdentify(_x, _y).then((response) => {
            if (response.results) {
                this.addToMap(response.results, event);
            } else {
                console.log("No results from server :: " + response);
            }
        });

        this.querySurfaces(line).then((e) => {
            this.filterSurfaces3D(e, line);
        });
    }

    private querySurfaces(vertical_line) {
        const map = this.scene;
        const main_deferred = new Deferred();
        const first = new Deferred();
        const last = new Deferred();

        const crit_3d = map.findLayerById("critical_3d");
        const part77 = map.findLayerById("part_77_group");
        const query = new Query({
            geometry: vertical_line,
            units: "feet",
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
            returnZ: true
        });


        const viz = Array.map(crit_3d.layers.items, (lyr: FeatureLayer) => {
            const deferred = new Deferred();
            lyr.queryFeatures(query).then((e) => {
                if (e.features.length) {
                    // iterate through each geometry and get the oid if it intersect the vertical geomtery
                    // the Query is not honoring the 3d feature intersect so the Geometry Engine is used
                    this.filterSurfaces3D(e, vertical_line).then((oids) => {
                        if (oids.length > 1) {
                            lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                        } else {
                            lyr.definitionExpression = "OBJECTID = " + oids[0];
                        }
                        deferred.resolve(true);
                    });
                } else {
                    lyr.definitionExpression = "OBJECTID IS NULL";
                    deferred.resolve(false);
                }
            }, function(err) {
                console.log(err);
                deferred.resolve(false);
            });
            lyr.refresh();
            return deferred.promise;
        });

        all(viz).then(function(e) {
            if (Array.indexOf(e, true) !== -1) {
                crit_3d.visible = true;
            } else {
                crit_3d.visible = false;
            }
            first.resolve();
        });
        
        const viz2 = Array.map(part77.layers.items, (lyr: FeatureLayer) => {
            const deferred = new Deferred();
            lyr.queryFeatures(query).then((e) => {
                if (e.features.length) {
                    this.filterSurfaces3D(e, vertical_line).then(function(oids) {
                        if (oids) {
                            if (oids.length > 1) {
                                lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                            } else {
                                lyr.definitionExpression = "OBJECTID = " + oids[0]
                            }
                            deferred.resolve(true);
                        } else {
                            lyr.definitionExpression = "OBJECTID IS NULL";
                            deferred.resolve(false);
                        }
                    });
                } else {
                    lyr.definitionExpression = "OBJECTID IS NULL";
                    deferred.resolve(false);
                }
            }, function(err) {
                console.log(err);
                deferred.resolve(false);
            });
            lyr.refresh();
            return deferred.promise;
        });

        all(viz2).then(function(e) {
            if (Array.indexOf(e, true) !== -1) {
                part77.visible = true;
            } else {
                part77.visible = false;
            }
            last.resolve();
        });

        all([first, last]).then(function(e) {
            main_deferred.resolve(e);
        });
        return main_deferred.promise;
    }

    private filterSurfaces3D(_graphics, _line) {
        // return a promise with an array of oids
        const main_deferred = new Deferred();

        const oids = Array.map(_graphics.features, (e: Graphic) => {
            const deferred = new Deferred();
            const does_intersect = geometryEngine.intersects(e.geometry, _line);
            if (does_intersect) {
                deferred.resolve(e.attributes["OBJECTID"]);
            } else {
                deferred.cancel();
            }
            return deferred.promise;
        });

        all(oids).then(function(list) {
            main_deferred.resolve(list);
        });

        return main_deferred.promise;
    }

    private doIdentify(x: number, y: number) {
        const map = this.scene;
        const view = this.view;
        const deferred = new Deferred();
        const x_coord = x;
        const y_coord = y;

        // a vertical line gets passed as the query geometry
        const vert_line = new Polyline({
            spatialReference: sr,
            hasZ: true,
            paths: [[
                [x_coord, y_coord, 0],
                [x_coord, y_coord, 1000]
            ]]
        });

        idParams.mapExtent = view.extent;
        idParams.geometry = new Point({
            x: x_coord,
            y: y_coord,
            spatialReference: sr
        });

        idTask.execute(idParams).then(function(response) {
            console.log(response.results);
            deferred.resolve(response);
        }, function(err) {
            console.log(err);
        });

        return deferred.promise;
    }

    private addToMap(_results, _event) {
        const map = this.scene;
        const view = this.view;

        //3D Layers
        const bldgResults = {displayFieldName: null, features: []};
        //2D Layers
        const parcelResults = {displayFieldName: null, features: []};
        let groundElev = 0;

        for (let i = 0, il = _results.length; i < il; i++) {
            const idResult = _results[i];
            let whichRaster;
            let b;
            let bl;
            if (idResult.layerId === 2) {
                whichRaster = "Raster_" + idResult.feature.attributes.OBJECTID;
                for (b = 0, bl = _results.length; b < bl; b++) {
                    if (_results[b].layerName === whichRaster) {
                        idResult.feature.Elev = _results[b].feature.attributes["Pixel Value"];
                        bldgResults.features.push(idResult.feature);
                    }
                }
            
            }
            if (idResult.layerId === 3) {
                whichRaster = "Raster_" + idResult.feature.attributes.RWY;
                for (b = 0; b < _results.length; b++) {
                    if (_results[b].layerName === whichRaster) {
                        idResult.feature.Elev = _results[b].feature.attributes["Pixel Value"];
                        bldgResults.features.push(idResult.feature);
                    }
                }
            }
                
            
            if (idResult.layerId === 0 || idResult.layerId === 4) {
                parcelResults.features.push(idResult.feature);
            }

            if (idResult.layerId === 58) {
                groundElev = parseInt(idResult.feature.attributes["Pixel Value"], 10);
            }
        }

        const obst_height = parseInt(dom.byId("obsHeight").value, 10);
        
        if (!groundElev) {
            groundElev = parseInt(dom.byId("groundLevel").value, 10);
        }

        const x_value = idParams.geometry.x;
        const y_value = idParams.geometry.y;
        const tab_content1 = this.layerTabContent(bldgResults, "bldgResults", groundElev, obst_height, x_value, y_value);
        const tab_content2 = this.layerTabContent(parcelResults, "parcelResults", groundElev, obst_height, x_value, y_value);

        
        const outputContent = tab_content1 + "<br>" + tab_content2.substr(tab_content2.indexOf("2D/Ground surfaces affected"));
        
        // query for the anchor nodes and attach an event publisher that passes the feature list name and the index

        const anchors = query(".show_link");
        if (anchors) {
            anchors.forEach((e: HTMLElement) => {
                on(e, "click", (evt) => {
                    evt.preventDefault();
                    const id = evt.target.id;

                    const start = id.lastIndexOf("_");
                    const length = id.length;
                    // the index is the number after the last underscore in the id
                    const index = parseInt(id.substring(start + 1, length), 10);
                    let feature;
                    if (id.indexOf("bldgResults") !== -1) {
                        feature = bldgResults.features[index];
                    } else if (id.indexOf("parcelResults") !== -1) {
                        feature = parcelResults.features[index];
                    }
                    if (feature) {
                        this.showFeature(feature);
                    } else {
                        console.log("Neither bldgResults or parcelResults were found in the dom id");
                    }
                });
            });
        }

        
        view.popup.content = outputContent;
        view.popup.open();
    }

    private layerTabContent (layerResults: Array<FeatureLayer>, layerName: string, base_height: number, peak_height: number, x: number, y: number) {
        let content: HTMLElement;
        let limiter = 99999;
        let obsHt = 0;
        if (peak_height) {
            obsHt = peak_height;
        }
        let i;
        let il;
        switch (layerName) {
            case "bldgResults":
                content = domConstruct.create("div");
                const heights = domConstruct.toDom("<b>x:</b> " + x.toFixed(3) + " <b>y:</b> " + y.toFixed(3) + "<br><b>Ground Elevation:</b> " + base_height + " feet MSL<br><b>Obstruction Height: </b>" + obsHt + " feet<br>");
                const sum = domConstruct.toDom("<i>3D surfaces affected: " + layerResults.features.length + "</i>");
                domConstruct.place(heights, content);
                domConstruct.place(sum, content);
                
                const bldg_table = domConstruct.create("table", {"border": 1}, content);
                const _row = domConstruct.create("tr", null, bldg_table);
                const h_cell1 = domConstruct.create("th", {"innerHTML": "Surface"}, _row);
                const h_cell2 = domConstruct.create("th", {"innerHTML": "Elevation MSL"}, _row);
                const h_cell3 = domConstruct.create("th", {"innerHTML": "Height AGL"}, _row);
                const h_cell4 = domConstruct.create("th", {"innerHTML": "Clearance"}, _row);
                
                for (i = 0, il = layerResults.features.length; i < il; i++) {
                    const feature = layerResults.features[i];
                    let elevation = feature.Elev;
                    if (elevation !== "NoData") {
                        elevation = Number(elevation).toFixed(3);
                        const insertthis = elevation - base_height;
                        const clearance = insertthis - obsHt;
                        if (insertthis < limiter) {
                            limiter = insertthis;
                        }
                    }
                    const _row2 = domConstruct.create("tr", null, bldg_table);
                    const text = feature.attributes.RWY + " " + feature.attributes.Layer;
                    const r_cell1 = domConstruct.create("td", {"innerHTML": text}, _row2);
                    domConstruct.create("a", {"innerHTML": "(show)", "class": "show_link", "id": "bldgResults_" + i}, r_cell1);
                    domConstruct.create("td", {"innerHTML": elevation.toFixed(3)}, _row2);
                    
                    // these may be replaced below with data
                    
                    
                    
                    domConstruct.create("td", {"innerHTML": insertthis.toFixed(3)}, _row2);
                    const r_cell4 = domConstruct.create("td", {"innerHTML": clearance.toFixed(3)}, _row2);

                    if (clearance < 0) {
                           domClass.add(r_cell4, "negative");
                           domAttr.set(r_cell4, "data-rwy", feature.attributes.RWY);
                           domAttr.set(r_cell4, "data-surface", feature.attributes.Layer);
                    } 
                }
                break;

            case "parcelResults":
                content = domConstruct.create("div");
                const info = domConstruct.toDom("<br><i>2D/Ground surfaces affected: " + layerResults.features.length + "</i>");
                domConstruct.place(info, content);

                const table = domConstruct.create("table", {"border": 1}, content);
                const header_row = domConstruct.create("tr", null, table);
                domConstruct.create("th", {"innerHTML": "Surface"}, header_row);
                
                for (i = 0; i < layerResults.features.length; i++) {
                    if (layerResults.features[i].attributes.RWY) {
                        const _row_ = domConstruct.create("tr", null, table);
                        const _td = domConstruct.create("td", {"innerHTML": layerResults.features[i].attributes.RWY + " " + layerResults.features[i].attributes.Layer}, _row_);
                        domConstruct.create("a", {"innerHTML": "(show)", "class": "show_link", "id": "parcelResults_" + i}, _td);
                    } else if (layerResults.features[i].attributes.NAME) {
                        // content += "<tr><td>" + layerResults.features[i].attributes.NAME + " TSA" + " <a href='#' onclick='showFeature(" + layerName + ".features[" + i + "]); return false;'>(show)</a></td>";
                        const row = domConstruct.create("tr", null, table);
                        const td = domConstruct.create("td", {"innerHTML": layerResults.features[i].attributes.NAME + " TSA"}, row);
                        domConstruct.create("a", {"innerHTML": "(show)", "class": "show_link", "id": "parcelResults_" + i}, td);
                    }
                }
                break;
        }

        if (content !== undefined) {
            let str_content = content.innerHTML;
            str_content = str_content.replace("feet MSL", "feet MSL<br><b>Critical Height: </b>" + limiter.toFixed(3) + " feet AGL");

            str_content = str_content.replace("No data feet MSL", "No data");
            str_content = str_content.replace("NaN feet MSL", "No data");
            str_content = str_content.replace("99999 feet AGL", "No data");
            str_content = str_content.replace("NaN", "No data");
            return str_content;
        }
        
    }

    private showFeature(_feat) {
        const view = this.view;
        view.graphics.removeAll();
        view.graphics.add(_feat);
        view.goTo(_feat._extent);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    render() {
        return (
        <div id="obstructionPanel" class="panel collapse in">
            <div id="headingObstruction" class="panel-heading" role="tab">
                <div class="panel-title">
                    <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseObstruction" aria-expanded="true" aria-controls="collapseObstruction"><span class="glyphicon glyphicon-plane" aria-hidden="true"></span><span class="panel-label">{this.name}</span></a> 
                    <a class="panel-close" role="button" data-toggle="collapse" tabindex="0" href="#obstructionPanel"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a> 
                </div>
            </div>
            <div id="collapseObstruction" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingObstruction">
                <div class="body-light" id="obstruction-flex">
                    <div class="obstruction-inputs">
                        <div>
                            <div>Height of obstruction</div>
                            <input id="obsHeight" type="number" placeholder="in feet"></input>
                        </div>
                        <div>
                            <div>+/- Ground Elevation</div>
                            <input id="groundLevel" type="number" placeholder="feet above or below"></input>
                        </div>
                    </div>
                    <div class="obstruction-inputs">
                        <div id="xandy">
                            <div>
                                <div>X: Easting</div>
                                <input id="easting" type="number" placeHolder="Easting"></input>
                            </div>
                            <div>
                                <div>Y: Northing</div>
                                <input id="northing" type="number" placeHolder="Northing"></input>
                            </div>
                        </div>
                    </div>
                    <div id="target_btns">
                        <div id="activate_target" onclick={ e => this.activate(e)} class="btn btn-transparent">Activate</div>
                        <div id="obs_submit" onclick={ e => this.submit(e)} class="btn btn-transparent">Submit</div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}


