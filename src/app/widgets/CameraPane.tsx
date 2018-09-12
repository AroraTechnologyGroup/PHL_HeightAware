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
import CameraViewModel, { CameraParams } from "./viewModels/CameraViewModel";
import * as WebScene from "esri/WebScene";
import * as SceneView from "esri/views/SceneView";
import * as dom from "dojo/dom";

interface PanelProperties extends CameraParams, esri.WidgetProperties {}
import { renderable, tsx } from "esri/widgets/support/widget";


@subclass("app.widgets.camera_pane")
export class CameraPane extends declared(Widget) {

    @property() name = "Camera Location";

    @property() viewModel = new CameraViewModel();

    @aliasOf("viewModel.scene") scene: WebScene;

    @aliasOf("viewModel.view") view: SceneView;

    constructor(params?: Partial<PanelProperties>) {
        super(params);
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    private onAfterCreate() {
        const heading = dom.byId("camera_heading") as HTMLInputElement;
        const camera_tilt = dom.byId("camera_tilt") as HTMLInputElement;
        const camera_x = dom.byId("camera_X") as HTMLInputElement;
        const camera_y = dom.byId("camera_Y") as HTMLInputElement;
        const camera_z = dom.byId("camera_Z") as HTMLInputElement;

        this.view.when(() => {
            this.view.on("pointer-move", (e) => {
                const camera = this.view.camera;
                heading.value = camera.heading.toFixed(3);
                camera_tilt.value = camera.tilt.toFixed(3);
                camera_x.value = camera.position.x.toFixed(3);
                camera_y.value = camera.position.y.toFixed(3);
                camera_z.value = camera.position.z.toFixed(1);
            });
        });
    }

    render() {
        return (
            <div id="panelCamera" class="panel collapse">
                <div id="headingCamera" class="panel-heading" role="tab">
                    <div class="panel-title">
                    <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseCamera" aria-expanded="false" aria-controls="collapseCamera"><span class="icon-ui-locate" aria-hidden="true"></span><span class="panel-label">{this.name}</span></a> 
                    <a class="panel-close" role="button" data-toggle="collapse" tabindex="0" href="#panelCamera"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a> 
                    </div>
                </div>
                <div id="collapseCamera" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingCamera">
                    <div class="body-light">   
                        <div>  
                            <div bind={this} afterCreate={this.onAfterCreate}> 
                                <div class="camera_label">Heading:</div>
                                <input id="camera_heading"></input>

                                <div class="camera_label">Tilt:</div>
                                <input id="camera_tilt"></input>

                                <div class="camera_label">Eastings:</div>
                                <input id="camera_X"></input>

                                <div class="camera_label">Northings:</div>
                                <input id="camera_Y"></input>

                                <div class="camera_label">Camera Height:</div>
                                <input id="camera_Z"></input>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}