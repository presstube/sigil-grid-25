import cjs from "./createjs_module.js";
import _ from "lodash";

export default function PTUtils() {
  throw "PTUTils is a static class and not meant to be instantiated";
}

// public function springMoveTo (target:Object,
//                               spring:Number = 0.1,
//                               friction:Number = 0.8):void {

//   var targetPoint:Point = getLocalPos( target, subject );
//   vX += (targetPoint.x - subject.x) * spring
//   vY += (targetPoint.y - subject.y) * spring
//   vX *= friction
//   vY *= friction
//   subject.x += vX
//   subject.y += vY
// }

PTUtils.springMoveTo = ({
  subject,
  target,
  parent,
  spring = 0.1,
  friction = 0.8,
}) => {
  let subjectPos = subject.localToLocal(0, 0, parent);
  let targetPos = target.localToLocal(0, 0, parent);
  if (!subject.vX) {
    subject.vX = 0;
  }
  if (!subject.vY) {
    subject.vY = 0;
  }
  subject.vX += (targetPos.x - subjectPos.x) * spring;
  subject.vY += (targetPos.y - subjectPos.y) * spring;
  subject.vX *= friction;
  subject.vY *= friction;
  subject.x += subject.vX;
  subject.y += subject.vY;
};

PTUtils.rotateToDegree = ({ subject, targetDegree, speed = 2, offset = 0 }) => {
  targetDegree = PTUtils.normalizeRotation(targetDegree);
  let subDeg = subject.rotation + offset;
  let totalDist = targetDegree - subDeg;
  if (totalDist < -180) {
    targetDegree += 360;
  } else if (totalDist > 180) {
    subDeg += 360;
  }
  totalDist = targetDegree - subDeg;
  // subject.vR += totalDist * spring;
  // subject.vR *= friction;
  subject.rotation += totalDist / speed;
  subject.rotation = PTUtils.normalizeRotation(subject.rotation);
};

PTUtils.springRotateToDegree = ({
  subject,
  targetDegree,
  spring = 0.1,
  friction = 0.8,
  offset = 0,
}) => {
  targetDegree = PTUtils.normalizeRotation(targetDegree);
  let subDeg = subject.rotation + offset;
  let totalDist = targetDegree - subDeg;
  if (!subject.vR) {
    subject.vR = 0;
  }
  if (totalDist < -180) {
    targetDegree += 360;
  } else if (totalDist > 180) {
    subDeg += 360;
  }
  totalDist = targetDegree - subDeg;
  subject.vR += totalDist * spring;
  subject.vR *= friction;
  subject.rotation += subject.vR;
  subject.rotation = PTUtils.normalizeRotation(subject.rotation);
};

PTUtils.springScaleTo = ({
  subject,
  targetScale,
  spring = 0.1,
  friction = 0.8,
  offset = 0,
}) => {
  let totalDist = targetScale - subject.scale;
  if (!subject.vS) {
    subject.vS = 0;
  }
  subject.vS += totalDist * spring;
  subject.vS *= friction;
  subject.scale += subject.vS;
};

PTUtils.loadAALib = function ({ path, id }) {
  const AALibScript = document.createElement("script");
  return new Promise((resolve, reject) => {
    AALibScript.setAttribute("src", path);
    document.body.appendChild(AALibScript);
    AALibScript.addEventListener(
      "load",
      () => {
        let comp = AdobeAn.getComposition(id);
        document.body.removeChild(AALibScript);
        resolve({
          lib: comp.getLibrary(),
          domElement: AALibScript,
        });
      },
      false,
    );
  });
};

PTUtils.makeTriangle = function (color, width, height) {
  var triangle = new cjs.Shape();
  triangle.graphics
    .beginFill(color)
    .lineTo(width / 2, 0)
    .lineTo(0, -height)
    .lineTo(-width / 2, 0)
    .lineTo(0, 0);
  return triangle;
};

PTUtils.makeCircle = function (color, radius) {
  var triangle = new cjs.Shape();
  triangle.graphics.beginFill(color).drawCircle(0, 0, radius);
  return triangle;
};

PTUtils.makeRect = function (color, x, y, w, h) {
  var rect = new cjs.Shape();
  rect.graphics.beginFill(color).drawRect(x, y, w, h);
  return rect;
};

PTUtils.populateBits = function (container, numBits) {
  for (var i = 0; i < numBits; i++) {
    var bit = PTUtils.makeTriangle("#FFF", 5, 5);
    var spread = 1000;
    bit.x = Math.random() * spread - Math.random() * spread;
    bit.y = Math.random() * spread - Math.random() * spread;
    bit.rotation = Math.random() * 360;
    container.addChild(bit);
  }
};

