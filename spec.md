# Logmeiin – Workout Log Backend Sync

## Current State
- Workout templates are stored in the backend (Internet Identity gated) and sync across devices.
- Workout logs are stored in browser localStorage only — they are NOT synced across devices.
- The WorkoutLog type tracks: id, templateId, templateName, createdAt, completedAt, and an array of exercises with planned values and actual values (sets, reps, weight, time, notes).
- Frontend uses `useLocalLogs` / `localStorageLogs.ts` for all log operations.
- Login is via Internet Identity; the `useAuth` and `useActor` hooks are already in place.

## Requested Changes (Diff)

### Add
- Backend Motoko types: `LogExercise` (name, plannedSets, plannedReps, plannedWeight, plannedTime, actualSets as Opt Nat, actualReps as Opt Nat, actualWeight as Opt Nat, actualTime as Opt Nat, notes), `WorkoutLog` (id, templateId, templateName, createdAt as Time, completedAt as Opt Time, exercises as List<LogExercise>), `WorkoutLogView` (same but with arrays).
- Backend functions: `createWorkoutLog(templateId, templateName, exercises)`, `getAllWorkoutLogs()`, `updateWorkoutLogActuals(logId, exercises)`, `markWorkoutLogComplete(logId)`, `deleteWorkoutLog(logId)`.
- Frontend hooks: `useBackendLogs` (fetch), `useCreateBackendLog`, `useUpdateBackendLog`, `useMarkBackendLogComplete`, `useDeleteBackendLog`.
- `useSmartLogs.ts` — routes to backend when authenticated, localStorage when not.
- Login gate on WorkoutLogPage: if not authenticated, show a prompt to log in.

### Modify
- `WorkoutLogPage.tsx` — use `useSmartLogs` instead of `useLocalLogs`; show login prompt when not authenticated.
- `LogEntryForm.tsx` — use smart update/complete mutations instead of local ones.
- `LocalTemplateDetailView.tsx` or wherever log creation is triggered on template creation — use smart create log.
- `backend.d.ts` — add new log types and function signatures.

### Remove
- Nothing removed; localStorage fallback is kept for unauthenticated users.

## Implementation Plan
1. Add WorkoutLog types and CRUD functions to `main.mo`.
2. Regenerate `backend.d.ts`.
3. Create `useBackendLogs.ts` hooks.
4. Create `useSmartLogs.ts` routing hook.
5. Update `WorkoutLogPage.tsx` to use smart hooks and show login gate when unauthenticated.
6. Update `LogEntryForm.tsx` to use smart mutations.
7. Find log creation call sites (template creation) and wire to smart create log.
