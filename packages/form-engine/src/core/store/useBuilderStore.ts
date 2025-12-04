import { create } from 'zustand';
import { Field } from '../schema/types';

interface BuilderState {
  fields: Field[];
  selectedFieldId: string | null;
  editingSubFieldId: string | null;
  setFields: (fields: Field[]) => void;
  setSelectedFieldId: (id: string | null) => void;
  setEditingSubFieldId: (id: string | null) => void;
  addField: (field: Field) => void;
  updateField: (id: string, key: keyof Field, value: any) => void;
  removeField: (id: string) => void;
  addSubField: (parentId: string, subField: Field) => void;
  updateSubField: (parentId: string, subId: string, key: keyof Field, value: any) => void;
  removeSubField: (parentId: string, subId: string) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  fields: [],
  selectedFieldId: null,
  editingSubFieldId: null,
  setFields: (fields) => set({ fields }),
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),
  setEditingSubFieldId: (id) => set({ editingSubFieldId: id }),
  addField: (field) => set((state) => ({ fields: [...state.fields, field], selectedFieldId: field.id, editingSubFieldId: null })),
  updateField: (id, key, value) => set((state) => ({
    fields: state.fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
    selectedFieldId: key === 'id' && state.selectedFieldId === id ? value : state.selectedFieldId
  })),
  removeField: (id) => set((state) => ({
    fields: state.fields.filter((f) => f.id !== id),
    selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    editingSubFieldId: state.editingSubFieldId // Reset if needed, but simple for now
  })),
  addSubField: (parentId, subField) => set((state) => ({
    fields: state.fields.map((f) => (f.id === parentId ? { ...f, subFields: [...(f.subFields || []), subField] } : f))
  })),
  updateSubField: (parentId, subId, key, value) => set((state) => ({
    fields: state.fields.map((f) => {
      if (f.id === parentId && f.subFields) {
        return {
          ...f,
          subFields: f.subFields.map((sf) => (sf.id === subId ? { ...sf, [key]: value } : sf))
        };
      }
      return f;
    }),
    editingSubFieldId: key === 'id' && state.editingSubFieldId === subId ? value : state.editingSubFieldId
  })),
  removeSubField: (parentId, subId) => set((state) => ({
    fields: state.fields.map((f) => {
      if (f.id === parentId && f.subFields) {
        return { ...f, subFields: f.subFields.filter((sf) => sf.id !== subId) };
      }
      return f;
    }),
    editingSubFieldId: state.editingSubFieldId === subId ? null : state.editingSubFieldId
  })),
}));
