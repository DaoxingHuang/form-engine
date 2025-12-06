import type { Field } from "../types";
/**
 * Builder store state shape.
 *
 * 表单构建器状态结构，包含字段列表、选中状态以及增删改字段的操作。
 */
interface BuilderState {
    fields: Field[];
    selectedFieldId: string | null;
    editingSubFieldId: string | null;
    setFields: (fields: Field[]) => void;
    setSelectedFieldId: (id: string | null) => void;
    setEditingSubFieldId: (id: string | null) => void;
    addField: (field: Field) => void;
    updateField: (id: string, updates: Partial<Field>) => void;
    removeField: (id: string) => void;
    addSubField: (parentId: string, subField: Field) => void;
    updateSubField: (parentId: string, subId: string, updates: Partial<Field>) => void;
    removeSubField: (parentId: string, subId: string) => void;
}
/**
 * Global state store for the form builder.
 *
 * 表单编辑器的全局 Zustand store：
 * - 负责管理字段列表及其子字段；
 * - 跟踪当前选中的字段和正在编辑的子字段；
 * - 提供一组 immutable 风格的更新函数，方便在 UI 中直接调用。
 *
 * @remarks
 * 此 store 在整个应用中是单例的，通常通过 `useBuilderStore()` 在 React 组件中直接访问。
 */
export declare const useBuilderStore: import("zustand").UseBoundStore<import("zustand").StoreApi<BuilderState>>;
export {};
//# sourceMappingURL=useBuilderStore.d.ts.map