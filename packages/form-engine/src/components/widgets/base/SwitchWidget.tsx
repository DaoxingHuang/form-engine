import React from "react";
import { Field } from "../../../core/schema/types";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const SwitchWidget: React.FC<WidgetProps> = ({ field, value, onChange }) => {
  return (
    <button
      onClick={() => !field.disabled && onChange(!value)}
      disabled={field.disabled}
      className={`w-12 h-6 rounded-full transition-colors relative ${value ? "bg-indigo-600" : "bg-gray-300"} ${field.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      type="button"
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${value ? "left-7" : "left-1"}`}
      />
    </button>
  );
};

export default SwitchWidget;
