define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/tasks/IdentifyTask", "esri/tasks/support/IdentifyParameters", "esri/geometry/Point", "esri/geometry/Polyline", "esri/layers/support/LabelClass", "esri/geometry/geometryEngine", "esri/geometry/SpatialReference", "esri/Graphic", "esri/tasks/support/Query", "esri/layers/FeatureLayer", "esri/renderers/SimpleRenderer", "esri/symbols/PolygonSymbol3D", "dojo/on", "dojo/dom", "dojo/Deferred", "dojo/_base/array", "dojo/dom-construct", "dojo/dom-class", "dojo/dom-attr", "dojo/promise/all", "./viewModels/ObstructionViewModel", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, tslib_1, decorators_1, Widget, IdentifyTask, IdentifyParameters, Point, Polyline, LabelClass, geometryEngine, SpatialReference, Graphic, Query, FeatureLayer, SimpleRenderer, PolygonSymbol3D, on, dom, Deferred, Array, domConstruct, domClass, domAttr, all, ObstructionViewModel_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/MapServer";
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
        visible: false,
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
        labelsVisible: true,
        popupEnabled: true
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
            mode: "on-the-ground"
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
            _this.name = "Obstruction Placement";
            _this.activated = false;
            _this.display_mode = "hover";
            return _this;
        }
        Object.defineProperty(ObstructionPane.prototype, "status", {
            get: function () {
                var d;
                if (this.activated) {
                    d = "Activated";
                }
                else {
                    d = "Activate";
                }
                return d;
            },
            enumerable: true,
            configurable: true
        });
        ObstructionPane.prototype.activate = function (event) {
            var _this = this;
            this.activated = true;
            var crit_3d = this.scene.findLayerById("critical_3d");
            var part77 = this.scene.findLayerById("part_77_group");
            var crit_2d = this.scene.findLayerById("critical_2d_surfaces");
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
            if (crit_2d) {
                crit_2d.visible = false;
                crit_2d.definitionExpression = "OBJECTID IS NULL";
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
                _this.activated = false;
                e.stopPropagation();
                if (e && e.mapPoint) {
                    if (mouse_track) {
                        mouse_track.remove();
                        _this.view.graphics.removeAll();
                    }
                    view_click.remove();
                    _this.ground_elevation = parseFloat(ground_node.value);
                    _this.modified_base = false;
                    _this.submit(e.mapPoint);
                }
            });
        };
        ObstructionPane.prototype.submit = function (point) {
            var main_deferred = new Deferred();
            var obsHeight = dom.byId("obsHeight");
            var groundLevel = dom.byId("groundLevel");
            var northingNode = dom.byId("northing");
            var eastingNode = dom.byId("easting");
            groundLevel.value = point.z.toFixed(1);
            northingNode.value = point.y.toFixed(3);
            eastingNode.value = point.x.toFixed(3);
            var height = parseFloat(obsHeight.value);
            if (!height) {
                height = 200 - Number(groundLevel.value);
                obsHeight.value = height.toFixed(2);
            }
            var z = parseFloat(groundLevel.value);
            var y = parseFloat(northingNode.value);
            var x = parseFloat(eastingNode.value);
            this.performQuery(x, y, z, height).then(function (graphic) {
                main_deferred.resolve(graphic);
            });
            return main_deferred.promise;
        };
        ObstructionPane.prototype.submitPanel = function (event) {
            var obsHeight = dom.byId("obsHeight");
            var groundLevel = dom.byId("groundLevel");
            var northingNode = dom.byId("northing");
            var eastingNode = dom.byId("easting");
            var base_level = parseFloat(groundLevel.value);
            if (base_level !== this.ground_elevation) {
                this.modified_base = true;
            }
            else {
                this.modified_base = false;
            }
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
            var main_deferred = new Deferred();
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
            this.scene.add(intersection_layer);
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
                _this.view.whenLayerView(obstruction_base).then(function (lyrView) {
                    lyrView.highlight(graphic);
                    _this.view.goTo(graphic.geometry.extent.center);
                    _this.setDefaultLayerVisibility();
                    main_deferred.resolve(graphic);
                });
            });
            return main_deferred.promise;
        };
        ObstructionPane.prototype.querySurfaces = function (vertical_line) {
            var _this = this;
            var map = this.scene;
            var main_deferred = new Deferred();
            var first = new Deferred();
            var second = new Deferred();
            var third = new Deferred();
            var crit_3d = map.findLayerById("critical_3d");
            var crid_3d_layers = crit_3d.layers;
            var part77 = map.findLayerById("part_77_group");
            var part77_layers = part77.layers;
            var crit_2d_layer = map.findLayerById("runwayhelipaddesignsurface");
            function isFalse(element, index, array) {
                if (!element) {
                    return true;
                }
                else {
                    return false;
                }
            }
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
                            else if (oids.length === 1 && oids[0] !== undefined) {
                                lyr.definitionExpression = "OBJECTID = " + oids[0];
                            }
                            else {
                                lyr.definitionExpression = "OBJECTID IS NULL";
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
                                else if (oids.length === 1 && oids[0] !== undefined) {
                                    lyr.definitionExpression = "OBJECTID = " + oids[0];
                                }
                                else {
                                    lyr.definitionExpression = "OBJECTID IS NULL";
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
                    second.resolve(false);
                }
                else {
                    part77.visible = true;
                    second.resolve(true);
                }
            });
            crit_2d_layer.queryFeatures(query).then(function (e) {
                if (e.features.length) {
                    var oids = e.features.map(function (obj) {
                        return obj.attributes.OBJECTID;
                    });
                    crit_2d_layer.definitionExpression = "OBJECTID IN (" + oids.join() + ")";
                    crit_2d_layer.visible = true;
                    third.resolve(true);
                }
                else {
                    crit_2d_layer.definitionExpression = "OBJECTID IS NULL";
                    crit_2d_layer.visible = false;
                    third.resolve(false);
                }
            }, function (err) {
                console.log(err);
                crit_2d_layer.visible = false;
                third.resolve(false);
            });
            all([first, second, third]).then(function (e) {
                if (e[0] || e[1] || e[2]) {
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
            var map = this.scene;
            var view = this.view;
            var obst_height_node = dom.byId("obsHeight");
            var ground_elev_node = dom.byId("groundLevel");
            var obst_height = parseFloat(obst_height_node.value);
            var groundElev = parseFloat(ground_elev_node.value);
            var features_3d = [];
            var features_2d = [];
            var server_dem_bool = false;
            for (var i = 0, il = _result.length; i < il; i++) {
                var idResult = _result[i];
                var whichRaster = void 0;
                var b = void 0;
                var bl = void 0;
                if ([1, 2, 3, 4, 6, 7, 8].indexOf(idResult.layerId) !== -1) {
                    var name_1 = idResult.feature.attributes.Name;
                    var rnwy_designator = idResult.feature.attributes["Runway Designator"].replace("/", "_");
                    var objectID = idResult.feature.attributes.OBJECTID;
                    var feat = idResult.feature.clone();
                    feat.attributes.layerName = idResult.layerName;
                    feat.attributes.Elev = undefined;
                    whichRaster = name_1 + "_" + rnwy_designator + "_" + objectID;
                    for (b = 0, bl = _result.length; b < bl; b++) {
                        if (_result[b].layerName === whichRaster) {
                            var pixel_value = _result[b].feature.attributes["Pixel Value"];
                            if (pixel_value === "NoData") {
                                console.log(whichRaster);
                            }
                            else {
                                var point_elev = parseFloat(pixel_value).toFixed(1);
                                feat.attributes.Elev = parseFloat(point_elev);
                                features_3d.push(feat);
                            }
                        }
                    }
                }
                if ([10, 11].indexOf(idResult.layerId) !== -1) {
                    var feat = idResult.feature.clone();
                    feat.attributes.layerName = idResult.layerName;
                    features_2d.push(feat);
                }
                if (idResult.layerId === 82) {
                    var raster_val = idResult.feature.attributes["Pixel Value"];
                    if (!this.modified_base) {
                        if (raster_val === "NoData") {
                            groundElev = this.obstruction_settings.base_height;
                            server_dem_bool = false;
                        }
                        else {
                            groundElev = parseFloat(parseFloat(raster_val).toFixed(1));
                            server_dem_bool = true;
                        }
                    }
                    else {
                        server_dem_bool = false;
                    }
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
            var dem_source;
            if (server_dem_bool) {
                dem_source = "PHL DEM";
            }
            else {
                if (this.modified_base) {
                    dem_source = "Manual Override";
                }
                else {
                    dem_source = "USGS DEM";
                }
            }
            var settings = {
                layerResults2d: Results2d,
                layerResults3d: Results3d,
                dem_source: dem_source,
                base_height: groundElev,
                peak_height: obst_height
            };
            this.obstruction_settings = settings;
            view.popup.content = this.buildPopup(Results3d, Results2d, groundElev, obst_height, x_value, y_value);
            view.popup.title = "Obstruction Analysis Results";
            view.popup.open();
        };
        ObstructionPane.prototype.buildPopup = function (layerResults3d, layerResults2d, base_height, peak_height, x, y) {
            var obsHt = 0;
            if (peak_height) {
                obsHt = peak_height;
            }
            var features3D = layerResults3d.features;
            var features2D = layerResults2d.features;
            var popup_container = domConstruct.create("div");
            var summary_content = domConstruct.toDom("<b>x:</b> " + x.toFixed(3) + " <b>y:</b> " + y.toFixed(3) + "<br><b>Ground Elevation:</b> " + base_height + " feet MSL <i>source: " + this.obstruction_settings.dem_source + "</i><br><b>Obstruction Height: </b>" + obsHt + " feet<br>");
            domConstruct.place(summary_content, popup_container);
            var tab_div = domConstruct.create("div", { class: "trailer-2 js-tab-group" });
            var nav_group = domConstruct.create("nav", { class: "tab-nav" });
            var link3D = domConstruct.create("a", { id: "3d_tab", class: "tab-title is-active js-tab", innerHTML: "3D Surfaces (" + features3D.length + ")" });
            var link2D = domConstruct.create("a", { id: "2d_tab", class: "tab-title js-tab", innerHTML: "2D Surfaces (" + features2D.length + ")" });
            var tab_content = domConstruct.create("section", { class: "tab-contents" });
            var article1 = domConstruct.create("article", { id: "results3d", class: "results_panel tab-section js-tab-section is-active" });
            var article2 = domConstruct.create("article", { id: "results2d", class: "results_panel tab-section js-tab-section" });
            var article1_meta = domConstruct.create("article", { id: "results3d_meta", class: "results_panel-meta tab-section js-tab-section" });
            var article2_meta = domConstruct.create("article", { id: "results2d_meta", class: "results_panel-meta tab-section js-tab-section" });
            on(link3D, "click", function (evt) {
                if (!domClass.contains(link3D, "is-active")) {
                    domClass.add(link3D, "is-active");
                    domClass.add(article1, "is-active");
                    domClass.add(article1_meta, "is-active");
                    domClass.remove(link2D, "is-active");
                    domClass.remove(article2, "is-active");
                    domClass.remove(article2_meta, "is-active");
                }
            });
            on(link2D, "click", function (evt) {
                if (!domClass.contains(link2D, "is-active")) {
                    domClass.add(link2D, "is-active");
                    domClass.add(article2, "is-active");
                    domClass.add(article2_meta, "is-active");
                    domClass.remove(link3D, "is-active");
                    domClass.remove(article1, "is-active");
                    domClass.remove(article1_meta, "is-active");
                }
            });
            domConstruct.place(article1, tab_content);
            domConstruct.place(article1_meta, tab_content);
            domConstruct.place(article2, tab_content);
            domConstruct.place(article2_meta, tab_content);
            domConstruct.place(link3D, nav_group);
            domConstruct.place(link2D, nav_group);
            domConstruct.place(nav_group, tab_div);
            domConstruct.place(tab_content, tab_div);
            domConstruct.place(tab_div, popup_container);
            var table3D = this.generateResultsGrid3D(layerResults3d, base_height, peak_height);
            domConstruct.place(table3D, article1);
            var table2D = this.generateResultsGrid2D(layerResults2d);
            domConstruct.place(table2D, article2);
            return popup_container;
        };
        ObstructionPane.prototype.row_hover_funct = function (evt, id) {
            var layerName = domAttr.get(evt.currentTarget, "data-layername");
            var layerID = layerName.toLowerCase().replace(" ", "_");
            var target_layer = this.scene.findLayerById(layerID);
            target_layer.definitionExpression = "OBJECTID = " + id;
            this.setSingleLayerVisible(target_layer);
        };
        ObstructionPane.prototype.generateResultsGrid3D = function (layerResults3d, base_height, peak_height) {
            var features3D = layerResults3d.features;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var table3D = domConstruct.create("table", { class: "table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h = domConstruct.create("th", { innerHTML: "Visibility Lock", class: "vis-field" });
            var h1 = domConstruct.create("th", { innerHTML: "Clearance (+ / - ft.)", class: "data-field" });
            var h2 = domConstruct.create("th", { innerHTML: "Surface Name", class: "data-field" });
            var h3 = domConstruct.create("th", { innerHTML: "Type", class: "data-field" });
            var h4 = domConstruct.create("th", { innerHTML: "Condition", class: "data-field" });
            var h5 = domConstruct.create("th", { innerHTML: "Runway", class: "data-field" });
            var h6 = domConstruct.create("th", { innerHTML: "Elevation Above Sea Level (ft.)", class: "data-field" });
            var h7 = domConstruct.create("th", { innerHTML: "Height Above Ground (ft.)", class: "data-field" });
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
            var tbody = domConstruct.create("tbody");
            var array3D = this.create3DArray(features3D, base_height, peak_height);
            var table_rows;
            array3D.forEach(function (obj) {
                var tr = domConstruct.create("tr", { class: "3d-results-row", id: obj.oid + "_3d_result_row" });
                domAttr.set(tr, "data-layername", obj.layerName);
                var viz = domConstruct.create("label", { class: "toggle-switch" });
                var viz_input = domConstruct.create("input", { type: "checkbox", class: "toggle-switch-input", id: obj.oid + "_3d_result_switch" });
                if (table_rows && table_rows.length) {
                    table_rows.push([viz_input, tr]);
                }
                else {
                    table_rows = [[viz_input, tr]];
                }
                var viz_span = domConstruct.create("span", { class: "toggle-switch-track margin-right-1" });
                domConstruct.place(viz_input, viz);
                domConstruct.place(viz_span, viz);
                var td = domConstruct.create("td", { class: "vis-field" });
                domConstruct.place(viz, td);
                var td1 = domConstruct.create("td", { innerHTML: obj.clearance, class: "data-field" });
                var td2 = domConstruct.create("td", { innerHTML: obj.surface, class: "data-field" });
                var td3 = domConstruct.create("td", { innerHTML: obj.type, class: "data-field" });
                var td4 = domConstruct.create("td", { innerHTML: obj.condition, class: "data-field" });
                var td5 = domConstruct.create("td", { innerHTML: obj.runway, class: "data-field" });
                var td6 = domConstruct.create("td", { innerHTML: obj.elevation, class: "data-field" });
                var td7 = domConstruct.create("td", { innerHTML: obj.height, class: "data-field" });
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
        };
        ObstructionPane.prototype.build3dTableConnections = function (table_body, table_rows) {
            var _this = this;
            console.log(table_rows);
            if (this.display_mode === "hover") {
                if (!this.table_leave_evt) {
                    this.table_leave_evt = on(table_body, "mouseleave", function (evt) {
                        _this.getDefaultLayerVisibility();
                    });
                }
                table_rows.forEach(function (arr) {
                    var row = arr[1];
                    var _switch = arr[0];
                    var row_hover = on(row, "mouseenter", function (evt) {
                        var id = evt.target.id.split("_")[0];
                        _this.row_hover_funct(evt, id);
                    });
                    if (!_this.row_hover_evts) {
                        _this.set("row_hover_evts", [row_hover]);
                    }
                    else {
                        _this.row_hover_evts.push(row_hover);
                    }
                    on(_switch, "click", function (evt) {
                        if (evt.target.checked) {
                            _this.set("display_mode", "toggle");
                            _this.build3dTableConnections(table_body, table_rows);
                        }
                        else {
                            var any_checked = Array.some(table_rows, function (arr) {
                                var _switch = arr[0];
                                if (_switch.checked) {
                                    return true;
                                }
                            });
                            if (!any_checked) {
                                _this.set("display_mode", "hover");
                                _this.build3dTableConnections(table_body, table_rows);
                            }
                        }
                    });
                });
            }
            else if (this.display_mode === "toggle") {
                if (this.table_leave_evt) {
                    this.table_leave_evt.remove();
                    this.table_leave_evt = undefined;
                }
                this.row_hover_evts.forEach(function (obj) {
                    obj.remove();
                });
                this.row_hover_evts = [];
            }
        };
        ObstructionPane.prototype.setSingleLayerVisible = function (visible_layer) {
            var part77_group = this.scene.findLayerById("part_77_group");
            var critical_3d = this.scene.findLayerById("critical_3d");
            visible_layer.visible = true;
            critical_3d.layers.forEach(function (lyr) {
                if (lyr.id !== visible_layer.id) {
                    lyr.visible = false;
                }
            });
            part77_group.layers.forEach(function (lyr) {
                if (lyr.id !== visible_layer.id) {
                    lyr.visible = false;
                }
            });
        };
        ObstructionPane.prototype.generateMetaGrid3D = function (layerResults3d, base_height, peak_height) {
            var _this = this;
            var features3D = layerResults3d.features;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var table3D = domConstruct.create("table", { class: "table meta-table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h1 = domConstruct.create("th", { innerHTML: "Clearance (+ / - ft.)", class: "data-field" });
            var h2 = domConstruct.create("th", { innerHTML: "Approach Guidance", class: "metadata-field" });
            var h3 = domConstruct.create("th", { innerHTML: "Date Acquired", class: "metadata-field" });
            var h4 = domConstruct.create("th", { innerHTML: "Description", class: "metadata-field" });
            var h5 = domConstruct.create("th", { innerHTML: "Safety Regulation", class: "metadata-field" });
            var h6 = domConstruct.create("th", { innerHTML: "Zone Use", class: "metadata-field" });
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(h3, header_row);
            domConstruct.place(h4, header_row);
            domConstruct.place(h5, header_row);
            domConstruct.place(h6, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table3D);
            var tbody = domConstruct.create("tbody");
            var array3D = this.create3DArray(features3D, base_height, peak_height);
            array3D.forEach(function (obj) {
                var tr = domConstruct.create("tr");
                domAttr.set(tr, "data-layername", obj.layerName);
                var td = domConstruct.create("td", { innerHTML: obj.clearance, class: "data-field" });
                var td2 = domConstruct.create("td", { innerHTML: obj.guidance, class: "metadata-field" });
                var td3 = domConstruct.create("td", { innerHTML: obj.date_acquired, class: "metadata-field" });
                var td4 = domConstruct.create("td", { innerHTML: obj.description, class: "metadata-field" });
                var td5 = domConstruct.create("td", { innerHTML: obj.regulation, class: "metadata-field" });
                var td6 = domConstruct.create("td", { innerHTML: obj.zone_use, class: "metadata-field" });
                if (obj.clearance <= 0) {
                    domClass.add(td, "negative");
                }
                domConstruct.place(td, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(td3, tr);
                domConstruct.place(td4, tr);
                domConstruct.place(td5, tr);
                domConstruct.place(td6, tr);
                on(tr, "mouseover", function (evt) {
                    var layerName = domAttr.get(evt.currentTarget, "data-layername");
                    var layerID = layerName.toLowerCase().replace(" ", "_");
                    var target_layer = _this.scene.findLayerById(layerID);
                    target_layer.definitionExpression = "OBJECTID = " + obj.oid;
                    _this.setSingleLayerVisible(target_layer);
                });
                domConstruct.place(tr, tbody);
            });
            on(tbody, "mouseleave", function (evt) {
                _this.getDefaultLayerVisibility();
            });
            domConstruct.place(tbody, table3D);
            domConstruct.place(table3D, div_wrapper);
            return div_wrapper;
        };
        ObstructionPane.prototype.generateResultsGrid2D = function (layerResults2d) {
            var _this = this;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var features2D = layerResults2d.features;
            var table2D = domConstruct.create("table", { class: "table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h1 = domConstruct.create("th", { innerHTML: "Surface Name" });
            var h2 = domConstruct.create("th", { innerHTML: "Description" });
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table2D);
            var tbody = domConstruct.create("tbody");
            var array2D = this.create2DArray(features2D);
            var highlight;
            array2D.forEach(function (obj) {
                var tr = domConstruct.create("tr");
                domAttr.set(tr, "data-layername", obj.layerName);
                var td = domConstruct.create("td", { innerHTML: obj.name });
                var td2 = domConstruct.create("td", { innerHTML: obj.description });
                domConstruct.place(td, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(tr, tbody);
                on(tr, "mouseover", function (evt) {
                    highlight = _this.highlight2DRow(evt, obj, highlight);
                });
            });
            on(tbody, "mouseleave", function (evt) {
                if (highlight) {
                    highlight.remove();
                }
            });
            domConstruct.place(tbody, table2D);
            domConstruct.place(table2D, div_wrapper);
            return div_wrapper;
        };
        ObstructionPane.prototype.highlight2DRow = function (evt, _obj, _highlight) {
            var layerName = domAttr.get(evt.currentTarget, "data-layername");
            var layerID = layerName.toLowerCase().replace(" ", "_");
            var target_layer = this.scene.findLayerById(layerID);
            var highlight = _highlight;
            this.view.whenLayerView(target_layer).then(function (lyrView) {
                if (highlight) {
                    highlight.remove();
                }
                highlight = lyrView.highlight(Number(_obj.oid));
            });
            return highlight;
        };
        ObstructionPane.prototype.generateMetaGrid2D = function (layerResults2d) {
            var _this = this;
            var div_wrapper = domConstruct.create("div", { class: "overflow-auto table-div" });
            var features2D = layerResults2d.features;
            var crit_2d_layer = this.scene.findLayerById("runwayhelipaddesignsurface");
            var aoa = this.scene.findLayerById("airoperationsarea");
            var table2D = domConstruct.create("table", { class: "table meta-table" });
            var thead = domConstruct.create("thead");
            var header_row = domConstruct.create("tr");
            var h1 = domConstruct.create("th", { innerHTML: "Date Acquired" });
            var h2 = domConstruct.create("th", { innerHTML: "Data Source" });
            var h3 = domConstruct.create("th", { innerHTML: "Last Update" });
            domConstruct.place(h1, header_row);
            domConstruct.place(h2, header_row);
            domConstruct.place(h3, header_row);
            domConstruct.place(header_row, thead);
            domConstruct.place(thead, table2D);
            var tbody = domConstruct.create("tbody");
            var array2D = this.create2DArray(features2D);
            var highlight;
            array2D.forEach(function (obj) {
                var tr = domConstruct.create("tr");
                domAttr.set(tr, "data-layername", obj.layerName);
                var td = domConstruct.create("td", { innerHTML: obj.date_acquired, class: "metadata-field" });
                var td2 = domConstruct.create("td", { innerHTML: obj.data_source, class: "metadata-field" });
                var td3 = domConstruct.create("td", { innerHTML: obj.last_update, class: "metadata-field" });
                domConstruct.place(td, tr);
                domConstruct.place(td2, tr);
                domConstruct.place(td3, tr);
                on(tr, "mouseover", function (evt) {
                    highlight = _this.highlight2DRow(evt, obj, highlight);
                });
                domConstruct.place(tr, tbody);
            });
            on(tbody, "mouseleave", function (evt) {
                if (highlight) {
                    highlight.remove();
                }
            });
            domConstruct.place(tbody, table2D);
            domConstruct.place(table2D, div_wrapper);
            return div_wrapper;
        };
        ObstructionPane.prototype.create3DArray = function (features, base_height, obsHt) {
            var results = features.map(function (feature) {
                var surface_elevation = feature.attributes.Elev;
                var height_agl;
                var clearance;
                height_agl = Number((surface_elevation - base_height).toFixed(1));
                clearance = Number((height_agl - obsHt).toFixed(1));
                return ({
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
            var sorted_array = results.slice(0);
            sorted_array.sort(function (leftSide, rightSide) {
                if (leftSide.clearance < rightSide.clearance) {
                    return 1;
                }
                if (leftSide.clearance > rightSide.clearance) {
                    return -1;
                }
                return 0;
            });
            return sorted_array;
        };
        ObstructionPane.prototype.create2DArray = function (features) {
            var results = features.map(function (feature) {
                return ({
                    oid: feature.attributes.OBJECTID,
                    layerName: feature.attributes.layerName,
                    name: feature.attributes.Name,
                    description: feature.attributes.Description,
                    date_acquired: feature.attributes["Date Data Acquired"],
                    data_source: feature.attributes["Data Source"],
                    last_update: feature.attributes["Last Update"]
                });
            });
            var sorted_array = results.slice(0);
            sorted_array.sort(function (leftSide, rightSide) {
                if (leftSide.name < rightSide.name) {
                    return 1;
                }
                if (leftSide.name > rightSide.name) {
                    return -1;
                }
                return 0;
            });
            return sorted_array;
        };
        ObstructionPane.prototype.togglePopup = function (event) {
            if (this.view.popup.visible) {
                this.view.popup.close();
            }
            else {
                this.view.popup.open();
            }
        };
        ObstructionPane.prototype.setDefaultLayerVisibility = function () {
            var _this = this;
            var i = 0;
            this.scene.allLayers.forEach(function (lyr) {
                if (lyr.type === "feature") {
                    var default_visibility = {
                        id: lyr.id,
                        def_visible: lyr.visible,
                        def_exp: lyr.definitionExpression
                    };
                    if (!i) {
                        _this.layer_visibility = [default_visibility];
                        i += 1;
                    }
                    else {
                        if (_this.layer_visibility) {
                            _this.layer_visibility.push(default_visibility);
                        }
                        else {
                            _this.layer_visibility = [default_visibility];
                        }
                    }
                }
            });
        };
        ObstructionPane.prototype.getDefaultLayerVisibility = function () {
            var _this = this;
            var default_vis = this.layer_visibility;
            this.layer_visibility.forEach(function (obj) {
                var target_layer = _this.scene.findLayerById(obj.id);
                target_layer.visible = obj.def_visible;
                target_layer.definitionExpression = obj.def_exp;
            });
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
                            widget_1.tsx("label", null,
                                widget_1.tsx("input", { id: "obsHeight", type: "number", placeholder: "Height of Obstruction", title: "Height of Obstruction in feet" })),
                            widget_1.tsx("label", null,
                                widget_1.tsx("input", { id: "groundLevel", type: "number", placeholder: "+/- Ground Elevation", title: "+/- Ground Elevation in feet" }))),
                        widget_1.tsx("div", { class: "obstruction-inputs" },
                            widget_1.tsx("div", { id: "xandy" },
                                widget_1.tsx("label", null,
                                    widget_1.tsx("input", { id: "easting", type: "number", placeHolder: "X: Easting", title: "X: Easting in feet" })),
                                widget_1.tsx("label", null,
                                    widget_1.tsx("input", { id: "northing", type: "number", placeHolder: "Y: Northing", title: "Y: Northing in feet" })))),
                        widget_1.tsx("div", { id: "target_btns" },
                            widget_1.tsx("div", { id: "activate_target", onclick: function (e) { return _this.activate(e); }, class: "btn btn-transparent" }, this.status),
                            widget_1.tsx("div", { id: "obs_submit", onclick: function (e) { return _this.submitPanel(e); }, class: "btn btn-transparent" }, "Submit"))))));
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
            decorators_1.property()
        ], ObstructionPane.prototype, "layer_visibility", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "obstruction_settings", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "display_mode", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "ground_elevation", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "modified_base", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "table_leave_evt", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ObstructionPane.prototype, "row_hover_evts", void 0);
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