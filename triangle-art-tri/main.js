import "./style.css";
import cjs from "./src/createjs_module.js";
import bootCJS from "./src/bootCJS.js";
import ScaleStage from "./src/ScaleStage.js";
import TrackingStage from "./src/TrackingStage.js";

import * as PTUtils from "presstubeutils";

const { canvas, stage, container } = bootCJS("cjs-canvas");

let drag = 0.95;
let scaleStage;
let trackingStage;
let lib;
let tri;

kickoff();

async function kickoff() {
  scaleStage = new ScaleStage();
  trackingStage = new TrackingStage();
  scaleStage.addChild(trackingStage);
  container.addChild(scaleStage);
  scaleStage.setScaleMultiplier(1);

  ({ lib } = await PTUtils.loadAALib({
    path: "tri-lib.js",
    id: "4E5B455787024170AD0540D588A0658A",
  }));

  tri = new lib.Tri();
  trackingStage.addChild(tri);

  cjs.Ticker.addEventListener("tick", onTick);
}

function onTick(e) {
  stage.update();
}
