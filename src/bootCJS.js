import cjs from "./createjs_module.js";

export default function bootCJS(canvasID) {
  // console.log("booting CJS on: #", canvasID)
  // console.log("booting CJS on: #", createjs);

  let cjs = createjs;
  let canvas = document.getElementById(canvasID);
  let stage = new cjs.Stage(canvas);
  let scaler = 1;
  let scaleBoundMin = 900;
  let scaleBoundMax = 900;

  let context = stage.canvas.getContext("2d");
  context.imageSmoothingEnabled = false;

  let container = new cjs.Container();
  stage.addChild(container);

  let onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scaler = 1;
    // console.log("cw ch:", canvas.width, canvas.height)
    if (canvas.width < scaleBoundMin || canvas.height < scaleBoundMin) {
      let smallestScaleSize =
        canvas.width < canvas.height ? canvas.width : canvas.height;
      scaler = smallestScaleSize / scaleBoundMin;
    } else if (canvas.width > scaleBoundMax && canvas.height > scaleBoundMax) {
      let smallestScaleSize =
        canvas.width < canvas.height ? canvas.width : canvas.height;
      scaler = smallestScaleSize / scaleBoundMax;
      // console.log("scaler:", scaler)
    }
    container.scaleX = scaler;
    container.scaleY = scaler;
    container.x = canvas.width / 2;
    container.y = canvas.height / 2;

    retinalize();
  };

  const neutralizeSize = () => {
    stage.width = canvas.width;
    stage.height = canvas.height;
  };

  const retinalize = () => {
    neutralizeSize();
    let ratio = window.devicePixelRatio;
    if (ratio === undefined) return;
    canvas.setAttribute("width", Math.round(stage.width * ratio));
    canvas.setAttribute("height", Math.round(stage.height * ratio));
    stage.scaleX = stage.scaleY = ratio;
    canvas.style.width = stage.width + "px";
    canvas.style.height = stage.height + "px";
  };

  window.onresize = onResize;
  onResize();

  // // should give back stage, canvas and container rather than exposing them like this?
  // window.stage = stage
  // window.container = container

  return {
    stage,
    container,
    canvas,
  };
}
