import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Nutrient = {
  nutrientName: string;
  unitName: string;
  value: number;
};

type FoodResult = {
  fdcId: number;
  description: string;
  brandName?: string;
  foodNutrients?: Nutrient[];
};

function getToday() {
  const now = new Date();

  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().split("T")[0];
}

function AddMeal() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [selectedFood, setSelectedFood] =
    useState<FoodResult | null>(null);

  const [mealType, setMealType] = useState("");
  const [date, setDate] = useState(getToday());
  const [grams, setGrams] = useState("100");

  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const findNutrient = (
    food: FoodResult,
    nutrientName: string
  ) => {
    const nutrient = food.foodNutrients?.find(
      (item) =>
        item.nutrientName
          .toLowerCase()
          .includes(nutrientName.toLowerCase())
    );

    return nutrient?.value || 0;
  };

  const getEnergy = (food: FoodResult) => {
    const kcalEnergy = food.foodNutrients?.find(
      (item) =>
        item.nutrientName.toLowerCase() === "energy" &&
        item.unitName.toLowerCase() === "kcal"
    );

    if (kcalEnergy) {
      return kcalEnergy.value;
    }

    return findNutrient(food, "energy");
  };

  const nutrition = useMemo(() => {
    if (!selectedFood || Number(grams) <= 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    const multiplier = Number(grams) / 100;

    return {
      calories: getEnergy(selectedFood) * multiplier,

      protein:
        findNutrient(
          selectedFood,
          "protein"
        ) * multiplier,

      carbs:
        findNutrient(
          selectedFood,
          "carbohydrate"
        ) * multiplier,

      fat:
        findNutrient(
          selectedFood,
          "total lipid"
        ) * multiplier,
    };
  }, [selectedFood, grams]);

  const searchFood = async () => {
    if (!query.trim()) {
      setMessage("Enter a food to search.");
      return;
    }

    setSearching(true);
    setMessage("");
    setSelectedFood(null);

    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(
          query
        )}&pageSize=8`
      );

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setResults(data.foods || []);

      if (!data.foods?.length) {
        setMessage("No foods found.");
      }
    } catch {
      setMessage(
        "Food search could not be completed."
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setMessage("");

    if (!selectedFood) {
      setMessage(
        "Please select a food first."
      );
      return;
    }

    if (!mealType) {
      setMessage(
        "Please select a meal type."
      );
      return;
    }

    if (!date) {
      setMessage("Please select a date.");
      return;
    }

    if (Number(grams) <= 0) {
      setMessage(
        "Serving size must be greater than 0."
      );
      return;
    }

    setSaving(true);

    const newMeal = {
      name: selectedFood.description,
      mealType,
      date,
      grams: Number(grams),

      calories:
        Math.round(nutrition.calories * 10) / 10,

      protein:
        Math.round(nutrition.protein * 10) / 10,

      carbs:
        Math.round(nutrition.carbs * 10) / 10,

      fat:
        Math.round(nutrition.fat * 10) / 10,
    };

    try {
      const response = await fetch(
        "http://localhost:3001/meals",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(newMeal),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setMessage(
        "Meal added successfully!"
      );

      setTimeout(() => {
        navigate("/nutrition");
      }, 700);
    } catch {
      setMessage(
        "Meal could not be added."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="add-meal-page">
      <div className="add-meal-header">
        <span className="eyebrow">
          FOOD DATABASE
        </span>

        <h1>Add Meal</h1>

        <p>
          Search for a food, select your serving
          size and add it to your daily nutrition.
        </p>
      </div>

      <div className="food-search-panel">
        <div className="food-search-bar">
          <input
            type="text"
            placeholder="Search banana, chicken, rice..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchFood();
              }
            }}
          />

          <button
            type="button"
            onClick={searchFood}
            disabled={searching}
          >
            {searching
              ? "Searching..."
              : "Search Food"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="food-results">
            {results.map((food) => (
              <button
                type="button"
                key={food.fdcId}
                className={
                  selectedFood?.fdcId ===
                  food.fdcId
                    ? "food-result active"
                    : "food-result"
                }
                onClick={() => {
                  setSelectedFood(food);
                  setMessage("");
                }}
              >
                <div>
                  <strong>
                    {food.description}
                  </strong>

                  <span>
                    {food.brandName ||
                      "USDA Food Database"}
                  </span>
                </div>

                <span className="select-food">
                  {selectedFood?.fdcId ===
                  food.fdcId
                    ? "Selected"
                    : "Select"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedFood && (
        <form
          className="meal-form"
          onSubmit={handleSubmit}
        >
          <div className="selected-food-header">
            <div>
              <span className="eyebrow">
                SELECTED FOOD
              </span>

              <h2>
                {selectedFood.description}
              </h2>
            </div>

            <button
              type="button"
              className="change-food-button"
              onClick={() => {
                setSelectedFood(null);
                setResults([]);
              }}
            >
              Change
            </button>
          </div>

          <div className="meal-form-grid">
            <div>
              <label>Meal Type</label>

              <select
                value={mealType}
                onChange={(e) =>
                  setMealType(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select meal
                </option>

                <option value="Breakfast">
                  Breakfast
                </option>

                <option value="Lunch">
                  Lunch
                </option>

                <option value="Dinner">
                  Dinner
                </option>

                <option value="Snack">
                  Snack
                </option>
              </select>
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
              <label>
                Serving Size (g)
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={grams}
                onChange={(e) =>
                  setGrams(e.target.value)
                }
              />
            </div>
          </div>

          <div className="nutrition-preview">
            <div className="nutrition-preview-main">
              <span>Calories</span>

              <strong>
                {Math.round(
                  nutrition.calories
                )}
              </strong>

              <small>kcal</small>
            </div>

            <div>
              <span>Protein</span>

              <strong>
                {nutrition.protein.toFixed(
                  1
                )}
                g
              </strong>
            </div>

            <div>
              <span>Carbs</span>

              <strong>
                {nutrition.carbs.toFixed(1)}
                g
              </strong>
            </div>

            <div>
              <span>Fat</span>

              <strong>
                {nutrition.fat.toFixed(1)}g
              </strong>
            </div>
          </div>

          <button
            type="submit"
            className="save-meal-button"
            disabled={saving}
          >
            {saving
              ? "Adding Meal..."
              : "Add Meal"}
          </button>
        </form>
      )}

      {message && (
        <p className="action-message">
          {message}
        </p>
      )}
    </section>
  );
}

export default AddMeal;