import { createLogFromTemplate } from './localStorageLogs';

export interface TemplateExercise {
  name: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeight: number;
  plannedTime: number; // minutes
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  createdAt: string; // ISO string
  exercises: TemplateExercise[];
}

const STORAGE_KEY = 'workout_templates_local';

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__ls_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getAllTemplates(): WorkoutTemplate[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutTemplate[];
  } catch {
    return [];
  }
}

export function getTemplateById(id: string): WorkoutTemplate | null {
  const templates = getAllTemplates();
  return templates.find((t) => t.id === id) ?? null;
}

export function createTemplate(
  name: string,
  exercises: TemplateExercise[]
): WorkoutTemplate {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }
  const template: WorkoutTemplate = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    createdAt: new Date().toISOString(),
    exercises,
  };
  const templates = getAllTemplates();
  templates.push(template);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    throw new Error('Failed to save template: storage quota may be exceeded');
  }
  // Auto-generate a corresponding log entry
  createLogFromTemplate(template);
  return template;
}

export function updateTemplate(
  id: string,
  updates: Partial<Pick<WorkoutTemplate, 'name' | 'exercises'>>
): WorkoutTemplate | null {
  if (!isLocalStorageAvailable()) return null;
  const templates = getAllTemplates();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  templates[idx] = { ...templates[idx], ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    throw new Error('Failed to update template: storage quota may be exceeded');
  }
  return templates[idx];
}

export function deleteTemplate(id: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  const templates = getAllTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    return false;
  }
  return true;
}
