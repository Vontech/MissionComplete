import { createSlice, createAsyncThunk, createEntityAdapter, createSelector, select } from '@reduxjs/toolkit'

import { api } from '../../utils/api';
import { getIdTree } from '../../utils/algos';
import { message } from 'antd';
import { trackAction } from '../../utils/tracking';

const tasksAdapter = createEntityAdapter({
  selectId: entity => entity._id
})

const initialState = tasksAdapter.getInitialState({
  status: 'idle', //idle, loading, succeeded, failed,
  error: null,
  currentSelectedTask: null,
  isSearchOpen: false // TODO(vontell) - Should this be somewhere else?
})

// Async Thunks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await api.getTasks();
  return response.data;
});

export const addNewTask = createAsyncThunk(
  'tasks/addNewTask',
  // The payload creator receives the partial `{title, content}` object
  async initialPost => {
    // We send the initial data to the fake API server
    const response = await api.addTask(initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
)

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async postId => {
    const response = await api.removeTask(postId)
    return postId
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async updatePost => {
    const response = await api.updateTask(updatePost)
    return response.data
  }
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskUpdated(state, action) {
      const { id } = action.payload
      const existingTask = state.entities[id]
      if (existingTask) {
        // existingTask.title = title
        // existingTask.content = content
      }
    },
    updateCurrentSelectedTask(state, action) {
      const task = action.payload;
      state.currentSelectedTask = task;
      return state;
    },
    updateIsSearchOpen(state, action) {
      const isOpen = action.payload;
      state.isSearchOpen = isOpen;
    }
  },
  extraReducers: {
    [fetchTasks.pending]: (state, action) => {
      state.status = 'loading'
    },
    [fetchTasks.fulfilled]: (state, action) => {
      state.status = 'succeeded'
      // Add any fetched posts to the array
      tasksAdapter.upsertMany(state, action.payload)
    },
    [fetchTasks.rejected]: (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    },
    [addNewTask.rejected]: () => {},

    // In this case, we also need to add the id to the parent
    [addNewTask.fulfilled]: (state, action) => {
      tasksAdapter.addOne(state, action);
      // Also add parent, if applicable
      if (action.payload.parent) {
        let parent = action.payload.parent;
        let child = action.payload._id;
        state.entities[parent].children.push(child)
      }
      message.success('Created new task "' + action.payload.name + '"')
      trackAction('CREATE_TASK')
    },
    [updateTask.rejected]: () => {
      message.error('Failed to update task - try again later')
    },
    [updateTask.fulfilled]: (state, action) => {
      // Update parent if parent changed
      let originalParent = state.entities[action.payload._id].parent;
      let redux_req = {'id': action.payload._id, 'changes': action.payload};
      tasksAdapter.updateOne(state, redux_req);
      if (action.payload.parent !== originalParent) {

        // If there was a parent before, remove this child
        if (originalParent) {
          state.entities[originalParent].children.pop(action.payload._id);
        }

        // And if there is a new parent, we add this to it
        if (action.payload.parent) {
          state.entities[action.payload.parent].children.push(action.payload._id)
        }

      }
      message.success('Updated task')
    },
    [removeTask.rejected]: () => {
      message.error('Failed to delete task - try again later')
    },

    // In this case, we also need to remove from parents
    [removeTask.fulfilled]: (state, action) => {
      let parent = state.entities[action.payload].parent;
      let children = state.entities[action.payload].children;
      tasksAdapter.removeOne(state, action);
      // If there was a parent...
      if (parent) {
        state.entities[parent].children.pop(action.payload);
      }
      // If it is a parent...
      if (children) {
        for (let child of children) {
          state.entities[child].parent = null;
        }
      }
      // if (action.payload.parent) {
      //   let parent = action.payload.parent;
      //   let child = action.payload._id;
      //   state.entities[parent].children.push(child)
      // }
      message.success('Deleted task')
    },
  }
})

// Selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds
  // Pass in a selector that returns the tasks slice of state
} = tasksAdapter.getSelectors(state => state.tasks)

export const selectTaskTree = createSelector(
  [selectAllTasks, selectTaskIds],
  (tasks, taskIds) => getIdTree(tasks)
);

// export const selectTaskTree = tasksAdapter.getSelectors((state) => getIdTree(state.tasks))

export const { taskAdded, taskUpdated, updateIsSearchOpen, updateCurrentSelectedTask } = tasksSlice.actions

// Subscribers

function scrollToTask(taskId) {
  if (!document.getElementById(taskId)) {
    return;
  }

  document.getElementById(taskId).scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center'
  });
}


let previousSelectedTask = null;
export const attachTaskListeners = (store) => {
  store.subscribe(() => {
    let {tasks} = store.getState();
    //console.log(tasks)
    if (tasks.currentSelectedTask !== previousSelectedTask) {
      scrollToTask(tasks.currentSelectedTask)
    }
    previousSelectedTask = tasks.currentSelectedTask;
  })
}

export default tasksSlice.reducer