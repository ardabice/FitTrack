import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

function EditWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [notes, setNotes] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3001/workouts/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Workout could not be loaded.");
        }

        return response.json();
      })
      .then((workout) => {
        setName(workout.name || "");
        setDate(workout.date || "");
        setType(workout.type || "");
        setDuration(String(workout.duration || ""));
        setDistanceKm(
          workout.distanceKm
            ? String(workout.distanceKm)
            : ""
        );
        setNotes(workout.notes || "");

        if (
          workout.exercises &&
          workout.exercises.length > 0
        ) {
          setExercises(
            workout.exercises.map(
              (exercise: {
                id: string;
                name: string;
                sets: number;
                reps: number;
                weight: number;
              }) => ({
                id: exercise.id,
                name: exercise.name,
                sets: String(exercise.sets),
                reps: String(exercise.reps),
                weight: String(exercise.weight),
              })
            )
          );
        } else {
          setExercises([]);
        }
      })
      .catch(() => {
        setMessage("Workout could not be loaded.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleTypeChange = (newType: string) => {
    setType(newType);

    if (
      newType === "Strength" &&
      exercises.length === 0
    ) {
      setExercises([
        {
          id: crypto.randomUUID(),
          name: "",
          sets: "",
          reps: "",
          weight: "",
        },
      ]);
    }

    if (newType === "Cardio") {
      setDistanceKm(distanceKm || "");
    }
  };

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

  const removeExercise = (exerciseId: string) => {
    if (exercises.length === 1) {
      setMessage(
        "Strength workouts need at least one exercise."
      );
      return;
    }

    setExercises(
      exercises.filter(
        (exercise) => exercise.id !== exerciseId
      )
    );
  };

  const updateExercise = (
    exerciseId: string,
    field: keyof Exercise,
    value: string
  ) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise
      )
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");

    if (!name || !date || !type || !duration) {
      setMessage(
        "Please fill in all required fields."
      );
      return;
    }

    if (Number(duration) <= 0) {
      setMessage(
        "Duration must be greater than 0."
      );
      return;
    }

    if (type === "Strength") {
      if (exercises.length === 0) {
        setMessage(
          "Please add at least one exercise."
        );
        return;
      }

      const invalidExercise = exercises.some(
        (exercise) =>
          !exercise.name.trim() ||
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

    if (
      type === "Cardio" &&
      Number(distanceKm) <= 0
    ) {
      setMessage(
        "Distance must be greater than 0."
      );
      return;
    }

    const updatedWorkout =
      type === "Strength"
        ? {
            id,
            name,
            date,
            type,
            duration: Number(duration),
            notes,
            exercises: exercises.map(
              (exercise) => ({
                id: exercise.id,
                name: exercise.name.trim(),
                sets: Number(exercise.sets),
                reps: Number(exercise.reps),
                weight: Number(exercise.weight),
              })
            ),
          }
        : {
            id,
            name,
            date,
            type,
            duration: Number(duration),
            distanceKm: Number(distanceKm),
            notes,
            exercises: [],
          };

    try {
      const response = await fetch(
        `http://localhost:3001/workouts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedWorkout),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setMessage(
        "Workout updated successfully!"
      );

      setTimeout(() => {
        navigate(`/workouts/${id}`);
      }, 700);
    } catch {
      setMessage(
        "Workout could not be updated."
      );
    }
  };

  if (loading) {
    return <p>Loading workout...</p>;
  }

  return (
    <section>
      <span className="eyebrow">
        EDIT SESSION
      </span>

      <h1>Edit Workout</h1>

      <p>
        Update exercises, sets, reps and weights.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Workout Name</label>

          <input
            type="text"
            value={name}
            placeholder="Example: Push Day"
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </div>

        <div>
          <label>Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </div>

        <div>
          <label>Workout Type</label>

          <select
            value={type}
            onChange={(e) =>
              handleTypeChange(
                e.target.value
              )
            }
          >
            <option value="">
              Select type
            </option>

            <option value="Strength">
              Strength
            </option>

            <option value="Cardio">
              Cardio
            </option>
          </select>
        </div>

        <div>
          <label>
            Duration (minutes)
          </label>

          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
          />
        </div>

        {type === "Strength" && (
          <div className="exercise-section">
            <div className="exercise-heading">
              <div>
                <span className="eyebrow">
                  EXERCISES
                </span>

                <h2>
                  Workout Exercises
                </h2>
              </div>

              <button
                type="button"
                onClick={addExercise}
              >
                + Add Exercise
              </button>
            </div>

            {exercises.map(
              (exercise, index) => (
                <div
                  className="exercise-card"
                  key={exercise.id}
                >
                  <div className="exercise-card-header">
                    <strong>
                      Exercise {index + 1}
                    </strong>

                    {exercises.length >
                      1 && (
                      <button
                        type="button"
                        className="remove-exercise"
                        onClick={() =>
                          removeExercise(
                            exercise.id
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div>
                    <label>
                      Exercise Name
                    </label>

                    <input
                      type="text"
                      placeholder="Example: Bench Press"
                      value={
                        exercise.name
                      }
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
                        value={
                          exercise.sets
                        }
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
                        value={
                          exercise.reps
                        }
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
                      <label>
                        Weight (kg)
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={
                          exercise.weight
                        }
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
              )
            )}
          </div>
        )}

        {type === "Cardio" && (
          <div>
            <label>
              Distance (km)
            </label>

            <input
              type="number"
              min="0.1"
              step="0.1"
              value={distanceKm}
              onChange={(e) =>
                setDistanceKm(
                  e.target.value
                )
              }
            />
          </div>
        )}

        <div>
          <label>Notes</label>

          <textarea
            value={notes}
            placeholder="How did the workout go?"
            onChange={(e) =>
              setNotes(e.target.value)
            }
          />
        </div>

        <button type="submit">
          Save Changes
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

export default EditWorkout;