import { type ClassValue } from "clsx";
import React from "react";
export declare function cn(...inputs: ClassValue[]): string;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=base.d.ts.map