const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// GET /api/users - get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id - get single user
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id/role - update user role (admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !["viewer", "analyst", "admin"].includes(role)) {
      throw new ApiError(400, "Valid role is required (viewer, analyst, admin)");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, "You cannot change your own role");
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `Role updated to ${role}`,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id/status - activate/deactivate user (admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean value");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // can't deactivate yourself
    if (user._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, "You cannot change your own status");
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: isActive ? "User activated" : "User deactivated",
      data: { _id: user._id, name: user.name, isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};
