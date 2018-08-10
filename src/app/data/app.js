define(["require", "exports", "esri/Basemap", "esri/geometry/Extent", "esri/geometry/SpatialReference", "esri/layers/ElevationLayer", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/layers/MapImageLayer", "esri/layers/TileLayer", "esri/WebScene"], function (require, exports, Basemap, Extent, SpatialReference, ElevationLayer, FeatureLayer, GroupLayer, MapImageLayer, TileLayer, WebScene) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sr = new SpatialReference({
        wkid: 2272
    });
    var imageryLayer = new TileLayer({
        url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_1ft_Imagery/MapServer"
    });
    var elevationLayer = new ElevationLayer({
        url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_DEM_1ft/ImageServer"
    });
    var buildingUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Buildings_MapService/MapServer/0";
    var buildingSymbol = {
        type: "polygon-3d",
        symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#FC921F"
                },
                edges: {
                    type: "solid",
                    color: "#A7C636"
                }
            }]
    };
    var renderer = {
        type: "unique-value",
        defaultSymbol: {
            type: "polygon-3d",
            symbolLayers: [{
                    type: "extrude",
                    material: {
                        color: "#A7C636"
                    },
                    edges: {
                        type: "solid",
                        color: "#56661C"
                    }
                }]
        },
        defaultLabel: "Building",
        field: "STRUCTHGHT",
        uniqueValueInfos: [{
                value: "Building",
                symbol: buildingSymbol,
                label: "Building"
            }],
        visualconstiables: [{
                type: "size",
                field: "STRUCTHGHT",
                valueUnit: "feet"
            }]
    };
    var CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/CEPCT/MapServer";
    var TSS = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/0";
    var DEPARTURE = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/1";
    var MISSED_APCH = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/2";
    var OEI = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/3";
    var APPROACH_20 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/0";
    var APPROACH_40 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/1";
    var APPROACH_50 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/2";
    var PRIMARY = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/3";
    var TRANSITIONAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/4";
    var critical2dSurfacesUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/2D_Critical_Surfaces/MapServer";
    var crit2dLayer = new MapImageLayer({
        url: critical2dSurfacesUrl,
        opacity: 0.25
    });
    var tssLayer = new FeatureLayer({
        url: TSS,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var departLayer = new FeatureLayer({
        url: DEPARTURE,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var missedApchLayer = new FeatureLayer({
        url: MISSED_APCH,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var oeiLayer = new FeatureLayer({
        url: OEI,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var critical3dGroup = new GroupLayer({
        id: "critical_3d",
        title: "3D Critical Surfaces",
        visible: false
    });
    critical3dGroup.addMany([oeiLayer, missedApchLayer, departLayer, tssLayer]);
    var approach20Layer = new FeatureLayer({
        url: APPROACH_20,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var approach40Layer = new FeatureLayer({
        url: APPROACH_40,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var approach50Layer = new FeatureLayer({
        url: APPROACH_50,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var primaryLayer = new FeatureLayer({
        url: PRIMARY,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var transitionalLayer = new FeatureLayer({
        url: TRANSITIONAL,
        opacity: 0.5,
        visible: true,
        spatialReference: sr,
        elevationInfo: {
            mode: "absolute-height"
        },
        returnZ: true
    });
    var part77Group = new GroupLayer({
        id: "part_77_group",
        title: "Part 77 3D Surfaces",
        visible: false
    });
    part77Group.addMany([approach20Layer, approach40Layer, approach50Layer, primaryLayer, transitionalLayer]);
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
        layers: [crit2dLayer, critical3dGroup, part77Group]
    });
});
//# sourceMappingURL=app.js.map