import { ClipboardList, Code, FileJson, Import, Play, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { generateSchema } from "../../core/schema/generator";
import { parseSchemaToFields } from "../../core/schema/parser";
import { useBuilderStore } from "../../core/store/useBuilderStore";
import FormRunner from "../runner/FormRunner";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import Sidebar from "./Sidebar";

interface FormBuilderProps {
  onPublish?: (schema: any) => void;
  initialSchema?: any;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onPublish, initialSchema }) => {
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
    } catch (e: any) {
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
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-indigo-900 text-white px-4 py-3 flex justify-between items-center shadow-md z-10">
          <span className="font-bold flex items-center gap-2">
            <Play size={18} /> 模拟预览中
          </span>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded"
          >
            退出预览
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <FormRunner fields={fields} onSubmit={(data) => alert(JSON.stringify(data, null, 2))} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-100/80">
        <div className="h-14 bg-white border-b border-gray-200 flex justify-between items-center px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJson(!showJson)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border ${showJson ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              <Code size={14} /> {showJson ? "关闭编辑器" : "JSON"}
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium"
            >
              <Play size={14} fill="currentColor" /> 试运行
            </button>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:bg-indigo-300"
          >
            <Save size={16} /> {isSaving ? "发布中..." : "发布表单"}
          </button>
        </div>

        {showJson ? (
          <div className="flex-1 overflow-y-auto p-8 relative">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 h-[600px] flex flex-col animate-in fade-in zoom-in duration-200">
              <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-mono flex items-center gap-2">
                  <FileJson size={16} /> Schema Editor
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(jsonInput)}
                  className="text-xs hover:text-indigo-300 flex items-center gap-1"
                >
                  <ClipboardList size={14} /> 复制
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="flex-1 p-4 font-mono text-xs text-gray-800 resize-none outline-none focus:bg-gray-50"
                spellCheck={false}
              />
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">在此粘贴 JSON Schema 可还原设计</span>
                <button
                  onClick={handleRestoreFromJson}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  <Import size={16} /> 应用并还原设计
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Canvas />
        )}
      </div>

      <PropertiesPanel />
    </div>
  );
};

export default FormBuilder;
