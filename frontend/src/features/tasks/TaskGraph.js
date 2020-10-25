import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { ArcherContainer, ArcherElement } from 'react-archer';

import Task from './Task';

import {
  selectAllTasks,
  selectTaskTree
} from './tasksSlice'
import { getIdTree } from '../../utils/algos';
import { ConsoleSqlOutlined, ContactsTwoTone } from '@ant-design/icons';

// const task = useSelector(state => selectTaskById(state, taskId))

// CONSTANTS FOR TASK GRAPH RENDERING
const X_SCALE = 1;
const Y_SCALE = 1;
const HORIZONTAL_PADDING = 500;
const VERTICAL_PADDING = 500;

function renderTaskGraph({tree, taskMap}) {
  let listOfTaskComps = [];
  if (!tree) {
    return null
  }

  // Keep track of the tree size
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function recurseOverComps(currentTree) {
    if (currentTree.data._id != null) { // Only create node if not special root
      let task = taskMap.get(currentTree.data._id);
      // let x_pos = 5000 + x_scale * currentTree.x;
      // let y_pos = 5000 + y_scale * currentTree.y;
      let x_pos = X_SCALE * currentTree.x;
      let y_pos = Y_SCALE * currentTree.y;

      minX = Math.min(minX, x_pos); 
      minY = Math.min(minY, y_pos);
      maxX = Math.max(maxX, x_pos);
      maxY = Math.max(maxY, y_pos);

      listOfTaskComps.push([
        task._id,
        x_pos,
        y_pos,
        task,
        currentTree.data,
      ]);

      for (let child of (currentTree.children || [])) {
        recurseOverComps(child);
      }
      return [x_pos, y_pos];
    } else {
      for (let child of (currentTree.children || [])) {
        recurseOverComps(child);
      }
    }
  }

  recurseOverComps(tree);

  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  let width = Math.max(maxX - minX + HORIZONTAL_PADDING, vw);
  let height = Math.max(maxY - minY + VERTICAL_PADDING, vh);

  let horizontalOffset = (-1 * minX) + HORIZONTAL_PADDING/2;
  if ((-1*minX) < (vw/2 - HORIZONTAL_PADDING/2)) {
    horizontalOffset = (vw/2)// + minX + horizontal_padding/2 - 150;
  }
  
  let taskViews = listOfTaskComps.map((propArr) => {
    let p = {
      key: propArr[0],
      x: propArr[1] + horizontalOffset,
      y: propArr[2],
      task: propArr[3]
    }
    let propStyles = { 'top': p.y, 'left': p.x - 150 }
    return (
      <div
        key={p.key}
        id={p.key}
        style={{ position: 'absolute', minWidth: '300px', ...propStyles}} >
        <ArcherElement
          id={p.key}
          relations={p.task.children.map((element) => {
            return {
              targetId: element,
              targetAnchor: 'top',
              sourceAnchor: 'bottom',
            }
          })}>
            <div>
              <Task task={p.task}></Task>
            </div>
          </ArcherElement>
        </div>
    )
  })

  return (
    <div style={{width: width, height: height}}>
      <div>
        {taskViews}
      </div>
    </div>
  );

}

export const TaskGraph = () => {

  let allTasks = useSelector(selectAllTasks)
  const {tree, taskMap} = getIdTree(allTasks)

  if (!tree || !taskMap) {
    return (<div></div>)
  }
  
  const renderedTaskGraph = renderTaskGraph({tree, taskMap})
  const paneWidth = renderedTaskGraph ? renderedTaskGraph.props.style.width : 0

  return (
    <ArcherContainer
      strokeColor="rgb(227 227 227)"
      strokeWidth={3}
      noCurves={true}
      arrowLength={0}
      style={{width: paneWidth}}>
        <div style={{background: '#F5F6F8', width: paneWidth}}>
          {renderedTaskGraph}
        </div>
    </ArcherContainer>
  )
}

export default TaskGraph;