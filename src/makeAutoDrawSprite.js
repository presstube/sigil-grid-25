import cjs from "./createjs_module.js";
import makeAutoDrawSpriteSheet from "./makeAutoDrawSpriteSheet.js";

export default function makeRedrawSprite({ shape, strokeWeight, strokeColor }) {
  const spriteSheet = makeAutoDrawSpriteSheet({
    shape,
    strokeWeight,
    strokeColor,
  });
  const sprite = new cjs.Sprite(spriteSheet);
  sprite.totalFrames = spriteSheet._frames.length;
  return sprite;
}
