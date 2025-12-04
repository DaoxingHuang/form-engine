import { Field } from "@chameleon/engine-core";
import React from "react";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const TextAreaWidget: React.FC<WidgetProps> = ({ field, value, onChange, error }) => {
  const safeValue = value === undefined || value === null ? "" : value;
  return (
    <div className="relative">
      <textarea
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${error ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"} ${field.disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        rows={3}
      />
      {field.maxLength && (
        <span className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none bg-white px-1 rounded">
          {String(safeValue).length}/{field.maxLength}
        </span>
      )}
    </div>
  );
};

export default TextAreaWidget;
