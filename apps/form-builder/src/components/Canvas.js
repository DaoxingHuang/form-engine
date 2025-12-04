import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBuilderStore } from "@chameleon/engine-core";
import { Plus, Star, Trash2, Upload } from "lucide-react";
const Canvas = () => {
    const { fields, selectedFieldId, setSelectedFieldId, removeField, setEditingSubFieldId } = useBuilderStore();
    const handleSelect = (id) => {
        setSelectedFieldId(id);
        setEditingSubFieldId(null);
    };
    const handleRemove = (e, id) => {
        e.stopPropagation();
        removeField(id);
    };
    const renderPreviewComponent = (field) => {
        const commonClass = "w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-400";
        const renderOptions = (opts) => (_jsx("div", { className: "flex flex-wrap gap-2", children: (opts || []).map((o) => (_jsx("span", { className: "text-xs bg-gray-100 px-2 py-1 rounded text-gray-500", children: o.label }, o.value))) }));
        if (field.type === "array") {
            return (_jsx("div", { className: "border border-dashed border-indigo-200 bg-indigo-50/30 rounded p-3 space-y-2", children: field.subFields && field.subFields.length > 0 ? (_jsxs("div", { className: "grid gap-2", children: [field.subFields.map((sub) => (_jsxs("div", { className: "flex items-center gap-2 bg-white px-2 py-2 rounded border border-gray-100 shadow-sm", children: [_jsx("span", { className: "text-[10px] text-white bg-gray-400 px-1 rounded uppercase w-8 text-center", children: sub.type.slice(0, 3) }), _jsx("span", { className: "text-xs text-gray-700 flex-1", children: sub.title }), _jsx("span", { className: "text-[10px] text-gray-400 font-mono", children: sub.id })] }, sub.id))), _jsxs("div", { className: "text-xs text-indigo-500 text-center mt-2 border-t border-dashed border-indigo-200 pt-2 flex items-center justify-center gap-1", children: [_jsx(Plus, { size: 12 }), " \u70B9\u51FB\u201C\u6DFB\u52A0\u4E00\u9879\u201D\u5C06\u91CD\u590D\u4E0A\u8FF0\u7ED3\u6784"] })] })) : (_jsx("div", { className: "text-xs text-gray-400 text-center italic py-2", children: "\u8BF7\u5728\u53F3\u4FA7\u914D\u7F6E\u5217\u8868\u5305\u542B\u7684\u5B57\u6BB5" })) }));
        }
        switch (field.type) {
            case "textarea":
                return _jsx("div", { className: `${commonClass} h-20`, children: field.placeholder });
            case "select":
                return (_jsxs("div", { className: `${commonClass} flex justify-between`, children: [_jsx("span", { children: "\u8BF7\u9009\u62E9..." }), _jsx("span", { children: "\u25BC" })] }));
            case "radio":
                return _jsx("div", { className: "mt-1", children: renderOptions(field.options || []) });
            case "checkbox":
                return _jsx("div", { className: "mt-1", children: renderOptions(field.options || []) });
            case "switch":
                return (_jsx("div", { className: "w-10 h-5 bg-gray-200 rounded-full relative", children: _jsx("div", { className: "w-3 h-3 bg-white rounded-full absolute top-1 left-1 shadow" }) }));
            case "slider":
                return (_jsxs("div", { className: "w-full h-2 bg-gray-200 rounded relative mt-2", children: [_jsx("div", { className: "w-1/3 h-full bg-indigo-300 rounded" }), _jsx("div", { className: "w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-[-4px] left-1/3 shadow" })] }));
            case "rate":
                return (_jsxs("div", { className: "flex gap-1 text-gray-300", children: [_jsx(Star, { size: 16, fill: "currentColor" }), _jsx(Star, { size: 16, fill: "currentColor" }), _jsx(Star, { size: 16, fill: "currentColor" }), _jsx(Star, { size: 16 }), _jsx(Star, { size: 16 })] }));
            case "upload":
                return (_jsxs("div", { className: `${commonClass} flex items-center gap-2 text-gray-400`, children: [_jsx(Upload, { size: 14 }), " \u70B9\u51FB\u4E0A\u4F20\u6587\u4EF6"] }));
            default:
                return _jsx("div", { className: commonClass, children: field.placeholder || "输入框占位符" });
        }
    };
    return (_jsx("div", { className: "flex-1 bg-gray-100/80 p-8 overflow-y-auto flex justify-center", onClick: () => handleSelect(""), children: _jsxs("div", { className: "w-full max-w-2xl bg-white min-h-[800px] shadow-sm rounded-lg flex flex-col", children: [_jsxs("div", { className: "h-12 border-b border-gray-100 flex items-center px-6 bg-gray-50/30 rounded-t-lg", children: [_jsxs("div", { className: "flex gap-1.5", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-red-400/80" }), _jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-yellow-400/80" }), _jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-green-400/80" })] }), _jsx("div", { className: "ml-4 text-xs text-gray-400 font-medium", children: "New Form" })] }), _jsxs("div", { className: "flex-1 p-8 space-y-4", children: [fields.length === 0 && (_jsxs("div", { className: "h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-3", children: [_jsx(Plus, { size: 32, className: "text-gray-300" }), _jsx("p", { className: "text-sm", children: "\u70B9\u51FB\u5DE6\u4FA7\u7EC4\u4EF6\u6DFB\u52A0\u5230\u6B64\u5904" })] })), fields.map((field) => (_jsxs("div", { onClick: (e) => {
                                e.stopPropagation();
                                handleSelect(field.id);
                            }, className: `
                relative group rounded-lg border-2 transition-all cursor-pointer p-4
                ${selectedFieldId === field.id ? "border-indigo-500 bg-indigo-50/10 ring-4 ring-indigo-500/10" : "border-transparent hover:border-indigo-200 hover:bg-gray-50"}
              `, children: [_jsxs("div", { className: "mb-2 flex justify-between items-start", children: [_jsxs("label", { className: "text-sm font-bold text-gray-700 select-none", children: [field.title, field.required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), selectedFieldId === field.id && (_jsx("button", { onClick: (e) => handleRemove(e, field.id), className: "text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors", children: _jsx(Trash2, { size: 14 }) }))] }), renderPreviewComponent(field), field.description && _jsx("p", { className: "text-xs text-gray-400 mt-1.5", children: field.description })] }, field.id)))] })] }) }));
};
export default Canvas;
