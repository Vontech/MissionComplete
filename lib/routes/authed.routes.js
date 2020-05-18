'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _users = require('../controllers/users.controller');

var _users2 = _interopRequireDefault(_users);

var _tasks = require('../controllers/tasks.controller');

var _tasks2 = _interopRequireDefault(_tasks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// User routes
router.post('/logout', _users2.default.logoutUser);

// Task Routes
router.post('/task', _tasks2.default.createTask);
router.get('/allTasks', _tasks2.default.getTasks);
router.delete('/task/:taskId', _tasks2.default.removeTask);
router.get('/task', _tasks2.default.getTask);
router.patch('/task', _tasks2.default.updateTask);
router.post('/removeChildren', _tasks2.default.removeChildren);

exports.default = router;