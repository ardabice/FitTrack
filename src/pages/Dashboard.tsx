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

type Meal = {
  id: string;
  name: string;
  mealType: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function getToday() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().split("T")[0];
}

function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const [calorieGoal, setCalorieGoal] = useState(() => {
    const savedGoal = localStorage.getItem(
      "fittrackCalorieGoal"
    );

    return savedGoal ? Number(savedGoal) : 2200;
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [workoutResponse, mealResponse] =
          await Promise.all([
            fetch("http://localhost:3001/workouts"),
            fetch("http://localhost:3001/meals"),
          ]);

        if (
          !workoutResponse.ok ||
          !mealResponse.ok
        ) {
          throw new Error(
            "Dashboard data could not be loaded."
          );
        }

        const workoutData =
          await workoutResponse.json();

        const mealData =
          await mealResponse.json();

        setWorkouts(workoutData);
        setMeals(mealData);

        const savedGoal =
          localStorage.getItem(
            "fittrackCalorieGoal"
          );

        if (savedGoal) {
          setCalorieGoal(Number(savedGoal));
        }
      } catch (error) {
        console.error(
          "Dashboard data could not be loaded.",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalMinutes = useMemo(() => {
    return workouts.reduce(
      (total, workout) =>
        total + workout.duration,
      0
    );
  }, [workouts]);

  const totalExercises = useMemo(() => {
    return workouts.reduce(
      (total, workout) =>
        total +
        (workout.exercises?.length || 0),
      0
    );
  }, [workouts]);

  const totalVolume = useMemo(() => {
    return workouts.reduce(
      (workoutTotal, workout) => {
        const workoutVolume =
          workout.exercises?.reduce(
            (exerciseTotal, exercise) =>
              exerciseTotal +
              exercise.sets *
                exercise.reps *
                exercise.weight,
            0
          ) || 0;

        return (
          workoutTotal + workoutVolume
        );
      },
      0
    );
  }, [workouts]);

  const getTopWeight = (
    workout: Workout
  ) => {
    return (
      workout.exercises?.reduce(
        (max, exercise) =>
          Math.max(
            max,
            exercise.weight
          ),
        0
      ) || 0
    );
  };

  const recentWorkouts = useMemo(() => {
    return [...workouts]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 3);
  }, [workouts]);

  const today = getToday();

  const todaysMeals = meals.filter(
    (meal) => meal.date === today
  );

  const totalCalories =
    todaysMeals.reduce(
      (total, meal) =>
        total + meal.calories,
      0
    );

  const totalProtein =
    todaysMeals.reduce(
      (total, meal) =>
        total + meal.protein,
      0
    );

  const totalCarbs =
    todaysMeals.reduce(
      (total, meal) =>
        total + meal.carbs,
      0
    );

  const totalFat =
    todaysMeals.reduce(
      (total, meal) =>
        total + meal.fat,
      0
    );

  const calorieProgress = Math.min(
    (totalCalories / calorieGoal) * 100,
    100
  );

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <section className="dashboard">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">
            FITTRACK OVERVIEW
          </span>

          <h1>
            Train smarter.
            <br />
            <span>
              Track real progress.
            </span>
          </h1>

          <p>
            Track your exercises,
            training volume and nutrition
            in one place.
          </p>
        </div>

        <div className="hero-score">
          <span>Training Log</span>

          <strong>
            {workouts.length}
          </strong>

          <small>Total sessions</small>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-label">
            Total Workouts
          </div>

          <strong>
            {workouts.length}
          </strong>

          <span>
            Training sessions
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-label">
            Training Time
          </div>

          <strong>
            {totalMinutes}
          </strong>

          <span>
            Minutes completed
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-label">
            Exercises Logged
          </div>

          <strong>
            {totalExercises}
          </strong>

          <span>
            Strength exercises
          </span>
        </article>

        <article className="stat-card accent-card">
          <div className="stat-label">
            Training Volume
          </div>

          <strong>
            {totalVolume.toLocaleString()}
          </strong>

          <span>
            kg total volume
          </span>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                ACTIVITY
              </span>

              <h2>
                Recent Workouts
              </h2>
            </div>

            <Link to="/workouts">
              View all
            </Link>
          </div>

          <div className="recent-workouts">
            {recentWorkouts.map(
              (workout) => (
                <article
                  className="workout-row"
                  key={workout.id}
                >
                  <div className="workout-marker" />

                  <div className="workout-main">
                    <strong>
                      {workout.name}
                    </strong>

                    <span>
                      {workout.type ===
                      "Strength"
                        ? `${
                            workout.exercises
                              ?.length || 0
                          } exercises`
                        : `${
                            workout.distanceKm ||
                            0
                          } km`}
                    </span>
                  </div>

                  <div className="workout-meta">
                    <strong>
                      {workout.duration} min
                    </strong>

                    <span>
                      {workout.type ===
                      "Strength"
                        ? `${getTopWeight(
                            workout
                          )} kg top weight`
                        : "Cardio session"}
                    </span>
                  </div>

                  <Link
                    to={`/workouts/${workout.id}`}
                    className="dashboard-workout-link"
                  >
                    →
                  </Link>
                </article>
              )
            )}
          </div>
        </section>

        <section className="dashboard-panel nutrition-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                NUTRITION
              </span>

              <h2>Daily Fuel</h2>
            </div>

            <Link to="/nutrition">
              View
            </Link>
          </div>

          <div className="calorie-circle">
            <div>
              <strong>
                {Math.round(
                  totalCalories
                )}
              </strong>

              <span>
                / {calorieGoal} kcal
              </span>
            </div>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${calorieProgress}%`,
              }}
            />
          </div>

          <div className="macro-grid">
            <div>
              <span>Protein</span>

              <strong>
                {Math.round(
                  totalProtein * 10
                ) / 10}
                g
              </strong>
            </div>

            <div>
              <span>Carbs</span>

              <strong>
                {Math.round(
                  totalCarbs * 10
                ) / 10}
                g
              </strong>
            </div>

            <div>
              <span>Fat</span>

              <strong>
                {Math.round(
                  totalFat * 10
                ) / 10}
                g
              </strong>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;