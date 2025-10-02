require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model

const port = process.env.PORT || 5000;

// --- Initialize Master User ---
const initializeMasterUser = async () => {
    try {
        const masterUserExists = await User.findOne({ userType: 'master' });
        if (!masterUserExists) {
            console.log('Master user not found, creating one...');
            await User.create({
                name: 'Master User',
                username: 'master',
                password: 'master123', // This will be hashed by the pre-save hook
                userType: 'master',
            });
            console.log('Master user created successfully.');
        } else {
            console.log('Master user already exists.');
        }
    } catch (error) {
        console.error('Error during master user initialization:', error);
        process.exit(1);
    }
};

// --- Start Server ---
const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to the database.');
        
        await initializeMasterUser();

        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.error('Failed to start the server:', error);
        process.exit(1);
    }
};

start();
