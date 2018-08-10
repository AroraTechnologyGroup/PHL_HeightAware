import Accessor = require("esri/core/Accessor");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface ObstructionParams {
  scene: WebScene;
  view: SceneView;
}

@subclass("widgets.App.PanelViewModel")
class ObstructionViewModel extends declared(Accessor) {

  @property() scene: WebScene;

  @property() view: SceneView;


  constructor(params?: Partial<ObstructionParams>) {
    super(params);
  }
}

export default ObstructionViewModel;
