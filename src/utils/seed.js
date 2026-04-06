/**
 * Seed script - populates database with sample data for testing
 * Run: node src/utils/seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Record = require("../models/Record");

const categories = {
  income: ["Salary", "Freelance", "Investments", "Bonus"],
  expense: ["Food", "Rent", "Transport", "Utilities", "Entertainment", "Shopping"],
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // clear existing data
    await User.deleteMany({});
    await Record.deleteMany({});
    console.log("Cleared old data");

    // create users
    const admin = await User.create({
      name: "Rahul Sharma",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    await User.create({
      name: "Priya Patel",
      email: "analyst@example.com",
      password: "password123",
      role: "analyst",
    });

    await User.create({
      name: "Amit Kumar",
      email: "viewer@example.com",
      password: "password123",
      role: "viewer",
    });

    console.log("Users created");

    // generate 30 sample records spread across last 6 months
    const records = [];

    for (let i = 0; i < 30; i++) {
      const isIncome = Math.random() > 0.55;
      const daysAgo = Math.floor(Math.random() * 180);
      const recordDate = new Date();
      recordDate.setDate(recordDate.getDate() - daysAgo);

      const type = isIncome ? "income" : "expense";
      const catList = categories[type];
      const category = catList[Math.floor(Math.random() * catList.length)];

      records.push({
        amount: isIncome
          ? Math.floor(Math.random() * 50000) + 10000
          : Math.floor(Math.random() * 5000) + 200,
        type,
        category,
        date: recordDate,
        description: `${category} - entry #${i + 1}`,
        createdBy: admin._id, // admin creates all records
      });
    }

    await Record.insertMany(records);
    console.log(`${records.length} records created`);

    console.log("\n--- Seed Complete ---");
    console.log("Admin:   admin@example.com / password123");
    console.log("Analyst: analyst@example.com / password123");
    console.log("Viewer:  viewer@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedData();
