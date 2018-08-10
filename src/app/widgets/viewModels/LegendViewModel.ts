import Accessor = require("esri/core/Accessor");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface LegendParams {
  scene: WebScene;
  view: SceneView;
}

@subclass("widgets.App.LegendViewModel")
class LegendViewModel extends declared(Accessor) {

  @property() scene: WebScene;

  @property() view: SceneView;


  constructor(params?: Partial<LegendParams>) {
    super(params);
  }
}

export default LegendViewModel;
