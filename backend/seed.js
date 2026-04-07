const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/user.model');

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@cpms.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log('Email: admin@cpms.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const admin = new User({
      first_name: 'Super',
      middle_name: '',
      last_name: 'Admin',
      email: 'admin@cpms.com',
      password: hashedPassword,
      role: 'superuser',
      number: 9999999999,
      gender: 'Male',
      isProfileCompleted: true
    });

    await admin.save();
    console.log('✅ SuperAdmin created successfully!');
    console.log('📧 Email: admin@cpms.com');
    console.log('🔑 Password: Admin@123');
    console.log('\n💡 Use these credentials to login as Admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
