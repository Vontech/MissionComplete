'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TaskSchema = new _mongoose2.default.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  completed: { type: Boolean },
  parent: { type: String },
  children: { type: [String] },
  dueDate: { type: Date },
  priority: { type: Number },
  user: { type: String }
});

var Tasks = _mongoose2.default.model('Tasks', TaskSchema);

exports.default = Tasks;