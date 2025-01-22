import "./style.css";
import _ from "lodash";
import cjs from "./src/createjs_module.js";
import PTUtils from "./src/PTUtils.js";
import bootCJS from "./src/bootCJS.js";
import ScaleStage from "./src/ScaleStage.js";
import TrackingStage from "./src/TrackingStage.js";
import makeAutoDrawSprite from "./src/makeAutoDrawSprite.js";
import { lib } from "./AA/lib-wrapper.js";

const { canvas, stage, container } = bootCJS("cjs-canvas");

cjs.Ticker.framerate = 30;

app();

async function app() {
  let drag = 0.95;
  let scaleStage = null;
  let trackingStage = null;
  let itemScroller;
  let app = {};
  let sigils;
  let strokeWeight = 4;
  let strokeColor = "#EEEEEE";
  let respawnIndex = 0;

  scaleStage = app.scaleStage = new ScaleStage();
  trackingStage = app.trackingStage = new TrackingStage();
  scaleStage.addChild(trackingStage);
  container.addChild(scaleStage);
  scaleStage.setScaleMultiplier(1);

  app.stage = stage;
  app.scaleStage = scaleStage;
  app.trackingStage = trackingStage;

  sigils = new lib.Sigils_1();

  console.log("sigils: ", sigils);

  const framesIndexes = _.times(sigils.totalFrames, (index) => index);
  const chosenFrameIndexes = _.sampleSize(framesIndexes, 100);

  makeGrid();

  cjs.Ticker.addEventListener("tick", onTick);

  function makeGrid() {
    const spacing = 60;
    const dimension = 10;
    _.times(dimension, (index) => {
      _.times(dimension, (innerIndex) => {
        const sprite = new cjs.Sprite();
        sprite.x =
          innerIndex * spacing - (dimension * spacing) / 2 + spacing / 2;
        sprite.y = index * spacing - (dimension * spacing) / 2 + spacing / 2;
        sprite.scale = 0.2;
        trackingStage.addChild(sprite);
        respawnSprite(sprite);
      });
    });
  }

  function onTick(e) {
    stage.update();
  }

  function respawnSprite(sprite) {
    const oldSprite = sprite;
    if (oldSprite) {
      trackingStage.removeChild(oldSprite);
    }

    sigils.gotoAndStop(chosenFrameIndexes[respawnIndex % 100]);
    respawnIndex++;

    sprite = makeAutoDrawSprite({
      shape: sigils,
      strokeWeight,
      strokeColor,
    });

    trackingStage.addChild(sprite);
    sprite.x = oldSprite.x;
    sprite.y = oldSprite.y;
    sprite.scale = oldSprite.scale;
    sprite.play();

    sprite.addEventListener("tick", onTick);

    function onTick(e) {
      if (sprite.currentFrame == sprite.totalFrames / 2 - 1) {
        sprite.gotoAndStop(sprite.totalFrames / 2);
        _.delay(() => {
          sprite.gotoAndPlay(sprite.currentFrame + 1);
        }, 3000);
      } else if (sprite.currentFrame == sprite.totalFrames - 1) {
        sprite.stop();
        sprite.removeEventListener("tick", onTick);
        respawnSprite(sprite);
      }
    }
    return sprite;
  }
}
