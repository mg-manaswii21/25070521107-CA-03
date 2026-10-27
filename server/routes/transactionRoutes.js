
const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All transaction routes require login.
router.use(authMiddleware);

// Get only the logged-in user's transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch transactions." });
  }
});

// Add a transaction for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { type, title, amount, category, date } = req.body;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Choose income or expense." });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Enter a valid title (max 100 characters).",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero.",
      });
    }

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ message: "Enter a category." });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      date: date || new Date(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: "Could not create transaction." });
  }
});

// Delete only a transaction belonging to the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction ID." });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    res.json({ message: "Transaction deleted." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete transaction." });
  }
});

module.exports = router;
