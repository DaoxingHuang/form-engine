import { AvatarUpload, DocumentUpload, FileUpload } from "@origami/form-ui";
import type { RunnerWidgetComponent } from "../../types";

const UploadWidget: RunnerWidgetComponent = ({ field, value, onChange }) => {
  const safeValue = value === undefined || value === null ? "" : value;
  const lowerId = field.id.toLowerCase();

  // 1. Avatar Upload Style
  if (lowerId.includes("avatar") || lowerId.includes("photo")) {
    return (
      <div>
        <AvatarUpload value={safeValue as string} onChange={onChange} disabled={field.disabled} />
      </div>
    );
  }

  // 2. Contract/Document Upload Style
  if (lowerId.includes("contract") || lowerId.includes("doc") || lowerId.includes("file")) {
    return (
      <div className="space-y-1">
        <DocumentUpload value={safeValue as string} onChange={onChange} disabled={field.disabled} />
      </div>
    );
  }

  // 3. Default Upload Style
  return (
    <div className="space-y-2">
      <FileUpload
        value={safeValue as string}
        onChange={onChange}
        accept={field.accept}
        disabled={field.disabled}
        maxSize={field.maxFileSize ? field.maxFileSize / 1024 : undefined}
      />
    </div>
  );
};

export default UploadWidget;
