# Origami Form Engine

A powerful, schema-driven form engine built with React, TypeScript, and Tailwind CSS. Origami provides a complete solution for building, rendering, and managing complex forms with a modern tech stack.

## ✨ Key Features

- **Visual Form Builder**: Intuitive drag-and-drop interface for creating forms without writing code.
- **Schema-Driven**: Forms are defined by a portable JSON schema, making them easy to store, version, and share.
- **Rich Widget Library**: Includes a comprehensive set of built-in widgets:
  - **Basic**: Text, TextArea, Number, Password
  - **Choice**: Select, Radio, Checkbox, Switch
  - **Advanced**: Date Picker, File Upload, Rating, Slider
  - **Layout**: Array/List support for complex data structures
- **High Performance**: State management powered by **Zustand** for efficient re-renders and optimal performance.
- **Type-Safe**: Built entirely with **TypeScript** for robust and reliable code.
- **Modern Architecture**: Managed as a **pnpm monorepo** for modular development and easy maintenance.
- **Extensible**: Easily create custom widgets and extend the core functionality.

## 🏗 Project Structure

This project is organized as a monorepo using pnpm workspaces.

### 📦 Packages

| Package | Description |
| --- | --- |
| **`@origami/core`** | The heart of the engine. Contains the core logic, state management (Zustand), and schema definitions. |
| **`@origami/editor`** | Components for the visual form builder and runner integration. |
| **`@origami/widgets`** | The default collection of form widgets (Inputs, Selects, Uploads, etc.) and the Widget Factory. |
| **`@origami/form-ui`** | Shared UI components and design system elements used across the platform. |
| **`@origami/utils`** | Common utility functions and helpers. |

### 🚀 Applications

| App | Description | Command |
| --- | --- | --- |
| **`apps/form-builder`** | The standalone visual editor application. | `pnpm dev:builder` |
| **`apps/form-runner`** | A lightweight runtime for rendering forms from schema. | `pnpm dev:runner` |
| **`apps/forms`** | A comprehensive demo/implementation showcasing advanced features (including 3D elements). | `pnpm dev:forms` |

## 🛠 Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (v8+)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd form-engine
pnpm install
```

### Running the Applications

You can start the different applications using the following commands:

**Start the Form Builder:**

```bash
pnpm dev:builder
```

**Start the Form Runner:**

```bash
pnpm dev:runner
```

**Start the Forms Demo:**

```bash
pnpm dev:forms
```

## 💻 Development

### Build

Build all packages and apps:

```bash
pnpm build
```

### Linting

Check for code quality issues:

```bash
pnpm lint
```

### Testing

Run the test suite:

```bash
pnpm test
```

## 🔧 Tech Stack

- **Core**: React, TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tools**: Vite, tsup
- **Package Manager**: pnpm
- **Testing**: Vitest

## 📄 License

MIT
