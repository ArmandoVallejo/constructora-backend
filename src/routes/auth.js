const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

router.post('/register', async (req, res) => {

	const { email, password, name, role } = req.body;

	if (!email || !password || !name || !role) {
		return res.status(400).json({ error: 'All fields are required' });
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return res.status(409).json({ error: 'Email already in use' });
	}

	const hashedPassword = bcrypt.hashSync(password, 10);

	try {
		const newUser = new User();
		newUser.email = email;
		newUser.password = hashedPassword;
		newUser.name = name;
		newUser.role = role;
		await newUser.save();
		return res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		return res.status(500).json({ error: 'Server error', details: error.message });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required' });
	}

	const user = await User.findOne({ email });

	if (!user) {
		return res.status(401).json({ error: 'Invalid email or password' });
	}

	const isPasswordValid = bcrypt.compareSync(password, user.password);

	if (!isPasswordValid) {
		return res.status(401).json({ error: 'Invalid email or password' });
	}

	const token = jwt.sign(
		{
			id: user._id,
			email: user.email,
			role: user.role
		},
		process.env.JWT_SECRET,
		{ expiresIn: '1h' }
	);

	return res.status(200).json({
		message: 'Login succesfully',
		token
	});
});

module.exports = router;