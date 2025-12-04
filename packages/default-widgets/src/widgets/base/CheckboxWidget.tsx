import { Field } from "@origami/core";
import { CheckSquare } from "lucide-react";
import React from "react";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const CheckboxWidget: React.FC<WidgetProps> = ({ field, value, onChange }) => {
  const currentVals = Array.isArray(value) ? value : [];

  const toggleCheck = (optVal: string) => {
    if (field.disabled) return;
    if (currentVals.includes(optVal)) {
      onChange(currentVals.filter((v: string) => v !== optVal));
    } else {
      onChange([...currentVals, optVal]);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 pt-1">
      {field.options &&
        field.options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 cursor-pointer group ${field.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={currentVals.includes(opt.value)}
              disabled={field.disabled}
              onChange={() => toggleCheck(opt.value)}
            />
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${currentVals.includes(opt.value) ? "border-indigo-600 bg-indigo-600" : "border-gray-300 group-hover:border-indigo-400"}`}
            >
              {currentVals.includes(opt.value) && <CheckSquare size={12} className="text-white" />}
            </div>
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
    </div>
  );
};

export default CheckboxWidget;
