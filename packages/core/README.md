# Origami Form Engine

A powerful, modular, and schema-driven form builder and runner system built with React and TypeScript.

## 🚀 Features

- **Visual Form Builder**: An intuitive drag-and-drop interface for creating complex forms.
- **Schema-Driven**: Forms are defined by a JSON schema, making them portable and easy to store.
- **Form Runner**: A lightweight component to render and validate forms based on the schema.
- **Rich Field Types**: Supports text, numbers, dates, selects, radios, switches, uploads, and nested array structures.
- **Validation**: Built-in validation support including required fields, regex patterns, and custom error messages.
- **Responsive Design**: Built with Tailwind CSS for a modern and responsive UI.
- **Monorepo Structure**: Managed with pnpm workspaces for modular development.

## 📦 Project Structure

This project is organized as a monorepo:

- **apps/**
  - `form-builder`: The visual editor application.
  - `form-runner`: The standalone form rendering application.
- **packages/**
  - `core`: Core logic, state management (Zustand), and schema utilities.
  - `widgets`: Reusable form widget components.
  - `form-ui`: Shared UI components.
  - `utils`: General utility functions.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Package Manager**: pnpm

## 🏁 Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (v8+)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd form-engine
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

To start the development servers:

- **Form Builder**:
  ```bash
  pnpm dev:builder
  ```
  Runs the builder app at `http://localhost:5173` (or similar).

- **Form Runner**:
  ```bash
  pnpm dev:runner
  ```
  Runs the runner app.

### Building

To build all packages and apps:

```bash
pnpm build
```

## 📝 License

MIT
