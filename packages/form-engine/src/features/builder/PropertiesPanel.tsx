import { ArrowLeft, Edit2, Plus, Trash2, X } from "lucide-react";
import React from "react";
import { Field } from "../../core/schema/types";
import { useBuilderStore } from "../../core/store/useBuilderStore";

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

const OptionsEditor = ({
  options,
  onChange
}: {
  options?: { label: string; value: string }[];
  onChange: (opts: any[]) => void;
}) => {
  const addOption = () => {
    onChange([...(options || []), { label: "新选项", value: `opt_${Date.now()}` }]);
  };
  const updateOption = (idx: number, key: string, val: string) => {
    const newOpts = [...(options || [])];
    (newOpts[idx] as any)[key] = val;
    onChange(newOpts);
  };
  const removeOption = (idx: number) => {
    onChange((options || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-gray-50 rounded border border-gray-200 p-2 space-y-2">
      <div className="flex text-[10px] text-gray-400 font-medium px-1">
        <span className="flex-[1.5]">显示文字</span>
        <span className="flex-1 ml-2">实际值</span>
        <span className="w-5"></span>
      </div>
      {(options || []).map((opt, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            className="flex-[1.5] text-xs border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 outline-none"
            value={opt.label}
            onChange={(e) => updateOption(idx, "label", e.target.value)}
          />
          <input
            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:border-indigo-500 outline-none font-mono text-gray-600"
            value={opt.value}
            onChange={(e) => updateOption(idx, "value", e.target.value)}
          />
          <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addOption}
        className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:bg-indigo-50 px-2 py-1.5 rounded w-full justify-center border border-dashed border-indigo-200"
      >
        <Plus size={12} /> 添加选项
      </button>
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
            以配置详细属性
          </p>
        </div>
      </div>
    );
  }

  const isSubField = !!editingSubFieldId;
  const currentField = isSubField ? editingSubField : selectedField;
  const handleChange = (key: keyof Field, value: any) => {
    if (isSubField) {
      updateSubField(selectedField.id, editingSubField!.id, key, value);
    } else {
      updateField(selectedField.id, key, value);
    }
  };

  if (!currentField) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">属性配置</h3>
      </div>

      <div className="p-5 space-y-6 animate-in slide-in-from-right duration-300">
        {isSubField && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <button onClick={() => setEditingSubFieldId(null)} className="p-1 hover:bg-gray-100 rounded text-gray-600">
              <ArrowLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-800">配置列表子项</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              字段标识 (Key) <span className="text-indigo-500">*重要</span>
            </label>
            <input
              value={currentField.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className="w-full px-3 py-2 border rounded text-xs font-mono outline-none focus:border-indigo-500 bg-white border-gray-300 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">标题 (Title)</label>
            <input
              type="text"
              value={currentField.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          {["text", "textarea", "number", "email"].includes(currentField.type) && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">占位提示 (Placeholder)</label>
              <input
                type="text"
                value={currentField.placeholder || ""}
                onChange={(e) => handleChange("placeholder", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          )}
        </div>

        {["select", "radio", "checkbox"].includes(currentField.type) && (
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-2">选项配置</label>
            <OptionsEditor options={currentField.options} onChange={(newOpts) => handleChange("options", newOpts)} />
          </div>
        )}

        {currentField.type === "upload" && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-800">上传约束</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">允许类型</label>
                <input
                  value={currentField.accept || "*/*"}
                  onChange={(e) => handleChange("accept", e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs"
                  placeholder="image/*"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">最大体积 (KB)</label>
                <input
                  type="number"
                  value={currentField.maxFileSize || 500}
                  onChange={(e) => handleChange("maxFileSize", Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {currentField.type === "array" && !isSubField && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-gray-800">列表对象结构</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
              <div className="space-y-2">
                {(!currentField.subFields || currentField.subFields.length === 0) && (
                  <p className="text-xs text-gray-400 text-center py-4 bg-white rounded border border-dashed">
                    暂无字段，请添加
                  </p>
                )}
                {currentField.subFields &&
                  currentField.subFields.map((sub, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded border border-gray-200 shadow-sm flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono uppercase w-10 text-center">
                          {sub.type}
                        </span>
                        <span className="text-xs font-medium text-gray-700 truncate">{sub.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingSubFieldId(sub.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => removeSubField(selectedField.id, sub.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="pt-3 border-t border-gray-200 grid grid-cols-4 gap-1.5">
                {SUB_FIELD_TYPES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => {
                      const newSub: Field = {
                        id: `sub_${Date.now()}`,
                        type: t.type,
                        title: "新字段",
                        required: false,
                        options: ["select", "radio"].includes(t.type) ? [{ label: "1", value: "1" }] : undefined
                      };
                      addSubField(selectedField.id, newSub);
                    }}
                    className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                  >
                    <span className="text-[9px] mt-1">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentField.type !== "array" && (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h4 className="text-xs font-bold text-gray-800">校验规则</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentField.required}
                onChange={(e) => handleChange("required", e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">设为必填项</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentField.disabled}
                onChange={(e) => handleChange("disabled", e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">设为禁用</span>
            </label>
            {["text", "textarea", "email"].includes(currentField.type) && (
              <>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">最小字符数</label>
                    <input
                      type="number"
                      value={currentField.minLength ?? ""}
                      onChange={(e) => handleChange("minLength", e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">最大限制 (强制)</label>
                    <input
                      type="number"
                      value={currentField.maxLength ?? ""}
                      onChange={(e) => handleChange("maxLength", e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">常用正则模板</label>
                  <select
                    onChange={(e) => {
                      const preset = REGEX_PRESETS.find((p) => p.value === e.target.value);
                      if (preset) {
                        handleChange("validationRegex", preset.value);
                        handleChange("errorMsg", preset.msg);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- 选择预设模板 (自动填充) --</option>
                    {REGEX_PRESETS.filter((p) => p.value).map((p, i) => (
                      <option key={i} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={currentField.validationRegex || ""}
                    onChange={(e) => handleChange("validationRegex", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-xs font-mono"
                    placeholder="正则表达式"
                  />
                  <input
                    type="text"
                    value={currentField.errorMsg || ""}
                    onChange={(e) => handleChange("errorMsg", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-xs"
                    placeholder="错误提示文案"
                  />
                </div>
              </>
            )}
            {["number", "slider", "rate"].includes(currentField.type) && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">最小值</label>
                  <input
                    type="number"
                    value={currentField.minimum ?? ""}
                    onChange={(e) => handleChange("minimum", Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">最大值</label>
                  <input
                    type="number"
                    value={currentField.maximum ?? ""}
                    onChange={(e) => handleChange("maximum", Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
