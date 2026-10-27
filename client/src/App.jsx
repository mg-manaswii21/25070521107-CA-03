import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./Auth";
import HabitPage from "./HabitPage";
import GoalsPage from "./GoalsPage";

const API_URL = "http://localhost:5000/api/transactions";

const menuItems = [
  { icon: "⌂", label: "Dashboard" },
  { icon: "↕", label: "Transactions" },
  { icon: "◷", label: "Budgets" },
  { icon: "✓", label: "Habits" },
  { icon: "◎", label: "Goals" },
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function App() {
  const [authToken, setAuthToken] = useState(
  () => localStorage.getItem("lifebalance_token") || ""
);

const [currentUser, setCurrentUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("lifebalance_user") || "null");
  } catch {
    return null;
  }
});
  const [activePage, setActivePage] = useState("Dashboard");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [type, setType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );

  async function loadTransactions() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
});
      if (!response.ok) throw new Error("Could not load transactions.");

      const data = await response.json();
      setTransactions(data);
    } catch {
      setError(
        "Could not connect to the backend. Make sure your server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  if (authToken && currentUser) {
    loadTransactions();
  } else {
    setTransactions([]);
    setLoading(false);
  }
}, [authToken, currentUser]);

function handleAuthenticated(data) {
  localStorage.setItem("lifebalance_token", data.token);
  localStorage.setItem("lifebalance_user", JSON.stringify(data.user));

  setAuthToken(data.token);
  setCurrentUser(data.user);
  setActivePage("Dashboard");
  setError("");
  setNotice("");
}

