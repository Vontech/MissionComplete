'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tasks = require('../models/tasks.model');

var _tasks2 = _interopRequireDefault(_tasks);

var _logger = require('../setup/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var controller = {};
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
	var task = null;
	try {
		task = await _tasks2.default.findById(task_id);
	} catch (err) {}
	if (!task) {
		return 'could not find task with id \'' + task_id + '\'';
	}
	var parent_id = task.parent;

	// Set the parent of this task to null
	var newTask = await _tasks2.default.findByIdAndUpdate(task_id, { '$set': { 'parent': null } }, { new: true });
	if (!newTask || newTask.parent != null) {
		return 'Unable to remove the parent from this task';
	}

	// Remove the child from that parent task, if it exists
	if (parent_id) {
		var newParent = await _tasks2.default.findByIdAndUpdate(parent_id, { '$pull': { 'children': { $in: [task_id] } } }, { new: true });
		if (newParent.children.includes(task_id)) {
			return 'Unable to remove the task from its parent';
		}
	}
	return null;
}

controller.getTasks = async function (req, res, next) {
	_tasks2.default.find({ user: req.session.userId }, function (err, tasks) {
		if (err) {
			res.status(400);
			return res.json({ message: 'Error getting tasks: ' + err });
		}
		res.status(200);
		res.json(tasks);
	});
};

// Create task will create a task, optionally within an existing tree
// Possible parameters:
//  - name
//  - notes
//  - completed
//  - parent
//  - children
controller.createTask = async function (req, res, next) {
	var taskData = {
		name: req.body.name || "Untitled",
		notes: req.body.notes || null,
		completed: false,
		parent: null,
		children: req.body.children,
		dueDate: req.body.dueDate || undefined,
		priority: req.body.priority || 4,
		user: req.session.userId
	};
	_tasks2.default.create(taskData, function (err, createdTask) {
		if (err) {
			_logger2.default.error(err);
			return next(err);
		}

		// If no parent, just return the task, otherwise attach parent
		if (!req.body.parent) {
			res.status(200);
			return res.json(createdTask);
		}

		var proxy_request = {
			body: {
				task_id: createdTask._id,
				parent: req.body.parent
			}
		};

		controller.updateTask(proxy_request, res, next);
	});
};

// Removes a task from a tree. 
controller.removeTask = async function (req, res, next) {

	// Make sure the task is valid
	var baseError = 'Error deleting task -';
	if (!req.params.hasOwnProperty('taskId') || req.params.taskId == null) {
		res.status(400);
		return res.json({ message: baseError + ' invalid task ID' });
	}

	var task_id = req.params.taskId;

	// Remove the task from the upper tree
	var removeFromTreeErr = await disassociateTaskFromParent(task_id);
	if (removeFromTreeErr) {
		res.status(400);
		return res.json({ message: baseError + ' ' + removeFromTreeErr });
	}

	// Disassociate each child from this task
	var task = await _tasks2.default.findById(task_id);
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = task.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var child = _step.value;

			await disassociateTaskFromParent(child);
		}

		// Delete the child
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	_tasks2.default.findByIdAndDelete(task_id, function (err) {
		if (err) {
			res.status(400);
			return res.json({ message: baseError + ' ' + err });
		} else {
			res.status(200);
			return res.json({ message: 'Successfully deleted task with id \'' + task_id + '\'' });
		}
	});
};

controller.getTask = async function (req, res, next) {
	var baseError = 'Error getting task -';
	if (!hasTaskId(req)) {
		res.status(400);
		return res.json({ message: baseError + ' invalid task ID' });
	}
	_tasks2.default.findById(req.body.task_id, function (err, retrievedTask) {
		if (err || retrievedTask == null) {
			res.status(400);
			return res.json({ message: baseError + ' could not find task with id \'' + req.body.task_id + '\'' });
		} else {
			res.status(200);
			return res.json(retrievedTask);
		}
	});
};

controller.updateTask = async function (req, res, next) {
	var baseError = 'Error getting task -';
	if (!hasTaskId(req)) {
		res.status(400);
		return res.json({ message: baseError + ' invalid task ID' });
	}
	// Get the task by task_id
	var currentTask = await _tasks2.default.findById(req.body.task_id);
	if (!currentTask) {
		res.status(400);
		return res.json({ message: baseError + ' could not find task with id \'' + req.body.task_id + '\'' });
	}
	// Set variables with updated values from the request, keep defaults if no value given
	var new_name = req.body.name ? req.body.name : currentTask.name;
	var new_notes = req.body.notes ? req.body.notes : currentTask.notes;
	var new_completed = req.body.completed ? req.body.completed : currentTask.completed;
	var new_due_date = req.body.dueDate ? req.body.dueDate : currentTask.dueDate;
	var new_priority = req.body.priority ? req.body.priority : currentTask.priority;
	var new_parent = void 0;
	// If a new parent task ID is given, verify that it is valid
	if (req.body.parent) {
		if (currentTask.id === req.body.parent) {
			res.status(400);
			return res.json({ message: 'Error updating task - cannot make a task its own parent' });
		}

		var parentTask = null;
		try {
			parentTask = await _tasks2.default.findById(req.body.parent);
		} catch (err) {
			res.status(400);
			return res.json({ message: 'Could not find desired parent task with id \'' + req.body.parent + '\'' });
		}

		if (!parentTask) {
			res.status(400);
			return res.json({ message: baseError + ' could not find desired parent task with id \'' + req.body.parent + '\'' });
		}
		new_parent = req.body.parent;
	} else {
		new_parent = currentTask.parent;
	}

	// Update the task itself
	// TODO: We need to make this operation atomic
	var to_update = {
		'name': new_name,
		'notes': new_notes,
		'completed': new_completed,
		'parent': new_parent,
		'dueDate': new_due_date,
		'priority': new_priority
	};
	_tasks2.default.findByIdAndUpdate(req.body.task_id, { '$set': to_update }, { new: true }, function (err, updatedTask) {
		if (err) {
			res.status(400);
			return res.json({ message: 'Error updating task' });
		} else {

			// Also update new parent if there is a new parent
			if (new_parent != currentTask.parent) {
				_tasks2.default.findByIdAndUpdate(new_parent, { $addToSet: { children: updatedTask.id } }, { new: true }, function (err, updatedParent) {
					if (err) {
						res.status(400);
						return res.json({ message: 'Error adding children' });
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
};

controller.removeChildren = async function (req, res, next) {

	// Make sure the task is valid
	var baseError = 'Error removing child -';
	var child_ids = req.body.child_ids;

	if (!(req.body.hasOwnProperty('child_ids') && req.body.child_ids)) {
		res.status(500);
		return res.json({ message: 'Error removing children - no children given' });
	}

	// Remove the task from the upper tree, and then set the 
	var errors = [];
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = child_ids[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var child = _step2.value;

			var removeFromTreeErr = await disassociateTaskFromParent(child);
			if (removeFromTreeErr) {
				errors.append(baseError + ' ' + removeFromTreeErr);
			}
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}

	res.status(200);
	return res.json({ 'errors': errors });
};

exports.default = controller;