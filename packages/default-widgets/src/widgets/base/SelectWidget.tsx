import { Field } from "@origami/core";
import React from "react";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const SelectWidget: React.FC<WidgetProps> = ({ field, value, onChange, error }) => {
  const safeValue = value === undefined || value === null ? "" : value;
  return (
    <div className="relative">
      <select
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none bg-white ${error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"} ${field.disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        <option value="">请选择...</option>
        {field.options &&
          field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      <div className="absolute right-3 top-3 pointer-events-none text-gray-400">▼</div>
    </div>
  );
};

export default SelectWidget;
