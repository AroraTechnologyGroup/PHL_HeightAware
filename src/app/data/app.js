define(["require", "exports", "esri/Basemap", "esri/geometry/Extent", "esri/PopupTemplate", "esri/geometry/SpatialReference", "esri/layers/ElevationLayer", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/layers/TileLayer", "esri/WebScene"], function (require, exports, Basemap, Extent, PopupTemplate, SpatialReference, ElevationLayer, FeatureLayer, GroupLayer, TileLayer, WebScene) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sr = new SpatialReference({
        wkid: 2272
    });
    var imageryLayer = new TileLayer({
        url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_1ft_Imagery/MapServer",
        opacity: 0.95
    });
    var elevationLayer = new ElevationLayer({
        url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_DEM_1ft/ImageServer"
    });
    var buildingUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/1";
    var terminalF = {
        type: "polygon-3d",
        symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#66c2a5"
                },
                edges: {
                    type: "solid",
                    color: "#A7C636"
                }
            }]
    };
    var terminalDE = {
        type: "polygon-3d",
        symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#fc8d62"
                },
                edges: {
                    type: "solid",
                    color: "#A7C636"
                }
            }]
    };
    var terminalBC = {
        type: "polygon-3d",
        symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#8da0cb"
                },
                edges: {
                    type: "solid",
                    color: "#A7C636"
                }
            }]
    };
    var terminalAWest = {
        type: "polygon-3d",
        symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#e78ac3"
                },
                edges: {
                    type: "solid",
                    color: "#A7C636"
                }
            }]
    };
    var terminalAEast = {
        type: "polygon-3d",
        symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#a6d854"
                },
                edges: {
                    type: "solid",
                    color: "#A7C636"
                }
            }]
    };
    var building_renderer = {
        type: "unique-value",
        defaultSymbol: {
            type: "polygon-3d",
            symbolLayers: [{
                    type: "extrude",
                    material: {
                        color: "#D3D3D3"
                    },
                    edges: {
                        type: "solid",
                        color: "#56661C"
                    }
                }]
        },
        defaultLabel: "Building",
        field: "NAME",
        uniqueValueInfos: [{
                value: "Terminal F",
                symbol: terminalF,
                label: "Terminal F"
            }, {
                value: "Terminal D-E",
                symbol: terminalDE,
                label: "Terminal D-E"
            }, {
                value: "Terminal B-C",
                symbol: terminalBC,
                label: "Terminal B-C"
            }, {
                value: "Terminal A West",
                symbol: terminalAWest,
                label: "Terminal A West"
            }, {
                value: "Terminal A East",
                symbol: terminalAEast,
                label: "Terminal A East"
            }],
        visualVariables: [{
                type: "size",
                field: "STRUCTHGHT",
                valueUnit: "feet"
            }]
    };
    var buildingPopupTemplate = new PopupTemplate({
        title: "Building  {Name}",
        content: [{
                type: "fields",
                fieldInfos: [{
                        fieldName: "BUILDINGNO",
                        visible: true,
                        lable: "Building Number"
                    }, {
                        fieldName: "STRUCTHGHT",
                        visible: true,
                        label: "Structure Height"
                    }]
            }]
    });
    var buildingLayer = new FeatureLayer({
        url: buildingUrl,
        spatialReference: sr,
        popupEnabled: true,
        popupTemplate: buildingPopupTemplate
    });
    buildingLayer.renderer = building_renderer;
    var treeUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/0";
    var treeLayer = new FeatureLayer({
        url: treeUrl,
        spatialReference: sr,
        popupEnabled: false
    });
    var airfieldGroup = new GroupLayer({
        id: "airfieldGroup",
        title: "Airfield Features",
        visible: true
    });
    airfieldGroup.addMany([buildingLayer, treeLayer]);
    var TERPS = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/6";
    var DEPARTURE = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/7";
    var OEI = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/8";
    var TRANSITIONAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/1";
    var APPROACH = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/2";
    var HORIZONTAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/3";
    var CONICAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/4";
    var critical2DSurfacesUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/10";
    var aoaUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/11";
    var aoaLayer = new FeatureLayer({
        url: aoaUrl,
        opacity: 0.25,
        title: "Air Operations Area",
        renderer: {
            type: "simple",
            symbol: {
                type: "polygon-3d",
                symbolLayers: [{
                        type: "fill",
                        material: { color: "#89e9f0" }
                    }]
            }
        },
        elevationInfo: {
            mode: "on-the-ground"
        },
        popupEnabled: false
    });
    var critical2dSurfacesLayer = new FeatureLayer({
        url: critical2DSurfacesUrl,
        id: "critical_2d_surfaces",
        opacity: 0.5,
        title: "Critical 2D Surfaces",
        elevationInfo: {
            mode: "on-the-ground"
        },
        popupEnabled: false,
        visible: false
    });
    var critical2dGroup = new GroupLayer({
        id: "critical_2d",
        title: "2D Critical Surfaces",
        visible: true
    });
    critical2dGroup.addMany([aoaLayer, critical2dSurfacesLayer]);
    var terpsLayer = new FeatureLayer({
        url: TERPS,
        title: "TERPS",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var departLayer = new FeatureLayer({
        url: DEPARTURE,
        title: "Departure",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var oeiLayer = new FeatureLayer({
        url: OEI,
        title: "OEI",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var critical3dGroup = new GroupLayer({
        id: "critical_3d",
        title: "3D Critical Surfaces",
        visible: false
    });
    critical3dGroup.addMany([oeiLayer, departLayer, terpsLayer]);
    var transitionalLayer = new FeatureLayer({
        url: TRANSITIONAL,
        title: "Transitional",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var approachLayer = new FeatureLayer({
        url: APPROACH,
        title: "Approach",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var horizontalLayer = new FeatureLayer({
        url: HORIZONTAL,
        title: "Horizontal",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var conicalLayer = new FeatureLayer({
        url: CONICAL,
        title: "Conical",
        opacity: 1.0,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true,
        popupEnabled: false
    });
    var part77Group = new GroupLayer({
        id: "part_77_group",
        title: "Part 77 3D Surfaces",
        visible: false
    });
    part77Group.addMany([approachLayer, transitionalLayer, horizontalLayer, conicalLayer]);
    exports.scene = new WebScene({
        basemap: new Basemap({
            baseLayers: [imageryLayer]
        }),
        ground: {
            layers: [elevationLayer]
        },
        clippingEnabled: true,
        clippingArea: new Extent({
            xmax: 2739534.7447781414,
            ymax: 268804.0899403095,
            xmin: 2606408.7447781414,
            ymin: 156304.08994030952,
            spatialReference: sr
        }),
        layers: [critical2dGroup, critical3dGroup, part77Group, airfieldGroup]
    });
});
//# sourceMappingURL=app.js.map