const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const Access = require("../models/Access");


router.get("/", auth, authorize("admin", "analista"), async (req, res) => {

	await Access.create({
		user: req.user._id,
		resource: "project",
		action: "read",
		timestamp: new Date(),
	});

	const projects = await Project.find();
	res.json(projects);
});

module.exports = router;
