// server/utils/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const Trainer = require('../models/Trainer');
const Class = require('../models/Class');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const membershipPlans = [
  {
    name: 'Basic',
    price: 2000,
    period: 'month',
    features: [
      'Access to gym equipment',
      'Locker room access',
      'Basic fitness assessment',
      'Mobile app access',
      '24/7 gym access'
    ],
    popular: false,
    iconClass: 'plan-icon-blue'
  },
  {
    name: 'Premium',
    price: 5000,
    period: 'month',
    features: [
      'Everything in Basic',
      'Personal trainer (2 sessions/month)',
      'Group fitness classes',
      'Nutrition consultation',
      'Guest passes (2/month)',
      'Sauna & steam room access'
    ],
    popular: true,
    iconClass: 'plan-icon-primary'
  },
  {
    name: 'Elite',
    price: 8000,
    period: 'month',
    features: [
      'Everything in Premium',
      'Unlimited personal training',
      'Custom meal plans',
      'Priority class booking',
      'Massage therapy (1/month)',
      'VIP lounge access',
      'Unlimited guest passes'
    ],
    popular: false,
    iconClass: 'plan-icon-purple'
  }
];

const trainers = [
  {
    name: 'Sarah Johnson',
    specialization: 'Strength Training & Powerlifting',
    experience: 8,
    image: 'https://i.pinimg.com/736x/6a/a7/6c/6aa76cca9f2a4ce7458902851b89e1b0.jpg',
    bio: 'Former Olympic weightlifter with expertise in strength training and powerlifting. Helped 200+ clients achieve their strength goals.',
    certifications: ['NASM-CPT', 'CSCS', 'Olympic Lifting'],
    stats: {
      clients: 200,
      years: 8,
      rating: 4.9
    }
  },
  {
    name: 'Mike Rodriguez',
    specialization: 'HIIT & Cardio Training',
    experience: 6,
    image: 'https://i.pinimg.com/1200x/88/d1/1a/88d11a3428462b2e143d8c4a28af7a60.jpg',
    bio: 'High-energy trainer specializing in HIIT workouts and cardiovascular conditioning. Marathon runner and fitness enthusiast.',
    certifications: ['ACE-CPT', 'HIIT Specialist', 'Running Coach'],
    stats: {
      clients: 150,
      years: 6,
      rating: 4.8
    }
  },
  {
    name: 'Emily Chen',
    specialization: 'Yoga & Flexibility',
    experience: 10,
    image: 'https://i.pinimg.com/1200x/a5/48/6e/a5486e5ceec98dc2eb463c447ff86994.jpg',
    bio: 'Certified yoga instructor with a focus on flexibility, mindfulness, and holistic wellness. Trained in multiple yoga disciplines.',
    certifications: ['RYT-500', 'Yin Yoga', 'Meditation'],
    stats: {
      clients: 300,
      years: 10,
      rating: 5.0
    }
  },
  {
    name: 'Rose Yougt',
    specialization: 'Bodybuilding & Nutrition',
    experience: 12,
    image: 'https://i.pinimg.com/1200x/2d/5d/1f/2d5d1ff0cafd1dff0a8d3e6b09c5af73.jpg',
    bio: 'Professional bodybuilder and nutrition expert. Specializes in muscle building, cutting, and competition preparation.',
    certifications: ['IFBB Pro', 'Nutrition Specialist', 'Contest Prep'],
    stats: {
      clients: 180,
      years: 12,
      rating: 4.9
    }
  }
];

const classes = [
  {
    name: 'Morning Yoga',
    trainer: 'Emily Chen',
    type: 'Yoga',
    difficulty: 'Beginner',
    duration: 60,
    day: 'Monday',
    time: '06:00',
    maxSpots: 15,
    bookedSpots: 0
  },
  {
    name: 'HIIT Bootcamp',
    trainer: 'Mike Rodriguez',
    type: 'HIIT',
    difficulty: 'Advanced',
    duration: 45,
    day: 'Monday',
    time: '08:00',
    maxSpots: 12,
    bookedSpots: 0
  },
  {
    name: 'Strength Training',
    trainer: 'Sarah Johnson',
    type: 'Strength',
    difficulty: 'Intermediate',
    duration: 60,
    day: 'Monday',
    time: '10:00',
    maxSpots: 10,
    bookedSpots: 0
  },
  {
    name: 'Evening Flow',
    trainer: 'Emily Chen',
    type: 'Yoga',
    difficulty: 'All Levels',
    duration: 75,
    day: 'Monday',
    time: '18:00',
    maxSpots: 20,
    bookedSpots: 0
  },
  {
    name: 'Cardio Blast',
    trainer: 'Mike Rodriguez',
    type: 'Cardio',
    difficulty: 'Intermediate',
    duration: 45,
    day: 'Monday',
    time: '19:30',
    maxSpots: 15,
    bookedSpots: 0
  },
  {
    name: 'Power Lifting',
    trainer: 'Sarah Johnson',
    type: 'Strength',
    difficulty: 'Advanced',
    duration: 90,
    day: 'Tuesday',
    time: '07:00',
    maxSpots: 8,
    bookedSpots: 0
  },
  {
    name: 'Zumba Dance',
    trainer: 'Rose Yougt',
    type: 'Dance',
    difficulty: 'All Levels',
    duration: 60,
    day: 'Tuesday',
    time: '09:00',
    maxSpots: 25,
    bookedSpots: 0
  },
  {
    name: 'Lunch Break Cardio',
    trainer: 'Mike Rodriguez',
    type: 'Cardio',
    difficulty: 'Beginner',
    duration: 30,
    day: 'Tuesday',
    time: '12:00',
    maxSpots: 15,
    bookedSpots: 0
  },
  {
    name: 'Vinyasa Yoga',
    trainer: 'Emily Chen',
    type: 'Yoga',
    difficulty: 'Intermediate',
    duration: 60,
    day: 'Tuesday',
    time: '17:00',
    maxSpots: 18,
    bookedSpots: 0
  },
  {
    name: 'CrossFit',
    trainer: 'Sarah Johnson',
    type: 'HIIT',
    difficulty: 'Advanced',
    duration: 60,
    day: 'Tuesday',
    time: '19:00',
    maxSpots: 12,
    bookedSpots: 0
  }
];

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await MembershipPlan.deleteMany();
    await Trainer.deleteMany();
    await Class.deleteMany();
    
    // Import membership plans
    await MembershipPlan.insertMany(membershipPlans);
    console.log('Membership plans imported');
    
    // Import trainers
    await Trainer.insertMany(trainers);
    console.log('Trainers imported');
    
    // Get trainer IDs for classes
    const trainerDocs = await Trainer.find();
    const trainerMap = {};
    trainerDocs.forEach(trainer => {
      trainerMap[trainer.name] = trainer._id;
    });
    
    // Add trainer IDs to classes
    const classesWithTrainerIds = classes.map(cls => ({
      ...cls,
      trainerId: trainerMap[cls.trainer]
    }));
    
    // Import classes
    await Class.insertMany(classesWithTrainerIds);
    console.log('Classes imported');
    
    console.log('Data import complete!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await MembershipPlan.deleteMany();
    await Trainer.deleteMany();
    await Class.deleteMany();
    
    console.log('Data deleted!');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Run script
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import data or -d to delete data');
  process.exit();
}
