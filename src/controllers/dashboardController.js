const Record = require("../models/Record");

// GET /api/dashboard/summary - overall income/expense/balance
exports.getSummary = async (req, res, next) => {
  try {
    const result = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // parse the aggregation result
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach((item) => {
      if (item._id === "income") {
        totalIncome = item.total;
        incomeCount = item.count;
      } else if (item._id === "expense") {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalRecords: incomeCount + expenseCount,
        incomeCount,
        expenseCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/category-summary - breakdown by category
exports.getCategorySummary = async (req, res, next) => {
  try {
    const result = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // reshape data so frontend gets one object per category
    const categories = {};
    result.forEach((item) => {
      const cat = item._id.category;
      if (!categories[cat]) {
        categories[cat] = { category: cat, income: 0, expense: 0, net: 0, count: 0 };
      }
      if (item._id.type === "income") {
        categories[cat].income = item.total;
      } else {
        categories[cat].expense = item.total;
      }
      categories[cat].count += item.count;
      categories[cat].net = categories[cat].income - categories[cat].expense;
    });

    res.json({
      success: true,
      data: Object.values(categories),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/monthly-trends - income & expense by month
exports.getMonthlyTrends = async (req, res, next) => {
  try {
    // default to last 12 months
    const monthsBack = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const result = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // group by month for cleaner response
    const trends = {};
    result.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (!trends[key]) {
        trends[key] = { month: key, income: 0, expense: 0, net: 0 };
      }
      if (item._id.type === "income") {
        trends[key].income = item.total;
      } else {
        trends[key].expense = item.total;
      }
      trends[key].net = trends[key].income - trends[key].expense;
    });

    res.json({
      success: true,
      data: Object.values(trends),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/recent - last N transactions
exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 10);

    const records = await Record.find({ isDeleted: false })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};
