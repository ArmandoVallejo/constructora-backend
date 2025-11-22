const {Schema, model} = require('mongoose');

const projectSchema = new Schema({
	name:{
		type: String,
		required: true,
	},
	location:{
		address:{
			type: String,
			required: true,
		},
		lat:{
			type: Number,
			required: true,
		},
		lng:{
			type: Number,
			required: true,
		}
	},
	status:{
		type: String,
		enum: ['planned', 'in-progress', 'completed'],
		default: 'planned'
	},
	startDate:{
		type: Date,
		required: true,
	},
	client:{
		type: String,
		required: true,
	}
});

module.exports = model('Project', projectSchema);