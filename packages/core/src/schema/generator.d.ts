import type { Field, Schema } from "../types";
/**
 * Generate a JSON Schema object from builder fields.
 *
 * The generated schema is designed to be consumed by the form runner and
 * follows these conventions:
 * - Basic fields are mapped to `string` / `number` / `boolean` JSON types with
 *   `uiWidget` metadata for the appropriate widget.
 * - `array` fields are represented as arrays of objects via an `items` schema.
 * - Option-based fields produce `enum` / `enumNames` pairs.
 * - Upload fields carry extra constraints such as `accept` and `maxFileSize`.
 *
 * @param fields - Field definitions from the form builder.
 * @returns A JSON Schema object describing the form.
 */
export declare const generateSchema: (fields: Field[]) => Schema;
//# sourceMappingURL=generator.d.ts.map