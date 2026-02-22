import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type OldWorkoutSession = {
    date : Time.Time;
    exerciseName : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat;
    duration : Nat;
    notes : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userWorkouts : Map.Map<Principal, List.List<OldWorkoutSession>>;
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

  type NewWorkoutSession = {
    day : DayOfWeek;
    date : Time.Time;
    exerciseName : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat;
    duration : Nat;
    notes : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userWorkouts : Map.Map<Principal, List.List<NewWorkoutSession>>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserWorkouts = old.userWorkouts.map<Principal, List.List<OldWorkoutSession>, List.List<NewWorkoutSession>>(
      func(_userId, oldSessions) {
        oldSessions.map<OldWorkoutSession, NewWorkoutSession>(
          func(oldSession) {
            {
              oldSession with day = #monday;
            };
          }
        );
      }
    );
    { old with userWorkouts = newUserWorkouts };
  };
};
