const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function connectDB() {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('Successfully connected to the database ' + mongoose.connection.name);
	} catch (error) {
		console.error('Error connecting to the database:', error);
		process.exit(1);
	}
}

module.exports = connectDB;