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

const buildingUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Buildings_MapService/MapServer/0";

const buildingSymbol = {
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

const renderer = {
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

const CEPCT = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/CEPCT/MapServer";

const TSS = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/0";
const DEPARTURE = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/1";
const MISSED_APCH = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/2";
const OEI = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/3D_Critical_Surfaces/FeatureServer/3";

const APPROACH_20 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/0"
const APPROACH_40 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/1"
const APPROACH_50 = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/2"
const PRIMARY = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/3"
const TRANSITIONAL = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/Surfaces_Part77_3d/FeatureServer/4"

const critical2dSurfacesUrl = "http://gis.aroraengineers.com/arcgis/rest/services/PHL/2D_Critical_Surfaces/MapServer"

const crit2dLayer = new MapImageLayer({
    url: critical2dSurfacesUrl,
    opacity: 0.25
});

const tssLayer = new FeatureLayer({
    url: TSS,
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


const pointerTracker = new Graphic({
    symbol: new PictureMarkerSymbol({
        url: "../assets/reticle.png",
        width: 40,
        height: 40
    })
});		

const graphics_test =  new GraphicsLayer({
    elevationInfo: {
        mode: "absolute-height"
    },
    listMode: "hide",
    title: "Graphics Test"
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
    layers: [crit2dLayer, critical3dGroup, part77Group, obstruction_base, graphics_test]
});
