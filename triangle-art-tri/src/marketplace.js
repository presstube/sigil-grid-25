// marketplace.js

import "../style.css";
// Wait for the DOM to be fully loaded
window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Dynamically import Art from art.js
    const { Art } = await import("./art.js");

    // // Initialize the Art instance
    const art = new Art("art-canvas");

    const someEditionConfig = {
      color: "#00FF00",
    };

    art.setEditionConfig(someEditionConfig);

    window.addEventListener("keydown", onKeyDown);

    function onKeyDown(e) {
      console.log("e: ", e);
      if (e.keyCode == 71) {
        console.log("getting edition config: ", art.getEditionConfig());
      }
    }
  } catch (err) {
    console.error("Error initializing Art:", err);
  }
});
