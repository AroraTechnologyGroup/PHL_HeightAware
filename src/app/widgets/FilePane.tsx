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


@subclass("app.widgets.file_pane")
export class FilePane extends declared(Widget) {

    @property() name: string = "Batch Upload";

    constructor() {
        super();
    }

    postInitialize() {
        // utilize the own() method on this to clean up the events when destroying the widget
    }

    render() {
        return(
            <div id="fileLoader" class="panel collapse">
                <div id="headingLoader" class="panel-heading" role="tab">
                    <div class="panel-title">
                        <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseLoader" aria-expanded="true" aria-controls="collapseLoader"><span class="icon-ui-upload" arira-hidden="true"></span><span class="panel-label">{this.name}</span></a>
                        <a class="panel-close" role="button" data-toggle="collapse" tabindex="0" href="#fileLoader"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
                    </div>
                </div>
                <div id="collapseLoader" class="panel-collapse collapse" role="tabpanel" area-labeledby="headingLoader">
                    <div class="body-light">
                        <div>
                            <div id="fileLoader">      
                                <form id="fileform">
                                    <div>
                                        <input type="file" id="file"></input>
                                    </div>
                                    <div>
                                        <select class="pointlist" id="pointlist"></select>
                                        <input class="pointlist" type="button" value="Update"  id="csvupdate"></input>
                                    </div>
                                </form>
                                <div>
                                    <input type="submit" id="xysubmit"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
  

