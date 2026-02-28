import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    weight: bigint;
    duration: bigint;
    name: string;
    reps: bigint;
    sets: bigint;
    notes: string;
}
export interface PhaseExerciseLog {
    id: LogEntryId;
    weight: bigint;
    exerciseId: ExerciseId;
    date: Time;
    reps: bigint;
    sets: bigint;
}
export type Time = bigint;
export interface WorkoutSession {
    day: DayOfWeek;
    weight: bigint;
    duration: bigint;
    date: Time;
    reps: bigint;
    sets: bigint;
    notes: string;
    exerciseName: string;
}
export type PhaseId = bigint;
export interface UserWorkoutTemplateView {
    id: bigint;
    template: WorkoutTemplateView;
}
export type LogEntryId = bigint;
export interface Phase {
    id: PhaseId;
    owner: Principal;
    name: string;
}
export type ExerciseId = bigint;
export interface WorkoutTemplateView {
    days: Array<DayOfWeek>;
    name: string;
    exercises: Array<Exercise>;
}
export interface UserProfile {
    name: string;
    weightUnit: WeightUnit;
}
export interface PhaseExercise {
    id: ExerciseId;
    name: string;
    phaseId: PhaseId;
}
export enum DayOfWeek {
    tuesday = "tuesday",
    wednesday = "wednesday",
    saturday = "saturday",
    thursday = "thursday",
    sunday = "sunday",
    friday = "friday",
    monday = "monday"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WeightUnit {
    kg = "kg",
    lbs = "lbs"
}
export interface backendInterface {
    addExerciseToPhase(phaseId: PhaseId, name: string): Promise<ExerciseId>;
    addExerciseToTemplate(templateId: bigint, exercise: Exercise): Promise<boolean>;
    addWorkout(session: WorkoutSession): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPhase(name: string): Promise<PhaseId>;
    createWorkoutTemplate(template: WorkoutTemplateView): Promise<boolean>;
    deletePhase(phaseId: PhaseId): Promise<boolean>;
    getAllPhases(): Promise<Array<Phase>>;
    getAllWorkoutTemplates(): Promise<Array<UserWorkoutTemplateView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExerciseLogs(exerciseId: ExerciseId): Promise<Array<PhaseExerciseLog>>;
    getExercisesForPhase(phaseId: PhaseId): Promise<Array<PhaseExercise>>;
    getOwnWorkoutHistory(): Promise<Array<WorkoutSession>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserWorkoutHistory(user: Principal): Promise<Array<WorkoutSession>>;
    getWorkoutSessionsByDateRange(startDate: Time, endDate: Time): Promise<Array<WorkoutSession>>;
    getWorkoutSessionsByDay(day: DayOfWeek): Promise<Array<WorkoutSession>>;
    getWorkoutTemplatesByDay(day: DayOfWeek): Promise<Array<UserWorkoutTemplateView>>;
    isCallerAdmin(): Promise<boolean>;
    logExercise(exerciseId: ExerciseId, sets: bigint, reps: bigint, weight: bigint): Promise<LogEntryId>;
    removeExercise(exerciseId: ExerciseId): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
