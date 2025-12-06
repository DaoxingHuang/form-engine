import { create } from "zustand";
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
export const useBuilderStore = create<BuilderState>((set) => ({
  fields: [],
  selectedFieldId: null,
  editingSubFieldId: null,
  setFields: (fields) => set({ fields }),
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),
  setEditingSubFieldId: (id) => set({ editingSubFieldId: id }),
  addField: (field) =>
    set((state) => ({ fields: [...state.fields, field], selectedFieldId: field.id, editingSubFieldId: null })),
  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      selectedFieldId: updates.id !== undefined && state.selectedFieldId === id ? updates.id : state.selectedFieldId
    })),
  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      editingSubFieldId: state.editingSubFieldId // Reset if needed, but simple for now
    })),
  addSubField: (parentId, subField) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === parentId ? { ...f, subFields: [...(f.subFields || []), subField] } : f))
    })),
  updateSubField: (parentId, subId, updates) =>
    set((state) => ({
      fields: state.fields.map((f) => {
        if (f.id === parentId && f.subFields) {
          return {
            ...f,
            subFields: f.subFields.map((sf) => (sf.id === subId ? { ...sf, ...updates } : sf))
          };
        }
        return f;
      }),
      editingSubFieldId:
        updates.id !== undefined && state.editingSubFieldId === subId ? updates.id : state.editingSubFieldId
    })),
  removeSubField: (parentId, subId) =>
    set((state) => ({
      fields: state.fields.map((f) => {
        if (f.id === parentId && f.subFields) {
          return { ...f, subFields: f.subFields.filter((sf) => sf.id !== subId) };
        }
        return f;
      }),
      editingSubFieldId: state.editingSubFieldId === subId ? null : state.editingSubFieldId
    }))
}));
