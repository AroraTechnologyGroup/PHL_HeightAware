/// <reference path="../../../node_modules/dojo-typings/dojo/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojo/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dijit/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dijit/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojox/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojox/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />

import * as Basemap from "esri/Basemap";
import * as Extent from "esri/geometry/Extent";
import * as PopupTemplate from "esri/PopupTemplate";
import * as Point from "esri/geometry/Point";
import * as SpatialReference from "esri/geometry/SpatialReference";
import * as Graphic from "esri/Graphic";
import * as ElevationLayer from "esri/layers/ElevationLayer";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as GraphicsLayer from "esri/layers/GraphicsLayer";
import * as GroupLayer from "esri/layers/GroupLayer";
import * as MapImageLayer from "esri/layers/MapImageLayer";
import * as TileLayer from "esri/layers/TileLayer";
import * as VectorTileLayer from "esri/layers/VectorTileLayer";
import * as SimpleRenderer from "esri/renderers/SimpleRenderer";
import * as PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import * as PolygonSymbol3D from "esri/symbols/PolygonSymbol3D";
import * as WebScene from "esri/WebScene";
import * as ExtrudeSymbol3DLayer from "esri/symbols/ExtrudeSymbol3DLayer";

const sr = new SpatialReference({
  wkid: 2272
});

const imageryLayer = new TileLayer({
  url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_1ft_Imagery/MapServer",
  opacity: 0.95
});

const elevationLayer = new ElevationLayer({
  url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_DEM_1ft/ImageServer"
});

const buildingUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/1";

const terminalF = {
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

const terminalDE = {
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

const terminalBC = {
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

const terminalAWest = {
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

const terminalAEast = {
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

const building_renderer = {
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

const buildingPopupTemplate = new PopupTemplate({
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

const buildingLayer = new FeatureLayer({
    url: buildingUrl,
    spatialReference: sr,
    popupEnabled: true,
    popupTemplate: buildingPopupTemplate
});

buildingLayer.renderer = building_renderer;

const treeUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/0";

const treeLayer = new FeatureLayer({
    url: treeUrl,
    spatialReference: sr,
    popupEnabled: false
});


const airfieldGroup = new GroupLayer({
    id: "airfieldGroup",
    title: "Airfield Features",
    visible: true
});

airfieldGroup.addMany([buildingLayer, treeLayer]);

const TERPS = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/6";
const DEPARTURE = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/7";
const OEI = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/8";

const TRANSITIONAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/1";
const APPROACH = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/2";
const HORIZONTAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/3";
const CONICAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/4";

const critical2DSurfacesUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/10";
const aoaUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/11";


const aoaLayer = new FeatureLayer({
    url: aoaUrl,
    opacity: 0.25,
    title: "Air Operations Area",
    renderer: {
        type: "simple",
        symbol: {
            type: "polygon-3d",
            symbolLayers: [{
                type: "fill",
                material: { color: "#89e9f0"}
            }]
        }
    },
    elevationInfo: {
        mode: "on-the-ground"
    },
    popupEnabled: false
});

const critical2dSurfacesLayer = new FeatureLayer({
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

const critical2dGroup = new GroupLayer({
    id: "critical_2d",
    title: "2D Critical Surfaces",
    visible: true
});
critical2dGroup.addMany([aoaLayer, critical2dSurfacesLayer]);

const terpsLayer = new FeatureLayer({
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

const departLayer = new FeatureLayer({
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

const oeiLayer = new FeatureLayer({
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

const critical3dGroup = new GroupLayer({
    id: "critical_3d",
    title: "3D Critical Surfaces",
    visible: false
});
critical3dGroup.addMany([oeiLayer, departLayer, terpsLayer]);

const transitionalLayer = new FeatureLayer({
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

const approachLayer = new FeatureLayer({
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

const horizontalLayer = new FeatureLayer({
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

const conicalLayer = new FeatureLayer({
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

const part77Group = new GroupLayer({
  id: "part_77_group",
  title: "Part 77 3D Surfaces",
  visible: false
});

part77Group.addMany([approachLayer, transitionalLayer, horizontalLayer, conicalLayer]);

export const scene = new WebScene({
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
