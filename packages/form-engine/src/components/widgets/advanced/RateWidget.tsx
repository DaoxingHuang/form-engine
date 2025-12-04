import { Star } from "lucide-react";
import React from "react";
import { Field } from "../../../core/schema/types";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const RateWidget: React.FC<WidgetProps> = ({ field, value, onChange }) => {
  return (
    <div className={`flex gap-1 ${field.disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !field.disabled && onChange(star)}
          type="button"
          disabled={field.disabled}
          className={field.disabled ? "cursor-not-allowed" : ""}
        >
          <Star
            size={24}
            className={`transition-colors ${star <= (value || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
          />
        </button>
      ))}
    </div>
  );
};

export default RateWidget;
