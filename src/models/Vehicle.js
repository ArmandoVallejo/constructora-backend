const { Schema, model } = require('mongoose');

const vehicleSchema = new Schema({
	licensePlate:{
		type: String,
		required: true,
		unique: true
	},
	type:{
		type: String,
		required: true
	},
	status:{
		type: String,
		enum: ['available', 'in_use', 'maintenance'],
		default: 'available'
	},
	assignedToProject:{
		type: Schema.Types.ObjectId,
		ref: 'Project',
		default: null
	}
});

module.exports = model('Vehicle', vehicleSchema);