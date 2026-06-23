require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Subscription = require('../models/Subscription');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

const seedUsers = [
  {
    firstName: 'Admin', lastName: 'User', email: 'admin@vivahsetu.com',
    mobile: '9999999999', password: 'Admin@123', gender: 'male',
    dateOfBirth: new Date('1990-01-01'), role: 'admin', isEmailVerified: true,
  },
  {
    firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@example.com',
    mobile: '9876543210', password: 'Test@123', gender: 'male',
    dateOfBirth: new Date('1993-05-15'), isEmailVerified: true,
  },
  {
    firstName: 'Priya', lastName: 'Patel', email: 'priya@example.com',
    mobile: '9876543211', password: 'Test@123', gender: 'female',
    dateOfBirth: new Date('1995-08-22'), isEmailVerified: true,
  },
  {
    firstName: 'Arun', lastName: 'Kumar', email: 'arun@example.com',
    mobile: '9876543212', password: 'Test@123', gender: 'male',
    dateOfBirth: new Date('1991-03-10'), isEmailVerified: true,
  },
  {
    firstName: 'Sneha', lastName: 'Verma', email: 'sneha@example.com',
    mobile: '9876543213', password: 'Test@123', gender: 'female',
    dateOfBirth: new Date('1996-11-05'), isEmailVerified: true,
  },
];

const profileData = [
  null, // admin
  { religion: 'Hindu', caste: 'Brahmin', motherTongue: 'Hindi', city: 'Mumbai', state: 'Maharashtra', education: "Bachelor's in Engineering", occupation: 'Software Engineer', annualIncome: '10-15 LPA', diet: 'vegetarian', bio: 'I am a software engineer passionate about technology.' },
  { religion: 'Hindu', caste: 'Patel', motherTongue: 'Gujarati', city: 'Ahmedabad', state: 'Gujarat', education: "Master's in Business", occupation: 'Marketing Manager', annualIncome: '8-12 LPA', diet: 'vegetarian', bio: 'Fun-loving, family-oriented person.' },
  { religion: 'Hindu', caste: 'Kshatriya', motherTongue: 'Telugu', city: 'Hyderabad', state: 'Telangana', education: "MBBS", occupation: 'Doctor', annualIncome: '20-25 LPA', diet: 'non_vegetarian', bio: 'Doctor by profession, traveler by passion.' },
  { religion: 'Hindu', caste: 'Brahmin', motherTongue: 'Marathi', city: 'Pune', state: 'Maharashtra', education: "CA", occupation: 'Chartered Accountant', annualIncome: '12-18 LPA', diet: 'vegetarian', bio: 'Simple, down-to-earth person looking for a life partner.' },
];

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Subscription.deleteMany({});

    for (let i = 0; i < seedUsers.length; i++) {
      const userData = seedUsers[i];
      const user = await User.create(userData);

      const pData = profileData[i];
      const profile = await Profile.create({
        userId: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        age: new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear(),
        gender: user.gender,
        height: 165 + Math.floor(Math.random() * 20),
        weight: 55 + Math.floor(Math.random() * 20),
        maritalStatus: 'never_married',
        ...(pData || {}),
      });

      if (pData) profile.calculateCompletionScore();
      await profile.save();

      user.profileId = profile._id;
      const sub = await Subscription.create({ userId: user._id, plan: 'free' });
      user.subscriptionId = sub._id;
      user.profileCompletionScore = profile.completionScore;
      await user.save({ validateBeforeSave: false });

      console.log(`✅ Created: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log('\n🌱 Seed complete!');
    console.log('Admin: admin@vivahsetu.com / Admin@123');
    console.log('User:  rahul@example.com / Test@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
