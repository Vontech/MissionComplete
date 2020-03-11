import Tasks from '../models/tasks.model';
import logger from '../setup/logger';

const controller = {};

controller.createTask = async (req, res, next) => {
	const taskData = {
		name: req.body.name || "Untitled",
		notes: req.body.notes || null,
		completed: false,
		parent: req.body.parent || null,
		children: req.body.children,
	};
	Tasks.create(taskData, (err, createdTask) => {
		if (err) {
			logger.error(err);
			return next(err);
		}
		return res.json({ createdTask });
	});
};

export default controller;
