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


@subclass("app.widgets.runway_pane")
export class RunwayPane extends declared(Widget) {
    
    @property() name: string = "Runway Selector";

    constructor() {
        super();
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    render () {
        return (
            <div id="runwayPanel" class="panel collapse">
                <div id="headingRunway" class="panel-heading" role="tab">
                    <div class="panel-title">
                        <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseRunway" aria-expanded="true" aria-controls="collapseRunway"><span class="glyphicon glyphicon-road" aria-hidden="true"></span><span class="panel-label">{this.name}</span></a> 
                        <a class="panel-close" role="button" data-toggle="collapse" href="#runwayPanel"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a> 
                    </div>
                </div>
                <div id="collapseRunway" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingRunway">
                    <div class="body-light">
                        <div class="grid-container">
                            <div class="column-1 left" id="arrive">
                                <div>
                                    Arrivals
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="9L"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="9R"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="27R"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="27L"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="17"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="26"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="35"></input>
                                </div>
                            </div>
                            <div class="column-1" id="runway_selector">
                                <div>
                                    Runways
                                </div>
                                <div>
                                    9L
                                </div>
                                <div>
                                    9R
                                </div>
                                <div>
                                    27R
                                </div>
                                <div>
                                    27L
                                </div>
                                <div>
                                    17
                                </div>
                                <div>
                                    26
                                </div>
                                <div>
                                    35
                                </div>
                            </div>
                            <div class="column-1" id="depart">
                                <div>
                                    Departures
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="9L"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="9R"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="27R"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="27L"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="17"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="26"></input>
                                </div>
                                <div>
                                    <input type="checkbox" class="runway" value="35"></input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


