# Sigil Grid Color System

## Overview
The Sigil Grid art piece manages its own color generation based on the provided seed, with the `lightMode` flag determining how these colors are applied.

## Color Generation
- Two colors are always generated deterministically from the seed:
  - A light color (RGB values between 200-255)
  - A dark color (RGB values between 0-55)

## Color Assignment
The `lightMode` flag determines how these colors are assigned:
- `lightMode: true`
  - Background = light color
  - Sigils = dark color
- `lightMode: false`
  - Background = dark color
  - Sigils = light color

## Setting Edition Config

```javascript
// Example: Setting lightMode
art.setEditionConfig({
  lightMode: true
});

// Example: Setting new seed (generates new colors)
art.setEditionConfig({
  seed: "64_character_hex_string..."
});
```

## Color System Behavior

### When Setting lightMode
1. The system swaps the current background and foreground colors
2. No new colors are generated
3. The art piece immediately updates to reflect the change

### When Setting a New Seed
1. The system generates new light and dark colors from the seed
2. Colors are assigned based on current `lightMode` setting
3. The art piece updates with the new colors

## Event Feedback
The system emits an `EDITION_CONFIG_CHANGE` event containing the current configuration:

```javascript
{
  seed: "64_character_hex_string...",
  lightMode: true,
  backgroundColor: "#RRGGBB", // The current background color
  strokeColor: "#RRGGBB",     // The current sigil color
  // ... other config values
}
```

## Important Notes
1. Colors are always generated in pairs (light/dark)
2. The same seed always produces the same color pair
3. `lightMode` only affects color assignment, not generation
4. Color changes are immediate and affect the entire art piece
5. The marketplace can access current colors through `getEditionConfig()` 