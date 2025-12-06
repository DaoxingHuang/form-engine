import { parseSchemaToFields } from "@origami/core";
import { FormBuilder, FormRunner } from "@origami/editor";
import { ArrowLeft, CheckCircle, Code } from "lucide-react";
import { useState } from "react";

export default function App() {
  const [mode, setMode] = useState<"edit" | "run">("edit");
  const [schema, setSchema] = useState<any>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handlePublish = (newSchema: any) => {
    setSchema(newSchema);
    setMode("run");
    setSubmittedData(null);
  };

  const handleBack = () => {
    setMode("edit");
  };

  const handleSubmit = (data: any) => {
    setSubmittedData(data);
    console.log("Form Submitted:", data);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      {mode === "edit" ? (
        <FormBuilder onPublish={handlePublish} initialSchema={schema} />
      ) : (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
          <div className="h-14 bg-white border-b border-gray-200 flex justify-between items-center px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                title="返回编辑"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-bold text-gray-800">表单填写预览</h1>
            </div>
            <div className="text-sm text-gray-500">预览模式</div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-gray-100/50">
            <div className="absolute inset-0 overflow-y-auto p-4 sm:p-8">
              <div className="max-w-3xl mx-auto">
                {submittedData ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">提交成功</h2>
                    <p className="text-gray-500 mb-8">表单数据已成功接收</p>

                    <div className="bg-gray-50 rounded-lg p-4 text-left mb-8 border border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        <Code size={12} /> 提交数据 (JSON)
                      </div>
                      <pre className="text-sm font-mono text-gray-700 overflow-x-auto">
                        {JSON.stringify(submittedData, null, 2)}
                      </pre>
                    </div>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setSubmittedData(null)}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        再次填写
                      </button>
                      <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                      >
                        返回编辑
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[400px]">
                    {schema ? (
                      <FormRunner fields={parseSchemaToFields(schema)} onSubmit={handleSubmit} className="h-full" />
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400">No schema to display</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
