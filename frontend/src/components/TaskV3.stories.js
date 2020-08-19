import React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, date, boolean, number, color } from '@storybook/addon-knobs/react';


import TaskV3 from './TaskV3';
import Taskk from '../Models'

export default {
  component: TaskV3,
  title: 'Task',
  decorators: [withKnobs],
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
};

const groupId = 'GROUP-ID1';

export const exampleTaskData = { 
    "_id": "5eefbebb5baaa3b7f06e05bd", 
    "children": [], 
    "name": "Finish MissionComplete", 
    "notes": "These are some notes!", 
    "completed": false, 
    "parent": "5eefbeb55baaa3b7f06e05bc", 
    "priority": 2, 
    "dueDate": new Date('Jan 25 2017'),
    "category": "My Category",
    "categoryColor": "#41B768"
  }

export const actionsData = {
  onPinTask: action('onPinTask'),
  onArchiveTask: action('onArchiveTask'),
};

export const Configurable = () => {
  let newTaskData = Object.assign({}, exampleTaskData);
  let task = new Taskk(newTaskData);

  task.dueDate = new Date(date('Task Date', exampleTaskData.dueDate, groupId))
  task.name = text('Task Title', exampleTaskData.name, groupId)
  task.notes = text('Task Notes', exampleTaskData.notes, groupId)
  task.completed = boolean('Task Completed', exampleTaskData.completed, groupId)
  task.priority = number('Task Priority', exampleTaskData.priority, {
    range: true,
    min: 0,
    max: 2,
    step: 1,
  }, groupId)

  let progress = number('Task Progress', 0, {
    range: true,
    min: 0,
    max: 1,
    step: 0.01,
  }, groupId)
  task.category = text('Task Category', exampleTaskData.category, groupId);
  task.categoryColor = color('Task Category Color', exampleTaskData.categoryColor, groupId)

  console.log(task)
  return (<TaskV3 task={task} progress={progress} {...actionsData} />)
}

// export const Pinned = () => (<TaskV3 task={exampleTaskData} {...actionsData} />);

// export const Archived = () => (
//   <TaskV3 task={exampleTaskData} {...actionsData} />
// );