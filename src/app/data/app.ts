/// <reference path="../../../node_modules/dojo-typings/dojo/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojo/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dijit/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dijit/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojox/1.11/index.d.ts" />
/// <reference path="../../../node_modules/dojo-typings/dojox/1.11/modules.d.ts" />
/// <reference path="../../../node_modules/@types/arcgis-js-api/index.d.ts" />

import * as Basemap from "esri/Basemap";
import * as Extent from "esri/geometry/Extent";
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
  url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_1ft_Imagery/MapServer"
});

const elevationLayer = new ElevationLayer({
  url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_DEM_1ft/ImageServer"
});

const buildingUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Buildings_MapService/FeatureServer/0";

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

const buildingLayer = new FeatureLayer({
    url: buildingUrl,
    spatialReference: sr,
    popupEnabled: true,
    title: "Buildings"
});

buildingLayer.renderer = building_renderer;

const airfieldGroup = new GroupLayer({
    id: "airfieldGroup",
    title: "Airfield Features",
    visible: true
});

airfieldGroup.addMany([buildingLayer]);

const CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/CEPCT/MapServer";

const TSS = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/0";
const DEPARTURE = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/1";
const MISSED_APCH = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/2";
const OEI = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/3";

const APPROACH_20 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/0";
const APPROACH_40 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/1";
const APPROACH_50 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/2";
const PRIMARY = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/3";
const TRANSITIONAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/4";

const critical2dSurfacesUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/2D_Critical_Surfaces/FeatureServer/0";

const crit2dLayer = new FeatureLayer({
    url: critical2dSurfacesUrl,
    opacity: 0.25,
    title: "Air Operations Area"
});

const critical2dGroup = new GroupLayer({
    id: "critical_2d",
    title: "2D Critical Surfaces",
    visible: true
});
critical2dGroup.addMany([crit2dLayer]);

const tssLayer = new FeatureLayer({
    url: TSS,
    title: "TSS",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const departLayer = new FeatureLayer({
    url: DEPARTURE,
    title: "Departure",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const missedApchLayer = new FeatureLayer({
    url: MISSED_APCH,
    title: "Missed Approach",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const oeiLayer = new FeatureLayer({
    url: OEI,
    title: "OEI",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const critical3dGroup = new GroupLayer({
    id: "critical_3d",
    title: "3D Critical Surfaces",
    visible: false
});
critical3dGroup.addMany([oeiLayer, missedApchLayer, departLayer, tssLayer]);

const approach20Layer = new FeatureLayer({
    url: APPROACH_20,
    title: "Approach 20",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const approach40Layer = new FeatureLayer({
    url: APPROACH_40,
    title: "Approach 40",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const approach50Layer = new FeatureLayer({
    url: APPROACH_50,
    title: "Approach 50",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const primaryLayer = new FeatureLayer({
    url: PRIMARY,
    title: "Primary",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const transitionalLayer = new FeatureLayer({
    url: TRANSITIONAL,
    title: "Transitional",
    opacity: 0.5,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true
});

const part77Group = new GroupLayer({
  id: "part_77_group",
  title: "Part 77 3D Surfaces",
  visible: false
});

part77Group.addMany([approach20Layer, approach40Layer, approach50Layer, primaryLayer, transitionalLayer]);

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
