import { Field } from "@chameleon/core";
import React from "react";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const SliderWidget: React.FC<WidgetProps> = ({ field, value, onChange }) => {
  return (
    <div className={`flex items-center gap-4 ${field.disabled ? "opacity-50" : ""}`}>
      <input
        type="range"
        min={field.minimum || 0}
        max={field.maximum || 100}
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={field.disabled}
        className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none accent-indigo-600 ${field.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      />
      <span className="text-sm font-mono font-medium text-gray-600 min-w-[30px] text-right">{value || 0}</span>
    </div>
  );
};

export default SliderWidget;
