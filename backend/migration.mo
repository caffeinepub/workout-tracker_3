import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";

module {
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

  type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
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

  type OldUserWorkoutTemplatePersistent = {
    id : Nat;
    template : WorkoutTemplatePersistent;
  };

  // New persistent template type with creator
  type NewUserWorkoutTemplatePersistent = {
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
    workoutTemplates : Map.Map<Principal, List.List<OldUserWorkoutTemplatePersistent>>;
    phases : Map.Map<Principal, List.List<Phase>>;
    phaseExercises : Map.Map<Principal, List.List<PhaseExercise>>;
    exerciseLogs : Map.Map<Principal, List.List<PhaseExerciseLog>>;
    nextTemplateId : Nat;
    nextPhaseId : Nat;
    nextExerciseId : Nat;
    nextLogEntryId : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userWorkouts : Map.Map<Principal, List.List<WorkoutSession>>;
    workoutTemplates : Map.Map<Principal, List.List<NewUserWorkoutTemplatePersistent>>;
    phases : Map.Map<Principal, List.List<Phase>>;
    phaseExercises : Map.Map<Principal, List.List<PhaseExercise>>;
    exerciseLogs : Map.Map<Principal, List.List<PhaseExerciseLog>>;
    nextTemplateId : Nat;
    nextPhaseId : Nat;
    nextExerciseId : Nat;
    nextLogEntryId : Nat;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    // Convert all old templates to the new format by adding the creator field
    let newWorkoutTemplates = old.workoutTemplates.map<Principal, List.List<OldUserWorkoutTemplatePersistent>, List.List<NewUserWorkoutTemplatePersistent>>(
      func(creator, oldList) {
        oldList.map<OldUserWorkoutTemplatePersistent, NewUserWorkoutTemplatePersistent>(
          func(oldTpl) {
            {
              oldTpl with
              creator;
            };
          }
        );
      }
    );

    { old with workoutTemplates = newWorkoutTemplates };
  };
};
