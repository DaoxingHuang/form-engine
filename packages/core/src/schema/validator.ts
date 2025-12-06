import type { Field } from "../types";

const ID_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

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
export const validateFieldId = (id: string): string | null => {
  if (!id) return "ID 不能为空";
  if (!ID_REGEX.test(id)) return "ID 格式不正确 (仅限字母、数字、下划线，且不能以数字开头)";
  return null;
};

/**
 * Collect validation errors for all field IDs (including sub-fields).
 *
 * @param fields - Top-level field list from the builder.
 * @returns A map keyed by field path (e.g. `fieldId` or `arrayField.subId`).
 */
export const getValidationErrors = (fields: Field[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  const idCounts: Record<string, number> = {};

  // Count IDs
  fields.forEach((f) => {
    idCounts[f.id] = (idCounts[f.id] || 0) + 1;
    if (f.type === "array" && f.subFields) {
      const subIdCounts: Record<string, number> = {};
      f.subFields.forEach((sf) => {
        subIdCounts[sf.id] = (subIdCounts[sf.id] || 0) + 1;
      });
      f.subFields.forEach((sf) => {
        const errorKey = `${f.id}.${sf.id}`;
        const formatError = validateFieldId(sf.id);
        if (formatError) {
          errors[errorKey] = formatError;
        } else if (subIdCounts[sf.id] > 1) {
          errors[errorKey] = "ID 重复";
        }
      });
    }
  });

  // Check main fields
  fields.forEach((f) => {
    const formatError = validateFieldId(f.id);
    if (formatError) {
      errors[f.id] = formatError;
    } else if (idCounts[f.id] > 1) {
      errors[f.id] = "ID 重复";
    }
  });

  return errors;
};

/**
 * Validate high-level form structure and return human-readable messages.
 *
 * @param fields - Fields to validate.
 * @returns An array of error messages targeted at end users.
 */
export const validateFormStructure = (fields: Field[]): string[] => {
  const errors: string[] = [];
  const errorMap = getValidationErrors(fields);

  const processedIds = new Set<string>();

  fields.forEach((field) => {
    if (errorMap[field.id] && !processedIds.has(field.id)) {
      errors.push(`组件 "${field.title}" (${field.id}): ${errorMap[field.id]}`);
      processedIds.add(field.id);
    }

    if (field.type === "array" && field.subFields) {
      field.subFields.forEach((sub) => {
        const errorKey = `${field.id}.${sub.id}`;
        if (errorMap[errorKey] && !processedIds.has(errorKey)) {
          errors.push(`组件 "${field.title}" 的子项 "${sub.title}" (${sub.id}): ${errorMap[errorKey]}`);
          processedIds.add(errorKey);
        }
      });
    }
  });

  return errors;
};
