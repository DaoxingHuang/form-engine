# Form Engine

This package contains the core logic and components for the Form Engine, refactored to be modular and extensible.

## Architecture

- **Core**: `src/core` contains the schema parsing, generation, validation logic, and state management stores.
- **Components**: `src/components` contains the UI widgets.
  - `widgets/base`: Basic inputs (Text, Select, etc.).
  - `widgets/layout`: Layout components (Array, etc.).
  - `widgets/factory.tsx`: The central component that renders widgets based on the schema type.
- **Features**: `src/features` contains the main application modules.
  - `runner`: The Form Runner component.
  - `builder`: (To be implemented) The Form Builder component.

## Usage

```tsx
import { FormRunner } from '@chameleon/form-engine';

const MyPage = () => {
  const fields = [
    { id: 'name', title: 'Name', type: 'text' },
    { id: 'age', title: 'Age', type: 'number' }
  ];

  return (
    <FormRunner
      fields={fields}
      onSubmit={(data) => console.log(data)}
    />
  );
};
```

## State Management

We use `zustand` for state management.
- `useRunnerStore`: Manages the form data and validation state during runtime.
- `useBuilderStore`: Manages the form structure during design time.
