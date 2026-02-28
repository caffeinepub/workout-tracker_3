import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Migration "migration";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration function to transform actor state after upgrade
(with migration = Migration.run)
actor {
  type WeightUnit = {
    #lbs;
    #kg;
  };

  public type UserProfile = {
    name : Text;
    weightUnit : WeightUnit;
  };

  public type PhaseId = Nat;
  public type ExerciseId = Nat;
  public type LogEntryId = Nat;

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

  public type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  func compareDayOfWeek(a : DayOfWeek, b : DayOfWeek) : Order.Order {
    switch (a, b) {
      case (#monday, #monday) { #equal };
      case (#monday, _) { #less };
      case (_, #monday) { #greater };

      case (#tuesday, #tuesday) { #equal };
      case (#tuesday, _) { #less };
      case (_, #tuesday) { #greater };

      case (#wednesday, #wednesday) { #equal };
      case (#wednesday, _) { #less };
      case (_, #wednesday) { #greater };

      case (#thursday, #thursday) { #equal };
      case (#thursday, _) { #less };
      case (_, #thursday) { #greater };

      case (#friday, #friday) { #equal };
      case (#friday, _) { #less };
      case (_, #friday) { #greater };

      case (#saturday, #saturday) { #equal };
      case (#saturday, _) { #less };
      case (_, #saturday) { #greater };

      case (#sunday, #sunday) { #equal };
    };
  };

  type Duration = {
    value : Nat;
    unit : DurationUnit;
  };

  type DurationUnit = {
    #minutes;
    #seconds;
  };

  public type Exercise = {
    name : Text;
    sets : Nat;
    reps : Nat;
    weight : Nat;
    duration : Duration;
    notes : Text;
  };

  public type WorkoutTemplatePersistent = {
    name : Text;
    exercises : List.List<Exercise>;
    days : Set.Set<DayOfWeek>;
  };

  public type WorkoutTemplateView = {
    name : Text;
    exercises : [Exercise];
    days : [DayOfWeek];
  };

  public type UserWorkoutTemplatePersistent = {
    id : Nat;
    creator : Principal;
    template : WorkoutTemplatePersistent;
  };

  public type UserWorkoutTemplateView = {
    id : Nat;
    template : WorkoutTemplateView;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userWorkouts = Map.empty<Principal, List.List<WorkoutSession>>();
  let workoutTemplates = Map.empty<Principal, List.List<UserWorkoutTemplatePersistent>>();
  let phases = Map.empty<Principal, List.List<Phase>>();
  let phaseExercises = Map.empty<Principal, List.List<PhaseExercise>>();
  let exerciseLogs = Map.empty<Principal, List.List<PhaseExerciseLog>>();
  var nextTemplateId = 0;
  var nextPhaseId = 0;
  var nextExerciseId = 0;
  var nextLogEntryId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func toWorkoutTemplateView(persistentTemplate : WorkoutTemplatePersistent) : WorkoutTemplateView {
    {
      persistentTemplate with
      exercises = persistentTemplate.exercises.toArray();
      days = persistentTemplate.days.toArray();
    };
  };

  func toUserWorkoutTemplateView(persistentTemplate : UserWorkoutTemplatePersistent) : UserWorkoutTemplateView {
    {
      persistentTemplate with
      template = toWorkoutTemplateView(persistentTemplate.template);
    };
  };

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

  // Workout Template Functions
  public shared ({ caller }) func createWorkoutTemplate(template : WorkoutTemplateView) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create templates");
    };

    let persistentTemplate : WorkoutTemplatePersistent = {
      template with
      exercises = List.fromArray<Exercise>(template.exercises);
      days = Set.fromArray<DayOfWeek>(template.days, compareDayOfWeek);
    };

    let userTemplate : UserWorkoutTemplatePersistent = {
      id = nextTemplateId;
      creator = caller;
      template = persistentTemplate;
    };

    let currentTemplates = switch (workoutTemplates.get(caller)) {
      case (null) { List.empty<UserWorkoutTemplatePersistent>() };
      case (?templates) { templates };
    };

    currentTemplates.add(userTemplate);
    workoutTemplates.add(caller, currentTemplates);
    nextTemplateId += 1;

    true;
  };

  public shared ({ caller }) func addExerciseToTemplate(templateId : Nat, exercise : Exercise) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add exercises to templates");
    };

    switch (workoutTemplates.get(caller)) {
      case (null) { false };
      case (?templates) {
        var found = false;
        let updatedTemplates = templates.map<UserWorkoutTemplatePersistent, UserWorkoutTemplatePersistent>(
          func(tpl) {
            if (tpl.id == templateId) {
              let newExercises = List.fromArray<Exercise>(tpl.template.exercises.toArray());
              newExercises.add(exercise);
              found := true;
              {
                tpl with
                template = { tpl.template with exercises = newExercises };
              };
            } else { tpl };
          }
        );

        if (found) {
          workoutTemplates.add(caller, updatedTemplates);
          true;
        } else { false };
      };
    };
  };

  public query ({ caller }) func getAllWorkoutTemplates() : async [UserWorkoutTemplateView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access templates");
    };

    let currentTemplates = switch (workoutTemplates.get(caller)) {
      case (null) { List.empty<UserWorkoutTemplatePersistent>() };
      case (?templates) { templates };
    };

    currentTemplates.map<UserWorkoutTemplatePersistent, UserWorkoutTemplateView>(toUserWorkoutTemplateView).toArray();
  };

  public query ({ caller }) func getWorkoutTemplatesByDay(day : DayOfWeek) : async [UserWorkoutTemplateView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access templates");
    };

    let currentTemplates = switch (workoutTemplates.get(caller)) {
      case (null) { List.empty<UserWorkoutTemplatePersistent>() };
      case (?templates) { templates };
    };

    currentTemplates.filter(
      func(userTemplate) {
        userTemplate.template.days.toArray().any(func(d) { d == day });
      }
    ).map<UserWorkoutTemplatePersistent, UserWorkoutTemplateView>(toUserWorkoutTemplateView).toArray();
  };

  // New: Update Template Name
  public shared ({ caller }) func updateTemplateName(templateId : Nat, newName : Text) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update templates");
    };

    let templatesOpt = workoutTemplates.get(caller);
    switch (templatesOpt) {
      case (null) {
        ?"No templates found for caller";
      };
      case (?templates) {
        var templateFound = false;
        let updatedTemplates = templates.map<UserWorkoutTemplatePersistent, UserWorkoutTemplatePersistent>(
          func(tpl) {
            if (tpl.id == templateId and tpl.creator == caller) {
              templateFound := true;
              {
                tpl with template = {
                  tpl.template with name = newName;
                };
              };
            } else { tpl };
          }
        );

        if (templateFound) {
          workoutTemplates.add(caller, updatedTemplates);
          null;
        } else {
          ?"Template not found";
        };
      };
    };
  };

  // New: Delete Template
  public shared ({ caller }) func deleteTemplate(templateId : Nat) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete templates");
    };

    let templatesOpt = workoutTemplates.get(caller);
    switch (templatesOpt) {
      case (null) {
        ?"No templates found for caller";
      };
      case (?templates) {
        let filteredTemplates = templates.filter(func(tpl) { tpl.id != templateId or tpl.creator != caller });

        if (filteredTemplates.size() < templates.size()) {
          workoutTemplates.add(caller, filteredTemplates);
          null;
        } else {
          ?"Template not found";
        };
      };
    };
  };

  // Phase Management Functions
  public shared ({ caller }) func createPhase(name : Text) : async PhaseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create phases");
    };

    let phase : Phase = {
      id = nextPhaseId;
      name;
      owner = caller;
    };

    let currentPhases = switch (phases.get(caller)) {
      case (null) { List.empty<Phase>() };
      case (?phases) { phases };
    };

    currentPhases.add(phase);
    phases.add(caller, currentPhases);
    let id = nextPhaseId;
    nextPhaseId += 1;
    id;
  };

  public query ({ caller }) func getAllPhases() : async [Phase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access phases");
    };

    switch (phases.get(caller)) {
      case (null) { [] };
      case (?phasesList) { phasesList.toArray() };
    };
  };

  public shared ({ caller }) func deletePhase(phaseId : PhaseId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete phases");
    };

    switch (phases.get(caller)) {
      case (null) { false };
      case (?phasesList) {
        let updatedPhases = phasesList.filter(func(phase) { phase.id != phaseId });
        phases.add(caller, updatedPhases);
        true;
      };
    };
  };

  // Phase Exercise Management Functions
  public shared ({ caller }) func addExerciseToPhase(phaseId : PhaseId, name : Text) : async ExerciseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add exercises to phases");
    };

    let exercise : PhaseExercise = {
      id = nextExerciseId;
      phaseId;
      name;
    };

    let currentExercises = switch (phaseExercises.get(caller)) {
      case (null) { List.empty<PhaseExercise>() };
      case (?exercises) { exercises };
    };

    currentExercises.add(exercise);
    phaseExercises.add(caller, currentExercises);
    let id = nextExerciseId;
    nextExerciseId += 1;
    id;
  };

  public query ({ caller }) func getExercisesForPhase(phaseId : PhaseId) : async [PhaseExercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access phase exercises");
    };

    switch (phaseExercises.get(caller)) {
      case (null) { [] };
      case (?exercises) {
        exercises.filter(func(ex) { ex.phaseId == phaseId }).toArray();
      };
    };
  };

  public shared ({ caller }) func removeExercise(exerciseId : ExerciseId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove exercises");
    };

    switch (phaseExercises.get(caller)) {
      case (null) { false };
      case (?exercises) {
        let updatedExercises = exercises.filter(func(ex) { ex.id != exerciseId });
        phaseExercises.add(caller, updatedExercises);
        true;
      };
    };
  };

  // Exercise Log Functions
  public shared ({ caller }) func logExercise(exerciseId : ExerciseId, sets : Nat, reps : Nat, weight : Nat) : async LogEntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log exercises");
    };

    let logEntry : PhaseExerciseLog = {
      id = nextLogEntryId;
      exerciseId;
      date = Time.now();
      sets;
      reps;
      weight;
    };

    let currentLogs = switch (exerciseLogs.get(caller)) {
      case (null) { List.empty<PhaseExerciseLog>() };
      case (?logs) { logs };
    };

    currentLogs.add(logEntry);
    exerciseLogs.add(caller, currentLogs);
    let id = nextLogEntryId;
    nextLogEntryId += 1;
    id;
  };

  public query ({ caller }) func getExerciseLogs(exerciseId : ExerciseId) : async [PhaseExerciseLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access exercise logs");
    };

    switch (exerciseLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.filter(func(log) { log.exerciseId == exerciseId }).toArray();
      };
    };
  };
};
