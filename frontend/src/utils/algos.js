
import * as d3 from 'd3';

export function getIdTree(tasks) {
    let {roots, taskMap} = getTaskMapAndRoots(tasks);
    let trees = [];
    for (let root of roots) {
        let tree = getTraversedTree(root, taskMap);
        trees.push(d3.tree().nodeSize([350, 200])(d3.hierarchy(tree)));
    }
    return {tree: trees, taskMap: taskMap};
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
    return {roots: roots, taskMap: taskMap};
}

export function getTraversedTree(id, taskMap) {
    let currentTree = {id: id, children: []}

    let task = taskMap.get(id);
    console.log(task)
    if (task.children == null) {
        return currentTree
    }

    for (let child of task.children) {
        currentTree.children.push(getTraversedTree(child, taskMap))
    }

    return currentTree;
}

