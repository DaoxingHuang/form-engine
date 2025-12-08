import React from "react";
/**
 * Props for the {@link DocumentUpload} component.
 */
export interface DocumentUploadProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    label?: string;
}
/**
 * Compact upload control specialized for single document selection.
 *
 * It displays a label, a short helper text and a primary button that opens the
 * native file picker. When a file is selected, the component reports the
 * chosen file name via `onChange`.
 */
export declare const DocumentUpload: React.FC<DocumentUploadProps>;
//# sourceMappingURL=DocumentUpload.d.ts.map