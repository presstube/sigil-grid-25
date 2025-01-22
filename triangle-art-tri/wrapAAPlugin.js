export default function wrapAAPlugin() {
  return {
    name: "wrap-aa-plugin",
    enforce: "pre",
    transform(src, id) {
      // Use a regex to match files ending with '-AA-lib.js'
      if (/-AA-lib\.js$/.test(id)) {
        const cleanedSrc = src.replace(/var createjs, AdobeAn;\s*$/, "");

        // Extract the composition ID from the source
        const compositionIdMatch = cleanedSrc.match(/id:\s*['"]([^'"]+)['"]/);
        const compositionId = compositionIdMatch ? compositionIdMatch[1] : null;

        if (!compositionId) {
          throw new Error("Composition ID not found in tri-lib.js");
        }

        // Create a unique namespace based on the file name or some identifier
        const namespace = id
          .replace(/\.js$/, "")
          .replace(/[^a-zA-Z0-9_]/g, "_");

        const wrappedSrc = `
          // Ensure AdobeAn and createjs are available globally
          let AdobeAn = globalThis.AdobeAn || (globalThis.AdobeAn = {});
          let createjs = globalThis.createjs;

          // Wrap the original code and namespace the composition
          (function (cjs, an) {
            ${cleanedSrc}

            // Re-namespace the composition
            an.compositions['${compositionId}_${namespace}'] = an.compositions['${compositionId}'];
            delete an.compositions['${compositionId}'];
          })(createjs, AdobeAn);

          // Get the composition using the namespaced ID
          const comp = AdobeAn.getComposition('${compositionId}_${namespace}');
          const lib = comp ? comp.getLibrary() : null;

          // Export lib as a named export
          export { lib };
        `;
        return {
          code: wrappedSrc,
          map: null,
        };
      }
      return null;
    },
  };
}
