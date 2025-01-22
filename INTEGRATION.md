# Sigil Grid Integration Guide

## Overview
The Sigil Grid art piece is delivered as a single ES module (`art-core-sigil-grid-25.js`) that exports two main components:
- `Art`: The main class for initializing and controlling the art piece
- `artInfo`: Metadata about the art piece

## Quick Start

```javascript
// Import the library
const { Art, artInfo } = await import('./art-core-sigil-grid-25.js');

// Initialize with a canvas
const art = new Art({
  canvasId: "your-canvas-id"
});
```

## Canvas Setup
The art piece requires a canvas element in your HTML:

```html
<canvas id="your-canvas-id"></canvas>
```

## Core Features

### Initialization
```javascript
const art = new Art({
  canvasId: "your-canvas-id",
  // Optional: Initial configuration
  editionConfig: {
    seed: "0123...", // 64-character hex string
    dimension: 5,    // Grid size (2-10)
    lightMode: true  // Color scheme toggle
  }
});
```

### Visual Anchor
The art piece emits a `VISUAL_ANCHOR_CHANGE` event that provides coordinates for UI elements (e.g., MINT button):

```javascript
window.addEventListener("VISUAL_ANCHOR_CHANGE", (event) => {
  const { x, y } = event.detail;
  // Position your UI element at these coordinates
  mintButton.style.left = `${x}px`;
  mintButton.style.top = `${y}px`;
});
```

### Deterministic Generation
The art piece uses a seeded random number generator for deterministic output:

```javascript
// Generate a valid random seed (64-character hex string)
const seed = Array.from(
  { length: 64 }, 
  () => Math.floor(Math.random() * 16).toString(16)
).join('');

// Update configuration
art.setEditionConfig({
  seed,
  dimension: 5,
  lightMode: true
});
```

### Thumbnail Generation
```javascript
const blob = await art.captureThumbnail();
const url = URL.createObjectURL(blob);
```

### Event Handling
```javascript
// Listen for configuration changes
window.addEventListener("EDITION_CONFIG_CHANGE", (event) => {
  const config = event.detail;
  // Handle config change
});

// Listen for errors
window.addEventListener("SIGIL_GRID_ERROR", (event) => {
  const error = event.detail;
  // Handle error
});
```

## Advanced Features

### Interactive Mode
Enable click-to-change functionality for testing:
```javascript
art.setChangeEnabled(true);
```

### Manual Configuration
```javascript
art.setEditionConfig({
  seed: "your-seed-here",
  dimension: 5,    // Range: 2-10
  lightMode: true  // true = light background, dark foreground
});
```

## Error Handling
The art piece emits `SIGIL_GRID_ERROR` events for various error conditions:
- Invalid seed format
- Invalid grid dimensions
- Canvas initialization failures
- Thumbnail generation failures

## Build Requirements
The art piece requires the following:
1. Adobe Animate library integration (handled by the build process)
2. ES module support in the target environment
3. Canvas support in the browser

## Example Integration
Here's a complete example of integrating the art piece with a MINT button:

```javascript
async function initializeArt() {
  try {
    const { Art } = await import('./art-core-sigil-grid-25.js');
    
    // Initialize art
    const art = new Art({
      canvasId: "art-canvas"
    });

    // Create MINT button
    const mintButton = document.createElement('button');
    mintButton.textContent = 'MINT';
    mintButton.style.cssText = `
      position: fixed;
      transform: translate(-50%, -50%);
      padding: 10px 20px;
      font-size: 16px;
      background: #ffffff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;
    document.body.appendChild(mintButton);

    // Position MINT button
    window.addEventListener("VISUAL_ANCHOR_CHANGE", (event) => {
      const { x, y } = event.detail;
      mintButton.style.left = `${x}px`;
      mintButton.style.top = `${y}px`;
    });

    // Handle errors
    window.addEventListener("SIGIL_GRID_ERROR", (event) => {
      console.error("Art error:", event.detail);
    });

    return art;
  } catch (err) {
    console.error("Art initialization failed:", err);
    throw err;
  }
}
```

## Troubleshooting
1. If the art piece fails to load, ensure the Adobe Animate library is properly loaded
2. Check that the canvas ID matches between HTML and initialization
3. Verify that the seed format is correct (64-character hex string)
4. Ensure grid dimensions are within the valid range (2-10)

## Support
For additional support or to report issues, please contact the development team. 