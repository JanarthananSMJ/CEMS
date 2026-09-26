const UserSettings = require('../models/UserSettings');
const SystemSettings = require('../models/SystemSettings');

/**
 * @desc    Get user settings
 * @route   GET /api/settings/user
 * @access  Private
 */
exports.getUserSettings = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;

    // Atomically find-or-create so concurrent requests never race into duplicates
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: userSettings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/settings/user
 * @access  Private
 */
exports.updateUserSettings = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;

    // Only apply fields that are actually provided in the request
    const updates = {};
    if (req.body.notification) updates.notification = req.body.notification;
    if (req.body.theme) updates.theme = req.body.theme;
    if (req.body.language) updates.language = req.body.language;
    if (req.body.privacy) updates.privacy = req.body.privacy;
    updates.updatedAt = Date.now();

    // Atomically find-or-create so concurrent requests never race into duplicates
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { userId } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: userSettings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get system settings
 * @route   GET /api/settings/system
 * @access  Private (Admin only)
 */
exports.getSystemSettings = async (req, res, next) => {
  try {
    // Atomically find-or-create the single system settings document, so
    // concurrent requests never race into creating duplicates
    const systemSettings = await SystemSettings.findOneAndUpdate(
      {},
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/settings/system
 * @access  Private (Admin only)
 */
exports.updateSystemSettings = async (req, res, next) => {
  try {
    // Only apply fields provided in the request (allows partial updates),
    // skipping updatedAt/updatedBy which are managed here directly
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (key !== 'updatedAt' && key !== 'updatedBy') {
        updates[key] = req.body[key];
      }
    });
    updates.updatedBy = req.user.id;
    updates.updatedAt = Date.now();

    // Atomically find-or-create the single system settings document, so
    // concurrent requests never race into creating duplicates
    const systemSettings = await SystemSettings.findOneAndUpdate(
      {},
      { $set: updates },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    next(error);
  }
};