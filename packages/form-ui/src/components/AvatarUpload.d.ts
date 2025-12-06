import React from "react";
export interface AvatarUploadProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    onUpload?: (file: File) => Promise<string>;
}
export declare const AvatarUpload: React.FC<AvatarUploadProps>;
//# sourceMappingURL=AvatarUpload.d.ts.map