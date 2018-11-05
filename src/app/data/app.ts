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
import * as WebStyleSymbol from "esri/symbols/WebStyleSymbol";


const sr = new SpatialReference({
  wkid: 103142
});

const imageryLayer = new TileLayer({
  url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/PHL_Imagery_1ft/MapServer",
  opacity: 0.95
});

const elevationLayer = new ElevationLayer({
  url: "http://gis.aroraengineers.com/arcgis/rest/services/PHL/DEM_Merged_2011/ImageServer"
});

const buildingUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/2";

const terminalF = {
  type: "polygon-3d",
  symbolLayers: [{
      type: "extrude",
      material: {
          color: "#66c2a5"
      },
      edges: {
          type: "solid",
          color: "#43464b"
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
            color: "#43464b"
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
            color: "#43464b"
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
            color: "#43464b"
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
            color: "#43464b"
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
              color: "#43464b"
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
    title: "Building",
    spatialReference: sr,
    popupEnabled: false,
    popupTemplate: buildingPopupTemplate
});

buildingLayer.renderer = building_renderer;

const tankSiteUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/1";

const tankSiteLayer = new FeatureLayer({
    url: tankSiteUrl,
    title: "TankSite",
    spatialReference: sr,
    elevationInfo: {
        mode: "on-the-ground"
    },
    renderer: new SimpleRenderer({
        symbol: {
            type: "polygon-3d",
            symbolLayers: [{
                type: "extrude",
                material: {
                    color: "#D3D3D3"
                },
                edges: {
                    type: "solid",
                    color: "#D3D3D3"
                }
            }]
        },
        visualVariables: [{
            type: "size",
            field: "TOPELEV",
            valueUnit: "feet"
        }]
    })
});

const treeUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/ContextFeatures/FeatureServer/0";

const treeLayer = new FeatureLayer({
    url: treeUrl,
    title: "Tree",
    spatialReference: sr,
    legendEnabled: false,
    popupEnabled: false,
    elevationInfo: {
        mode: "on-the-ground"
    },
    renderer: new SimpleRenderer({
        symbol: {
            type: "web-style",  // autocasts as new WebStyleSymbol()
            name: "Ficus",
            portal: {
            url: "https://www.arcgis.com"
            },
            styleName: "EsriRealisticTreesStyle"
        },
        visualVariables: [{
            type: "size",
            field: "ABOVEGROUN",
            // axis: "height",
            valueUnit: "feet"
        }, {
            type: "rotation",
            valueExpression: "random() * 360" // we use a random rotation, so that plants look different
        }]
    })
});


const ContextGroup = new GroupLayer({
    id: "ContextGroup",
    title: "Context Features",
    visible: true
});

ContextGroup.addMany([tankSiteLayer, buildingLayer, treeLayer]);

const TRANSITIONAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/1";
const APPROACH = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/2";
const HORIZONTAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/3";
const CONICAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/4";

const TERPS = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/6";
const DEPARTURE = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/7";
const OEI = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/8";

const critical2DSurfacesUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/10";
const aoaUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces/FeatureServer/11";


const aoaLayer = new FeatureLayer({
    url: aoaUrl,
    opacity: 0.25,
    title: "Air Operations Area",
    id: "airoperationsarea",
    spatialReference: sr,
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
    id: "runwayhelipaddesignsurface",
    title: "Critical 2D Surfaces",
    opacity: 0.15,
    elevationInfo: {
        mode: "on-the-ground"
    },
    spatialReference: sr,
    popupEnabled: false,
    visible: true,
    definitionExpression: "OBJECTID IS NULL"
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
    id: "terps",
    opacity: 1.0,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
});

const departLayer = new FeatureLayer({
    url: DEPARTURE,
    title: "Departure",
    id: "departure",
    opacity: 1.0,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
});

const oeiLayer = new FeatureLayer({
    url: OEI,
    title: "OEI",
    id: "oei",
    opacity: 1.0,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
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
    id: "transitional",
    opacity: 1.0,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
});

const approachLayer = new FeatureLayer({
    url: APPROACH,
    title: "Approach",
    id: "approach",
    opacity: 1.0,
    visible: false,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
});

const horizontalLayer = new FeatureLayer({
    url: HORIZONTAL,
    title: "Horizontal",
    id: "horizontal",
    opacity: 1.0,
    visible: false,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
});

const conicalLayer = new FeatureLayer({
    url: CONICAL,
    title: "Conical",
    id: "conical",
    opacity: 1.0,
    visible: true,
    spatialReference: sr,
    elevationInfo: {
        mode: "absolute-height"
    },
    returnZ: true,
    popupEnabled: false,
    definitionExpression: "OBJECTID IS NULL"
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
    layers: [critical2dGroup, critical3dGroup, part77Group, ContextGroup]
});
