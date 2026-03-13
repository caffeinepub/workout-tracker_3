import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  type WeightUnit = {
    #lbs;
    #kg;
  };

  type UserProfile = {
    name : Text;
    weightUnit : WeightUnit;
  };

  type PhaseId = Nat;
  type ExerciseId = Nat;
  type LogEntryId = Nat;

  type Phase = {
    id : PhaseId;
    name : Text;
    owner : Principal;
  };

  type PhaseExercise = {
    id : ExerciseId;
    phaseId : PhaseId;
    name : Text;
  };

  type PhaseExerciseLog = {
    id : LogEntryId;
    exerciseId : ExerciseId;
    date : Time.Time;
    sets : Nat;
    reps : Nat;
    weight : Nat;
  };

  type WorkoutSession = {
    day : DayOfWeek;
    date : Time.Time;
    exerciseName : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat;
    duration : Nat;
    notes : Text;
  };

  type Duration = {
    value : Nat;
    unit : DurationUnit;
  };

  type DurationUnit = {
    #minutes;
    #seconds;
  };

  type Exercise = {
    name : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat;
    duration : Duration;
    notes : Text;
  };

  type WorkoutTemplatePersistent = {
    name : Text;
    exercises : List.List<Exercise>;
    days : Set.Set<DayOfWeek>;
  };

  type WorkoutTemplateView = {
    name : Text;
    exercises : [Exercise];
    days : [DayOfWeek];
  };

  type UserWorkoutTemplatePersistent = {
    id : Nat;
    creator : Principal;
    template : WorkoutTemplatePersistent;
  };

  type UserWorkoutTemplateView = {
    id : Nat;
    template : WorkoutTemplateView;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userWorkouts : Map.Map<Principal, List.List<WorkoutSession>>;
    workoutTemplates : Map.Map<Principal, List.List<UserWorkoutTemplatePersistent>>;
    phases : Map.Map<Principal, List.List<Phase>>;
    phaseExercises : Map.Map<Principal, List.List<PhaseExercise>>;
    exerciseLogs : Map.Map<Principal, List.List<PhaseExerciseLog>>;
    nextTemplateId : Nat;
    nextPhaseId : Nat;
    nextExerciseId : Nat;
    nextLogEntryId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userWorkouts : Map.Map<Principal, List.List<WorkoutSession>>;
    workoutTemplates : Map.Map<Principal, List.List<UserWorkoutTemplatePersistent>>;
    workoutLogs : Map.Map<Principal, List.List<WorkoutLogPersistent>>;
    phases : Map.Map<Principal, List.List<Phase>>;
    phaseExercises : Map.Map<Principal, List.List<PhaseExercise>>;
    exerciseLogs : Map.Map<Principal, List.List<PhaseExerciseLog>>;
    nextTemplateId : Nat;
    nextWorkoutLogId : Nat;
    nextPhaseId : Nat;
    nextExerciseId : Nat;
    nextLogEntryId : Nat;
  };

  type LogExercise = {
    name : Text;
    plannedSets : Nat;
    plannedReps : Nat;
    plannedWeight : Nat;
    plannedTime : Nat;
    actualSets : ?Nat;
    actualReps : ?Nat;
    actualWeight : ?Nat;
    actualTime : ?Nat;
    notes : Text;
  };

  type WorkoutLogPersistent = {
    id : Nat;
    templateId : Text;
    templateName : Text;
    createdAt : Time.Time;
    completedAt : ?Time.Time;
    exercises : List.List<LogExercise>;
  };

  public func run(old : OldActor) : NewActor {
    { old with workoutLogs = Map.empty<Principal, List.List<WorkoutLogPersistent>>(); nextWorkoutLogId = 0 };
  };
};
