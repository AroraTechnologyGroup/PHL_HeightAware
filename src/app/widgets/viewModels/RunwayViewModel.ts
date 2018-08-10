import Accessor = require("esri/core/Accessor");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface RunwayParams {
  scene: WebScene;
  view: SceneView;
}

@subclass("widgets.App.RunwayViewModel")
class RunwayViewModel extends declared(Accessor) {

  @property() scene: WebScene;

  @property() view: SceneView;


  constructor(params?: Partial<RunwayParams>) {
    super(params);
  }
}

export default RunwayViewModel;
