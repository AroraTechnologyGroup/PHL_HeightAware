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

@subclass("app.widgets.obstructionPane")
export class ObstructionPane extends declared(Widget) {
    
    @property() name: string = "Obstruction Analysis";

    constructor() {
        super();
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    render() {
        return (
        <div id="obstructionPanel" class="panel collapse in">
            <div id="headingObstruction" class="panel-heading" role="tab">
                <div class="panel-title">
                    <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseObstruction" aria-expanded="true" aria-controls="collapseObstruction"><span class="glyphicon glyphicon-plane" aria-hidden="true"></span><span class="panel-label">{this.name}</span></a> 
                    <a class="panel-close" role="button" data-toggle="collapse" tabindex="0" href="#obstructionPanel"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a> 
                </div>
            </div>
            <div id="collapseObstruction" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingObstruction">
                <div class="body-light" id="obstruction-flex">
                    <div class="obstruction-inputs">
                        <div>
                            <div>Height of obstruction</div>
                            <input id="obsHeight" type="number" placeholder="in feet"></input>
                        </div>
                        <div>
                            <div>+/- Ground Elevation</div>
                            <input id="groundLevel" type="number" placeholder="feet above or below"></input>
                        </div>
                    </div>
                    <div class="obstruction-inputs">
                        <div id="xandy">
                            <div>
                                <div>X: Easting</div>
                                <input id="easting" type="number" placeHolder="Easting"></input>
                            </div>
                            <div>
                                <div>Y: Northing</div>
                                <input id="northing" type="number" placeHolder="Northing"></input>
                            </div>
                        </div>
                    </div>
                    <div id="target_btns">
                        <div id="activate_target" class='btn btn-transparent'>Activate</div>
                        <div id="obs_submit" class='btn btn-transparent'>Submit</div>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}


