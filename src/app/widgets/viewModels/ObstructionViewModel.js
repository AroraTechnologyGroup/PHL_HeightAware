var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/support/widget", "esri/tasks/support/FeatureSet", "esri/core/Accessor", "esri/core/watchUtils", "esri/Graphic", "esri/tasks/IdentifyTask", "esri/tasks/support/IdentifyParameters", "esri/geometry/SpatialReference", "esri/layers/support/LabelClass", "esri/layers/FeatureLayer", "esri/renderers/SimpleRenderer", "esri/symbols/PolygonSymbol3D", "esri/geometry/Point", "esri/geometry/geometryEngine", "esri/geometry/Polyline", "esri/tasks/support/Query", "esri/tasks/Geoprocessor", "dojo/_base/array", "dojo/promise/all", "dojo/Deferred", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, widget_1, FeatureSet, Accessor, watchUtils_1, Graphic, IdentifyTask, IdentifyParameters, SpatialReference, LabelClass, FeatureLayer, SimpleRenderer, PolygonSymbol3D, Point, geometryEngine, Polyline, Query, Geoprocessor, Array, all, Deferred, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/MapServer";
    var sr = new SpatialReference({
        wkid: 103142
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
        labelsVisible: false,
        popupEnabled: true
    });
    var pointerTracker = new Graphic({
        symbol: {
            type: "point-3d",
            symbolLayers: [{
                    type: "object",
                    width: 5,
                    height: 100,
                    depth: 5,
                    resource: { primitive: "cylinder" },
                    material: { color: "blue" }
                }]
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
    var ObstructionViewModel = (function (_super) {
        __extends(ObstructionViewModel, _super);
        function ObstructionViewModel(params) {
            var _this = _super.call(this, params) || this;
            watchUtils_1.whenOnce(_this, "view").then(_this.onload.bind(_this));
            return _this;
        }
        ObstructionViewModel.prototype.activate = function (event) {
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
            var ground_node = document.getElementById("groundLevel");
            var obsHeight_node = document.getElementById("obsHeight");
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
                        var z = result.geometry.z;
                        ground_node.value = z.toFixed(1);
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
                    _this.groundElevation = parseFloat(ground_node.value);
                    _this.modifiedBase = false;
                    _this.submit(e.mapPoint);
                }
            });
        };
        ObstructionViewModel.prototype.deactivate = function (event) {
            console.log(event);
        };
        ObstructionViewModel.prototype.ccXY = function () {
            var deferred = new Deferred();
            var conv = this.ccWidgetViewModel.get("conversions");
            var first_conversion = conv.getItemAt(0);
            var x;
            var y;
            if (first_conversion.format.name === "basemap") {
                x = first_conversion.position.location.x;
                y = first_conversion.position.location.y;
                deferred.resolve({ x: x, y: y });
            }
            else {
                this.ccWidgetViewModel.reverseConvert(first_conversion.position.coordinate, first_conversion.format).then(function (point) {
                    deferred.resolve({ x: point.x, y: point.y });
                });
            }
            return deferred.promise;
        };
        ObstructionViewModel.prototype.submit = function (point) {
            var _this = this;
            var main_deferred = new Deferred();
            var obsHeight = document.getElementById("obsHeight");
            var groundLevel = document.getElementById("groundLevel");
            groundLevel.value = point.z.toFixed(1);
            var height = parseFloat(obsHeight.value);
            if (!height) {
                height = 200 - Number(groundLevel.value);
                obsHeight.value = height.toFixed(2);
            }
            var z = parseFloat(groundLevel.value);
            this.ccXY().then(function (coord) {
                var graphic = _this.addObstructionGraphic(coord.x, coord.y, z, height);
                _this.performQuery(graphic).then(function (graphic) {
                    main_deferred.resolve(graphic);
                });
            });
            return main_deferred.promise;
        };
        ObstructionViewModel.prototype.addObstructionGraphic = function (_x, _y, _z, _height) {
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
                "obstacleHeight": _height
            };
            graphic.geometry = ptBuff;
            graphic.geometry.spatialReference = sr;
            obstruction_base.source.removeAll();
            obstruction_base.source.add(graphic);
            this.scene.add(obstruction_base);
            this.scene.add(intersection_layer);
            return graphic;
        };
        ObstructionViewModel.prototype.performQuery = function (_graphic) {
            var _this = this;
            var main_deferred = new Deferred();
            var _z = _graphic.attributes.baseElevation;
            var _agl = _graphic.attributes.obstacleHeight;
            var polygon = _graphic.geometry;
            var _x = polygon.centroid.x;
            var _y = polygon.centroid.y;
            var line = new Polyline({
                paths: [[
                        [_x, _y, _z],
                        [_x + 1, _y + 1, _agl]
                    ]],
                spatialReference: sr,
                hasZ: true
            });
            var promise = this.doIdentify(_x, _y);
            promise.then(function (response) {
                if (response) {
                    var obstructionSettings = _this.buildObstructionSettings(response);
                    if (!_this.modifiedBase) {
                        var ground_elevation = obstructionSettings.groundElevation;
                        var input = document.getElementById("groundLevel");
                        input.value = ground_elevation.toString();
                        _this.groundElevation = ground_elevation;
                    }
                    else {
                    }
                    var _msl = Number((_this.groundElevation + _agl).toFixed(2));
                    _agl = Number(_agl.toFixed(2));
                    _x = Number(_x.toFixed(2));
                    _y = Number(_y.toFixed(2));
                    var params = {
                        x: _x,
                        y: _y,
                        msl: _msl,
                        agl: _agl,
                        modifiedBase: _this.modifiedBase,
                        layerResults3d: obstructionSettings.layerResults3d,
                        layerResults2d: obstructionSettings.layerResults2d,
                        groundElevation: _this.groundElevation,
                        dem_source: obstructionSettings.dem_source
                    };
                    _this.results.set(params);
                    _this.results.expand.expand();
                }
                else {
                    console.log("No results from server :: " + response);
                }
            });
            this.querySurfaces(line).then(function () {
                _this.view.whenLayerView(obstruction_base).then(function (lyrView) {
                    lyrView.highlight(_graphic);
                    _this.view.goTo(_graphic.geometry.extent.center);
                    _this.setDefaultLayerVisibility();
                    main_deferred.resolve(_graphic);
                });
            });
            return main_deferred.promise;
        };
        ObstructionViewModel.prototype.submitPanel = function (event) {
            var _this = this;
            var obsHeight = document.getElementById("obsHeight");
            var groundLevel = document.getElementById("groundLevel");
            var base_level = parseFloat(groundLevel.value);
            if (base_level !== this.groundElevation) {
                this.modifiedBase = true;
            }
            else {
                if (this.modifiedBase) {
                    console.log("the base has already been modified once");
                }
                else {
                    this.modifiedBase = false;
                }
            }
            this.groundElevation = base_level;
            this.ccXY().then(function (_a) {
                var _x = _a[0], _y = _a[1];
                var _z = _this.groundElevation;
                var panelPoint = new Point({
                    x: _x,
                    y: _y,
                    z: _z,
                    spatialReference: sr
                });
                _this.submit(panelPoint);
            });
        };
        ObstructionViewModel.prototype.querySurfaces = function (vertical_line) {
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
                        var oids = e.features.map(function (value) {
                            return value.attributes["OBJECTID"];
                        });
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
                        var oids = e.features.map(function (value) {
                            return value.attributes["OBJECTID"];
                        });
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
                        return obj.attributes["OBJECTID"];
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
        ObstructionViewModel.prototype.getIntersectionPoint = function (_polygon, _line) {
            var deferred = new Deferred();
            var peak_height = _line.paths[0][1][2];
            var poly_geo = _polygon.geometry;
            var base_point = new Point({
                x: _line.paths[0][0][0],
                y: _line.paths[0][0][1],
                spatialReference: sr
            });
            var geo_service = new Geoprocessor({
                url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Intersect3DLineWithOIS/GPServer/Intersect%203D%20Line%20With%20Multipatch"
            });
            var graphic = new Graphic({
                geometry: base_point,
                attributes: [{
                        "OBJECTID": 0
                    }, {
                        "SHAPE_Length": line_length
                    }]
            });
            var fset = new FeatureSet();
            fset.geometryType = "polyline";
            fset.features = [graphic];
            geo_service.execute({
                in_line_features: fset,
                in_multipatch_features: "OIS"
            }).then(function (out) {
                console.log(out);
                deferred.resolve(out);
            }, function (err) {
                console.log(err);
                deferred.resolve(false);
            });
            return deferred.promise;
        };
        ObstructionViewModel.prototype.filterSurfaces3D = function (_graphics, _line) {
            var _this = this;
            var main_deferred = new Deferred();
            var height = _line.paths[0][1][2];
            var oids = Array.map(_graphics.features, function (e) {
                var deferred = new Deferred();
                _this.getIntersectionPoint(e, _line).then(function (pnt) {
                    if (pnt && pnt.z <= height) {
                        var interectGraph = intersectionGraphic.clone();
                        var inPoint = new Point(pnt);
                        inPoint.spatialReference = sr;
                        interectGraph.geometry = inPoint;
                        interectGraph.attributes = {
                            surfaceName: e.attributes.NAME
                        };
                        intersection_layer.source.add(interectGraph);
                        deferred.resolve(e.attributes.OBJECTID);
                    }
                    else {
                        deferred.resolve();
                    }
                }, function (err) {
                    console.log(err);
                    deferred.resolve();
                });
                return deferred.promise;
            });
            all(oids).then(function (list) {
                main_deferred.resolve(list);
            });
            return main_deferred.promise;
        };
        ObstructionViewModel.prototype.doIdentify = function (x, y) {
            var map = this.scene;
            var view = this.view;
            var deferred = new Deferred();
            var x_coord = x;
            var y_coord = y;
            var idTask = new IdentifyTask({
                url: CEPCT
            });
            var idParams = new IdentifyParameters();
            idParams.tolerance = 1;
            idParams.returnGeometry = true;
            idParams.layerOption = "all";
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
        ObstructionViewModel.prototype.setDefaultLayerVisibility = function () {
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
                        _this.layerVisibility = [default_visibility];
                        i += 1;
                    }
                    else {
                        if (_this.layerVisibility) {
                            _this.layerVisibility.push(default_visibility);
                        }
                        else {
                            _this.layerVisibility = [default_visibility];
                        }
                    }
                }
            });
        };
        ObstructionViewModel.prototype.buildObstructionSettings = function (idResults) {
            var features_3d = [];
            var features_2d = [];
            var server_dem_bool = false;
            for (var i = 0, il = idResults.length; i < il; i++) {
                var idResult = idResults[i];
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
                    for (b = 0, bl = idResults.length; b < bl; b++) {
                        if (idResults[b].layerName === whichRaster) {
                            var pixel_value = idResults[b].feature.attributes["Pixel Value"];
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
                    if (!this.modifiedBase) {
                        if (raster_val === "NoData") {
                            server_dem_bool = false;
                        }
                        else {
                            this.groundElevation = parseFloat(parseFloat(raster_val).toFixed(1));
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
            var dem_source;
            if (server_dem_bool) {
                dem_source = "PHL DEM";
            }
            else {
                if (this.modifiedBase) {
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
                groundElevation: this.groundElevation
            };
            return settings;
        };
        ObstructionViewModel.prototype.onload = function () {
        };
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "scene", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "view", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], ObstructionViewModel.prototype, "name", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "groundElevation", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "activated", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "layerVisibility", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "modifiedBase", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "ccWidgetViewModel", void 0);
        __decorate([
            decorators_1.property()
        ], ObstructionViewModel.prototype, "results", void 0);
        ObstructionViewModel = __decorate([
            decorators_1.subclass("widgets.App.ObstructionViewModel")
        ], ObstructionViewModel);
        return ObstructionViewModel;
    }(decorators_1.declared(Accessor)));
    exports.default = ObstructionViewModel;
});
//# sourceMappingURL=ObstructionViewModel.js.map