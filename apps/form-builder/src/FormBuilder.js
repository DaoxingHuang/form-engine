import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { FormRunner } from "@chameleon/default-widgets";
import { generateSchema, parseSchemaToFields, useBuilderStore } from "@chameleon/core";
import { ClipboardList, Code, FileJson, Import, Play, Save } from "lucide-react";
import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import PropertiesPanel from "./components/PropertiesPanel";
import Sidebar from "./components/Sidebar";
const FormBuilder = ({ onPublish, initialSchema }) => {
    const { fields, setFields, setSelectedFieldId } = useBuilderStore();
    const [showJson, setShowJson] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        if (initialSchema) {
            setFields(parseSchemaToFields(initialSchema));
        }
    }, [initialSchema, setFields]);
    useEffect(() => {
        if (showJson) {
            setJsonInput(JSON.stringify(generateSchema(fields), null, 2));
        }
    }, [showJson, fields]);
    const handleRestoreFromJson = () => {
        try {
            const parsedSchema = JSON.parse(jsonInput);
            if (!parsedSchema.properties) {
                alert("无效 Schema");
                return;
            }
            setFields(parseSchemaToFields(parsedSchema));
            setSelectedFieldId(null);
            alert("还原成功");
            setShowJson(false);
        }
        catch (e) {
            alert("JSON Error: " + e.message);
        }
    };
    const handlePublish = () => {
        setIsSaving(true);
        const schema = generateSchema(fields);
        onPublish?.(schema);
        setTimeout(() => setIsSaving(false), 1000);
    };
    if (isPreviewMode) {
        return (_jsxs("div", { className: "flex flex-col h-full bg-gray-50", children: [_jsxs("div", { className: "bg-indigo-900 text-white px-4 py-3 flex justify-between items-center shadow-md z-10", children: [_jsxs("span", { className: "font-bold flex items-center gap-2", children: [_jsx(Play, { size: 18 }), " \u6A21\u62DF\u9884\u89C8\u4E2D"] }), _jsx("button", { onClick: () => setIsPreviewMode(false), className: "bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded", children: "\u9000\u51FA\u9884\u89C8" })] }), _jsx("div", { className: "flex-1 overflow-hidden", children: _jsx(FormRunner, { fields: fields, onSubmit: (data) => alert(JSON.stringify(data, null, 2)) }) })] }));
    }
    return (_jsxs("div", { className: "flex h-full relative", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col min-w-0 bg-gray-100/80", children: [_jsxs("div", { className: "h-14 bg-white border-b border-gray-200 flex justify-between items-center px-4 shadow-sm z-10", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setShowJson(!showJson), className: `flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border ${showJson ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`, children: [_jsx(Code, { size: 14 }), " ", showJson ? "关闭编辑器" : "JSON"] }), _jsxs("button", { onClick: () => setIsPreviewMode(true), className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium", children: [_jsx(Play, { size: 14, fill: "currentColor" }), " \u8BD5\u8FD0\u884C"] })] }), _jsx("button", { onClick: handlePublish, disabled: isSaving, className: "flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed", children: isSaving ? ("发布中...") : (_jsxs(_Fragment, { children: [_jsx(Save, { size: 16 }), " \u53D1\u5E03\u8868\u5355"] })) })] }), _jsxs("div", { className: "flex-1 overflow-hidden relative", children: [_jsx(Canvas, {}), showJson && (_jsxs("div", { className: "absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col p-6 animate-in fade-in duration-200", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("h3", { className: "font-bold text-gray-800 flex items-center gap-2", children: [_jsx(FileJson, { size: 20 }), " Schema JSON \u7F16\u8F91\u5668"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => navigator.clipboard.writeText(jsonInput), className: "flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-gray-600", children: [_jsx(ClipboardList, { size: 14 }), " \u590D\u5236"] }), _jsxs("button", { onClick: handleRestoreFromJson, className: "flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded shadow-sm", children: [_jsx(Import, { size: 14 }), " \u5E94\u7528\u66F4\u6539"] })] })] }), _jsx("textarea", { className: "flex-1 w-full border border-gray-300 rounded-lg p-4 font-mono text-sm bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none", value: jsonInput, onChange: (e) => setJsonInput(e.target.value) })] }))] })] }), _jsx(PropertiesPanel, {})] }));
};
export default FormBuilder;
