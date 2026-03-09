export interface LogExercise {
  name: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeight: number;
  plannedTime: number;
  actualSets: number | null;
  actualReps: number | null;
  actualWeight: number | null;
  actualTime: number | null;
  notes: string;
}

export interface WorkoutLog {
  id: string;
  templateId: string;
  templateName: string;
  createdAt: string; // ISO string
  completedAt: string | null; // ISO string or null
  exercises: LogExercise[];
}

const STORAGE_KEY = "workout_logs_local";

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

export function getAllLogs(): WorkoutLog[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutLog[];
    // Ensure notes field exists on all exercises (for backwards compat)
    return parsed.map((log) => ({
      ...log,
      exercises: (log.exercises ?? []).map((ex) => ({
        ...ex,
        notes: typeof ex.notes === "string" ? ex.notes : "",
      })),
    }));
  } catch {
    return [];
  }
}

export function getLogById(id: string): WorkoutLog | null {
  const logs = getAllLogs();
  return logs.find((l) => l.id === id) ?? null;
}

export function createLogFromTemplate(template: {
  id: string;
  name: string;
  exercises: Array<{
    name: string;
    plannedSets: number;
    plannedReps: number;
    plannedWeight: number;
    plannedTime: number;
  }>;
}): WorkoutLog {
  const log: WorkoutLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    templateId: template.id,
    templateName: template.name,
    createdAt: new Date().toISOString(),
    completedAt: null,
    exercises: template.exercises.map((ex) => ({
      name: ex.name,
      plannedSets: ex.plannedSets,
      plannedReps: ex.plannedReps,
      plannedWeight: ex.plannedWeight,
      plannedTime: ex.plannedTime,
      actualSets: null,
      actualReps: null,
      actualWeight: null,
      actualTime: null,
      notes: "",
    })),
  };
  if (!isLocalStorageAvailable()) return log;
  const logs = getAllLogs();
  logs.push(log);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // silently fail if quota exceeded
  }
  return log;
}

export function updateLogActuals(
  logId: string,
  exercises: LogExercise[],
): WorkoutLog | null {
  if (!isLocalStorageAvailable()) return null;
  const logs = getAllLogs();
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx === -1) return null;
  logs[idx] = { ...logs[idx], exercises };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    throw new Error("Failed to update log: storage quota may be exceeded");
  }
  return logs[idx];
}

export function markLogComplete(logId: string): WorkoutLog | null {
  if (!isLocalStorageAvailable()) return null;
  const logs = getAllLogs();
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx === -1) return null;
  logs[idx] = { ...logs[idx], completedAt: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    throw new Error("Failed to mark log complete");
  }
  return logs[idx];
}

export function deleteLog(id: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  const logs = getAllLogs();
  const filtered = logs.filter((l) => l.id !== id);
  if (filtered.length === logs.length) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    return false;
  }
  return true;
}
