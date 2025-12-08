import type { Field } from "../types";
/**
 * Runner store state shape.
 *
 * 表单运行器状态结构，包含当前表单数据、校验错误以及更新和校验方法。
 */
interface RunnerState {
    formData: Record<string, any>;
    errors: Record<string, string>;
    setFormData: (data: Record<string, any>) => void;
    setErrors: (errors: Record<string, string>) => void;
    updateField: (id: string, value: any) => void;
    validate: (fields: Field[]) => boolean;
}
/**
 * Global state store for the form runner.
 *
 * 表单运行阶段的全局 Zustand store：
 * - 维护 `formData` 和字段级别的错误信息；
 * - 提供 `updateField` 快速更新单个字段并清理对应错误；
 * - 提供 `validate` 方法按字段规则进行校验。
 *
 * @remarks
 * 该 store 与 `useBuilderStore` 解耦，可以单独在运行环境中使用。
 */
export declare const useRunnerStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RunnerState>>;
export {};
//# sourceMappingURL=useRunnerStore.d.ts.map