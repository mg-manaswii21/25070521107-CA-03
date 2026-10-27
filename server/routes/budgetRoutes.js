
const express = require("express");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Get budgets for a selected month and year, including actual spending.
router.get("/", async (req, res) => {
  try {
    const currentDate = new Date();
    const month = Number(req.query.month) || currentDate.getMonth() + 1;
    const year = Number(req.query.year) || currentDate.getFullYear();

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12." });
    }

    if (!Number.isInteger(year) || year < 2020 || year > 2100) {
      return res.status(400).json({ message: "Enter a valid year." });
    }

    const budgets = await Budget.find({ month, year }).sort({ category: 1 });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const spending = await Transaction.aggregate([
      {
        $match: {
          type: "expense",
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const spendingByCategory = Object.fromEntries(
      spending.map((item) => [item._id, item.total])
    );

    res.json(
      budgets.map((budget) => ({
        ...budget.toObject(),
        spent: spendingByCategory[budget.category] || 0,
        remaining: budget.limit - (spendingByCategory[budget.category] || 0),
      }))
    );
  } catch (error) {
    console.error("Fetch budgets error:", error.message);
    res.status(500).json({ message: "Could not fetch budgets." });
  }
});

// Create or update a category budget for a month.
router.post("/", async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const budgetLimit = Number(limit);
    const budgetMonth = Number(month);
    const budgetYear = Number(year);

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ message: "Enter a budget category." });
    }

    if (category.trim().length > 60) {
      return res.status(400).json({ message: "Category must be 60 characters or fewer." });
    }

    if (!Number.isFinite(budgetLimit) || budgetLimit <= 0) {
      return res.status(400).json({ message: "Budget limit must be greater than zero." });
    }

    if (!Number.isInteger(budgetMonth) || budgetMonth < 1 || budgetMonth > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12." });
    }

    if (!Number.isInteger(budgetYear) || budgetYear < 2020 || budgetYear > 2100) {
      return res.status(400).json({ message: "Enter a valid year." });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        category: category.trim(),
        month: budgetMonth,
        year: budgetYear,
      },
      {
        $set: { limit: budgetLimit },
        $setOnInsert: {
          category: category.trim(),
          month: budgetMonth,
          year: budgetYear,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    console.error("Save budget error:", error.message);
    res.status(500).json({ message: "Could not save budget." });
  }
});

// Delete a budget by its MongoDB ID.
router.delete("/:id", async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid budget ID." });
    }

    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found." });
    }

    res.json({ message: "Budget deleted." });
  } catch (error) {
    console.error("Delete budget error:", error.message);
    res.status(500).json({ message: "Could not delete budget." });
  }
});

module.exports = router;
