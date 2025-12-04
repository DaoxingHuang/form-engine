import { Field } from "@chameleon/engine-core";
import React from "react";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const RadioWidget: React.FC<WidgetProps> = ({ field, value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4 pt-1">
      {field.options &&
        field.options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 cursor-pointer group ${field.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !field.disabled && onChange(opt.value)}
          >
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${value === opt.value ? "border-indigo-600 bg-indigo-600" : "border-gray-300 group-hover:border-indigo-400"}`}
            >
              {value === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
    </div>
  );
};

export default RadioWidget;
