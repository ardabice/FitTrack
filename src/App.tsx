import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import WorkoutDetail from "./pages/WorkoutDetail";
import AddWorkout from "./pages/AddWorkout";
import EditWorkout from "./pages/EditWorkout";
import Nutrition from "./pages/Nutrition";
import AddMeal from "./pages/AddMeal";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="topbar">
          <NavLink to="/" className="brand">
            <span className="brand-icon">F</span>

            <div>
              <strong>FitTrack</strong>
              <span>Train. Fuel. Progress.</span>
            </div>
          </NavLink>

          <nav className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/workouts"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Workouts
            </NavLink>

            <NavLink
              to="/nutrition"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Nutrition
            </NavLink>
          </nav>

          <div className="nav-actions">
            <NavLink to="/workouts/new" className="secondary-button">
              + Workout
            </NavLink>

            <NavLink to="/nutrition/new" className="primary-button">
              + Meal
            </NavLink>
          </div>
        </header>

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/workouts" element={<Workouts />} />
            <Route path="/workouts/:id" element={<WorkoutDetail />} />
            <Route path="/workouts/new" element={<AddWorkout />} />
            <Route path="/workouts/:id/edit" element={<EditWorkout />} />

            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/nutrition/new" element={<AddMeal />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;