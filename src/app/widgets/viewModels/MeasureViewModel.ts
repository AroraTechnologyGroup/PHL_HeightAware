import Accessor = require("esri/core/Accessor");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as DirectLineMeasurement3D from "esri/widgets/DirectLineMeasurement3D";
import * as AreaMeasurement3D from "esri/widgets/AreaMeasurement3D";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

import { renderable, tsx } from "esri/widgets/support/widget";

export interface MeasureParams {
  scene: WebScene;
  view: SceneView;
  activeWidget: DirectLineMeasurement3D | AreaMeasurement3D | null;
}

@subclass("widgets.App.RunwayViewModel")
class MeasureViewModel extends declared(Accessor) {

  @property() scene: WebScene;

  @property() view: SceneView;

  @renderable()
  @property() activeWidget: DirectLineMeasurement3D | AreaMeasurement3D | null;

  constructor(params?: Partial<MeasureParams>) {
    super(params);
  }
}

export default MeasureViewModel;
