const User = require('../models/User');

/**
 * Ensure the admin account defined in .env exists, so a fresh device/DB
 * always has a working admin login without any manual setup.
 */
const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('Admin seed skipped: ADMIN_EMAIL/ADMIN_PASSWORD not set in .env');
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`Existing user ${ADMIN_EMAIL} promoted to admin`);
      }
      return;
    }

    await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      college: process.env.ADMIN_COLLEGE || 'Administration',
      role: 'admin'
    });

    console.log(`Admin account created for ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Failed to seed admin account:', error.message);
  }
};

module.exports = seedAdmin;
