import { Rate } from "@origami/form-ui";
import type { RunnerWidgetComponent } from "../../types";

const RateWidget: RunnerWidgetComponent = ({ field, value, onChange }) => {
  return <Rate value={value as number} onChange={onChange} disabled={field.disabled} />;
};

export default RateWidget;
