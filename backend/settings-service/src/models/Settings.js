const mongoose = require('mongoose');

/**
 * Base model for the single "settings" collection. SystemSettings and
 * UserSettings are stored here as discriminated sub-types (distinguished by
 * the `kind` field) instead of living in two separate collections.
 */
const settingsSchema = new mongoose.Schema({}, {
  collection: 'settings',
  discriminatorKey: 'kind'
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
