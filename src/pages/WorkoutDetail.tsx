import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3001/workouts/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Workout not found.");
        }

        return response.json();
      })
      .then((data) => {
        setWorkout({
          ...data,
          exercises: data.exercises || [],
        });
      })
      .catch(() => {
        setMessage("Workout could not be loaded.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const totalSets = useMemo(() => {
    if (!workout) return 0;

    return workout.exercises.reduce(
      (total, exercise) => total + exercise.sets,
      0
    );
  }, [workout]);

  const totalVolume = useMemo(() => {
    if (!workout) return 0;

    return workout.exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets *
          exercise.reps *
          exercise.weight,
      0
    );
  }, [workout]);

  const topWeight = useMemo(() => {
    if (!workout || workout.exercises.length === 0) {
      return 0;
    }

    return Math.max(
      ...workout.exercises.map(
        (exercise) => exercise.weight
      )
    );
  }, [workout]);

  const averagePace = useMemo(() => {
    if (
      !workout ||
      workout.type !== "Cardio" ||
      !workout.distanceKm
    ) {
      return null;
    }

    return workout.duration / workout.distanceKm;
  }, [workout]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3001/workouts/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setMessage("Workout deleted successfully.");

      setTimeout(() => {
        navigate("/workouts");
      }, 700);
    } catch {
      setMessage("Workout could not be deleted.");
    }
  };

  if (loading) {
    return <p>Loading workout...</p>;
  }

  if (!workout) {
    return (
      <p>
        {message || "Workout not found."}
      </p>
    );
  }

  return (
    <section className="workout-detail-page">
      <Link
        to="/workouts"
        className="back-link"
      >
        ← Back to workouts
      </Link>

      <div className="detail-header">
        <div>
          <span className="eyebrow">
            {workout.type}
          </span>

          <h1>{workout.name}</h1>

          <p>
            {workout.type === "Strength"
              ? `${workout.exercises.length} exercises · ${totalSets} sets`
              : `${workout.distanceKm || 0} km cardio session`}
          </p>
        </div>
      </div>

      {workout.type === "Strength" && (
        <>
          <div className="detail-grid">
            <article className="detail-stat">
              <span>Date</span>
              <strong>{workout.date}</strong>
            </article>

            <article className="detail-stat">
              <span>Duration</span>
              <strong>
                {workout.duration} min
              </strong>
            </article>

            <article className="detail-stat">
              <span>Training Volume</span>
              <strong>
                {totalVolume.toLocaleString()} kg
              </strong>
            </article>

            <article className="detail-stat">
              <span>Top Weight</span>
              <strong>
                {topWeight} kg
              </strong>
            </article>
          </div>

          <div className="detail-notes">
            <span className="eyebrow">
              EXERCISES
            </span>

            <h2>Workout Exercises</h2>

            <div className="exercise-preview-list">
              {workout.exercises.map(
                (exercise) => (
                  <div
                    className="exercise-preview"
                    key={exercise.id}
                  >
                    <span>
                      {exercise.name}
                    </span>

                    <strong>
                      {exercise.sets} ×{" "}
                      {exercise.reps}
                      {" · "}
                      {exercise.weight} kg
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {workout.type === "Cardio" && (
        <div className="detail-grid">
          <article className="detail-stat">
            <span>Date</span>
            <strong>{workout.date}</strong>
          </article>

          <article className="detail-stat">
            <span>Duration</span>
            <strong>
              {workout.duration} min
            </strong>
          </article>

          <article className="detail-stat">
            <span>Distance</span>
            <strong>
              {workout.distanceKm || 0} km
            </strong>
          </article>

          <article className="detail-stat">
            <span>Average Pace</span>

            <strong>
              {averagePace
                ? `${averagePace.toFixed(1)} min/km`
                : "-"}
            </strong>
          </article>
        </div>
      )}

      <div className="detail-notes">
        <span className="eyebrow">
          SESSION NOTES
        </span>

        <h2>How it went</h2>

        <p>
          {workout.notes ||
            "No notes added for this session."}
        </p>
      </div>

      <div className="detail-actions">
        <Link
          to={`/workouts/${workout.id}/edit`}
          className="primary-button"
        >
          Edit Workout
        </Link>

        <button
          type="button"
          className="danger-button"
          onClick={handleDelete}
        >
          Delete Workout
        </button>
      </div>

      {message && (
        <p className="action-message">
          {message}
        </p>
      )}
    </section>
  );
}

export default WorkoutDetail;