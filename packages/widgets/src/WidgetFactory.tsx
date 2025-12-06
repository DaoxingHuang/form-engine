import { Field } from "@origami/core";
import React from "react";
import DateWidget from "./widgets/advanced/DateWidget";
import RateWidget from "./widgets/advanced/RateWidget";
import SliderWidget from "./widgets/advanced/SliderWidget";
import UploadWidget from "./widgets/advanced/UploadWidget";
import CheckboxWidget from "./widgets/base/CheckboxWidget";
import { RadioWidget } from "./widgets/base/RadioWidget";
import SelectWidget from "./widgets/base/SelectWidget";
import SwitchWidget from "./widgets/base/SwitchWidget";
import TextAreaWidget from "./widgets/base/TextAreaWidget";
import TextWidget from "./widgets/base/TextWidget";
import ArrayWidget from "./widgets/layout/ArrayWidget";

/**
 * Fallback widget rendered when a field type does not have a dedicated widget
 * implementation.
 */
const PlaceholderWidget = ({ field }: { field: Field }) => (
  <div className="p-2 border border-gray-200 rounded text-gray-400 text-sm">
    Widget type "{field.type}" not implemented yet.
  </div>
);

/**
 * Mapping from logical field `type` to concrete React widget components.
 */
const WIDGET_MAP: Record<string, React.FC<any>> = {
  text: TextWidget,
  number: TextWidget, // Reuse TextWidget for number
  textarea: TextAreaWidget,
  select: SelectWidget,
  radio: RadioWidget,
  checkbox: CheckboxWidget,
  switch: SwitchWidget,
  date: DateWidget,
  slider: SliderWidget,
  rate: RateWidget,
  upload: UploadWidget,
  array: ArrayWidget
};

/**
 * Props for the {@link WidgetFactory} component.
 */
interface WidgetFactoryProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  path: string;
  errors: Record<string, string>;
}
/**
 * Render an appropriate form widget for a given field definition.
 *
 * The factory looks up the React component mapped to `field.type` and passes
 * through value, change handler, validation errors and path information. When
 * no widget is registered for a type, a placeholder widget is rendered.
 */
export const WidgetFactory: React.FC<WidgetFactoryProps> = ({ field, value, onChange, path, errors }) => {
  const Component = WIDGET_MAP[field.type] || PlaceholderWidget;
  const error = errors[path];

  return (
    <div className={`widget-wrapper ${field.customClass || ""}`}>
      <Component field={field} value={value} onChange={onChange} error={error} path={path} errors={errors} />
    </div>
  );
};
