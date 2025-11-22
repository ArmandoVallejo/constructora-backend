const { Schema, model } = require('mongoose');

const accessSchema = new Schema({
	user:{
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	resource:{
		type: String,
		enum: ['project', 'vehicle', 'collection'],
		required: true,
	},
	resourceId:{
		type: Schema.Types.ObjectId,
		required: true,
	},
	action:{
		type: String,
		enum: ['create', 'read', 'update', 'delete'],
		required: true,
	},
	timestamp:{
		type: Date,
		default: Date.now,
	}
});

module.exports = model('Access', accessSchema);