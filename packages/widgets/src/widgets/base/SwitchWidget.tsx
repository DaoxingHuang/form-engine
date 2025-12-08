import { Switch } from "@origami/form-ui";
import type { RunnerWidgetComponent } from "../../types";

const SwitchWidget: RunnerWidgetComponent = ({ field, value, onChange }) => {
  return <Switch checked={!!value} onChange={onChange} disabled={field.disabled} />;
};

export default SwitchWidget;
