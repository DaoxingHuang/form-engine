import { Field } from "@origami/core";
import { FileCheck, FileText, Image as ImageIcon, Upload, User, X } from "lucide-react";
import React, { useState } from "react";

interface WidgetProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const UploadWidget: React.FC<WidgetProps> = ({ field, value, onChange, error }) => {
  const [uploading, setUploading] = useState(false);
  const safeValue = value === undefined || value === null ? "" : value;
  const lowerId = field.id.toLowerCase();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field.disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (field.maxFileSize && file.size > field.maxFileSize * 1024) {
      alert(`文件大小不能超过 ${field.maxFileSize}KB`);
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 1. Avatar Upload Style
  if (lowerId.includes("avatar") || lowerId.includes("photo")) {
    return (
      <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 border-dashed hover:border-indigo-300 transition-colors">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2 border-2 border-white shadow-sm relative group cursor-pointer">
          {safeValue ? (
            <img src={safeValue} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={32} className="text-gray-400" />
          )}
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={field.disabled}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
            更换
          </div>
        </div>
        <span className="text-xs text-gray-500 font-medium">点击上传头像</span>
        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }

  // 2. Contract/Document Upload Style
  if (lowerId.includes("contract") || lowerId.includes("doc") || lowerId.includes("file")) {
    return (
      <div className="space-y-1">
        <div className="border border-blue-100 bg-blue-50/50 p-3 rounded-lg flex items-center justify-between group hover:bg-blue-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileCheck className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-blue-900">文档上传</div>
              <div className="text-[10px] text-blue-500">{safeValue ? "已选择文件" : "支持 PDF, Word"}</div>
            </div>
          </div>
          <label className="bg-white text-blue-600 border border-blue-200 px-4 py-1.5 rounded-md text-xs font-medium cursor-pointer hover:shadow-sm transition-all">
            {safeValue ? "重新上传" : "选择文件"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange(file.name); // Simulate upload for doc
              }}
              disabled={field.disabled}
            />
          </label>
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  // 3. Default Upload Style
  return (
    <div className="space-y-2">
      <label
        className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg transition-colors ${error ? "border-red-500 bg-red-50" : "border-gray-300"} ${field.disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-50"}`}
      >
        <div className="flex flex-col items-center">
          <Upload size={24} className="text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">点击上传文件</span>
        </div>
        <input
          type="file"
          className="hidden"
          accept={field.accept}
          onChange={handleFileUpload}
          disabled={uploading || field.disabled}
        />
      </label>
      {safeValue && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
          {safeValue.startsWith("data:image") || safeValue.match(/\.(jpeg|jpg|gif|png)$/) ? (
            <ImageIcon size={16} className="text-indigo-500" />
          ) : (
            <FileText size={16} className="text-gray-500" />
          )}
          <span className="text-xs text-gray-600 truncate flex-1">已上传文件</span>
          <button
            onClick={() => !field.disabled && onChange("")}
            className={`text-red-400 hover:text-red-600 ${field.disabled ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={field.disabled}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadWidget;
