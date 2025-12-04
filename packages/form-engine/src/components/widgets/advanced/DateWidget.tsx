import React from "react";
import { Field } from "../../../core/schema/types";

interface DateWidgetProps {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const DateWidget: React.FC<DateWidgetProps> = ({ field, value, onChange, error }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {field.title}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="datetime-local"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${error ? "border-red-500" : "border-gray-300"}
          ${field.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      />
      {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DateWidget;
