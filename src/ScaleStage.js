import cjs from "./createjs_module.js";

let p = cjs.extend(ScaleStage, cjs.Container);
p.draw = function (ctx, ignoreCache) {
  this.Container_draw(ctx, ignoreCache);
  // custom logic here...
};
window.ScaleStage = cjs.promote(ScaleStage, "Container");

export default function ScaleStage() {
  this.Container_constructor();

  let scaleStage = this,
    targetScale = 1,
    maxScale = 1,
    minScale = 0.35,
    range = maxScale - minScale,
    scaleSpeed = 2; //20;

  function onTick(e) {
    scaleStage.scaleX += (targetScale - scaleStage.scaleX) / scaleSpeed;
    scaleStage.scaleY += (targetScale - scaleStage.scaleY) / scaleSpeed;
  }

  function setTargetScale(scale) {
    if (scale === null) {
      targetScale = 1;
      that.removeEventListener("tick", onTick);
    } else {
      targetScale = scale;
      scaleStage.addEventListener("tick", onTick);
    }
  }

  scaleStage.setScaleMultiplier = function (multiplier) {
    setTargetScale(minScale + range * multiplier);
  };

  scaleStage.setMaxScale = function (max) {
    maxScale = max;
    setRange();
  };

  scaleStage.setMinScale = function (min) {
    minScale = min;
    setRange();
  };

  function setRange() {
    range = maxScale - minScale;
  }

  scaleStage.getTargetScale = function () {
    return targetScale;
  };

  scaleStage.toString = function () {
    return "[ScaleStage (name=" + scaleStage.name + ")]";
  };
}
