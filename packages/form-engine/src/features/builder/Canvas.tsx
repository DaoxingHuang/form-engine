import { Plus, Star, Trash2, Upload } from "lucide-react";
import React from "react";
import { Field } from "../../core/schema/types";
import { useBuilderStore } from "../../core/store/useBuilderStore";

const Canvas: React.FC = () => {
  const { fields, selectedFieldId, setSelectedFieldId, removeField, setEditingSubFieldId } = useBuilderStore();

  const handleSelect = (id: string) => {
    setSelectedFieldId(id);
    setEditingSubFieldId(null);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeField(id);
  };

  const renderPreviewComponent = (field: Field) => {
    const commonClass = "w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-400";
    const renderOptions = (opts: any[]) => (
      <div className="flex flex-wrap gap-2">
        {(opts || []).map((o) => (
          <span key={o.value} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
            {o.label}
          </span>
        ))}
      </div>
    );

    if (field.type === "array") {
      return (
        <div className="border border-dashed border-indigo-200 bg-indigo-50/30 rounded p-3 space-y-2">
          {field.subFields && field.subFields.length > 0 ? (
            <div className="grid gap-2">
              {field.subFields.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 bg-white px-2 py-2 rounded border border-gray-100 shadow-sm"
                >
                  <span className="text-[10px] text-white bg-gray-400 px-1 rounded uppercase w-8 text-center">
                    {sub.type.slice(0, 3)}
                  </span>
                  <span className="text-xs text-gray-700 flex-1">{sub.title}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{sub.id}</span>
                </div>
              ))}
              <div className="text-xs text-indigo-500 text-center mt-2 border-t border-dashed border-indigo-200 pt-2 flex items-center justify-center gap-1">
                <Plus size={12} /> 点击“添加一项”将重复上述结构
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 text-center italic py-2">请在右侧配置列表包含的字段</div>
          )}
        </div>
      );
    }

    switch (field.type) {
      case "textarea":
        return <div className={`${commonClass} h-20`}>{field.placeholder}</div>;
      case "select":
        return (
          <div className={`${commonClass} flex justify-between`}>
            <span>请选择...</span>
            <span>▼</span>
          </div>
        );
      case "radio":
        return <div className="mt-1">{renderOptions(field.options || [])}</div>;
      case "checkbox":
        return <div className="mt-1">{renderOptions(field.options || [])}</div>;
      case "switch":
        return (
          <div className="w-10 h-5 bg-gray-200 rounded-full relative">
            <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1 shadow"></div>
          </div>
        );
      case "slider":
        return (
          <div className="w-full h-2 bg-gray-200 rounded relative mt-2">
            <div className="w-1/3 h-full bg-indigo-300 rounded"></div>
            <div className="w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-[-4px] left-1/3 shadow"></div>
          </div>
        );
      case "rate":
        return (
          <div className="flex gap-1 text-gray-300">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} />
            <Star size={16} />
          </div>
        );
      case "upload":
        return (
          <div className={`${commonClass} flex items-center gap-2 text-gray-400`}>
            <Upload size={14} /> 点击上传文件
          </div>
        );
      default:
        return <div className={commonClass}>{field.placeholder}</div>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 relative bg-gray-100/80 h-full">
      <div className="max-w-2xl mx-auto min-h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
        {fields.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 py-32 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <Plus size={48} className="mb-4 text-gray-200" />
            <p>从左侧拖拽或点击添加组件</p>
          </div>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              onClick={() => handleSelect(field.id)}
              className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer bg-white ${selectedFieldId === field.id ? "border-indigo-500 shadow-md ring-2 ring-indigo-50" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}`}
            >
              <div className="pointer-events-none space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    {field.title} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                    {field.type}
                  </span>
                </div>
                {renderPreviewComponent(field)}
                {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
              </div>
              <button
                onClick={(e) => handleRemove(e, field.id)}
                className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-md shadow border border-gray-100 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all z-10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Canvas;
