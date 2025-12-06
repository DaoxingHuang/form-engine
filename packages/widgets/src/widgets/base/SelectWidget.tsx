import { Select } from "@origami/form-ui";
import type { RunnerWidgetComponent } from "../../types";

const SelectWidget: RunnerWidgetComponent = ({ field, value, onChange, error }) => {
  const safeValue = value === undefined || value === null ? "" : value;
  return (
    <div className="relative">
      <Select
        value={safeValue as string}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        error={!!error}
      >
        <option value="">请选择...</option>
        {field.options &&
          field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </Select>
    </div>
  );
};

export default SelectWidget;
