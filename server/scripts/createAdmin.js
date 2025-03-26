require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdminUsers = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Admin users data array
    const adminUsers = [
      {
        name: 'Parthiv Reddy Yarrapureddy',
        email: 'parthivreddy7769@gmail.com',
        password: 'Parthiv@9',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Lakshmi Reddy Vangala',
        email: 'vlakshmireddy1812@gmail.com',
        password: '!@#$%^&*',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Anchuri Harshith',
        email: 'anchuriharshith323@gmail.com',
        password: 'H_Rshith',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Thangella Jugal Kishore Reddy',
        email: 'thangellajugalkishore@gmail.com',
        password: '123456',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Guru charan reddy',
        email: 'charanreddyguru@gmail.com',
        password: '0utl00k@275',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Aditya vardhan',
        email: 'bayyaadi2@gmail.com',
        password: 'Aditya_@0712',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Bhonagiri Aditya',
        email: 'adityabhonagiri04@gmail.com',
        password: 'ADITYAruck$234',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Somagani Jaithra Sathwik',
        email: 'jaithrasathwiks@gmail.com',
        password: 'Vindiesel@2004',
        role: 'admin',
        isVerified: true
      }
    ];
    
    console.log('Creating/updating admin users...');
    let createdCount = 0;
    let existingCount = 0;
    
    // Process each admin user
    for (const adminData of adminUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: adminData.email });
      
      if (existingUser) {
        console.log(`User with email ${adminData.email} already exists.`);
        existingCount++;
      } else {
        // Create new admin user
        const admin = new User(adminData);
        await admin.save();
        console.log(`Admin user ${adminData.name} created successfully!`);
        createdCount++;
      }
    }
    
    console.log(`\nProcess completed: ${createdCount} admin users created, ${existingCount} already existed.`);
    console.log('\nAdmin User Credentials (for your records):');
    adminUsers.forEach(user => {
      console.log(`- ${user.name}: ${user.email} [Password hidden]`);
    });
    
    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error creating admin users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdminUsers();
