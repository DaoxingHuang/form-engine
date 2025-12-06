import { Input } from "@origami/form-ui";
import type { RunnerWidgetComponent } from "../../types";

const DateWidget: RunnerWidgetComponent = ({ field, value, onChange, error }) => {
  return (
    <div className="flex flex-col gap-1">
      <Input
        type="datetime-local"
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={field.disabled}
        error={!!error}
      />
    </div>
  );
};
export default DateWidget;
