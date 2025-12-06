import type { Field } from "@origami/core";
import React from "react";
import type { RunnerWidgetMap, RunnerWidgetProps } from "./types";
/**
 * Props for the {@link WidgetFactory} component.
 */
interface WidgetFactoryProps extends RunnerWidgetProps {
    field: Field;
    path: string;
    errors: Record<string, string>;
    /**
     * Optional map of custom widgets that override the default mapping.
     * Keys are field types, values are React components that accept the
     * standard widget props (field, value, onChange, error, path, errors).
     */
    widgetsOverride?: RunnerWidgetMap;
}
/**
 * Render an appropriate form widget for a given field definition.
 *
 * The factory looks up the React component mapped to `field.type` and passes
 * through value, change handler, validation errors and path information. When
 * no widget is registered for a type, a placeholder widget is rendered.
 */
export declare const WidgetFactory: React.FC<WidgetFactoryProps>;
export {};
//# sourceMappingURL=WidgetFactory.d.ts.map