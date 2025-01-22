import cjs from "./createjs_module.js";
import PTUtils from "./PTUtils.js";

let p = cjs.extend(TrackingStage, cjs.Container);
p.draw = function (ctx, ignoreCache) {
  this.Container_draw(ctx, ignoreCache);
  // custom logic here...
};
window.TrackingStage = cjs.promote(TrackingStage, "Container");

export default function TrackingStage() {
  this.Container_constructor();

  let trackingStage = this,
    trackingTarget,
    trackingSpeed = 1.5, //1.5,
    amountToMove = new cjs.Point();

  function onTick(e) {
    amountToMove = new cjs.Point(
      (-trackingTarget.x - trackingStage.x) / trackingSpeed,
      (-trackingTarget.y - trackingStage.y) / trackingSpeed,
    );
    trackingStage.x += amountToMove.x;
    trackingStage.y += amountToMove.y;

    // PTUtils.springMoveTo({
    //   subject: trackingStage,
    //   target: trackingTarget,
    //   parent: trackingStage,
    //   spring: 0.1,
    //   friction: 0.8,
    // });
  }

  trackingStage.setTrackingTarget = function (target) {
    trackingTarget = target;
    if (target) {
      // start tracking
      this.addEventListener("tick", onTick);
    } else {
      // stop tracking
      this.removeEventListener("tick", onTick);
    }
  };

  trackingStage.getAmountToMove = function () {
    return amountToMove;
  };

  trackingStage.toString = function () {
    return "[TrackingStage (name=" + trackingStage.name + ")]";
  };

  trackingStage.setTrackingSpeed = function (speed) {
    trackingSpeed = speed;
    console.log("ts: ", trackingSpeed);
  };
}
