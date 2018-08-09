import Accessor =  require("esri/core/Accessor");
import { whenOnce } from "esri/core/watchUtils";
import * as FeatureLayer from "esri/layers/FeatureLayer";
import * as EsriScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface AppParams {
  scene: EsriScene;
  view: SceneView;
}

@subclass("widgets.App.AppViewModel")
class AppViewModel extends declared(Accessor) {

  @property() scene: EsriScene;

  @property() view: SceneView;

  constructor(params?: Partial<AppParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }

  onload() {
   

  }
}

export default AppViewModel;
