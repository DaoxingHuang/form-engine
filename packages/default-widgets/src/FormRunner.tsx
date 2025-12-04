import { Field, useRunnerStore } from "@chameleon/engine-core";
import { AlertCircle } from "lucide-react";
import React, { useEffect } from "react";
import { WidgetFactory } from "./WidgetFactory";

interface FormRunnerProps {
  fields: Field[];
  initialValues?: Record<string, any>;
  onSubmit?: (data: any) => void;
}

export const FormRunner: React.FC<FormRunnerProps> = ({ fields, initialValues, onSubmit }) => {
  const { formData, errors, setFormData, updateField, validate } = useRunnerStore();

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    } else {
      // Initialize defaults
      const defaults: Record<string, any> = {};
      fields.forEach((f) => {
        if (f.type === "array") defaults[f.id] = [];
        else if (f.type === "checkbox") defaults[f.id] = [];
        else if (f.type === "switch") defaults[f.id] = false;
        else if (f.type === "number") defaults[f.id] = f.minimum || 0;
        else defaults[f.id] = "";
      });
      setFormData(defaults);
    }
  }, [fields, initialValues, setFormData]);

  const handleSubmit = () => {
    if (validate(fields)) {
      onSubmit?.(formData);
    } else {
      alert("请检查表单中的错误项");
    }
  };

  return (
    <div className="p-8 space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            {field.title} {field.required && <span className="text-red-500">*</span>}
          </label>
          <WidgetFactory
            field={field}
            value={formData[field.id]}
            onChange={(v) => updateField(field.id, v)}
            path={field.id}
            errors={errors}
          />
          {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
          {errors[field.id] && (
            <div className="flex items-center gap-1 text-xs text-red-500 animate-pulse font-medium">
              <AlertCircle size={12} /> {errors[field.id]}
            </div>
          )}
        </div>
      ))}
      <div className="pt-6">
        <button
          onClick={handleSubmit}
          className="w-full py-3 text-lg bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
        >
          提交
        </button>
      </div>
    </div>
  );
};
