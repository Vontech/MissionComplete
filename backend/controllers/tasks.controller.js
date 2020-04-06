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
		return res.json(createdTask);
	});
};

controller.removeTask = async (req, res, next) => {
	let baseError = 'Error deleting task -';
	if (!req.body.hasOwnProperty('task_id') || !req.body.task_id) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	Tasks.findByIdAndDelete(req.body.task_id, (err) => {
		if (err) {
			res.status(400);
			return res.json({ message: `${baseError} could not find task with id '${req.body.task_id}'`});
		} else {
			res.status(200);
			return res.json({ message: `Successfully deleted task with id '${req.body.task_id}'`});
		}
	});
}

controller.getTask = async (req, res, next) => {
	let baseError = 'Error getting task -';
	if (!req.body.hasOwnProperty('task_id') || !req.body.task_id) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	Tasks.findById(req.body.task_id, (err, retrievedTask) => {
		if (err) {
			res.status(400);
			return res.json({ message: `${baseError} could not find task with id '${req.body.task_id}'`});
		} else {
			res.status(200);
			return res.json(retrievedTask);
		}
	});
}

controller.updateTask = async (req, res, next) => {
	let baseError = 'Error getting task -';
	if (!req.body.hasOwnProperty('task_id') || !req.body.task_id) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	let currentTask;
	// Get the task by task_id
	await Tasks.findById(req.body.task_id, (err, found_task) => {
		if (err) {
			res.status(400);
			return res.json({ message: `${baseError} could not find task with id '${req.body.task_id}'`});
		} else {
			currentTask = found_task;
		}
	});
	// Set variables with updated values from the request, keep defaults if no value given
	let new_name = (req.body.name) ? req.body.name : currentTask.name;
	let new_notes = (req.body.notes) ? req.body.notes : currentTask.notes;
	let new_completed = (req.body.completed) ? req.body.completed : currentTask.completed;
	let new_parent;
	// If a new parent task ID is given, verify that it is valid
	if (req.body.parent) {
		if (currentTask.parent === req.body.parent) {
			res.status(400);
			return res.json({ message: `Error updating task - cannot make a task its own parent`});
		}
		await Tasks.findById(req.body.parent, (err, parentTask) => {
			if (err) {
				res.status(400);
				return res.json({ message: `Error updating task - could not find parent task with id '${req.body.parent}'`});
			} else {
				// If a new parent is defined, add the given task to its list of children
				new_parent = req.body.parent;
				Tasks.findByIdAndUpdate(new_parent, { $addToSet: { children: req.body.task_id }}, 
				{ new: true }, (err, updatedTask) => {
					if (err) {
						res.status(400);
						return res.json({ message: `Error adding children` });
					}
				});
			}
		});
	} else {
		new_parent = currentTask.parent;
	}
	// Update the given task with the new attribute valuess
	Tasks.findByIdAndUpdate(req.body.task_id, { '$set': { 'name': new_name, 'notes': new_notes, 
	'completed': new_completed, 'parent': new_parent }}, { new: true }, (err, updatedTask) => {
		if (err) {
			res.status(400);
			return res.json({ message: 'Error updating task' });
		} else {
			res.status(200);
			return res.json(updatedTask);
		}
	});
}

controller.addChildren = async (req, res, next) => {
	let baseError = 'Error getting task -';
	if (!req.body.hasOwnProperty('task_id') || !req.body.task_id) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	// For each child to be added, set its parent as the given task
	req.body.child_ids.forEach(child_id => {
		Tasks.findByIdAndUpdate(child_id, { '$set': { 'parent': req.body.task_id }}, 
		{ new: true }, (err, childTask) => {
			if (err) {
				res.status(400);
				return res.json({ message: `${baseError} could not find task with id '${child_id}'`});
			}
		});
	});
	await Tasks.findByIdAndUpdate(req.body.task_id, { $addToSet: { children: req.body.child_ids }}, 
	{ new: true }, (err, updatedTask) => {
		if (err) {
			res.status(400);
			return res.json({ message: `Error adding children` });
		} else {
			res.status(200);
			return res.json(updatedTask);
		}
	});
}

controller.removeChildren = async (req, res, next) => {
	let baseError = 'Error getting task -';
	if (!req.body.hasOwnProperty('task_id') || !req.body.task_id) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	// For each child to be added, set its parent as the given task
	req.body.child_ids.forEach(async function (child_id) {
		await Tasks.findByIdAndUpdate(child_id, { '$set': { 'parent': null }}, 
		{ new: true }, (err, childTask) => {
			if (err) {
				res.status(400);
				return res.json({ message: `${baseError} could not find task with id '${child_id}'`});
			}
		});
	});
	await Tasks.findByIdAndUpdate(req.body.task_id, { $pull: { children: { $in: req.body.child_ids }}}, 
	{ new: true }, (err, updatedTask) => {
		if (err) {
			res.status(400);
			return res.json({ message: 'Error removing children' });
		} else {
			res.status(200);
			return res.json(updatedTask);
		}
	});

}

export default controller;
