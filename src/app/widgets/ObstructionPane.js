define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/tasks/IdentifyTask", "esri/tasks/support/IdentifyParameters", "esri/geometry/Point", "esri/geometry/Polyline", "esri/layers/support/LabelClass", "esri/geometry/geometryEngine", "esri/geometry/SpatialReference", "esri/Graphic", "esri/tasks/support/Query", "esri/layers/FeatureLayer", "esri/renderers/SimpleRenderer", "esri/symbols/PolygonSymbol3D", "dojo/on", "dojo/dom", "dojo/Deferred", "dojo/query", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class", "dojo/dom-attr", "dojo/promise/all", "esri/core/watchUtils", "./viewModels/ObstructionViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, IdentifyTask, IdentifyParameters, Point, Polyline, LabelClass, geometryEngine, SpatialReference, Graphic, Query, FeatureLayer, SimpleRenderer, PolygonSymbol3D, on, dom, Deferred, query, Array, domConstruct, domClass, domAttr, all, watchUtils, ObstructionViewModel_1, widget_1) {
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
    var intersectionMarker = {
        type: "web-style",
        styleName: "EsriThematicShapesStyle",
        name: "Centered Sphere"
    };
    var intersectionGraphic = new Graphic({
        symbol: intersectionMarker
    });
    var intersectionLabelClass = new LabelClass({
        labelExpressionInfo: { expression: "$feature.surfaceName" },
        labelPlacement: "right",
        symbol: {
            type: "text",
            color: "black",
            haloSize: 1,
            haloColor: "white"
        }
    });
    var intersection_layer = new FeatureLayer({
        id: "surface_intersection",
        title: "Surface Intersection Point",
        fields: [
            {
                name: "ObjectID",
                alias: "ObjectID",
                type: "oid"
            },
            {
                name: "surfaceName",
                alias: "Surface Name",
                type: "text"
            }
        ],
        objectIdField: "ObjectID",
        geometryType: "point",
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        source: [],
        legendEnabled: false,
        renderer: {
            type: "simple",
            symbol: intersectionMarker
        },
        labelingInfo: [intersectionLabelClass],
        labelsVisible: true
    });
    var pointerTracker = new Graphic({
        symbol: {
            type: "point-3d",
            symbolLayers: [{
                    type: "object",
                    width: 50,
                    height: 50,
                    depth: 50,
                    resource: { primitive: "cube" },
                    material: { color: "red" }
                }],
            verticalOffset: {
                screenLength: "124px",
                maxWorldLength: 1000,
                minWorldLength: 250
            },
            callout: {
                type: "line",
                size: 1.5,
                color: [150, 150, 150],
                border: {
                    color: [50, 50, 50]
                }
            }
        }
    });
    var obstruction_base = new FeatureLayer({
        id: "obstruction_base",
        title: "Placed Obstruction",
        opacity: .50,
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
        source: [],
        legendEnabled: false,
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
            var intersect_points = this.scene.findLayerById("surface_intersection");
            if (crit_3d) {
                crit_3d.visible = false;
            }
            if (part77) {
                part77.visible = false;
            }
            if (intersect_points) {
                intersect_points.source.removeAll();
                this.scene.remove(intersect_points);
            }
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
                if (map_pnt) {
                    _this.scene.ground.queryElevation(map_pnt).then(function (result) {
                        var x = result.geometry.x;
                        var y = result.geometry.y;
                        var z = result.geometry.z;
                        ground_node.value = z.toFixed(1);
                        northing_node.value = y.toFixed(3);
                        easting_node.value = x.toFixed(3);
                    });
                }
            });
            var view_click = this.view.on("click", function (e) {
                e.stopPropagation();
                if (e && e.mapPoint) {
                    if (mouse_track) {
                        mouse_track.remove();
                        _this.view.graphics.removeAll();
                    }
                    view_click.remove();
                    _this.submit(e.mapPoint);
                }
            });
        };
        ObstructionPane.prototype.submit = function (point) {
            var obsHeight = dom.byId("obsHeight");
            var groundLevel = dom.byId("groundLevel");
            var northingNode = dom.byId("northing");
            var eastingNode = dom.byId("easting");
            groundLevel.value = point.z.toFixed(1);
            northingNode.value = point.y.toFixed(3);
            eastingNode.value = point.x.toFixed(3);
            var height = parseFloat(obsHeight.value);
            if (!height) {
                height = 200;
                obsHeight.value = "200";
            }
            var z = parseFloat(groundLevel.value);
            var y = parseFloat(northingNode.value);
            var x = parseFloat(eastingNode.value);
            this.performQuery(x, y, z, height);
        };
        ObstructionPane.prototype.submitPanel = function (event) {
            var obsHeight = dom.byId("obsHeight");
            var groundLevel = dom.byId("groundLevel");
            var northingNode = dom.byId("northing");
            var eastingNode = dom.byId("easting");
            var panelPoint = new Point({
                x: parseFloat(eastingNode.value),
                y: parseFloat(northingNode.value),
                z: parseFloat(groundLevel.value),
                spatialReference: sr
            });
            this.submit(panelPoint);
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
            graphic.geometry.spatialReference = sr;
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
            this.querySurfaces(line).then(function () {
                _this.scene.add(intersection_layer);
                _this.view.whenLayerView(obstruction_base).then(function (lyrView) {
                    lyrView.highlight(graphic);
                    _this.view.goTo(graphic);
                    var endAnim = watchUtils.whenTrue(_this.view, "animation", function () {
                        _this.scene.remove(obstruction_base);
                        endAnim.remove();
                    });
                });
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
                            deferred.resolve(oids);
                        }, function (err) {
                            console.log(err);
                            deferred.resolve(false);
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
                return deferred.promise;
            });
            function isFalse(element, index, array) {
                if (!element) {
                    return true;
                }
                else {
                    return false;
                }
            }
            all(viz).then(function (e) {
                if (e.every(isFalse)) {
                    crit_3d.visible = false;
                    first.resolve(false);
                }
                else {
                    crit_3d.visible = true;
                    first.resolve(true);
                }
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
                                deferred.resolve(oids);
                            }
                            else {
                                lyr.definitionExpression = "OBJECTID IS NULL";
                                deferred.resolve(false);
                            }
                        }, function (err) {
                            console.log(err);
                            deferred.resolve(false);
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
                return deferred.promise;
            });
            all(viz2).then(function (e) {
                if (e.every(isFalse)) {
                    part77.visible = false;
                    last.resolve(false);
                }
                else {
                    part77.visible = true;
                    last.resolve(true);
                }
            });
            all([first, last]).then(function (e) {
                if (e[0] || e[1]) {
                    main_deferred.resolve(true);
                }
                else {
                    main_deferred.resolve(false);
                }
            });
            return main_deferred.promise;
        };
        ObstructionPane.prototype.getIntersectionPoint = function (_polygon, _line) {
            var peak_height = _line.paths[0][1][2];
            var poly_geo = _polygon.geometry;
            var base_point = new Point({
                x: _line.paths[0][0][0],
                y: _line.paths[0][0][1],
                spatialReference: sr
            });
            if (geometryEngine.intersects(poly_geo, base_point)) {
                var planePoints = this.getNonCollinearPoints(poly_geo);
                var linePoints = [].concat.apply([], _line.paths[0]);
                if (planePoints) {
                    return this.intersect(planePoints, linePoints);
                }
                else {
                    console.error("Polygon ", poly_geo, "doesn't have non-collinear points.");
                }
            }
            return null;
        };
        ObstructionPane.prototype.intersect = function (planePoints, linePoints) {
            var x1 = planePoints[0];
            var y1 = planePoints[1];
            var z1 = planePoints[2];
            var x2 = planePoints[3];
            var y2 = planePoints[4];
            var z2 = planePoints[5];
            var x3 = planePoints[6];
            var y3 = planePoints[7];
            var z3 = planePoints[8];
            var x4 = linePoints[0];
            var y4 = linePoints[1];
            var z4 = linePoints[2];
            var x5 = linePoints[3];
            var y5 = linePoints[4];
            var z5 = linePoints[5];
            var mat1 = mat4.fromValues(1, 1, 1, 1, x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4);
            var mat2 = mat4.fromValues(1, 1, 1, 0, x1, x2, x3, x5 - x4, y1, y2, y3, y5 - y4, z1, z2, z3, z5 - z4);
            var det1 = mat4.determinant(mat1);
            var det2 = mat4.determinant(mat2);
            if (det2 !== 0) {
                var t = -det1 / det2;
                var intersectionPoint = {
                    x: x4 + (x5 - x4) * t,
                    y: y4 + (y5 - y4) * t,
                    z: z4 + (z5 - z4) * t
                };
                return intersectionPoint;
            }
            return null;
        };
        ObstructionPane.prototype.getNonCollinearPoints = function (_polygon) {
            try {
                var x1 = _polygon.rings[0][0][0];
                var y1 = _polygon.rings[0][0][1];
                var z1 = _polygon.rings[0][0][2];
                var x2 = _polygon.rings[0][1][0];
                var y2 = _polygon.rings[0][1][1];
                var z2 = _polygon.rings[0][1][2];
                for (var i = 2; i <= _polygon.rings[0].length; i++) {
                    var x3 = _polygon.rings[0][i][0];
                    var y3 = _polygon.rings[0][i][1];
                    var z3 = _polygon.rings[0][i][2];
                    if ((x3 - x1) / (x2 - x1) !== (y3 - y1) / (y2 - y1) || (x3 - x1) / (x2 - x1) !== (z3 - z1) / (z2 - z1)) {
                        return [x1, y1, z1, x2, y2, z2, x3, y3, z3];
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            return null;
        };
        ObstructionPane.prototype.filterSurfaces3D = function (_graphics, _line) {
            var _this = this;
            var main_deferred = new Deferred();
            var height = _line.paths[0][1][2];
            var oids = Array.map(_graphics.features, function (e) {
                var deferred = new Deferred();
                var intersectionPoint = _this.getIntersectionPoint(e, _line);
                if (intersectionPoint && intersectionPoint.z <= height) {
                    var interectGraph = intersectionGraphic.clone();
                    var inPoint = new Point(intersectionPoint);
                    inPoint.spatialReference = sr;
                    interectGraph.geometry = inPoint;
                    interectGraph.attributes = {
                        surfaceName: e.attributes.Layer
                    };
                    intersection_layer.source.add(interectGraph);
                    deferred.resolve(e.attributes.OBJECTID);
                }
                else {
                    deferred.resolve();
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
        ObstructionPane.prototype.togglePopup = function (event) {
            if (this.view.popup.visible) {
                this.view.popup.close();
            }
            else {
                this.view.popup.open();
            }
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
                            widget_1.tsx("div", { id: "obs_submit", onclick: function (e) { return _this.submitPanel(e); }, class: "btn btn-transparent" }, "Submit"),
                            widget_1.tsx("div", { id: "open_results", onclick: function (e) { return _this.togglePopup(e); }, class: "esri-icon-table" }))))));
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