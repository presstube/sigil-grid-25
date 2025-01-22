import _ from "lodash";
import cjs from "./createjs_module.js";

const spriteSheetPool = {};

export default function makeAutoDrawSpriteSheet({
  shape,
  strokeWeight,
  strokeColor,
}) {
  const cacheKey = `${shape.currentFrame}_${strokeColor}`;
  
  if (spriteSheetPool[cacheKey]) {
    return spriteSheetPool[cacheKey];
  } else {
    console.log("SPRITESHEET DOESNT EXIST, RIPPING IT");
    const spritesheet = ripShapeToSpriteSheet(shape);
    spriteSheetPool[cacheKey] = spritesheet;
    return spritesheet;
  }

  function convertToRedrawInstructions(shape) {
    const existingInstructions = shape.children[0].graphics._activeInstructions;
    const remadeInstructions = existingInstructions.map((instruction) => {
      const protoString = Object.getPrototypeOf(instruction).exec.toString();
      const match = protoString.match(/\.\s*(\w+)/);
      return {
        operation: match[1],
        instruction,
      };
    });
    return remadeInstructions;
  }

  function ripShapeToSpriteSheet(shape) {
    const spriteSheetBuilder = new cjs.SpriteSheetBuilder();
    const redrawInstructions = convertToRedrawInstructions(shape);
    // console.log("redrawInstructions: ", redrawInstructions);
    const rect = new cjs.Rectangle(-50, -50, 100, 100);

    _.times(redrawInstructions.length + 1, (index) => {
      const shape = new cjs.Shape();
      shape.graphics.setStrokeStyle(strokeWeight, "round", "round", 10, false);
      // shape.graphics.setStrokeStyle(strokeWeight);
      shape.graphics.beginStroke(strokeColor);
      _.times(index, (innerIndex) => {
        const { operation, instruction } = redrawInstructions[innerIndex];
        shape.graphics[operation](...Object.values(instruction));
      });
      // console.log("adding frame: ", index);
      spriteSheetBuilder.addFrame(shape, rect, 2);
    });

    _.times(redrawInstructions.length + 1, (index) => {
      const shape = new cjs.Shape();
      shape.graphics.setStrokeStyle(strokeWeight, "round", "round", 10, false);
      // shape.graphics.setStrokeStyle(strokeWeight);
      shape.graphics.beginStroke(strokeColor);
      _.times(redrawInstructions.length - index, (innerIndex) => {
        const { operation, instruction } =
          redrawInstructions[innerIndex + index];
        shape.graphics[operation](...Object.values(instruction));
      });
      // console.log("adding frame: ", index);
      spriteSheetBuilder.addFrame(shape, rect, 2);
    });

    // if (redrawingIndex < redrawInstructions.length) {
    //   const { operation, instruction } = redrawInstructions[redrawingIndex];
    //   redrawing.graphics[operation](...Object.values(instruction));
    //   // console.log("operation: ", operation);
    //   // console.log("instruction: ", ...Object.values(instruction));
    //   redrawingIndex++;
    // }
    const spritesheet = spriteSheetBuilder.build();
    spriteSheetPool[shape.currentFrame] = spritesheet;
    return spritesheet;
  }
}
