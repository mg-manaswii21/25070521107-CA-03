
import { useEffect, useState } from "react";
import "./GoalsPage.css";

const STORAGE_KEY = "lifebalance_goals";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function GoalsPage() {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  function addGoal(event) {
    event.preventDefault();

    const newGoal = {
      id: `${Date.now()}-${Math.random()}`,
      title: title.trim(),
      target: Number(target),
      saved: Number(saved || 0),
      deadline,
    };

    setGoals((previous) => [...previous, newGoal]);
    setTitle("");
    setTarget("");
    setSaved("");
    setDeadline("");
  }

  function updateProgress(id) {
    const goal = goals.find((item) => item.id === id);
    if (!goal) return;

    const input = window.prompt(
      `How much have you saved toward "${goal.title}"?`,
      String(goal.saved)
    );

    if (input === null || input.trim() === "") return;

    const amount = Number(input);

    if (!Number.isFinite(amount) || amount < 0) {
      window.alert("Please enter a valid amount of ₹0 or more.");
      return;
    }

    setGoals((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, saved: Math.min(amount, item.target) }
          : item
      )
    );
  }

  function deleteGoal(id) {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    setGoals((previous) => previous.filter((item) => item.id !== id));
  }

  const completedGoals = goals.filter(
    (goal) => goal.saved >= goal.target
  ).length;

  return (
    <section className="goals-page">
      <div className="goals-intro">
        <div>
          <span className="goals-tag">SMALL STEPS, BIG DREAMS</span>
          <h2>Make your goals happen.</h2>
          <p>
            Give your plans a target, track your savings, and celebrate
            every bit of progress.
          </p>
        </div>
        <div className="goals-art" aria-hidden="true">◎</div>
      </div>

      <div className="goals-summary">
        <article className="goal-summary-card">
          <span>Total goals</span>
          <strong>{goals.length}</strong>
        </article>
        <article className="goal-summary-card">
          <span>Goals completed</span>
          <strong>{completedGoals}</strong>
        </article>
        <article className="goal-summary-card">
          <span>Total saved</span>
          <strong>
            {money(goals.reduce((sum, goal) => sum + goal.saved, 0))}
          </strong>
        </article>
      </div>

      <div className="goals-layout">
        <article className="panel goal-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Create a goal</h2>
              <p>What are you saving for?</p>
            </div>
            <span className="goal-icon">＋</span>
          </div>

          <form className="goal-form" onSubmit={addGoal}>
            <label htmlFor="goal-title">Goal name</label>
            <input
              id="goal-title"
              type="text"
              placeholder="e.g. Buy a new laptop"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="goal-target">Target amount (₹)</label>
            <input
              id="goal-target"
              type="number"
              placeholder="e.g. 50000"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              min="0.01"
              step="0.01"
              required
            />

            <label htmlFor="goal-saved">Already saved (₹)</label>
            <input
              id="goal-saved"
              type="number"
              placeholder="e.g. 5000"
              value={saved}
              onChange={(event) => setSaved(event.target.value)}
              min="0"
              step="0.01"
            />

            <label htmlFor="goal-deadline">Target date (optional)</label>
            <input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />

            <button className="primary-button save-button" type="submit">
              Add goal <span>→</span>
            </button>
          </form>
        </article>

        <article className="panel goal-list-panel">
          <div className="panel-heading">
            <div>
              <h2>Your goals</h2>
              <p>Every step forward counts.</p>
            </div>
            <span className="goal-icon">✧</span>
          </div>

          {goals.length === 0 ? (
            <div className="goals-empty">
              <div className="goals-empty-icon">◎</div>
              <strong>Your next achievement starts here</strong>
              <p>Create your first goal using the form.</p>
            </div>
          ) : (
            <div className="goal-list">
              {goals.map((goal) => {
                const progress = Math.min(
                  100,
                  Math.round((goal.saved / goal.target) * 100)
                );

                return (
                  <div className="goal-item" key={goal.id}>
                    <div className="goal-item-top">
                      <div>
                        <h3>{goal.title}</h3>
                        {goal.deadline && (
                          <p className="goal-deadline">
                            Target date:{" "}
                            {new Date(
                              `${goal.deadline}T00:00:00`
                            ).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </div>
                      <span className="goal-percentage">{progress}%</span>
                    </div>

                    <div
                      className="goal-progress-track"
                      role="progressbar"
                      aria-label={`${goal.title} progress`}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div
                        className="goal-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="goal-amounts">
                      <span>{money(goal.saved)} saved</span>
                      <span>Target: {money(goal.target)}</span>
                    </div>

                    {progress === 100 && (
                      <p className="goal-complete">✦ Goal achieved!</p>
                    )}

                    <div className="goal-actions">
                      <button
                        type="button"
                        className="goal-update-button"
                        onClick={() => updateProgress(goal.id)}
                      >
                        Update savings
                      </button>
                      <button
                        type="button"
                        className="goal-delete-button"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default GoalsPage;
