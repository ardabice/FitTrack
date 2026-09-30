import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Meal = {
  id: string;
  name: string;
  mealType: string;
  date: string;
  grams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type GoalProfile = {
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  sex: "male" | "female";
  activityLevel: string;
  calorieGoal: number;
  maintenanceCalories: number;
};

function getToday() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().split("T")[0];
}

function Nutrition() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("female");
  const [activityLevel, setActivityLevel] = useState("moderate");

  const [goalProfile, setGoalProfile] =
    useState<GoalProfile | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/meals")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Meals could not be loaded.");
        }

        return response.json();
      })
      .then((data: Meal[]) => {
        setMeals(data);
      })
      .catch(() => {
        setMessage("Meals could not be loaded.");
      })
      .finally(() => {
        setLoading(false);
      });

    const savedGoal = localStorage.getItem(
      "fittrackGoalProfile"
    );

    if (savedGoal) {
      try {
        const parsedGoal: GoalProfile =
          JSON.parse(savedGoal);

        setGoalProfile(parsedGoal);

        setCurrentWeight(
          String(parsedGoal.currentWeight)
        );

        setTargetWeight(
          String(parsedGoal.targetWeight)
        );

        setHeight(String(parsedGoal.height));
        setAge(String(parsedGoal.age));
        setSex(parsedGoal.sex);

        setActivityLevel(
          parsedGoal.activityLevel
        );
      } catch {
        localStorage.removeItem(
          "fittrackGoalProfile"
        );
      }
    }
  }, []);

  const dailyMeals = useMemo(() => {
    return meals.filter(
      (meal) => meal.date === selectedDate
    );
  }, [meals, selectedDate]);

  const totalCalories = dailyMeals.reduce(
    (total, meal) => total + meal.calories,
    0
  );

  const totalProtein = dailyMeals.reduce(
    (total, meal) => total + meal.protein,
    0
  );

  const totalCarbs = dailyMeals.reduce(
    (total, meal) => total + meal.carbs,
    0
  );

  const totalFat = dailyMeals.reduce(
    (total, meal) => total + meal.fat,
    0
  );

  const calorieGoal =
    goalProfile?.calorieGoal || 2200;

  const calorieProgress = Math.min(
    (totalCalories / calorieGoal) * 100,
    100
  );

  const goalType = useMemo(() => {
    if (!goalProfile) return null;

    if (
      goalProfile.targetWeight <
      goalProfile.currentWeight
    ) {
      return "Weight Loss";
    }

    if (
      goalProfile.targetWeight >
      goalProfile.currentWeight
    ) {
      return "Weight Gain";
    }

    return "Maintain Weight";
  }, [goalProfile]);

  const calculateGoal = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setMessage("");

    const weightValue = Number(currentWeight);
    const targetValue = Number(targetWeight);
    const heightValue = Number(height);
    const ageValue = Number(age);

    if (
      weightValue <= 0 ||
      targetValue <= 0 ||
      heightValue <= 0 ||
      ageValue <= 0
    ) {
      setMessage(
        "Please enter valid goal information."
      );
      return;
    }

    let bmr = 0;

    if (sex === "male") {
      bmr =
        10 * weightValue +
        6.25 * heightValue -
        5 * ageValue +
        5;
    } else {
      bmr =
        10 * weightValue +
        6.25 * heightValue -
        5 * ageValue -
        161;
    }

    const activityFactors: Record<
      string,
      number
    > = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    const maintenanceCalories =
      bmr *
      activityFactors[activityLevel];

    let calorieAdjustment = 0;

    if (targetValue < weightValue) {
      calorieAdjustment = -300;
    }

    if (targetValue > weightValue) {
      calorieAdjustment = 300;
    }

    const calculatedGoal = Math.round(
      maintenanceCalories +
        calorieAdjustment
    );

    const newProfile: GoalProfile = {
      currentWeight: weightValue,
      targetWeight: targetValue,
      height: heightValue,
      age: ageValue,
      sex,
      activityLevel,
      calorieGoal: calculatedGoal,
      maintenanceCalories: Math.round(
        maintenanceCalories
      ),
    };

    setGoalProfile(newProfile);

    localStorage.setItem(
      "fittrackGoalProfile",
      JSON.stringify(newProfile)
    );

    localStorage.setItem(
      "fittrackCalorieGoal",
      String(calculatedGoal)
    );

    setMessage(
      "Nutrition goal updated successfully."
    );

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3001/meals/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setMeals((currentMeals) =>
        currentMeals.filter(
          (meal) => meal.id !== id
        )
      );

      setMessage(
        "Meal deleted successfully."
      );

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch {
      setMessage(
        "Meal could not be deleted."
      );
    }
  };

  if (loading) {
    return <p>Loading nutrition...</p>;
  }

  return (
    <section className="nutrition-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            DAILY NUTRITION
          </span>

          <h1>Nutrition</h1>

          <p>
            Track meals, calories and daily
            nutrition goals.
          </p>
        </div>

        <Link
          to="/nutrition/new"
          className="primary-button"
        >
          + Add Meal
        </Link>
      </div>

      <section className="goal-section">
        <div className="goal-section-heading">
          <div>
            <span className="eyebrow">
              YOUR GOAL
            </span>

            <h2>Daily Calorie Target</h2>

            <p>
              Set your body and activity
              information to estimate your
              daily calorie target.
            </p>
          </div>

          {goalProfile && (
            <div className="goal-result">
              <span>{goalType}</span>

              <strong>
                {goalProfile.calorieGoal}
              </strong>

              <small>kcal / day</small>
            </div>
          )}
        </div>

        <form
          className="goal-form"
          onSubmit={calculateGoal}
        >
          <div className="goal-form-grid">
            <div>
              <label>Current Weight (kg)</label>

              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="70"
                value={currentWeight}
                onChange={(e) =>
                  setCurrentWeight(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label>Target Weight (kg)</label>

              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="65"
                value={targetWeight}
                onChange={(e) =>
                  setTargetWeight(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label>Height (cm)</label>

              <input
                type="number"
                min="1"
                placeholder="170"
                value={height}
                onChange={(e) =>
                  setHeight(e.target.value)
                }
              />
            </div>

            <div>
              <label>Age</label>

              <input
                type="number"
                min="1"
                placeholder="25"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
              />
            </div>

            <div>
              <label>Sex</label>

              <select
                value={sex}
                onChange={(e) =>
                  setSex(
                    e.target.value as
                      | "male"
                      | "female"
                  )
                }
              >
                <option value="female">
                  Female
                </option>

                <option value="male">
                  Male
                </option>
              </select>
            </div>

            <div>
              <label>Activity Level</label>

              <select
                value={activityLevel}
                onChange={(e) =>
                  setActivityLevel(
                    e.target.value
                  )
                }
              >
                <option value="sedentary">
                  Sedentary
                </option>

                <option value="light">
                  Lightly Active
                </option>

                <option value="moderate">
                  Moderately Active
                </option>

                <option value="active">
                  Active
                </option>

                <option value="veryActive">
                  Very Active
                </option>
              </select>
            </div>
          </div>

          <div className="goal-form-footer">
            <p>
              Estimated calorie targets are
              intended for general fitness
              tracking.
            </p>

            <button type="submit">
              Calculate Goal
            </button>
          </div>
        </form>

        {goalProfile && (
          <div className="goal-insights">
            <div>
              <span>Current Weight</span>

              <strong>
                {goalProfile.currentWeight} kg
              </strong>
            </div>

            <div>
              <span>Target Weight</span>

              <strong>
                {goalProfile.targetWeight} kg
              </strong>
            </div>

            <div>
              <span>Maintenance</span>

              <strong>
                {
                  goalProfile.maintenanceCalories
                }{" "}
                kcal
              </strong>
            </div>

            <div>
              <span>Daily Target</span>

              <strong>
                {goalProfile.calorieGoal} kcal
              </strong>
            </div>
          </div>
        )}
      </section>

      <div className="nutrition-date-bar">
        <div>
          <span>Selected day</span>

          <strong>{selectedDate}</strong>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(
              e.target.value
            );

            setMessage("");
          }}
        />
      </div>

      <div className="nutrition-summary-grid">
        <article className="nutrition-summary-card calorie-summary-card">
          <span>Calories</span>

          <strong>
            {Math.round(totalCalories)}
          </strong>

          <small>
            of {calorieGoal} kcal
          </small>

          <div className="nutrition-progress">
            <div
              style={{
                width: `${calorieProgress}%`,
              }}
            />
          </div>
        </article>

        <article className="nutrition-summary-card">
          <span>Protein</span>

          <strong>
            {Math.round(totalProtein)}g
          </strong>

          <small>Daily intake</small>
        </article>

        <article className="nutrition-summary-card">
          <span>Carbs</span>

          <strong>
            {Math.round(totalCarbs)}g
          </strong>

          <small>Daily intake</small>
        </article>

        <article className="nutrition-summary-card">
          <span>Fat</span>

          <strong>
            {Math.round(totalFat)}g
          </strong>

          <small>Daily intake</small>
        </article>
      </div>

      <section className="nutrition-meals-section">
        <div className="nutrition-section-heading">
          <div>
            <span className="eyebrow">
              MEALS
            </span>

            <h2>Daily Meals</h2>
          </div>

          <span className="meal-count">
            {dailyMeals.length}{" "}
            {dailyMeals.length === 1
              ? "meal"
              : "meals"}
          </span>
        </div>

        {dailyMeals.length > 0 ? (
          <div className="meal-grid">
            {dailyMeals.map((meal) => (
              <article
                className="meal-card"
                key={meal.id}
              >
                <div className="meal-card-top">
                  <span className="meal-type">
                    {meal.mealType}
                  </span>

                  <button
                    type="button"
                    className="meal-delete-button"
                    onClick={() =>
                      handleDelete(meal.id)
                    }
                  >
                    Delete
                  </button>
                </div>

                <h3>{meal.name}</h3>

                {meal.grams && (
                  <p className="meal-portion">
                    {meal.grams} g serving
                  </p>
                )}

                <div className="meal-calories">
                  <strong>
                    {Math.round(
                      meal.calories
                    )}
                  </strong>

                  <span>kcal</span>
                </div>

                <div className="meal-macros">
                  <div>
                    <span>Protein</span>

                    <strong>
                      {Math.round(
                        meal.protein * 10
                      ) / 10}
                      g
                    </strong>
                  </div>

                  <div>
                    <span>Carbs</span>

                    <strong>
                      {Math.round(
                        meal.carbs * 10
                      ) / 10}
                      g
                    </strong>
                  </div>

                  <div>
                    <span>Fat</span>

                    <strong>
                      {Math.round(
                        meal.fat * 10
                      ) / 10}
                      g
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No meals logged</h2>

            <p>
              No meals have been added for this
              date yet.
            </p>

            <Link
              to="/nutrition/new"
              className="primary-button"
            >
              + Add your first meal
            </Link>
          </div>
        )}
      </section>

      {message && (
        <p className="action-message">
          {message}
        </p>
      )}
    </section>
  );
}

export default Nutrition;