function handleLogout() {
  localStorage.removeItem("lifebalance_token");
  localStorage.removeItem("lifebalance_user");

  setAuthToken("");
  setCurrentUser(null);
  setTransactions([]);
  setActivePage("Dashboard");
  setError("");
  setNotice("");
}
  async function addTransaction(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${authToken}`,
},        body: JSON.stringify({
          type,
          title: title.trim(),
          amount: Number(amount),
          category,
          date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save transaction.");
      }

      setTransactions((previous) =>
        [data, ...previous].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )
      );

      setTitle("");
      setAmount("");
      setNotice("Transaction saved successfully!");
    } catch (err) {
      setError(err.message || "Could not save transaction.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete transaction.");
      }

      setTransactions((previous) =>
        previous.filter((transaction) => transaction._id !== id)
      );
      setNotice("Transaction deleted.");
    } catch (err) {
      setError(err.message || "Could not delete transaction.");
    }
  }

  const now = new Date();
  const thisMonth = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  });

  const totalIncome = thisMonth
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = thisMonth
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  if (!authToken || !currentUser) {
  return <Auth onAuthenticated={handleAuthenticated} />;
}

return (
  <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">L</span>
          <span>LifeBalance</span>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => setActivePage(item.label)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
  <div className="avatar">
    {(currentUser.name || "U").charAt(0).toUpperCase()}
  </div>

  <div>
    <strong>{currentUser.name}</strong>
    <p>Personal workspace</p>
    <button
      type="button"
      onClick={handleLogout}
      style={{
        marginTop: "8px",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "#657f75",
        cursor: "pointer",
        fontSize: "12px",
      }}
    >
      Log out
    </button>
  </div>
</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL SPACE</p>
            <h1>{activePage}</h1>
          </div>
          <div className="date-chip">
            <span className="online-dot" />
            All in one place
          </div>
        </header>

        {error && (
          <div className="transaction-message error-message">{error}</div>
        )}
        {notice && (
          <div className="transaction-message success-message">{notice}</div>
        )}

        {activePage === "Dashboard" && (
          <>
            <section className="welcome-card">
              <div>
                <span className="welcome-tag">
                  A LITTLE PROGRESS EVERY DAY
                </span>
                <h2>Make room for what matters.</h2>
                <p>
                  Build healthier habits and feel more confident about your
                  money.
                </p>
              </div>
              <div className="welcome-art" aria-hidden="true">
                <span>✳</span>
                <span>↗</span>
                <span>♡</span>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h2>Your overview</h2>
                <p>A simple view of your financial and personal wellbeing.</p>
              </div>
              <span className="period-chip">This month</span>
            </div>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-top">
                  <span>Total income</span>
                  <span className="stat-icon income">↗</span>
                </div>
                <h3>{money(totalIncome)}</h3>
                <p>Income recorded this month</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Total expenses</span>
                  <span className="stat-icon expense">↘</span>
                </div>
                <h3>{money(totalExpenses)}</h3>
                <p>Expenses recorded this month</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Remaining balance</span>
                  <span className="stat-icon balance">₹</span>
                </div>
                <h3>{money(totalIncome - totalExpenses)}</h3>
                <p>Income minus expenses this month</p>
              </article>

              <article className="stat-card">
                <div className="stat-top">
                  <span>Total transactions</span>
                  <span className="stat-icon habit">↕</span>
                </div>
                <h3>{thisMonth.length}</h3>
                <p>Transactions recorded this month</p>
              </article>
            </section>

            <section className="content-grid">
              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent transactions</h2>
                    <p>Your latest income and expenses.</p>
                  </div>
                  <span className="panel-symbol">↗</span>
                </div>

                {loading ? (
                  <p className="transaction-empty">Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <div className="empty-chart">
                    <div className="chart-placeholder">
                      <span>₹</span>
                    </div>
                    <strong>No transactions yet</strong>
                    <p>Add your first transaction to get started.</p>
                  </div>
                ) : (
                  <div className="recent-list">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div className="recent-row" key={transaction._id}>
                        <div>
                          <strong>{transaction.title}</strong>
                          <p>
                            {transaction.category} ·{" "}
                            {new Date(transaction.date).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <strong
                          className={
                            transaction.type === "income"
                              ? "amount-income"
                              : "amount-expense"
                          }
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {money(Number(transaction.amount))}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Transactions")}
                >
                  View transactions <span>→</span>
                </button>
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Today's habits</h2>
                    <p>Small steps count.</p>
                  </div>
                  <span className="panel-symbol purple">✓</span>
                </div>
                <div className="empty-habits">
                  <div className="habit-illustration">✳</div>
                  <strong>Your routine starts here</strong>
                  <p>Habit tracking will be added in the next step.</p>
                  <button
                    className="primary-button"
                    onClick={() => setActivePage("Habits")}
                  >
                    Explore habits <span>→</span>
                  </button>
                </div>
              </article>
            </section>
          </>
        )}

        {activePage === "Transactions" && (
          <section className="transactions-page">
            <div className="section-heading">
              <div>
                <h2>Manage your money</h2>
                <p>Add income and expenses to track your finances.</p>
              </div>
              <span className="period-chip">
                {transactions.length} total
              </span>
            </div>

            <div className="transaction-layout">
              <article className="panel transaction-form-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Add transaction</h2>
                    <p>Your entries are saved in MongoDB.</p>
                  </div>
                </div>

                <form className="transaction-form" onSubmit={addTransaction}>
                  <label>Transaction type</label>
                  <div className="type-toggle">
                    <button
                      type="button"
                      className={type === "expense" ? "selected expense-choice" : ""}
                      onClick={() => {
                        setType("expense");
                        setCategory("Food");
                      }}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={type === "income" ? "selected income-choice" : ""}
                      onClick={() => {
                        setType("income");
                        setCategory("Allowance");
                      }}
                    >
                      Income
                    </button>
                  </div>

                  <label htmlFor="transaction-title">Description</label>
                  <input
                    id="transaction-title"
                    type="text"
                    placeholder="e.g. Lunch or Monthly allowance"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={100}
                    required
                  />

                  <label htmlFor="transaction-amount">Amount (₹)</label>
                  <input
                    id="transaction-amount"
                    type="number"
                    placeholder="e.g. 250"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                  />

                  <label htmlFor="transaction-category">Category</label>
                  <select
                    id="transaction-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  >
                    {(type === "expense"
                      ? ["Food", "Transport", "Education", "Shopping", "Bills", "Health", "Entertainment", "Other"]
                      : ["Allowance", "Salary", "Freelance", "Scholarship", "Gift", "Other"]
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="transaction-date">Date</label>
                  <input
                    id="transaction-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />

                  <button className="primary-button save-button" disabled={saving}>
                    {saving ? "Saving..." : "Save transaction"}
                    <span>→</span>
                  </button>
                </form>
              </article>

              <article className="panel transaction-list-panel">
                <div className="panel-heading">
                  <div>
                    <h2>All transactions</h2>
                    <p>Your saved records appear here.</p>
                  </div>
                  <button
                    type="button"
                    className="refresh-button"
                    onClick={loadTransactions}
                    disabled={loading}
                  >
                    ↻ Refresh
                  </button>
                </div>

                {loading ? (
                  <p className="transaction-empty">Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <div className="transaction-empty">
                    <div className="habit-illustration">↕</div>
                    <strong>No transactions yet</strong>
                    <p>Add your first entry using the form.</p>
                  </div>
                ) : (
                  <div className="transaction-list">
                    {transactions.map((transaction) => (
                      <div className="transaction-row" key={transaction._id}>
                        <div className="transaction-row-icon">
                          {transaction.type === "income" ? "↗" : "↘"}
                        </div>
                        <div className="transaction-details">
                          <strong>{transaction.title}</strong>
                          <p>
                            {transaction.category} ·{" "}
                            {new Date(transaction.date).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <div className="transaction-actions">
                          <strong
                            className={
                              transaction.type === "income"
                                ? "amount-income"
                                : "amount-expense"
                            }
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {money(Number(transaction.amount))}
                          </strong>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => deleteTransaction(transaction._id)}
                            aria-label={`Delete ${transaction.title}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </div>
          </section>
        )}

        

{activePage === "Habits" ? (
  <HabitPage />
) : activePage === "Goals" ? (
  <GoalsPage />
) : activePage === "Budgets" ? (
  <section className="panel coming-soon-panel">
    <div className="habit-illustration">✳</div>
    <h2>Budgets are coming next</h2>
    <p>We'll build your budgeting tools next.</p>
  </section>
) : null}



        <footer>
          <span>LifeBalance</span>
          <span>Progress over perfection.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
