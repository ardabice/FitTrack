import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type Workout = {
  id: string;
  name: string;
  date: string;
  type: string;
  duration: number;
  distanceKm?: number;
  notes: string;
  exercises: Exercise[];
};

function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/workouts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Workouts could not be loaded.");
        }

        return response.json();
      })
      .then((data) => setWorkouts(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      const exerciseNames = workout.exercises
        ?.map((exercise) => exercise.name)
        .join(" ")
        .toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        workout.name.toLowerCase().includes(searchText) ||
        workout.type.toLowerCase().includes(searchText) ||
        exerciseNames.includes(searchText);

      const matchesFilter =
        filter === "All" || workout.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [workouts, search, filter]);

  const getTotalSets = (workout: Workout) =>
    workout.exercises?.reduce(
      (total, exercise) => total + exercise.sets,
      0
    ) || 0;

  const getTopWeight = (workout: Workout) =>
    workout.exercises?.reduce(
      (max, exercise) => Math.max(max, exercise.weight),
      0
    ) || 0;

  if (loading) {
    return <p>Loading workouts...</p>;
  }

  return (
    <section className="workouts-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">TRAINING LOG</span>
          <h1>My Workouts</h1>

          <p>
            Track your exercises, sets, reps and training progress.
          </p>
        </div>

        <Link to="/workouts/new" className="primary-button">
          + Add Workout
        </Link>
      </div>

      <div className="workout-toolbar">
        <input
          type="text"
          placeholder="Search workout or exercise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="filter-group">
          {["All", "Strength", "Cardio"].map((type) => (
            <button
              key={type}
              className={
                filter === type
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="workout-grid">
        {filteredWorkouts.map((workout) => (
          <article className="workout-card" key={workout.id}>
            <div className="workout-card-top">
              <span className="workout-type">
                {workout.type}
              </span>

              <span className="workout-date">
                {workout.date}
              </span>
            </div>

            <h2>{workout.name}</h2>

            {workout.type === "Strength" && (
              <>
                <p className="muscle-group">
                  {workout.exercises.length} exercises ·{" "}
                  {getTotalSets(workout)} total sets
                </p>

                <div className="exercise-preview-list">
                  {workout.exercises
                    .slice(0, 3)
                    .map((exercise) => (
                      <div
                        className="exercise-preview"
                        key={exercise.id}
                      >
                        <span>{exercise.name}</span>

                        <strong>
                          {exercise.sets} × {exercise.reps}
                          {" · "}
                          {exercise.weight} kg
                        </strong>
                      </div>
                    ))}

                  {workout.exercises.length > 3 && (
                    <span className="more-exercises">
                      +{workout.exercises.length - 3} more
                    </span>
                  )}
                </div>

                <div className="workout-stats">
                  <div>
                    <span>Duration</span>
                    <strong>{workout.duration} min</strong>
                  </div>

                  <div>
                    <span>Exercises</span>
                    <strong>{workout.exercises.length}</strong>
                  </div>

                  <div>
                    <span>Top Weight</span>
                    <strong>{getTopWeight(workout)} kg</strong>
                  </div>
                </div>
              </>
            )}

            {workout.type === "Cardio" && (
              <div className="workout-stats cardio-stats">
                <div>
                  <span>Duration</span>
                  <strong>{workout.duration} min</strong>
                </div>

                <div>
                  <span>Distance</span>
                  <strong>{workout.distanceKm || 0} km</strong>
                </div>

                <div>
                  <span>Activity</span>
                  <strong>Cardio</strong>
                </div>
              </div>
            )}

            <p className="workout-notes">
              {workout.notes || "No notes added."}
            </p>

            <div className="workout-card-footer">
              <span>
                {workout.type === "Strength"
                  ? `${getTotalSets(workout)} sets logged`
                  : `${workout.distanceKm || 0} km completed`}
              </span>

              <Link to={`/workouts/${workout.id}`}>
                View details →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="empty-state">
          <h2>No workouts found</h2>
          <p>Try changing your search or filter.</p>
        </div>
      )}
    </section>
  );
}

export default Workouts;