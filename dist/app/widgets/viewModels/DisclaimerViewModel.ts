/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

/// <reference path="../../../../node_modules/@types/arcgis-js-api/index.d.ts" />
/// <reference path="../../../../node_modules/@types/dojo/index.d.ts" />

import Accessor = require("esri/core/Accessor");
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as domConstruct from "dojo/dom-construct";
import * as Expand from "esri/widgets/Expand";

import { renderable, tsx } from "esri/widgets/support/widget";
import { whenOnce } from "esri/core/watchUtils";

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

export interface DisclaimerParams {
  title: string;
  content: HTMLElement;
  guide_link: HTMLAnchorElement;
  view: SceneView;
}

@subclass("widgets.App.DisclaimerViewModel")
class DisclaimerViewModel extends declared(Accessor) {
  @renderable()
  @property() title = "Application Usage Information";

  @property() view: SceneView;

  @renderable()
  @property() content: string;

  @renderable()
  @property() guide_link = "./app/data/HeightAware3D_Documentation.pdf";

  @renderable()
  @property() drawer: Expand;

  @property() forceOpen: any;

  constructor(params?: Partial<DisclaimerParams>) {
    super(params);
    whenOnce(this, "view").then(this.onload.bind(this));
  }

  onload() {
    this.content = "PHL HeightAware is designed for planning purposes only and does not replace any procedures or guidance from any Airport department.";
  }
}

export default DisclaimerViewModel;
