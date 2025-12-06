import type { Field, Schema } from "../types";
/**
 * Parse a JSON Schema into builder field definitions.
 *
 * This is the inverse of {@link generateSchema}. It:
 * - Restores option lists from `enum` / `enumNames` pairs.
 * - Infers field types from `uiWidget` and JSON Schema `type`.
 * - Recursively parses `array` item schemas into sub-fields.
 *
 * @param schema - A JSON Schema object that follows the engine's conventions.
 * @returns An array of builder fields that can be edited in the UI.
 */
export declare const parseSchemaToFields: (schema: Schema) => Field[];
//# sourceMappingURL=parser.d.ts.map