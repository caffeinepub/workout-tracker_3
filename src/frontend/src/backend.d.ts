import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface UserProfile {
    name: string;
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
export interface backendInterface {
    addWorkout(session: WorkoutSession): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOwnWorkoutHistory(): Promise<Array<WorkoutSession>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserWorkoutHistory(user: Principal): Promise<Array<WorkoutSession>>;
    getWorkoutSessionsByDateRange(startDate: Time, endDate: Time): Promise<Array<WorkoutSession>>;
    getWorkoutSessionsByDay(day: DayOfWeek): Promise<Array<WorkoutSession>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
