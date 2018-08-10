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
                        <div class="grid-container">  
                            <div class="column-2"> 
                                <div class="camera_label">      
                                    Heading: 
                                </div>
                                <div class="camera_label">
                                    Tilt: 
                                </div>
                                <div class="camera_label">
                                    Eastings: 
                                </div>
                                <div class="camera_label">
                                    Northings: 
                                </div>
                                <div class="camera_label">
                                    Camera Height: 
                                </div>
                            </div>
                            <div class="col-2">
                                <div id="camera_heading"></div>
                                <div id="camera_tilt"></div>
                                <div id="camera_X"></div>
                                <div id="camera_Y"></div>
                                <div id="camera_Z"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}