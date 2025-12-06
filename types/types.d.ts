import type { Field } from "@origami/core";
import type React from "react";
/**
 * Standard props shape for all form runner field widgets.
 *
 * Custom widgets provided by host applications should implement this
 * interface so they can be dropped into the runner without additional glue.
 */
export interface RunnerWidgetProps {
    /**
     * Field metadata that describes how the widget should behave.
     */
    field: Field;
    /**
     * Current value for this field in the form data.
     */
    value: unknown;
    /**
     * Change handler to update the form state.
     */
    onChange: (value: unknown) => void;
    /**
     * Optional validation error message for this field, if any.
     */
    error?: string;
    /**
     * Optional full error map for the form; mainly used by layout
     * widgets such as array/object containers to pass nested errors
     * down to child widgets.
     */
    errors?: Record<string, string>;
    /**
     * Optional path of this field within the form data tree. For
     * simple flat forms it is usually the same as `field.id`.
     */
    path?: string;
}
/**
 * React component type for a form runner widget.
 */
export type RunnerWidgetComponent = React.FC<RunnerWidgetProps>;
/**
 * Mapping from field type to widget component implementation.
 *
 * Used by {@link WidgetFactory} and host applications to override
 * the default widget set for specific field types (e.g. "upload").
 */
export type RunnerWidgetMap = Record<string, RunnerWidgetComponent>;
/**
 * A map of widget type names to their React component implementations.
 * Used for overriding default widgets or registering new ones.
 */
export type RunnerWidgetMap = Record<string, RunnerWidgetComponent>;
//# sourceMappingURL=types.d.ts.map