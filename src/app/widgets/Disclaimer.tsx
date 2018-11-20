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
import * as query from "dojo/query";
import * as domAttr from "dojo/dom-attr";
import * as domClass from "dojo/dom-class";
import * as Expand from "esri/widgets/Expand";
import * as domConstruct from "dojo/dom-construct";
import * as watchUtils from "esri/core/watchUtils";

interface PanelProperties extends DisclaimerParams, esri.WidgetProperties {}

@subclass("app.widgets.Disclaimer")
export class Disclaimer extends declared(Widget) {

  @property() viewModel = new DisclaimerViewModel();

  @aliasOf("viewModel.title") title: string;

  @aliasOf("viewModel.content") content: string;

  @aliasOf("viewModel.view") view: SceneView;

  @aliasOf("viewModel.guide_link") guide_link: string;

  @aliasOf("viewModel.drawer") drawer: Expand;

  @aliasOf("viewModel.forceOpen") forceOpen: any;

  constructor(params?: Partial<PanelProperties>) {
    super(params);
  }

  postInitialize() {
    const handle1 = this.forceOpen = this.watch("drawer.expanded", (event: any) => {
      this.drawer.expand();
    });
    this.own([handle1]);
  }

  private toggleDisclaimer(event: any) {
    const input = query("input", event.currentTarget)[0] as HTMLInputElement;
    const btn = query("button", "user_optin")[0] as HTMLButtonElement;
    if (!input.checked) {
      input.checked = true;
      domClass.remove(btn, "btn-disabled");
    } else {
      input.checked = false;
      domClass.add(btn, "btn-disabled");
    }
  }

  private closePanel(): void {
    // the Accept button is only enabled after the user checks the box.. remove the force open watcher on the expanded property
    this.forceOpen.remove();
    this.drawer.collapse();
    domConstruct.destroy("user_optin");
  }

  render() {
    return (
      <div id="disclaimerPanel" class="esri-widget">
        <div id="title">
          <div id="guide_link">
            <a href={this.guide_link} target="_blank">Link to User Guide</a>
          </div>
          <p class="avenir-bold font-size-1">{this.title}</p>
        </div>
        <div id="content">
          <p class="avenir-light font-size-0">{this.content}</p>
        </div>
        <div id="user_optin">
          <div onclick={this.toggleDisclaimer} bind={this}>
            <input name="disc_check" type="checkbox"/>
            <label for="disc_check">I agree to the above disclaimer</label>
          </div>
          <button class="btn btn-disabled" onclick={this.closePanel} bind={this}>Proceed</button>
        </div>
      </div>
    );
  }
}

