const { Schema, model } = require("mongoose");

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['admin', 'analista', 'visitante'],
		default: 'visitante'
	}
});

module.exports = model("User", userSchema);