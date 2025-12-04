import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBuilderStore } from "@chameleon/core";
import { Calendar, CheckSquare, CircleDot, Hash, List, Sliders, Star, ToggleLeft, Type, Upload } from "lucide-react";
const COMPONENT_TYPES = [
    { type: "text", label: "单行文本", icon: _jsx(Type, { size: 16 }), group: "basic" },
    { type: "textarea", label: "多行文本", icon: "¶", group: "basic" },
    { type: "number", label: "数字输入", icon: _jsx(Hash, { size: 16 }), group: "basic" },
    { type: "select", label: "下拉选择", icon: "▼", group: "select" },
    { type: "radio", label: "单选框", icon: _jsx(CircleDot, { size: 16 }), group: "select" },
    { type: "checkbox", label: "多选框", icon: _jsx(CheckSquare, { size: 16 }), group: "select" },
    { type: "switch", label: "开关", icon: _jsx(ToggleLeft, { size: 16 }), group: "select" },
    { type: "date", label: "日期时间", icon: _jsx(Calendar, { size: 16 }), group: "advanced" },
    { type: "slider", label: "滑块", icon: _jsx(Sliders, { size: 16 }), group: "advanced" },
    { type: "rate", label: "评分", icon: _jsx(Star, { size: 16 }), group: "advanced" },
    { type: "upload", label: "文件/图片", icon: _jsx(Upload, { size: 16 }), group: "advanced" },
    { type: "array", label: "对象列表", icon: _jsx(List, { size: 16 }), group: "layout" }
];
const Sidebar = () => {
    const { addField } = useBuilderStore();
    const handleAddField = (type) => {
        const newField = {
            id: `field_${Date.now()}`,
            type,
            title: `未命名${COMPONENT_TYPES.find((c) => c.type === type)?.label}`,
            required: false,
            options: ["select", "radio", "checkbox"].includes(type) ? [{ label: "A", value: "a" }] : undefined,
            subFields: []
        };
        addField(newField);
    };
    return (_jsxs("div", { className: "w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm h-full", children: [_jsx("div", { className: "p-4 border-b border-gray-100 bg-gray-50/50", children: _jsx("h3", { className: "text-xs font-bold text-gray-500 uppercase tracking-wider", children: "\u7EC4\u4EF6\u5E93" }) }), _jsx("div", { className: "flex-1 overflow-y-auto p-3 space-y-4", children: ["basic", "select", "advanced", "layout"].map((group) => (_jsxs("div", { children: [_jsx("div", { className: "text-[10px] font-semibold text-gray-400 mb-2 uppercase px-1", children: group }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: COMPONENT_TYPES.filter((c) => c.group === group).map((comp) => (_jsxs("button", { onClick: () => handleAddField(comp.type), className: "flex flex-col items-center justify-center p-3 border border-gray-100 bg-white rounded-lg hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all group text-gray-600 hover:text-indigo-600", children: [_jsx("span", { className: "mb-1 opacity-60 group-hover:opacity-100 transition-opacity", children: typeof comp.icon === "string" ? (_jsx("span", { className: "text-base font-bold", children: comp.icon })) : (comp.icon) }), _jsx("span", { className: "text-xs", children: comp.label })] }, comp.type))) })] }, group))) })] }));
};
export default Sidebar;
