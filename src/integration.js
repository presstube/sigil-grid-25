import "../style.css";

// Wait for the DOM to be fully loaded
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Import the built library file directly
    const { Art, artInfo } = await import("../public/art-core-sigil-grid-25.js");

    console.log("Art Info:", artInfo);

    // Initialize the Art instance
    const art = new Art({
      canvasId: "cjs-canvas"
    });

    // Create control panel
    const controls = document.createElement('div');
    controls.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: monospace;
      min-width: 300px;
    `;

    // Seed control
    const seedControl = document.createElement('div');
    seedControl.style.marginBottom = '15px';
    seedControl.innerHTML = `
      <div style="margin-bottom: 5px;">Seed:</div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <input type="text" id="seedDisplay" readonly style="flex-grow: 1; padding: 5px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 4px;">
        <button id="randomizeSeed" style="padding: 5px 10px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">🎲</button>
      </div>
    `;

    // Size control
    const sizeControl = document.createElement('div');
    sizeControl.style.marginBottom = '15px';
    sizeControl.innerHTML = `
      <div style="margin-bottom: 5px;">Grid Size: <span id="sizeDisplay"></span></div>
      <input type="range" id="sizeSlider" min="2" max="10" style="width: 100%;">
    `;

    // Light mode control
    const lightModeControl = document.createElement('div');
    lightModeControl.style.marginBottom = '15px';
    lightModeControl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <label>
          <input type="checkbox" id="lightModeToggle">
          Light Mode: <span id="lightModeDisplay"></span>
        </label>
      </div>
    `;

    // Color display
    const colorDisplay = document.createElement('div');
    colorDisplay.innerHTML = `
      <div style="margin-bottom: 5px;">Colors:</div>
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <div>
          <div>Background:</div>
          <div id="bgColorDisplay" style="width: 100px; height: 20px; border-radius: 4px; margin-top: 5px;"></div>
        </div>
        <div>
          <div>Foreground:</div>
          <div id="fgColorDisplay" style="width: 100px; height: 20px; border-radius: 4px; margin-top: 5px;"></div>
        </div>
      </div>
    `;

    // Add thumbnail button
    const thumbnailControl = document.createElement('div');
    thumbnailControl.innerHTML = `
      <button id="thumbnailBtn" style="width: 100%; padding: 8px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        Generate Thumbnail
      </button>
    `;

    // Add all controls to panel
    controls.appendChild(seedControl);
    controls.appendChild(sizeControl);
    controls.appendChild(lightModeControl);
    controls.appendChild(colorDisplay);
    controls.appendChild(thumbnailControl);
    document.body.appendChild(controls);

    // Initialize control values
    const updateControlDisplay = (config) => {
      document.getElementById('seedDisplay').value = config.seed;
      document.getElementById('sizeDisplay').textContent = config.gridDimension;
      document.getElementById('sizeSlider').value = config.gridDimension;
      document.getElementById('lightModeToggle').checked = config.lightMode;
      document.getElementById('lightModeDisplay').textContent = config.lightMode ? "On" : "Off";
      document.getElementById('bgColorDisplay').style.backgroundColor = config.backgroundColor;
      document.getElementById('fgColorDisplay').style.backgroundColor = config.strokeColor;
    };

    // Add event listeners
    document.getElementById('randomizeSeed').addEventListener('click', () => {
      const currentConfig = art.getEditionConfig();
      const newSeed = Array.from(
        { length: 64 },
        () => Math.floor(Math.random() * 16).toString(16)
      ).join('');
      art.setEditionConfig({ ...currentConfig, seed: newSeed });
    });

    document.getElementById('sizeSlider').addEventListener('input', (e) => {
      const currentConfig = art.getEditionConfig();
      art.setEditionConfig({ ...currentConfig, gridDimension: parseInt(e.target.value) });
    });

    document.getElementById('lightModeToggle').addEventListener('change', (e) => {
      const currentConfig = art.getEditionConfig();
      art.setEditionConfig({ ...currentConfig, lightMode: e.target.checked });
    });

    document.getElementById('thumbnailBtn').addEventListener('click', async () => {
      try {
        const blob = await art.captureThumbnail();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error("Thumbnail generation failed:", error);
      }
    });

    // Add MINT button that follows visual anchor
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

    // Listen for visual anchor changes
    window.addEventListener("VISUAL_ANCHOR_CHANGE", (event) => {
      const { x, y } = event.detail;
      mintButton.style.left = `${x}px`;
      mintButton.style.top = `${y}px`;
    });

    // Listen for config changes
    window.addEventListener("EDITION_CONFIG_CHANGE", (event) => {
      console.log("Config changed:", event.detail);
      updateControlDisplay(event.detail);
    });

    // Listen for errors
    window.addEventListener("SIGIL_GRID_ERROR", (event) => {
      console.error("Art error:", event.detail);
    });

    // Enable click-to-change
    art.setChangeEnabled(true);

    // Initial display update
    updateControlDisplay(art.getEditionConfig());

  } catch (err) {
    console.error("Integration test error:", err);
  }
}); 