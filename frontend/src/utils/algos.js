
import * as d3 from 'd3';

export function getIdTree(tasks) {

  if (!tasks || tasks.length == 0) {
    return {tree: null, taskMap: null}
  }

  let { roots, taskMap } = getTaskMapAndRoots(tasks);
  let tree = {_id: null, children: []}
  for (let root of roots.sort()) {
    tree.children.push(getTraversedTree(root, taskMap))
  }
  let d3Tree = d3.tree().nodeSize([400, 250])(d3.hierarchy(tree));
  let result = { tree: d3Tree, taskMap: taskMap }
  return result;
}

// Consolidate root loop and mapping loop into one
export function getTaskMapAndRoots(tasks) {
  let taskMap = new Map();
  let roots = [];
  for (let task of tasks) {
    taskMap.set(task._id, task);
    if (task.parent == null) {
      roots.push(task._id);
    }
  }
  return { roots: roots, taskMap: taskMap };
}

export function getTraversedTree(id, taskMap) {
  let currentTree = { _id: id, children: [], numCompleted: 0, numTotal: 0 }

  let task = taskMap.get(id);
  if (task.children == null) {
    return currentTree
  }

  for (let child of task.children.slice().sort()) {
    if (!taskMap.has(child)) {
      continue;
    }
    let childResult = getTraversedTree(child, taskMap)
    currentTree.children.push(childResult)
    currentTree.numTotal += 1;
    currentTree.numCompleted += (taskMap.get(child).completed ? 1 : 0);
  }

  return currentTree;
}

export function getChildren(id, taskMap, children) {
  let task = taskMap.get(id);
  if (task.children == null) {
    return;
  }

  for (let child of task.children.sort()) {
    children.push(child);
    getChildren(child, taskMap, children)
  }

}

