const Record = require("../models/Record");
const ApiError = require("../utils/ApiError");

// POST /api/records - create a new record (admin only)
exports.createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    const record = await Record.create({
      amount,
      type,
      category,
      date: date || Date.now(),
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// GET /api/records - get all records with filters, search & pagination
exports.getRecords = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    // build filter object
    const filter = { isDeleted: false };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        throw new ApiError(400, "Type must be income or expense");
      }
      filter.type = type;
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // search across category and description
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // cap at 100
    const skip = (pageNum - 1) * limitNum;

    const records = await Record.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Record.countDocuments(filter);

    res.json({
      success: true,
      count: records.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/records/:id - get single record
exports.getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("createdBy", "name email");

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// PUT /api/records/:id - update a record (admin only)
exports.updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;

    // validate type if provided
    if (type && !["income", "expense"].includes(type)) {
      throw new ApiError(400, "Type must be income or expense");
    }

    // validate amount if provided
    if (amount !== undefined && (typeof amount !== "number" || amount < 0)) {
      throw new ApiError(400, "Amount must be a positive number");
    }

    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    // update fields if provided
    if (amount !== undefined) record.amount = amount;
    if (type) record.type = type;
    if (category) record.category = category;
    if (date) record.date = date;
    if (description !== undefined) record.description = description;

    await record.save();

    res.json({ success: true, message: "Record updated", data: record });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/records/:id - soft delete (admin only)
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    record.isDeleted = true;
    await record.save();

    res.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    next(error);
  }
};
