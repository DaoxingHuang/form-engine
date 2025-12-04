import React from "react";
import { Field } from "../../core/schema/types";
import DateWidget from "./advanced/DateWidget";
import RateWidget from "./advanced/RateWidget";
import SliderWidget from "./advanced/SliderWidget";
import UploadWidget from "./advanced/UploadWidget";
import CheckboxWidget from "./base/CheckboxWidget";
import RadioWidget from "./base/RadioWidget";
import SelectWidget from "./base/SelectWidget";
import SwitchWidget from "./base/SwitchWidget";
import TextAreaWidget from "./base/TextAreaWidget";
import TextWidget from "./base/TextWidget";
import ArrayWidget from "./layout/ArrayWidget";

// Placeholder for other widgets
const PlaceholderWidget = ({ field }: { field: Field }) => (
  <div className="p-2 border border-gray-200 rounded text-gray-400 text-sm">
    Widget type "{field.type}" not implemented yet.
  </div>
);

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

interface WidgetFactoryProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  path: string;
  errors: Record<string, string>;
}

export const WidgetFactory: React.FC<WidgetFactoryProps> = ({ field, value, onChange, path, errors }) => {
  const Component = WIDGET_MAP[field.type] || PlaceholderWidget;
  const error = errors[path];

  return (
    <div className={`widget-wrapper ${field.customClass || ""}`}>
      <Component field={field} value={value} onChange={onChange} error={error} path={path} errors={errors} />
    </div>
  );
};
