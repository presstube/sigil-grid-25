// art.js
import cjs from "./createjs_module.js";
import bootCJS from "./bootCJS.js";
import ScaleStage from "./ScaleStage.js";
import TrackingStage from "./TrackingStage.js";
import { lib as lib1 } from "./tri-AA-lib.js";
// import { lib as lib2 } from "./tri-2-AA-lib.js";
import * as PTUtils from "presstubeutils";

const presaleStart = new Date().toISOString();

export const artInfo = {
  collectionName: "Tri",
  description: "Triangles that wobble and spin.",
  singularName: "Tri",
  pluralName: "Tris",
  maxSupply: 99,
  price: 0.1,
  presaleStart,
  saleStart: new Date(
    new Date(presaleStart).getTime() + 5 * 60 * 1000,
  ).toISOString(),
  saleEnd: new Date(
    new Date(saleStart).getTime() + 10 * 60 * 1000,
  ).toISOString(),
};

export function Art(canvasId) {
  const { canvas, stage, container } = bootCJS(canvasId);
  cjs.Ticker.framerate = 30;

  let drag = 0.95;
  let scaleStage;
  let trackingStage;
  let tri;

  let editionConfig = {
    color: "#cccccc",
  };

  init();

  function init() {
    scaleStage = new ScaleStage();
    trackingStage = new TrackingStage();
    scaleStage.addChild(trackingStage);
    container.addChild(scaleStage);
    scaleStage.setScaleMultiplier(1);

    tri = new lib1.Tri();
    container.addChild(tri);

    // const tri2 = new lib2.Tri();
    // tri2.scale = 0.25;
    // container.addChild(tri2);

    applyEditionConfig();

    tri.addEventListener("mousedown", onMouseDown);
    cjs.Ticker.addEventListener("tick", onTick);
  }

  function applyEditionConfig() {
    PTUtils.setFillColor(tri, editionConfig.color);
  }

  function onTick(e) {
    stage.update();
    tri.rotation += 1;
  }

  function onMouseDown(e) {
    console.log("click");
    changeColor();
  }

  function changeColor() {
    editionConfig.color = getRandomColor();
    PTUtils.setFillColor(tri, editionConfig.color);
  }

  function getRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }

  function getEditionConfig() {
    return editionConfig;
  }

  function setEditionConfig(config) {
    editionConfig = config;
    applyEditionConfig();
  }

  return {
    getEditionConfig,
    setEditionConfig,
  };
}
