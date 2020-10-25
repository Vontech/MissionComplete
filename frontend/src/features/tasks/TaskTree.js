import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  selectTaskTree,
} from './tasksSlice'

import { Tree, Input } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Search } = Input;

// TODO: When searchValue is null, highlights get weird
// How do we expand both highlighted and specifically requested?

function getTaskNameSpan(task, searchValue, specificSelection) {
  const taskName = task.name;
  const index = taskName.indexOf(searchValue);
  const isSpecificSelection = specificSelection ? task._id === specificSelection : false;

  if (isSpecificSelection) {
    return (
      <span>
        <span style={{color: '#f50'}}>{taskName}</span>
      </span>
    )
  }

  // There is a specific selection, but not this task
  if (specificSelection) {
    return(<span>{taskName}</span>);
  }

  // No specific selection, no match on search
  if (index < 0) {
    return(<span>{taskName}</span>);
  }

  // No specific selection, match on search
  const beforeStr = taskName.substr(0, index);
  const afterStr = taskName.substr(index + searchValue.length);
  return (
    <span>
      {beforeStr}
        <span style={{color: '#f50'}}>{searchValue}</span>
      {afterStr}
    </span>
  )
};

function getTreeStructureRecursive({taskMap, currentTree, disabledNodes, searchValue, specificSelection}) {
  let task = taskMap.get(currentTree.data._id);
  if (!currentTree.data.children || currentTree.data.children.length === 0) {
    return {
        disabled: disabledNodes ? disabledNodes.includes(task._id) : false,
        key: task._id,
        title: getTaskNameSpan(task, searchValue, specificSelection)
    };
  }
  return {
      key: task._id,
      disabled: disabledNodes ? disabledNodes.includes(task._id) : false,
      title: getTaskNameSpan(task, searchValue, specificSelection),
      children: currentTree.children.slice().map((childTree) => { return getTreeStructureRecursive({taskMap, currentTree: childTree, disabledNodes, searchValue, specificSelection})})
    };
}

const AUTO_EXPAND_PARENT = true;

export const TaskTree = ({
  onChange,
  value,
  disabledNodes = [], 
  onTaskSelected = () => {}, 
  shouldFocus = false, 
  clearButton = null,
  maxHeight = null}) => {

  const dispatch = useDispatch()
  const {tree, taskMap} = useSelector(selectTaskTree)

  const [searchValue, setSearchValue] = useState('');

  // Typically, we highlight based on search value. However, when a
  // specific task is selected, we only want to highlight that one.
  const [specificSelection, setSpecificSelection] = useState(null);

  // In addition to search terms, also expand clicked items
  const [clickExpanded, setClickExpanded] = useState([]);

  if (!taskMap || !tree || !tree.children) {
    return (<div></div>);
  }

  let expandedKeys = [...clickExpanded];
  if (searchValue) {
    taskMap.forEach((value, key) => {
      if (value.name.indexOf(searchValue) > -1) {
        expandedKeys.push(key);
      }
    });
  }

  const onSearchChange = e => {
    const searchTerm = e.target.value;
    setSearchValue(searchTerm);
  };

  const onSelect = (ids) => {
    let parentSelection = ids ? ids[0] : null;
    setSpecificSelection(parentSelection);
    let name = parentSelection ? taskMap.get(parentSelection).name: null;
    setSearchValue(name);
    if (onTaskSelected) {
      onTaskSelected(parentSelection);
    }
    if (onChange) {
      onChange(parentSelection);
    }
  }

  if (value && value != specificSelection) {
    setSpecificSelection(value);
    let name = taskMap.get(value).name;
    setSearchValue(name);
  }

  let collapsableTree = (
    <Tree
      showLine={true}
      switcherIcon={<DownOutlined />}
      onSelect={onSelect}
      expandedKeys={expandedKeys}
      autoExpandParent={AUTO_EXPAND_PARENT}
      onExpand={(_, {node, expanded}) => {
        let exp = [...clickExpanded];
        if (expanded) {
          exp.push(node.key)
        } else {
          let tempSet = new Set(exp)
          tempSet.delete(node.key)
          exp = [...tempSet.keys()]
        }
        setClickExpanded(exp);
      }}
      treeData={tree.children.map(currentTree => {
        return getTreeStructureRecursive({taskMap, currentTree, disabledNodes, searchValue, specificSelection})
      })}
    >
    </Tree>
  )

  const clearButtonComp = clearButton ? (
    <div 
      style={{cursor: 'pointer'}}
      onClick={() => onSelect(null)}>
      {clearButton}
    </div>
  ): null;
  
  return (
    <div>
			<Search
        style={{ marginBottom: 8 }}
        placeholder="Search" 
        onChange={onSearchChange} 
        onKeyDown={() => setSpecificSelection(null)}
        value={searchValue} 
        addonAfter={clearButtonComp}
        autoFocus={shouldFocus}/>
        {maxHeight ? (
          <div style={{
            maxHeight: maxHeight,
            overflow: 'scroll'
          }}>
            {collapsableTree}
          </div>
        ): collapsableTree}
		</div>
  )
}

export default TaskTree;