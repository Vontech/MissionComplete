
import * as d3 from 'd3';

export function getIdTree(tasks) {
  let { roots, taskMap } = getTaskMapAndRoots(tasks);
  let tree = {id: null, children: []}
  for (let root of roots) {
    tree.children.push(getTraversedTree(root, taskMap))
  }
  let d3Tree = d3.tree().nodeSize([350, 250])(d3.hierarchy(tree));
  let result = { tree: d3Tree, taskMap: taskMap }
  console.log(result)
  return result;
}

// Consolidate root loop and mapping loop into one
export function getTaskMapAndRoots(tasks) {
  let taskMap = new Map();
  let roots = [];
  for (let task of tasks) {
    taskMap.set(task.id, task);
    if (task.parent == null) {
      roots.push(task.id);
    }
  }
  return { roots: roots, taskMap: taskMap };
}

export function getTraversedTree(id, taskMap) {
  let currentTree = { id: id, children: [], numCompleted: 0, numTotal: 0 }

  let task = taskMap.get(id);
  if (task.children == null) {
    return currentTree
  }

  for (let child of task.children) {
    let childResult = getTraversedTree(child, taskMap)
    currentTree.children.push(childResult)
    currentTree.numTotal += 1 + childResult.numTotal;
    currentTree.numCompleted += (taskMap.get(child).completed ? 1 : 0) + childResult.numCompleted;
  }

  return currentTree;
}

