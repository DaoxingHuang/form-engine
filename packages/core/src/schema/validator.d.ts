import type { Field } from "../types";
/**
 * Validate the format of a field identifier.
 *
 * A valid identifier:
 * - Contains only letters, digits and underscores.
 * - Does not start with a digit.
 *
 * @param id - Raw field identifier.
 * @returns An error message when invalid, or `null` when valid.
 */
export declare const validateFieldId: (id: string) => string | null;
/**
 * Collect validation errors for all field IDs (including sub-fields).
 *
 * @param fields - Top-level field list from the builder.
 * @returns A map keyed by field path (e.g. `fieldId` or `arrayField.subId`).
 */
export declare const getValidationErrors: (fields: Field[]) => Record<string, string>;
/**
 * Validate high-level form structure and return human-readable messages.
 *
 * @param fields - Fields to validate.
 * @returns An array of error messages targeted at end users.
 */
export declare const validateFormStructure: (fields: Field[]) => string[];
//# sourceMappingURL=validator.d.ts.map