PTUtils.makeFPSLabel = function () {
  let fpsLabel = new cjs.Text("-- fps", "bold 10px Arial", "#FFF");
  fpsLabel.x = 10;
  fpsLabel.y = 20;
  fpsLabel.addEventListener("tick", (e) => {
    // console.log(cjs.Ticker.getMeasuredFPS())
    fpsLabel.text = Math.round(cjs.Ticker.getMeasuredFPS()) + " FPS";
  });
  // fpsLabel.tick = function() {
  //  this.text = Math.round(cjs.Ticker.getMeasuredFPS()) + " FPS"
  // }
  return fpsLabel;
};

PTUtils.polarRadians = function (len, angleRadians) {
  return new cjs.Point(
    -len * Math.sin(-angleRadians),
    -len * Math.cos(-angleRadians),
  );
};

PTUtils.polarDegrees = function (len, angleDegrees) {
  return PTUtils.polarRadians(len, PTUtils.degreesToRads(angleDegrees));
};

PTUtils.degreesToRads = function (degrees) {
  return degrees * (Math.PI / 180);
};

PTUtils.radsToDegrees = function (rads) {
  var degrees = rads * (180 / Math.PI);
  if (degrees < -180) degrees += 360;
  return degrees;
};

PTUtils.distance = function (p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

PTUtils.angleRadians = function (p1, p2) {
  return Math.atan2(p1.y - p2.y, p1.x - p2.x) - Math.PI / 2;
};

PTUtils.angleDegrees = function (p1, p2) {
  return PTUtils.radsToDegrees(PTUtils.angleRadians(p1, p2));
};

PTUtils.getOppositeAngleRadians = function (radians) {
  return radians - Math.PI / 2 + Math.random() * Math.PI;
};

PTUtils.getAdjustedRotation = function (rotation) {
  if (rotation > 180) {
    rotation -= (Math.floor(rotation / 360) + 1) * 360;
  } else if (rotation < -180) {
    rotation += -Math.floor(rotation / 360) * 360;
  }
  return rotation;
};

PTUtils.addPoints = function (pointA, pointB) {
  return new cjs.Point(pointA.x + pointB.x, pointA.y + pointB.y);
};

PTUtils.setStrokeColor = function (item, color) {
  let currentFrame = item.currentFrame;
  let paused = item.paused;
  _.times(item.totalFrames, (frameIndex) => {
    item.gotoAndStop(frameIndex);
    _.times(item.children.length, (childIndex) => {
      if (item.children[childIndex].graphics._stroke) {
        item.children[childIndex].graphics._stroke.style = color;
      }
    });
  });
  item.gotoAndStop(currentFrame);
  if (!paused) item.play();
};

PTUtils.setStrokeWidth = function (item, width) {
  let currentFrame = item.currentFrame;
  let paused = item.paused;
  _.times(item.totalFrames, (frameIndex) => {
    item.gotoAndStop(frameIndex);
    _.times(item.children.length, (childIndex) => {
      if (item.children[childIndex].graphics._stroke) {
        item.children[childIndex].graphics._strokeStyle.width = width;
      }
    });
  });
  item.gotoAndStop(currentFrame);
  if (!paused) item.play();
};

PTUtils.setFillColor = function (item, color) {
  let currentFrame = item.currentFrame;
  let paused = item.paused;
  _.times(item.totalFrames, (frameIndex) => {
    item.gotoAndStop(frameIndex);
    _.times(item.children.length, (childIndex) => {
      if (item.children[childIndex].graphics._fill) {
        item.children[childIndex].graphics._fill.style = color;
      }
    });
  });
  item.gotoAndStop(currentFrame);
  if (!paused) item.play();
};

function normalizeRotation(r) {
  r = r % 360; // normalize to 360
  if (r > 180) {
    return -(360 - r);
  } else if (r <= -180) {
    return 360 + r;
  } else {
    return r;
  }
}

PTUtils.normalizeRotation = function (r) {
  r = r % 360; // normalize to 360
  if (r > 180) {
    return -(360 - r);
  } else if (r <= -180) {
    return 360 + r;
  } else {
    return r;
  }
};

PTUtils.isTouchDevice = function () {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

// PTUtils.springRotateToDegree = ({
//   subject,
//   targetDegree,
//   spring = 0.1,
//   friction = 0.8,
//   offset = 0,
// }) => {
//   targetDegree = normalizeRotation(targetDegree);
//   let subDeg = subject.rotation + offset;
//   let totalDist = targetDegree - subDeg;
//   if (!subject.vR) {
//     subject.vR = 0;
//   }
//   if (totalDist < -180) {
//     targetDegree += 360;
//   } else if (totalDist > 180) {
//     subDeg += 360;
//   }
//   totalDist = targetDegree - subDeg;
//   subject.vR += totalDist * spring;
//   subject.vR *= friction;
//   subject.rotation += subject.vR;
// };
