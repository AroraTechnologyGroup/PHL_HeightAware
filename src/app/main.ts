/// <reference path="../../node_modules/dojo-typings/dojo/1.11/index.d.ts" />
/// <reference path="../../node_modules/dojo-typings/dojo/1.11/modules.d.ts" />

import App from "./widgets/App";
import "@dojo/shim/Promise";

export const app = new App({
  container: document.getElementById("app") as HTMLElement
});

