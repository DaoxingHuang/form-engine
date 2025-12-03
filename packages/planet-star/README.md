# PlanetStar

**PlanetStar** is a high-performance, interactive 3D lottery component built with **React** and **Three.js**. It features a visually stunning planet composed of user cards, dynamic animations, and a complete lottery flow control system.

## Features

- **3D Planet Visualization**: Renders hundreds of user cards on a rotating 3D sphere using Fibonacci distribution for even spacing.
- **High Performance**: Optimized with Three.js, supporting efficient texture caching and particle systems.
- **Interactive Controls**: Full control over the lottery process (Start, Pause, Stop, Reset).
- **Customizable**: Extensive configuration options for visual appearance, animation speeds, and text content.
- **Async Data Support**: Seamlessly handles asynchronous user data loading with fallback to demo data.
- **Tools**: Built-in screenshot and screen recording capabilities (toggleable).
- **Responsive**: Adapts to different screen sizes and aspect ratios.

## Installation

```bash
pnpm add @lucky-boy/planet-star
```

## Usage

```tsx
import { PlanetStar, PlanetStarRef } from "@lucky-boy/planet-star";
import { useRef } from "react";

const App = () => {
  const planetRef = useRef<PlanetStarRef>(null);

  // User data (can be an array or a Promise)
  const users = [
    { id: "1", name: "User 1", avatarUrl: "..." }
    // ...
  ];

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PlanetStar
        ref={planetRef}
        users={users}
        demoUsers={[]} // Optional fallback data
      />
    </div>
  );
};
```

## Configuration

The component exposes a settings modal (accessible via UI or ref) to adjust various parameters:

- **Visuals**: Card count, size, scale, planet radius, particle count.
- **Animation**: Spin speed, duration, auto-start delay.
- **Text**: Customizable labels for all UI elements.
- **Tools**: Toggle screenshot and recording buttons.

## Key Technologies

- **Three.js**: Core rendering engine for the 3D scene.
- **React**: Component structure and state management.
- **Zustand**: Global state management for the lottery system.
- **Tween.js**: Smooth animations for camera movements and card effects.

## Architecture

- **`PlanetStar.tsx`**: Main entry point, handles React lifecycle, UI overlays, and data loading.
- **`usePlanetStarScene.ts`**: Encapsulates all Three.js logic (Scene, Camera, Renderer, Animation Loop).
- **`usePlanetStarStore.ts`**: Centralized state store for configuration and runtime status.

## Performance Note

The **Screenshot** and **Screen Recording** features require `preserveDrawingBuffer: true` in the WebGL renderer. This is automatically managed based on the "Show Tools" configuration to ensure optimal performance when tools are not in use.
