import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  public type WorkoutSession = {
    day : DayOfWeek;
    date : Time.Time;
    exerciseName : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat;
    duration : Nat;
    notes : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userWorkouts = Map.empty<Principal, List.List<WorkoutSession>>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Workout Functions
  public shared ({ caller }) func addWorkout(session : WorkoutSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add workouts");
    };

    let currentSessions = switch (userWorkouts.get(caller)) {
      case (null) { List.empty<WorkoutSession>() };
      case (?sessions) { sessions };
    };

    currentSessions.add(session);
    userWorkouts.add(caller, currentSessions);
  };

  public query ({ caller }) func getOwnWorkoutHistory() : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout history");
    };
    switch (userWorkouts.get(caller)) {
      case (null) { [] };
      case (?sessions) { sessions.toArray() };
    };
  };

  public query ({ caller }) func getUserWorkoutHistory(user : Principal) : async [WorkoutSession] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access other users' data");
    };
    switch (userWorkouts.get(user)) {
      case (null) { [] };
      case (?sessions) { sessions.toArray() };
    };
  };

  public query ({ caller }) func getWorkoutSessionsByDay(day : DayOfWeek) : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout sessions by day");
    };

    switch (userWorkouts.get(caller)) {
      case (null) { [] };
      case (?sessions) {
        sessions.filter(func(session) { session.day == day }).toArray();
      };
    };
  };

  public query ({ caller }) func getWorkoutSessionsByDateRange(startDate : Time.Time, endDate : Time.Time) : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout sessions by date range");
    };

    switch (userWorkouts.get(caller)) {
      case (null) { [] };
      case (?sessions) {
        sessions.filter(
          func(session) {
            session.date >= startDate and session.date <= endDate
          }
        ).toArray();
      };
    };
  };
};
