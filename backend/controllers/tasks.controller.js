import Tasks from '../models/tasks.model';
import logger from '../setup/logger';

const controller = {};
var moment = require('moment');

function hasTaskId(req) {
	return req.body.hasOwnProperty('task_id') && req.body.task_id;
}

/**
 * Disassociates a task from it's parent by updating this parent
 * and removing it as a child from the parent
 * @param {task_id} The task to disassociate from a parent 
 */
async function disassociateTaskFromParent(task_id) {
	// Grab this task and it's parent id
	let task = null;
	try {
		task = await Tasks.findById(task_id);
	} catch(err) {}
	if (!task) {
		return `could not find task with id '${task_id}'`;
	}
	let parent_id = task.parent

	// Set the parent of this task to null
	let newTask = await Tasks.findByIdAndUpdate(task_id, { '$set': { 'parent': null}}, { new: true });
	if (!newTask || newTask.parent != null) {
		return 'Unable to remove the parent from this task';
	}

	// Remove the child from that parent task, if it exists
	if (parent_id) {
		let newParent = await Tasks.findByIdAndUpdate(parent_id, { '$pull': { 'children': { $in: [task_id] }}}, { new: true });
		if (newParent.children.includes(task_id)) {
			return 'Unable to remove the task from its parent';
		}
	}
	return null;
}

controller.getTasks = async (req, res, next) => {
	Tasks.find({user: req.session.userId}, (err, tasks) => {
		if (err) {
			res.status(400);
			return res.json({ message: `Error getting tasks: ${err}` });
		}
		res.status(200);
		res.json(tasks);
	});
}

// Create task will create a task, optionally within an existing tree
// Possible parameters:
//  - name
//  - notes
//  - completed
//  - parent
//  - children
controller.createTask = async (req, res, next) => {
	const taskData = {
		name: req.body.name || "Untitled",
		notes: req.body.notes || null,
		completed: false,
		parent: null,
		children: req.body.children,
		dueDate: req.body.dueDate || undefined,
		priority: req.body.priority || 4,
		user: req.session.userId
	};
	Tasks.create(taskData, (err, createdTask) => {
		if (err) {
			logger.error(err);
			return next(err);
		}

		// If no parent, just return the task, otherwise attach parent
		if (!req.body.parent) {
			res.status(200);
			return res.json(createdTask);
		}

		let proxy_request = {
			body: {
				task_id: createdTask._id,
				parent: req.body.parent
			}
		}
		
		controller.updateTask(proxy_request, res, next);
		
	});
};

// Removes a task from a tree. 
controller.removeTask = async (req, res, next) => {

	// Make sure the task is valid
	let baseError = 'Error deleting task -';
	if (!req.params.hasOwnProperty('taskId') || req.params.taskId == null) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}

	let task_id = req.params.taskId;

	// Remove the task from the upper tree
	let removeFromTreeErr = await disassociateTaskFromParent(task_id);
	if (removeFromTreeErr) {
		res.status(400);
		return res.json({ message: `${baseError} ${removeFromTreeErr}` });
	}

	// Disassociate each child from this task
	let task = await Tasks.findById(task_id);
	for (let child of task.children) {
		await disassociateTaskFromParent(child);
	}

	// Delete the child
	Tasks.findByIdAndDelete(task_id, (err) => {
		if (err) {
			res.status(400);
			return res.json({ message: `${baseError} ${err}`});
		} else {
			res.status(200);
			return res.json({ message: `Successfully deleted task with id '${task_id}'`});
		}
	});
}

controller.getTask = async (req, res, next) => {
	let baseError = 'Error getting task -';
	if (!hasTaskId(req)) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	Tasks.findById(req.body.task_id, (err, retrievedTask) => {
		if (err || retrievedTask == null) {
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
	if (!hasTaskId(req)) {
		res.status(400);
		return res.json({ message: `${baseError} invalid task ID` });
	}
	// Get the task by task_id
	let currentTask = await Tasks.findById(req.body.task_id);
	if (!currentTask) {
		res.status(400);
		return res.json({ message: `${baseError} could not find task with id '${req.body.task_id}'`});
	}
	// Set variables with updated values from the request, keep defaults if no value given
	let new_name = (req.body.name) ? req.body.name : currentTask.name;
	let new_notes = (req.body.notes) ? req.body.notes : currentTask.notes;
	let new_completed = (req.body.completed) ? req.body.completed : currentTask.completed;
	let new_due_date = (req.body.dueDate) ? req.body.dueDate : currentTask.dueDate;
	let new_priority = (req.body.priority) ? req.body.priority : currentTask.priority;
	let new_parent;
	// If a new parent task ID is given, verify that it is valid
	if (req.body.parent) {
		if (currentTask.id === req.body.parent) {
			res.status(400);
			return res.json({ message: `Error updating task - cannot make a task its own parent`});
		}

		let parentTask = null;
		try {
			parentTask = await Tasks.findById(req.body.parent);
		} catch(err) {
			res.status(400);
			return res.json({ message: `Could not find desired parent task with id '${req.body.parent}'`});
		}
		
		if (!parentTask) {
			res.status(400);
			return res.json({ message: `${baseError} could not find desired parent task with id '${req.body.parent}'`});
		}
		new_parent = req.body.parent;
	} else {
		new_parent = currentTask.parent;
	}

	// Update the task itself
	// TODO: We need to make this operation atomic
	let to_update = {
		'name': new_name, 
		'notes': new_notes,
		'completed': new_completed,
		'parent': new_parent,
		'dueDate': new_due_date,
		'priority': new_priority
	}
	Tasks.findByIdAndUpdate(req.body.task_id, {'$set': to_update}, { new: true }, (err, updatedTask) => {
		if (err) {
			res.status(400);
			return res.json({ message: 'Error updating task' });
		} else {

			// Also update new parent if there is a new parent
			if (new_parent != currentTask.parent) {
				Tasks.findByIdAndUpdate(new_parent, { $addToSet: { children: updatedTask.id }}, 
					{ new: true }, (err, updatedParent) => {
						if (err) {
							res.status(400);
							return res.json({ message: `Error adding children` });
						}
						res.status(200);
						return res.json(updatedTask);
					});
			} else {
				res.status(200);
				return res.json(updatedTask);
			}
			
		}
	});
}

controller.removeChildren = async (req, res, next) => {

	// Make sure the task is valid
	let baseError = 'Error removing child -'
	let child_ids = req.body.child_ids;

	if (!(req.body.hasOwnProperty('child_ids') && req.body.child_ids)) {
		res.status(500);
		return res.json({ message: `Error removing children - no children given`})
	}

	// Remove the task from the upper tree, and then set the 
	let errors = [];
	for (let child of child_ids) {
		let removeFromTreeErr = await disassociateTaskFromParent(child);
		if (removeFromTreeErr) {
			errors.append(`${baseError} ${removeFromTreeErr}`)
		}
	}

	res.status(200);
	return res.json({'errors': errors});

}

export default controller;
