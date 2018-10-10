/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import esri = __esri;

import {
  aliasOf,
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";
import DisclaimerViewModel, { DisclaimerParams } from "./viewModels/DisclaimerViewModel";
import * as SceneView from "esri/views/SceneView";

interface PanelProperties extends DisclaimerParams, esri.WidgetProperties {}

@subclass("app.widgets.Disclaimer")
export class Disclaimer extends declared(Widget) {

  @property() viewModel = new DisclaimerViewModel();

  @aliasOf("viewModel.title") title: string;

  @aliasOf("viewModel.content") content: string;

  @aliasOf("viewModel.view") view: SceneView;

  @aliasOf("viewModel.guide_link") guide_link: string;

  constructor(params?: Partial<PanelProperties>) {
    super(params);
  }

  render() {
    return (
      <div id="disclaimerPanel">
        <div id="title">
          <p class="avenir-bold font-size-2">{this.title}</p>
        </div>
        <div id="content">
          <p class="avenir-light font-size-0">{this.content}</p>
        </div>
        <div id="guide_link">
          <a href={this.guide_link} target="_blank">Link to User Guide</a>
        </div>
      </div>
    );
  }
}

