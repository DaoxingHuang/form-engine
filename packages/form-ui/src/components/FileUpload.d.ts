import React from "react";
/**
 * Props for the {@link FileUpload} component.
 */
export interface FileUploadProps {
    value?: string;
    onChange?: (value: string) => void;
    accept?: string;
    maxSize?: number;
    disabled?: boolean;
    className?: string;
    uploading?: boolean;
    onUpload?: (file: File) => Promise<string>;
}
/**
 * Generic file upload component that supports size limits and async upload.
 *
 * When `onUpload` is provided, the component will call it with the selected
 * file and expects a URL (or identifier) to be returned. Otherwise it falls
 * back to a local `URL.createObjectURL` preview.
 */
export declare const FileUpload: React.FC<FileUploadProps>;
//# sourceMappingURL=FileUpload.d.ts.map