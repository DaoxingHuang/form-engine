import { generateSchema, parseSchemaToFields, useBuilderStore, validateFormStructure } from "@origami/core";
import { AlertCircle, ClipboardList, Code, FileJson, Import, Play, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import PropertiesPanel from "./components/PropertiesPanel";
import Sidebar from "./components/Sidebar";
import { FormRunner } from "./FormRunner";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialSchema) {
      setFields(parseSchemaToFields(initialSchema));
    }
  }, [initialSchema, setFields]);

  useEffect(() => {
    if (showJson) {
      setJsonInput(JSON.stringify(generateSchema(fields), null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showJson]);

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
    const errors = validateFormStructure(fields);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    setIsSaving(true);
    const schema = generateSchema(fields);
    onPublish?.(schema);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex h-full relative">
      {isPreviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Play size={20} className="text-indigo-600" /> 表单预览
              </h3>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-50/50 p-6 flex flex-col min-h-0">
              {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 min-h-[300px]">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Play size={32} className="text-gray-300 ml-1" />
                  </div>
                  <p className="text-sm">表单为空，请先添加组件</p>
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    返回编辑
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto w-full flex-1 flex flex-col overflow-hidden min-h-0">
                  <FormRunner
                    fields={fields}
                    onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              <Play size={14} fill="currentColor" /> 预览
            </button>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              "发布中..."
            ) : (
              <>
                <Save size={16} /> 发布表单
              </>
            )}
          </button>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />
              <div className="text-sm text-red-700 flex-1">
                <p className="font-medium mb-1">提交失败，请检查以下错误：</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs opacity-90">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setValidationErrors([])}
                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <Canvas />

          {showJson && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col p-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileJson size={20} /> Schema JSON 编辑器
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(jsonInput)}
                    className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-gray-600"
                  >
                    <ClipboardList size={14} /> 复制
                  </button>
                  <button
                    onClick={handleRestoreFromJson}
                    className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded shadow-sm"
                  >
                    <Import size={14} /> 应用更改
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 w-full border border-gray-300 rounded-lg p-4 font-mono text-sm bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <PropertiesPanel />
    </div>
  );
};

export default FormBuilder;
