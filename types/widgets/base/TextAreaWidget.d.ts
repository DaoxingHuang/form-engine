import type { Field } from "@origami/core";
import React from "react";
interface WidgetProps {
    field: Field;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}
declare const TextAreaWidget: React.FC<WidgetProps>;
export default TextAreaWidget;
//# sourceMappingURL=TextAreaWidget.d.ts.map