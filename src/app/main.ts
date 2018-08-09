/// <reference path="../../node_modules/dojo-typings/dojo/1.11/index.d.ts" />
/// <reference path="../../node_modules/dojo-typings/dojo/1.11/modules.d.ts" />

import * as cookie from "dojo/cookie";
import App from "./widgets/App";

import "@dojo/shim/Promise";

if (!cookie("HeightAware")) {
  alert("PHL HeightAware is designed for planning purposes only and does not replace any procedures or guidance from any Airport department.");
  const exdate = new Date();
  exdate.setDate(exdate.getDate() + 1);
  const cValue = escape("This cookie controls the warning pop-up.") + ((1 === null) ? "" : "; expires=" + exdate.toUTCString());
  cookie("HeightAware", cValue);
}

export const app = new App({
  container: document.getElementById("app") as HTMLElement
});

