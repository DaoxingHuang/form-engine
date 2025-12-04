import { Field } from "@chameleon/engine-core";
import { FileText, Image as ImageIcon, Upload, X } from "lucide-react";
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
