// marketplace.js

import "../style.css";

// Wait for the DOM to be fully loaded
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Dynamically import Art and artInfo
    const { Art, artInfo } = await import("./art.js");

    console.log("Art Info:", artInfo);

    // Initialize the Art instance
    const art = new Art({
      canvasId: "cjs-canvas"
    });

    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: monospace;
      z-index: 1000;
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
      <div style="margin-bottom: 5px;">Size: <span id="sizeDisplay"></span></div>
      <input type="range" id="sizeSlider" min="2" max="10" style="width: 100%;">
    `;

    // Light mode control
    const lightModeControl = document.createElement('div');
    lightModeControl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <label>
          <input type="checkbox" id="lightModeToggle">
          Light Mode: <span id="lightModeDisplay"></span>
        </label>
      </div>
    `;

    // Add controls to panel
    controlPanel.appendChild(seedControl);
    controlPanel.appendChild(sizeControl);
    controlPanel.appendChild(lightModeControl);
    document.body.appendChild(controlPanel);

    // Initialize control values
    const updateControlDisplay = (config) => {
      document.getElementById('seedDisplay').value = config.seed;
      document.getElementById('sizeDisplay').textContent = config.gridDimension;
      document.getElementById('sizeSlider').value = config.gridDimension;
      document.getElementById('lightModeToggle').checked = config.lightMode;
      document.getElementById('lightModeDisplay').textContent = config.lightMode ? "On" : "Off";
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

    // Listen for edition config changes
    window.addEventListener("EDITION_CONFIG_CHANGE", (event) => {
      console.log("Edition config changed:", event.detail);
      updateControlDisplay(event.detail);
    });

    // Enable click-to-change functionality
    art.setChangeEnabled(true);

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
      z-index: 1000;
    `;
    document.body.appendChild(mintButton);

    // Function to update MINT button position
    const updateMintPosition = (anchor) => {
      mintButton.style.left = `${anchor.x}px`;
      mintButton.style.top = `${anchor.y}px`;
    };

    // Listen for visual anchor changes
    window.addEventListener("VISUAL_ANCHOR_CHANGE", (event) => {
      console.log("Visual anchor changed:", event.detail);
      updateMintPosition(event.detail);
    });

    // Add keyboard controls
    window.addEventListener("keydown", async (e) => {
      switch(e.key.toLowerCase()) {
        case 'g':
          // Get current config
          console.log("Current edition config:", art.getEditionConfig());
          break;
        
        case 'r':
          // Random config (already handled by click due to setChangeEnabled)
          art.changeConfig();
          break;
        
        case 't':
          // Generate thumbnail
          try {
            const blob = await art.captureThumbnail();
            const url = URL.createObjectURL(blob);
            console.log("Thumbnail generated:", url);
            // Open thumbnail in new tab
            window.open(url, '_blank');
          } catch (error) {
            console.error("Error generating thumbnail:", error);
          }
          break;

        case '1':
        case '2':
          // Generate random seed and dimension
          const newConfig = {
            seed: Array.from(
              { length: 64 },
              () => Math.floor(Math.random() * 16).toString(16)
            ).join(''),
            gridDimension: Math.floor(Math.random() * 9) + 2, // Random dimension between 2-10
            lightMode: e.key === '1' // true for key 1, false for key 2
          };
          console.log("Setting new config:", newConfig);
          art.setEditionConfig(newConfig);
          break;
      }
    });

    // Add some UI instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 15px;
      border-radius: 5px;
      font-family: monospace;
      z-index: 1000;
    `;
    instructions.innerHTML = `
      Controls:<br>
      - Click: Randomize configuration<br>
      - G: Show current config<br>
      - R: Randomize config<br>
      - T: Generate thumbnail<br>
      - 1: Random config with light mode<br>
      - 2: Random config with dark mode
    `;
    document.body.appendChild(instructions);

    // Initial position update
    updateMintPosition(art.getVisualAnchor());

  } catch (err) {
    console.error("Error initializing Art:", err);
  }
}); 