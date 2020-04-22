import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
	type: String,
	trim: true,
  },
  completed: { type: Boolean },
  parent: { type: String },
  children: { type: [String] },
  user: { type: String },
});

const Tasks = mongoose.model('Tasks', TaskSchema);

export default Tasks;