import { createLogFromTemplate } from "./localStorageLogs";

export interface TemplateExercise {
  name: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeight: number;
  plannedTime: number; // total seconds
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  createdAt: string; // ISO string
  exercises: TemplateExercise[];
}

const STORAGE_KEY = "workout_templates_local";

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__ls_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/** Ensure a value is a finite, non-negative number; throw with a descriptive message if not. */
function validateNonNegativeNumber(value: unknown, fieldName: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    throw new Error(`${fieldName} must be a valid number (received: ${value})`);
  }
  if (n < 0) {
    throw new Error(
      `${fieldName} must be a non-negative number (received: ${n})`,
    );
  }
  return n;
}

export function getAllTemplates(): WorkoutTemplate[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutTemplate[];
    // Sanitize: ensure numeric fields are valid numbers (guard against corrupted data)
    return parsed.map((t) => ({
      ...t,
      exercises: (t.exercises ?? []).map((ex) => ({
        ...ex,
        plannedSets: Number.isFinite(Number(ex.plannedSets))
          ? Number(ex.plannedSets)
          : 0,
        plannedReps: Number.isFinite(Number(ex.plannedReps))
          ? Number(ex.plannedReps)
          : 0,
        plannedWeight: Number.isFinite(Number(ex.plannedWeight))
          ? Number(ex.plannedWeight)
          : 0,
        plannedTime: Number.isFinite(Number(ex.plannedTime))
          ? Number(ex.plannedTime)
          : 0,
        notes: typeof ex.notes === "string" ? ex.notes : "",
      })),
    }));
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
  exercises: TemplateExercise[],
): WorkoutTemplate {
  if (!isLocalStorageAvailable()) {
    throw new Error("localStorage is not available in this browser");
  }

  // Validate template name
  if (!name || !name.trim()) {
    throw new Error("Template name is required");
  }

  // Validate exercises
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new Error("At least one exercise is required");
  }

  // Validate each exercise's numeric fields
  const sanitizedExercises: TemplateExercise[] = exercises.map((ex, i) => {
    const label = `Exercise ${i + 1} ("${ex.name || "unnamed"}")`;
    if (!ex.name || !ex.name.trim()) {
      throw new Error(`Exercise ${i + 1} must have a name`);
    }
    return {
      name: ex.name.trim(),
      plannedSets: validateNonNegativeNumber(ex.plannedSets, `${label} sets`),
      plannedReps: validateNonNegativeNumber(ex.plannedReps, `${label} reps`),
      plannedWeight: validateNonNegativeNumber(
        ex.plannedWeight,
        `${label} weight`,
      ),
      plannedTime: validateNonNegativeNumber(
        ex.plannedTime,
        `${label} duration`,
      ),
      notes: ex.notes?.trim() ?? "",
    };
  });

  const template: WorkoutTemplate = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    exercises: sanitizedExercises,
  };

  const templates = getAllTemplates();
  templates.push(template);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    throw new Error("Failed to save template: storage quota may be exceeded");
  }

  // Auto-generate a corresponding log entry (non-fatal if this fails)
  try {
    createLogFromTemplate(template);
  } catch {
    // Log creation failure should not block template creation
  }

  return template;
}

export function updateTemplate(
  id: string,
  updates: Partial<Pick<WorkoutTemplate, "name" | "exercises">>,
): WorkoutTemplate | null {
  if (!isLocalStorageAvailable()) return null;
  const templates = getAllTemplates();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  templates[idx] = { ...templates[idx], ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    throw new Error("Failed to update template: storage quota may be exceeded");
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
