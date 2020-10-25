import React from 'react';
import { action } from '@storybook/addon-actions';


import TaskV3 from './TaskV3';
import Taskk from '../Models'

export default {
  //component: TaskV3,
  title: 'Task',
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
  argTypes: {
    priority: {control: { type: 'range', min: 0, max: 2, step: 1 }},
    progress: {control: { type: 'range', min: 0, max: 1, step: .01 }},
    name: { control: 'text' },
    category: { control: 'text' },
    dueDate: { control: 'date' },
    notes: { control: {type: 'text'}},
    completed: { control: 'boolean' },
    categoryColor: { control: 'color' }
  },
};

export const exampleTaskData = { 
    "_id": "5eefbebb5baaa3b7f06e05bd", 
    "children": [], 
    "name": "Finish MissionComplete", 
    "notes": "These are some notes!", 
    "completed": false, 
    "parent": "5eefbeb55baaa3b7f06e05bc", 
    "priority": 2, 
    "dueDate": new Date('Jan 25 2017'),
    "category": "My Categories",
    "categoryColor": "#41B768"
  }

export const actionsData = {
  onPinTask: action('onPinTask'),
  onArchiveTask: action('onArchiveTask'),
};

const Template = (args) => {
  var newTaskData = Object.assign({}, exampleTaskData);
  newTaskData = Object.assign(newTaskData, args);
  let task = new Taskk(newTaskData);

  console.log(task);
  return (<TaskV3 task={task} progress={args.progress} {...actionsData} />)
}

export const Default = Template.bind({})

Default.args = {
  dueDate: exampleTaskData.dueDate,
  name: exampleTaskData.name,
  notes: exampleTaskData.notes,
  completed: exampleTaskData.completed,
  priority: exampleTaskData.priority,
  progress: 0.0,
  category: exampleTaskData.category,
  categoryColor: exampleTaskData.categoryColor
}

// Configurable.argTypes = {
//   priority: { type: 'range', min: 0, max: 2, step: 1 },
//   progress: { type: 'range', min: 0, max: 1, step: .01 },
//   name: { control: 'text' },
//   category: { control: 'text' },
//   dueDate: { control: 'date' },
//   notes: { control: 'text' },
//   compeleted: { control: 'boolean' },
//   categoryColor: { control: 'color' }
// }

// export const Pinned = () => (<TaskV3 task={exampleTaskData} {...actionsData} />);

// export const Archived = () => (
//   <TaskV3 task={exampleTaskData} {...actionsData} />
// );