import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

function AddWorkout() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      sets: "",
      reps: "",
      weight: "",
    },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: "",
        reps: "",
        weight: "",
      },
    ]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length === 1) {
      setMessage("At least one exercise is required.");
      return;
    }

    setExercises(
      exercises.filter((exercise) => exercise.id !== id)
    );
  };

  const updateExercise = (
    id: string,
    field: keyof Exercise,
    value: string
  ) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id
          ? { ...exercise, [field]: value }
          : exercise
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name || !date || !type || !duration) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (Number(duration) <= 0) {
      setMessage("Duration must be greater than 0.");
      return;
    }

    if (type === "Strength") {
      const invalidExercise = exercises.some(
        (exercise) =>
          !exercise.name ||
          Number(exercise.sets) <= 0 ||
          Number(exercise.reps) <= 0 ||
          Number(exercise.weight) < 0
      );

      if (invalidExercise) {
        setMessage(
          "Please complete all exercise fields correctly."
        );
        return;
      }
    }

    if (type === "Cardio" && Number(distanceKm) <= 0) {
      setMessage("Distance must be greater than 0.");
      return;
    }

    const newWorkout = {
      name,
      date,
      type,
      duration: Number(duration),
      notes,

      ...(type === "Strength" && {
        exercises: exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          sets: Number(exercise.sets),
          reps: Number(exercise.reps),
          weight: Number(exercise.weight),
        })),
      }),

      ...(type === "Cardio" && {
        distanceKm: Number(distanceKm),
        exercises: [],
      }),
    };

    try {
      const response = await fetch(
        "http://localhost:3001/workouts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newWorkout),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setMessage("Workout added successfully!");

      setTimeout(() => {
        navigate("/workouts");
      }, 700);
    } catch {
      setMessage("Workout could not be added.");
    }
  };

  return (
    <section>
      <span className="eyebrow">NEW SESSION</span>

      <h1>Add Workout</h1>

      <p>
        Record your workout and track your progress.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Workout Name</label>

          <input
            type="text"
            placeholder="Example: Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label>Workout Type</label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select type</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
          </select>
        </div>

        <div>
          <label>Duration (minutes)</label>

          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        {type === "Strength" && (
          <div className="exercise-section">
            <div className="exercise-heading">
              <div>
                <span className="eyebrow">
                  EXERCISES
                </span>
                <h2>Workout Exercises</h2>
              </div>

              <button
                type="button"
                onClick={addExercise}
              >
                + Add Exercise
              </button>
            </div>

            {exercises.map((exercise, index) => (
              <div
                className="exercise-card"
                key={exercise.id}
              >
                <div className="exercise-card-header">
                  <strong>
                    Exercise {index + 1}
                  </strong>

                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className="remove-exercise"
                      onClick={() =>
                        removeExercise(exercise.id)
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label>Exercise Name</label>

                  <input
                    type="text"
                    placeholder="Example: Bench Press"
                    value={exercise.name}
                    onChange={(e) =>
                      updateExercise(
                        exercise.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="exercise-values">
                  <div>
                    <label>Sets</label>

                    <input
                      type="number"
                      min="1"
                      placeholder="3"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "sets",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>Reps</label>

                    <input
                      type="number"
                      min="1"
                      placeholder="12"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "reps",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>Weight (kg)</label>

                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="60"
                      value={exercise.weight}
                      onChange={(e) =>
                        updateExercise(
                          exercise.id,
                          "weight",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {type === "Cardio" && (
          <div>
            <label>Distance (km)</label>

            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="5"
              value={distanceKm}
              onChange={(e) =>
                setDistanceKm(e.target.value)
              }
            />
          </div>
        )}

        <div>
          <label>Notes</label>

          <textarea
            placeholder="How did the workout go?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit">
          Save Workout
        </button>
      </form>

      {message && (
        <p className="action-message">
          {message}
        </p>
      )}
    </section>
  );
}

export default AddWorkout;