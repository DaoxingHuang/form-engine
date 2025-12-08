import { useBuilderStore } from "@origami/core";
import { OptionsEditor } from "@origami/form-ui";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import React from "react";

const REGEX_PRESETS = [
  { label: "自定义", value: "", msg: "" },
  { label: "手机号 (中国)", value: "^1[3-9]\\d{9}$", msg: "请输入正确的11位手机号" },
  { label: "电子邮箱", value: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", msg: "请输入有效的邮箱地址" },
  { label: "身份证号", value: "(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)", msg: "身份证格式不正确" }
];

const SUB_FIELD_TYPES = [
  { type: "text", label: "文本" },
  { type: "number", label: "数字" },
  { type: "date", label: "日期" },
  { type: "select", label: "下拉" },
  { type: "radio", label: "单选" },
  { type: "switch", label: "开关" },
  { type: "upload", label: "上传" }
];

const FieldPropertiesEditor: React.FC<{
  field: any;
  onUpdate: (changes: any) => void;
  children?: React.ReactNode;
}> = ({ field, onUpdate, children }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Basic Info */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">标题</label>
          <input
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            value={field.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">字段标识 (ID)</label>
          <div className="flex gap-1">
            <input
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
              value={field.id}
              onChange={(e) => onUpdate({ id: e.target.value })}
            />
            <button
              className="px-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-500"
              title="复制ID"
              onClick={() => navigator.clipboard.writeText(field.id)}
            >
              #
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">描述/提示</label>
          <textarea
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            rows={2}
            value={field.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">占位符</label>
          <input
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>
      </div>

      {/* Validation */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-900">校验规则</h4>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`required-${field.id}`}
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
            必填项
          </label>
        </div>

        {["text", "textarea"].includes(field.type) && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">正则校验</label>
              <select
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 mb-2"
                onChange={(e) => {
                  const preset = REGEX_PRESETS.find((p) => p.value === e.target.value);
                  if (preset) {
                    onUpdate({
                      validation: { pattern: preset.value, message: preset.msg }
                    });
                  }
                }}
              >
                {REGEX_PRESETS.map((p) => (
                  <option key={p.label} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 font-mono text-xs"
                placeholder="正则表达式"
                value={field.validation?.pattern || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: { ...field.validation, pattern: e.target.value }
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">错误提示</label>
              <input
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2"
                placeholder="校验失败时的提示信息"
                value={field.validation?.message || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: { ...field.validation, message: e.target.value }
                  })
                }
              />
            </div>
          </>
        )}

        {field.type === "number" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">最小值</label>
              <input
                type="number"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                value={field.minimum ?? ""}
                onChange={(e) => onUpdate({ minimum: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">最大值</label>
              <input
                type="number"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                value={field.maximum ?? ""}
                onChange={(e) => onUpdate({ maximum: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        {field.type === "upload" && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">文件类型 (Accept)</label>
              <input
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. .jpg,.png,image/*"
                value={field.accept || ""}
                onChange={(e) => onUpdate({ accept: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">最大大小 (MB)</label>
              <input
                type="number"
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                value={field.maxFileSize ?? ""}
                onChange={(e) => onUpdate({ maxFileSize: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </div>
          </>
        )}
      </div>

      {/* Options for Select/Radio/Checkbox */}
      {["select", "radio", "checkbox"].includes(field.type) && (
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-900">选项配置</h4>
          <OptionsEditor options={field.options} onChange={(opts) => onUpdate({ options: opts })} />
        </div>
      )}

      {children}
    </div>
  );
};

const PropertiesPanel: React.FC = () => {
  const {
    fields,
    selectedFieldId,
    editingSubFieldId,
    updateField,
    updateSubField,
    addSubField,
    removeSubField,
    setEditingSubFieldId
  } = useBuilderStore();

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const editingSubField = selectedField?.subFields?.find((sf) => sf.id === editingSubFieldId);

  if (!selectedField) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">属性配置</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center bg-gray-50/30">
          <p className="text-sm font-medium">
            请在画布中选择组件
            <br />
            <span className="text-xs opacity-70">点击组件以编辑属性</span>
          </p>
        </div>
      </div>
    );
  }

  // If editing a sub-field (inside an Array)
  if (editingSubField) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm h-full animate-in slide-in-from-right-4 duration-200">
        <div className="p-4 border-b border-gray-100 bg-indigo-50/50 flex items-center gap-2">
          <button
            onClick={() => setEditingSubFieldId(null)}
            className="p-1 hover:bg-white rounded-full text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">子字段配置</h3>
            <p className="text-[10px] text-indigo-400">{editingSubField.id}</p>
          </div>
        </div>
        <FieldPropertiesEditor
          field={editingSubField}
          onUpdate={(changes) => updateSubField(selectedField.id, editingSubField.id, changes)}
        />
      </div>
    );
  }

  // Main Field Properties
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">属性配置</h3>
        <p className="text-[10px] text-gray-400 mt-0.5">{selectedField.type}</p>
      </div>

      <FieldPropertiesEditor field={selectedField} onUpdate={(changes) => updateField(selectedField.id, changes)}>
        {/* Array Sub-fields */}
        {selectedField.type === "array" && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 flex justify-between items-center">
              列表字段配置
              <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {selectedField.subFields?.length || 0} 个字段
              </span>
            </h4>
            <div className="space-y-2">
              {selectedField.subFields?.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded group hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded uppercase w-8 text-center">
                      {sub.type.slice(0, 3)}
                    </span>
                    <span className="text-xs font-medium truncate">{sub.title}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingSubFieldId(sub.id)}
                      className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => removeSubField(selectedField.id, sub.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1 mt-2">
              {SUB_FIELD_TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() =>
                    addSubField(selectedField.id, {
                      id: `sub_${Date.now()}`,
                      type: t.type,
                      title: `新${t.label}`,
                      required: false
                    })
                  }
                  className="text-[10px] border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 py-1.5 rounded transition-colors"
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </FieldPropertiesEditor>
    </div>
  );
};

export default PropertiesPanel;
