
import { useEffect, useState } from "react";
import "./HabitPage.css";

const STORAGE_KEY = "lifebalance_habits";

function HabitPage() {
  const [habits, setHabits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [habitName, setHabitName] = useState("");
  const [category, setCategory] = useState("Personal");

  const today = new Date().toLocaleDateString("en-CA");
  const completedToday = habits.filter(
    (habit) => habit.completedDate === today
  ).length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  function addHabit(event) {
    event.preventDefault();
    if (!habitName.trim()) return;

    setHabits((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: habitName.trim(),
        category,
        completedDate: "",
      },
    ]);

    setHabitName("");
  }

  function toggleHabit(id) {
    setHabits((previous) =>
      previous.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completedDate:
                habit.completedDate === today ? "" : today,
            }
          : habit
      )
    );
  }

  function deleteHabit(id) {
    setHabits((previous) =>
      previous.filter((habit) => habit.id !== id)
    );
  }

  return (
    <section className="habit-page">
      <div className="habit-heading">
        <div>
          <p className="habit-eyebrow">SMALL STEPS, EVERY DAY</p>
          <h1>Habit Tracker</h1>
          <p>Build routines that help you feel your best.</p>
        </div>
        <div className="habit-summary">
          <strong>{completedToday}/{habits.length}</strong>
          <span>Completed today</span>
        </div>
      </div>

      <div className="habit-progress">
        <div
          className="habit-progress-fill"
          style={{
            width: `${habits.length ? (completedToday / habits.length) * 100 : 0}%`,
          }}
        />
      </div>

      <form className="habit-form" onSubmit={addHabit}>
        <h2>Add a new habit</h2>
        <input
          value={habitName}
          onChange={(event) => setHabitName(event.target.value)}
          placeholder="e.g. Read for 20 minutes"
          maxLength={80}
          required
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>Personal</option>
          <option>Study</option>
          <option>Health</option>
          <option>Finance</option>
        </select>
        <button type="submit">+ Add habit</button>
      </form>

      <div className="habit-list-heading">
        <h2>Your daily habits</h2>
        <span>{habits.length} habits</span>
      </div>

      {habits.length === 0 ? (
        <div className="habit-empty">
          <span>🌱</span>
          <h3>Start with one small step</h3>
          <p>Add your first habit to begin building a better routine.</p>
        </div>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => {
            const done = habit.completedDate === today;

            return (
              <article className="habit-card" key={habit.id}>
                <button
                  type="button"
                  className={`habit-check ${done ? "is-done" : ""}`}
                  onClick={() => toggleHabit(habit.id)}
                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                >
                  {done ? "✓" : ""}
                </button>

                <div className="habit-details">
                  <strong className={done ? "habit-done-text" : ""}>
                    {habit.name}
                  </strong>
                  <span>{habit.category}</span>
                </div>

                <span className={`habit-status ${done ? "done" : ""}`}>
                  {done ? "Completed" : "Not done"}
                </span>

                <button
                  type="button"
                  className="habit-delete"
                  onClick={() => deleteHabit(habit.id)}
                  aria-label={`Delete ${habit.name}`}
                >
                  ×
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HabitPage;
