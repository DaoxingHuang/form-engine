import { Radio } from "@origami/form-ui";
import type { RunnerWidgetComponent } from "../../types";

export const RadioWidget: RunnerWidgetComponent = ({ field, value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-4 pt-1">
      {field.options &&
        field.options.map((opt) => (
          <Radio
            key={opt.value}
            label={opt.label}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            disabled={field.disabled}
          />
        ))}
    </div>
  );
};
