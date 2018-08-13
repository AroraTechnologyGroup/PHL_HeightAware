define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/tasks/IdentifyTask", "esri/tasks/support/IdentifyParameters", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/geometryEngine", "esri/geometry/SpatialReference", "esri/Graphic", "esri/symbols/PictureMarkerSymbol", "esri/tasks/support/Query", "esri/layers/FeatureLayer", "esri/renderers/SimpleRenderer", "esri/symbols/PolygonSymbol3D", "dojo/on", "dojo/dom", "dojo/Deferred", "dojo/query", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class", "dojo/dom-attr", "dojo/promise/all", "./viewModels/ObstructionViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, IdentifyTask, IdentifyParameters, Point, Polyline, geometryEngine, SpatialReference, Graphic, PictureMarkerSymbol, Query, FeatureLayer, SimpleRenderer, PolygonSymbol3D, on, dom, Deferred, query, Array, domConstruct, domClass, domAttr, all, ObstructionViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/CEPCT/MapServer";
    var idTask = new IdentifyTask({
        url: CEPCT
    });
    var idParams = new IdentifyParameters();
    idParams.tolerance = 1;
    idParams.returnGeometry = true;
    idParams.layerOption = "all";
    var sr = new SpatialReference({
        wkid: 2272
    });
    var pointerTracker = new Graphic({
        symbol: new PictureMarkerSymbol({
            url: "app/assets/reticle.png",
            width: 40,
            height: 40
        })
    });
    var obstruction_base = new FeatureLayer({
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
            }
        ],
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
                        resource: { primitive: "cylinder" },
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
    var ObstructionPane = (function (_super) {
        tslib_1.__extends(ObstructionPane, _super);
        function ObstructionPane(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new ObstructionViewModel_1.default();
            _this.name = "Obstruction Analysis";
            _this.activated = false;
            return _this;
        }
        ObstructionPane.prototype.activate = function (event) {
            var _this = this;
            var crit_3d = this.scene.findLayerById("critical_3d");
            var part77 = this.scene.findLayerById("part_77_group");
            crit_3d.visible = false;
            part77.visible = false;
            var ground_node = dom.byId("groundLevel");
            var northing_node = dom.byId("northing");
            var easting_node = dom.byId("easting");
            var obsHeight_node = dom.byId("obsHeight");
            var mouse_track = this.view.on("pointer-move", function (e) {
                var map_pnt = _this.view.toMap({
                    x: e.x,
                    y: e.y
                });
                var graphic = pointerTracker.clone();
                graphic.geometry = map_pnt;
                _this.view.graphics.removeAll();
                _this.view.graphics.push(graphic);
                _this.scene.ground.queryElevation(map_pnt).then(function (result) {
                    var x = result.geometry.x;
                    var y = result.geometry.y;
                    var z = result.geometry.z;
                    ground_node.value = z.toFixed(1);
                    northing_node.value = y.toFixed(3);
                    easting_node.value = x.toFixed(3);
                });
            });
            var view_click = this.view.on("click", function (e) {
                view_click.remove();
                e.stopPropagation();
                if (mouse_track) {
                    mouse_track.remove();
                    _this.view.graphics.removeAll();
                    if (e && e.mapPoint) {
                        _this.submit({});
                    }
                }
            });
        };
        ObstructionPane.prototype.submit = function (event) {
            var obsHeight = dom.byId("obsHeight");
            var groundLevel = dom.byId("groundLevel");
            var northingNode = dom.byId("northing");
            var eastingNode = dom.byId("easting");
            var height = parseFloat(obsHeight.value);
            if (!height) {
                height = 25;
                obsHeight.value = "25";
            }
            var z = parseFloat(groundLevel.value);
            var y = parseFloat(northingNode.value);
            var x = parseFloat(eastingNode.value);
            this.performQuery(x, y, z, height);
        };
        ObstructionPane.prototype.performQuery = function (_x, _y, _z, _height) {
            var _this = this;
            var pnt = new Point({
                x: _x,
                y: _y,
                z: _z,
                spatialReference: sr
            });
            var ptBuff = geometryEngine.buffer(pnt, 25, "feet");
            var peak = _z + _height;
            var graphic = new Graphic();
            graphic.attributes = {
                "ObjectID": 0,
                "baseElevation": _z,
                "obstacleHeight": peak
            };
            graphic.geometry = ptBuff;
            var line = new Polyline({
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
            var promise = this.doIdentify(_x, _y);
            promise.then(function (response) {
                if (response) {
                    _this.addToMap(response);
                }
                else {
                    console.log("No results from server :: " + response);
                }
            });
            this.querySurfaces(line).then(function (e) {
                _this.filterSurfaces3D(e, line);
            });
        };
        ObstructionPane.prototype.querySurfaces = function (vertical_line) {
            var _this = this;
            var map = this.scene;
            var main_deferred = new Deferred();
            var first = new Deferred();
            var last = new Deferred();
            var crit_3d = map.findLayerById("critical_3d");
            var crid_3d_layers = crit_3d.layers;
            var part77 = map.findLayerById("part_77_group");
            var part77_layers = part77.layers;
            var query = new Query({
                geometry: vertical_line,
                units: "feet",
                spatialRelationship: "intersects",
                returnGeometry: true,
                outFields: ["*"],
                returnZ: true
            });
            var viz = Array.map(crid_3d_layers.items, function (lyr) {
                var deferred = new Deferred();
                lyr.queryFeatures(query).then(function (e) {
                    if (e.features.length) {
                        _this.filterSurfaces3D(e, vertical_line).then(function (oids) {
                            if (oids.length > 1) {
                                lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                            }
                            else {
                                lyr.definitionExpression = "OBJECTID = " + oids[0];
                            }
                            deferred.resolve(true);
                        });
                    }
                    else {
                        lyr.definitionExpression = "OBJECTID IS NULL";
                        deferred.resolve(false);
                    }
                }, function (err) {
                    console.log(err);
                    deferred.resolve(false);
                });
                lyr.refresh();
                return deferred.promise;
            });
            all(viz).then(function (e) {
                if (Array.indexOf(e, true) !== -1) {
                    crit_3d.visible = true;
                }
                else {
                    crit_3d.visible = false;
                }
                first.resolve();
            });
            var viz2 = Array.map(part77_layers.items, function (lyr) {
                var deferred = new Deferred();
                lyr.queryFeatures(query).then(function (e) {
                    if (e.features.length) {
                        _this.filterSurfaces3D(e, vertical_line).then(function (oids) {
                            if (oids) {
                                if (oids.length > 1) {
                                    lyr.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                                }
                                else {
                                    lyr.definitionExpression = "OBJECTID = " + oids[0];
                                }
                                deferred.resolve(true);
                            }
                            else {
                                lyr.definitionExpression = "OBJECTID IS NULL";
                                deferred.resolve(false);
                            }
                        });
                    }
                    else {
                        lyr.definitionExpression = "OBJECTID IS NULL";
                        deferred.resolve(false);
                    }
                }, function (err) {
                    console.log(err);
                    deferred.resolve(false);
                });
                lyr.refresh();
                return deferred.promise;
            });
            all(viz2).then(function (e) {
                if (Array.indexOf(e, true) !== -1) {
                    part77.visible = true;
                }
                else {
                    part77.visible = false;
                }
                last.resolve();
            });
            all([first, last]).then(function (e) {
                main_deferred.resolve(e);
            });
            return main_deferred.promise;
        };
        ObstructionPane.prototype.filterSurfaces3D = function (_graphics, _line) {
            var main_deferred = new Deferred();
            var oids = Array.map(_graphics.features, function (e) {
                var deferred = new Deferred();
                var does_intersect = geometryEngine.intersects(e.geometry, _line);
                if (does_intersect) {
                    deferred.resolve(e.attributes["OBJECTID"]);
                }
                else {
                    deferred.cancel();
                }
                return deferred.promise;
            });
            all(oids).then(function (list) {
                main_deferred.resolve(list);
            });
            return main_deferred.promise;
        };
        ObstructionPane.prototype.doIdentify = function (x, y) {
            var map = this.scene;
            var view = this.view;
            var deferred = new Deferred();
            var x_coord = x;
            var y_coord = y;
            var vert_line = new Polyline({
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
            idTask.execute(idParams).then(function (response) {
                var results = response.results;
                console.log(results);
                deferred.resolve(results);
            }, function (err) {
                console.log(err);
            });
            return deferred.promise;
        };
        ObstructionPane.prototype.addToMap = function (_result) {
            var _this = this;
            var map = this.scene;
            var view = this.view;
            var obst_height_node = dom.byId("obsHeight");
            var ground_elev_node = dom.byId("groundLevel");
            var obst_height = parseFloat(obst_height_node.value);
            var groundElev = parseFloat(ground_elev_node.value);
            var features_3d = [];
            var features_2d = [];
            for (var i = 0, il = _result.length; i < il; i++) {
                var idResult = _result[i];
                var whichRaster = void 0;
                var b = void 0;
                var bl = void 0;
                if (idResult.layerId === 2) {
                    whichRaster = "Raster_" + idResult.feature.attributes.OBJECTID;
                    for (b = 0, bl = _result.length; b < bl; b++) {
                        if (_result[b].layerName === whichRaster) {
                            idResult.feature.attributes.Elev = _result[b].feature.attributes["Pixel Value"];
                            features_3d.push(idResult.feature);
                        }
                    }
                }
                if (idResult.layerId === 3) {
                    whichRaster = "Raster_" + idResult.feature.attributes.RWY;
                    for (b = 0; b < _result.length; b++) {
                        if (_result[b].layerName === whichRaster) {
                            idResult.feature.attributes.Elev = _result[b].feature.attributes["Pixel Value"];
                            features_3d.push(idResult.feature);
                        }
                    }
                }
                if (idResult.layerId === 0 || idResult.layerId === 4) {
                    features_2d.push(idResult.feature);
                }
            }
            var Results3d = {
                displayFieldName: "Name",
                features: features_3d
            };
            var Results2d = {
                displayFieldName: "Name",
                features: features_2d
            };
            var idParams_geo = idParams.geometry;
            var x_value = idParams_geo.x;
            var y_value = idParams_geo.y;
            var tab_content1 = this.layerTabContent(Results3d, "bldgResults", groundElev, obst_height, x_value, y_value);
            var tab_content2 = this.layerTabContent(Results2d, "parcelResults", groundElev, obst_height, x_value, y_value);
            var outputContent = tab_content1 + "<br>" + tab_content2.substr(tab_content2.indexOf("2D/Ground surfaces affected"));
            var anchors = query(".show_link");
            if (anchors) {
                anchors.forEach(function (e) {
                    on(e, "click", function (evt) {
                        evt.preventDefault();
                        var id = evt.target.id;
                        var start = id.lastIndexOf("_");
                        var length = id.length;
                        var index = parseInt(id.substring(start + 1, length), 10);
                        var feature;
                        if (id.indexOf("bldgResults") !== -1) {
                            feature = Results3d.features[index];
                        }
                        else if (id.indexOf("parcelResults") !== -1) {
                            feature = Results2d.features[index];
                        }
                        if (feature) {
                            _this.showFeature(feature);
                        }
                        else {
                            console.log("Neither bldgResults or parcelResults were found in the dom id");
                        }
                    });
                });
            }
            view.popup.content = outputContent;
            view.popup.open();
        };
        ObstructionPane.prototype.replaceStrings = function (content, limiter) {
            var str_content = content.innerHTML;
            str_content = str_content.replace("feet MSL", "feet MSL<br><b>Critical Height: </b>" + limiter.toFixed(3) + " feet AGL");
            str_content = str_content.replace("No data feet MSL", "No data");
            str_content = str_content.replace("NaN feet MSL", "No data");
            str_content = str_content.replace("99999 feet AGL", "No data");
            str_content = str_content.replace("NaN", "No data");
            return str_content;
        };
        ObstructionPane.prototype.layerTabContent = function (layerResults, layerName, base_height, peak_height, x, y) {
            var content;
            var limiter = 99999;
            var obsHt = 0;
            if (peak_height) {
                obsHt = peak_height;
            }
            var i;
            var il;
            var features = layerResults.features;
            switch (layerName) {
                case "bldgResults":
                    content = domConstruct.create("div");
                    var heights = domConstruct.toDom("<b>x:</b> " + x.toFixed(3) + " <b>y:</b> " + y.toFixed(3) + "<br><b>Ground Elevation:</b> " + base_height + " feet MSL<br><b>Obstruction Height: </b>" + obsHt + " feet<br>");
                    var sum = domConstruct.toDom("<i>3D surfaces affected: " + features.length + "</i>");
                    domConstruct.place(heights, content);
                    domConstruct.place(sum, content);
                    var bldg_table = domConstruct.create("table", { "border": 1 }, content);
                    var _row = domConstruct.create("tr", {}, bldg_table);
                    var h_cell1 = domConstruct.create("th", { "innerHTML": "Surface" }, _row);
                    var h_cell2 = domConstruct.create("th", { "innerHTML": "Elevation MSL" }, _row);
                    var h_cell3 = domConstruct.create("th", { "innerHTML": "Height AGL" }, _row);
                    var h_cell4 = domConstruct.create("th", { "innerHTML": "Clearance" }, _row);
                    for (i = 0, il = features.length; i < il; i++) {
                        var feature = features[i];
                        var str_elevation = feature.attributes.Elev;
                        var surface_elev = void 0;
                        var msl_value = void 0;
                        var clearance = void 0;
                        if (str_elevation !== "NoData") {
                            surface_elev = Number(Number(str_elevation).toFixed(3));
                            msl_value = surface_elev - base_height;
                            clearance = msl_value - obsHt;
                            if (clearance < limiter) {
                                limiter = clearance;
                            }
                        }
                        else {
                            surface_elev = 0;
                            msl_value = 0;
                            clearance = 0;
                        }
                        var _row2 = domConstruct.create("tr", {}, bldg_table);
                        var text = feature.attributes.RWY + " " + feature.attributes.Layer;
                        var r_cell1 = domConstruct.create("td", { "innerHTML": text }, _row2);
                        domConstruct.create("td", { "innerHTML": str_elevation }, _row2);
                        domConstruct.create("td", { "innerHTML": msl_value.toFixed(3) }, _row2);
                        var r_cell4 = domConstruct.create("td", { "innerHTML": clearance.toFixed(3) }, _row2);
                        if (clearance < 0) {
                            domClass.add(r_cell4, "negative");
                            domAttr.set(r_cell4, "data-rwy", feature.attributes.RWY);
                            domAttr.set(r_cell4, "data-surface", feature.attributes.Layer);
                        }
                    }
                    return this.replaceStrings(content, limiter);
                case "parcelResults":
                    content = domConstruct.create("div");
                    var info = domConstruct.toDom("<br><i>2D/Ground surfaces affected: " + features.length + "</i>");
                    domConstruct.place(info, content);
                    var table = domConstruct.create("table", { "border": 1 }, content);
                    var header_row = domConstruct.create("tr", {}, table);
                    domConstruct.create("th", { "innerHTML": "Surface" }, header_row);
                    for (i = 0; i < features.length; i++) {
                        if (features[i].attributes.RWY) {
                            var _row_ = domConstruct.create("tr", {}, table);
                            var _td = domConstruct.create("td", { "innerHTML": features[i].attributes.RWY + " " + features[i].attributes.Layer }, _row_);
                        }
                        else if (features[i].attributes.NAME) {
                            var row = domConstruct.create("tr", {}, table);
                            var td = domConstruct.create("td", { "innerHTML": features[i].attributes.NAME + " TSA" }, row);
                        }
                    }
                    return this.replaceStrings(content, limiter);
            }
            return "Error with layerName";
        };
        ObstructionPane.prototype.showFeature = function (_feat) {
            var view = this.view;
            view.graphics.removeAll();
            view.graphics.add(_feat);
            view.goTo(_feat);
        };
        ObstructionPane.prototype.postInitialize = function () {
        };
        ObstructionPane.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { id: "obstructionPanel", class: "panel collapse in" },
                widget_1.tsx("div", { id: "headingObstruction", class: "panel-heading", role: "tab" },
                    widget_1.tsx("div", { class: "panel-title" },
                        widget_1.tsx("a", { class: "panel-toggle", role: "button", "data-toggle": "collapse", href: "#collapseObstruction", "aria-expanded": "true", "aria-controls": "collapseObstruction" },
                            widget_1.tsx("span", { class: "glyphicon glyphicon-plane", "aria-hidden": "true" }),
                            widget_1.tsx("span", { class: "panel-label" }, this.name)),
                        widget_1.tsx("a", { class: "panel-close", role: "button", "data-toggle": "collapse", tabindex: "0", href: "#obstructionPanel" },
                            widget_1.tsx("span", { class: "esri-icon esri-icon-close", "aria-hidden": "true" })))),
                widget_1.tsx("div", { id: "collapseObstruction", class: "panel-collapse collapse in", role: "tabpanel", "aria-labelledby": "headingObstruction" },
                    widget_1.tsx("div", { class: "body-light", id: "obstruction-flex" },
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("div", null,
                                widget_1.tsx("div", null, "Height of obstruction"),
                                widget_1.tsx("input", { id: "obsHeight", type: "number", placeholder: "in feet" })),
                            widget_1.tsx("div", null,
                                widget_1.tsx("div", null, "+/- Ground Elevation"),
                                widget_1.tsx("input", { id: "groundLevel", type: "number", placeholder: "feet above or below" }))),
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("div", { id: "xandy" },
                                widget_1.tsx("div", null,
                                    widget_1.tsx("div", null, "X: Easting"),
                                    widget_1.tsx("input", { id: "easting", type: "number", placeHolder: "Easting" })),
                                widget_1.tsx("div", null,
                                    widget_1.tsx("div", null, "Y: Northing"),
                                    widget_1.tsx("input", { id: "northing", type: "number", placeHolder: "Northing" })))),
                        widget_1.tsx("div", { id: "target_btns" },
                            widget_1.tsx("div", { id: "activate_target", onclick: function (e) { return _this.activate(e); }, class: "btn btn-transparent" }, "Activate"),
                            widget_1.tsx("div", { id: "obs_submit", onclick: function (e) { return _this.submit(e); }, class: "btn btn-transparent" }, "Submit"))))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionPane.prototype, "name", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], ObstructionPane.prototype, "activated", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.scene")
        ], ObstructionPane.prototype, "scene", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], ObstructionPane.prototype, "view", void 0);
        ObstructionPane = tslib_1.__decorate([
            decorators_1.subclass("app.widgets.obstructionPane")
        ], ObstructionPane);
        return ObstructionPane;
    }(decorators_1.declared(Widget)));
    exports.ObstructionPane = ObstructionPane;
});
//# sourceMappingURL=ObstructionPane.js.map