const express = require('express');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth');

connectDB();

const app = express();

app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);


app.use((err, req, res, next) => {
	console.error(err.stack);

	res.status(err.status || 500).json({
		error: true,
		message: err.message || 'Internal Server Error',
	});
});

module.exports = app;
