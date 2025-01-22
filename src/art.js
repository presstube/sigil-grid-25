import cjs from "./createjs_module.js";
import bootCJS from "./bootCJS.js";
import ScaleStage from "./ScaleStage.js";
import TrackingStage from "./TrackingStage.js";
import makeAutoDrawSprite from "./makeAutoDrawSprite.js";
import { lib } from "../AA/sigils-AA-lib.js";
import _ from "lodash";

// Mulberry32 is a simple and fast 32-bit seeded random number generator
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Convert a hex string to a 32-bit integer for seeding
function hashToSeed(hash) {
  return parseInt(hash.slice(0, 8), 16);
}

// Helper function to generate a valid random seed
export function generateRandomSeed() {
  return Array.from(
    { length: 64 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Helper function to validate a seed string
export function isValidSeed(seed) {
  return /^[0-9a-f]{64}$/.test(seed);
}

export const artInfo = {
  singular: "Sigil Grid",
  plural: "Sigil Grids",
  description: "A grid of automatically drawing sigils that respawn over time.",
};

export class Art {
  constructor(artConfig, editionConfig = null) {
    this.canvas = document.getElementById(artConfig.canvasId);
    if (!this.canvas) {
      throw new Error(
        `Canvas element with ID '${artConfig.canvasId}' not found.`,
      );
    }

    this.dpr = window.devicePixelRatio || 1;
    this.changeEnabled = false;

    const { stage, container } = bootCJS(artConfig.canvasId);
    this.stage = stage;
    this.container = container;
    cjs.Ticker.framerate = 30;

    this.scaleStage = null;
    this.trackingStage = null;
    this.sigils = null;
    this.respawnIndex = 0;
    this.chosenFrameIndexes = [];
    
    // Fixed values to match original code exactly
    this.GRID_SPACING = 60;
    this.GRID_SCALE = 0.2;
    
    this.editionConfig = {
      strokeWeight: 4,
      strokeColor: "#EEEEEE",
      backgroundColor: "#111111",
      gridDimension: 10,
      lightMode: false, // Default to dark mode
      seed: "0000000000000000000000000000000000000000000000000000000000000000", // Default seed
      ...editionConfig
    };

    // Set initial background color
    this.canvas.style.backgroundColor = this.editionConfig.backgroundColor;

    // Initialize seeded random number generator
    this.initializeRandom();

    this.init();
    this.addClickHandler();
    window.addEventListener("resize", this.handleResize.bind(this));

    // Initialize error event
    this.ERROR_EVENT = "SIGIL_GRID_ERROR";
  }

  // Initialize/reset the random number generator to its initial state
  initializeRandom() {
    this.random = mulberry32(hashToSeed(this.editionConfig.seed));
    // Reset respawn index when random is reinitialized
    this.respawnIndex = 0;
  }

  // Helper method to get a random integer in range [min, max]
  getRandomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // Helper method to get a random light color
  getLightColor() {
    const r = Math.floor(this.random() * 56 + 200); // 200-255
    const g = Math.floor(this.random() * 56 + 200); // 200-255
    const b = Math.floor(this.random() * 56 + 200); // 200-255
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Helper method to get a random dark color
  getDarkColor() {
    const r = Math.floor(this.random() * 56); // 0-55
    const g = Math.floor(this.random() * 56); // 0-55
    const b = Math.floor(this.random() * 56); // 0-55
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  init() {
    this.scaleStage = new ScaleStage();
    this.trackingStage = new TrackingStage();
    this.scaleStage.addChild(this.trackingStage);
    this.container.addChild(this.scaleStage);
    this.scaleStage.setScaleMultiplier(1);

    this.sigils = new lib.Sigils_1();
    this.initializeFrameSelection();
    this.makeGrid();

    cjs.Ticker.addEventListener("tick", () => this.stage.update());
  }

  // Separate method to initialize frame selection
  initializeFrameSelection() {
    const framesIndexes = _.times(this.sigils.totalFrames, (index) => index);
    this.chosenFrameIndexes = [];
    const tempIndexes = [...framesIndexes];
    for (let i = 0; i < 100; i++) {
      const idx = Math.floor(this.random() * tempIndexes.length);
      this.chosenFrameIndexes.push(tempIndexes[idx]);
      tempIndexes.splice(idx, 1);
    }
  }

  makeGrid() {
    // Reset respawn index when making a new grid
    this.respawnIndex = 0;
    
    const { gridDimension } = this.editionConfig;
    _.times(gridDimension, (index) => {
      _.times(gridDimension, (innerIndex) => {
        const sprite = new cjs.Sprite();
        sprite.x =
          innerIndex * this.GRID_SPACING - (gridDimension * this.GRID_SPACING) / 2 + this.GRID_SPACING / 2;
        sprite.y = index * this.GRID_SPACING - (gridDimension * this.GRID_SPACING) / 2 + this.GRID_SPACING / 2;
        sprite.scale = this.GRID_SCALE;
        this.trackingStage.addChild(sprite);
        this.respawnSprite(sprite);
      });
    });

    this.emitVisualAnchorChange();
  }

  respawnSprite(sprite) {
    const oldSprite = sprite;
    if (oldSprite) {
      this.trackingStage.removeChild(oldSprite);
    }

    this.sigils.gotoAndStop(this.chosenFrameIndexes[this.respawnIndex % 100]);
    this.respawnIndex++;

    sprite = makeAutoDrawSprite({
      shape: this.sigils,
      strokeWeight: this.editionConfig.strokeWeight,
      strokeColor: this.editionConfig.strokeColor,
    });

    this.trackingStage.addChild(sprite);
    sprite.x = oldSprite.x;
    sprite.y = oldSprite.y;
    sprite.scale = oldSprite.scale;
    sprite.play();

    const onSpriteTick = (e) => {
      if (sprite.currentFrame == sprite.totalFrames / 2 - 1) {
        sprite.gotoAndStop(sprite.totalFrames / 2);
        _.delay(() => {
          sprite.gotoAndPlay(sprite.currentFrame + 1);
        }, 3000);
      } else if (sprite.currentFrame == sprite.totalFrames - 1) {
        sprite.stop();
        sprite.removeEventListener("tick", onSpriteTick);
        this.respawnSprite(sprite);
      }
    };

    sprite.addEventListener("tick", onSpriteTick);
    return sprite;
  }

  handleResize() {
    // Update canvas size
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    
    // Update stage
    this.stage.update();
    this.emitVisualAnchorChange();
  }

  addClickHandler() {
    this.canvas.addEventListener("click", () => {
      if (this.changeEnabled) {
        this.changeConfig();
      }
    });
  }

  setChangeEnabled(enabled) {
    this.changeEnabled = enabled;
  }

  changeConfig() {
    // Generate a new random 64-character hex string for the seed
    const newSeed = Array.from(
      { length: 64 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join('');

    // Generate light and dark colors using the seeded random
    const lightColor = this.getLightColor();
    const darkColor = this.getDarkColor();

    // Toggle lightMode randomly (non-seeded)
    const lightMode = Math.random() < 0.5;

    // Assign colors based on lightMode
    const backgroundColor = lightMode ? lightColor : darkColor;
    const strokeColor = lightMode ? darkColor : lightColor;

    const newConfig = {
      seed: newSeed,
      strokeColor,
      backgroundColor,
      lightMode,
      gridDimension: Math.floor(Math.random() * 9) + 2,  // 2-10, non-seeded
    };
    this.setEditionConfig(newConfig);
  }

  getEditionConfig() {
    return { ...this.editionConfig };
  }

  // Validate edition config without applying it
  validateEditionConfig(config) {
    const errors = [];
    
    if (config.seed !== undefined && !isValidSeed(config.seed)) {
      errors.push("Invalid seed format. Must be a 64-character hex string.");
    }
    
    if (config.gridDimension !== undefined) {
      if (!Number.isInteger(config.gridDimension) || 
          config.gridDimension < 2 || 
          config.gridDimension > 10) {
        errors.push("Grid dimension must be an integer between 2 and 10.");
      }
    }
    
    if (config.strokeWeight !== undefined) {
      if (typeof config.strokeWeight !== 'number' || config.strokeWeight <= 0) {
        errors.push("Stroke weight must be a positive number.");
      }
    }
    
    if (config.lightMode !== undefined && typeof config.lightMode !== 'boolean') {
      errors.push("Light mode must be a boolean value.");
    }
    
    if (config.strokeColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(config.strokeColor)) {
      errors.push("Stroke color must be a valid hex color (e.g., #FF0000).");
    }
    
    if (config.backgroundColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(config.backgroundColor)) {
      errors.push("Background color must be a valid hex color (e.g., #FF0000).");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Emit an error event
  emitError(message, code = "GENERAL_ERROR") {
    const event = new CustomEvent(this.ERROR_EVENT, {
      detail: {
        message,
        code,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  }

  setEditionConfig(config) {
    // Validate config before applying
    const validation = this.validateEditionConfig(config);
    if (!validation.isValid) {
      this.emitError(validation.errors.join(" "), "CONFIG_ERROR");
      throw new Error(validation.errors.join(" "));
    }

    const oldSeed = this.editionConfig.seed;
    const oldDimension = this.editionConfig.gridDimension;
    const oldLightMode = this.editionConfig.lightMode;
    
    // Update the config
    this.editionConfig = { ...this.editionConfig, ...config };
    
    // Handle color changes
    if ((config.seed && config.seed !== oldSeed) || 
        (config.lightMode !== undefined && config.lightMode !== oldLightMode)) {
      
      if (config.seed && config.seed !== oldSeed) {
        // If seed changed, generate entirely new colors
        this.initializeRandom();
        this.initializeFrameSelection();
        
        const lightColor = this.getLightColor();
        const darkColor = this.getDarkColor();
        
        this.editionConfig.backgroundColor = this.editionConfig.lightMode ? lightColor : darkColor;
        this.editionConfig.strokeColor = this.editionConfig.lightMode ? darkColor : lightColor;
      } else if (config.lightMode !== undefined && config.lightMode !== oldLightMode) {
        // If only lightMode changed, just swap the existing colors
        const tempColor = this.editionConfig.backgroundColor;
        this.editionConfig.backgroundColor = this.editionConfig.strokeColor;
        this.editionConfig.strokeColor = tempColor;
      }
    }
    
    // Update background color
    this.canvas.style.backgroundColor = this.editionConfig.backgroundColor;
    
    // If grid dimension changed, reinitialize
    if (config.gridDimension && config.gridDimension !== oldDimension) {
      this.initializeRandom();
      this.initializeFrameSelection();
    }
    
    // Recreate grid with new config
    while (this.trackingStage.children.length > 0) {
      this.trackingStage.removeChild(this.trackingStage.children[0]);
    }
    this.makeGrid();
    this.emitEditionConfigChange();
  }

  getVisualAnchor() {
    const { gridDimension } = this.editionConfig;
    
    // Use the same grid size calculation as in makeGrid
    const gridSize = gridDimension * this.GRID_SPACING;
    
    // Get the actual position in screen coordinates by using the tracking stage's transformation
    const bottomPoint = this.trackingStage.localToGlobal(0, gridSize/2);
    
    // Add some padding
    const padding = 40;
    
    return { 
      x: bottomPoint.x,
      y: bottomPoint.y + padding
    };
  }

  emitEditionConfigChange() {
    const event = new CustomEvent("EDITION_CONFIG_CHANGE", {
      detail: this.getEditionConfig(),
    });
    window.dispatchEvent(event);
  }

  emitVisualAnchorChange() {
    const event = new CustomEvent("VISUAL_ANCHOR_CHANGE", {
      detail: this.getVisualAnchor(),
    });
    window.dispatchEvent(event);
  }

  captureThumbnail() {
    return new Promise((resolve, reject) => {
      try {
        const offScreenCanvas = document.createElement("canvas");
        const ctx = offScreenCanvas.getContext("2d");
        const targetSize = 2048;
        offScreenCanvas.width = targetSize;
        offScreenCanvas.height = targetSize;

        // Draw background using current backgroundColor from editionConfig
        ctx.fillStyle = this.editionConfig.backgroundColor;
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Save current stage properties
        const originalX = this.container.x;
        const originalY = this.container.y;
        const originalScale = this.container.scale;
        const originalStageScale = this.scaleStage.scaleX;

        // Calculate container scale using bootCJS logic
        const scaleBoundMin = 900;
        const scaleBoundMax = 900;
        let scaler = 1;

        // Use the same logic as bootCJS for a 2048x2048 window
        if (targetSize > scaleBoundMax) {
          scaler = targetSize / scaleBoundMax;
        }

        // Center and scale the container
        this.container.x = targetSize / 2;
        this.container.y = targetSize / 2;
        this.container.scaleX = scaler;
        this.container.scaleY = scaler;

        // Scale the art relative to the container
        this.scaleStage.setScaleMultiplier(1);

        // Render the current stage to the offscreen canvas
        this.stage.draw(ctx, false);

        // Restore original properties
        this.container.x = originalX;
        this.container.y = originalY;
        this.container.scaleX = originalScale;
        this.container.scaleY = originalScale;
        this.scaleStage.setScaleMultiplier(originalStageScale);

        offScreenCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to generate thumbnail."));
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    });
  }
} 