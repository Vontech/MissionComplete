import React, { Component } from "react";

import { Tree, Input } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Search } = Input;

// TODO(vontell) - Allow for non-case matching

class TaskTree extends Component {

	constructor(props) {
	  super(props);
	  this.state = {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
	  }
	}
  
	componentDidMount() {
    if (this.props.value) {
      this.triggerParentSelection(this.props.value);
    }
  }
  
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  triggerParentSelection = (parentSelection) => {
    // If onTaskSelected is available, that should handle all changes
    if (this.props.onTaskSelected) {
      this.props.onTaskSelected(parentSelection);
      return;
    }
    this.props.onChange(parentSelection);
    this.updateSearchQuery(parentSelection);
  }

  updateSearchQuery = (parentId) => {
    let name = parentId ? this.props.tasks.taskMap.get(parentId).name: null;
    this.setState({searchValue: name})
  }

	renderTaskTree() {

    const that = this;
  
    let { taskTree, taskMap } = this.props.tasks;
    let searchValue = this.state.searchValue;

	  if (!taskTree || !taskMap || taskMap.size === 0) {
		  return null;
    }
    
    function getTitle(taskName) {
      const index = taskName.indexOf(searchValue);
      if (index > -1) {
        const beforeStr = taskName.substr(0, index);
        const afterStr = taskName.substr(index + searchValue.length);
        return (
          <span>
            {beforeStr}
            <span style={{color: '#f50'}}>{searchValue}</span>
            {afterStr}
          </span>
        )
      } else {
        return(<span>{taskName}</span>);
      }
    };
  
	  function recurseOverComps(currentTree) {
      let task = taskMap.get(currentTree.data.id);
      if (!currentTree.data.children || currentTree.data.children.length === 0) {
        return {
            disabled: that.props.disabledNodes ? that.props.disabledNodes.includes(task.id) : false,
            key: task.id,
            title: getTitle(task.name)
        };
      }
      return {
          key: task.id,
          disabled: that.props.disabledNodes ? that.props.disabledNodes.includes(task.id) : false,
          title: getTitle(task.name),
          children: currentTree.children.map((childTree) => { return recurseOverComps(childTree) })
        };
	  }
  
    let components = [];
	  for (let root of taskTree.children) {
		  components.push(recurseOverComps(root));
	  }
  
	  return (
      <Tree
        showLine={true}
        switcherIcon={<DownOutlined />}
        onSelect={(ids) => { this.triggerParentSelection(ids[0]) }}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        onExpand={this.onExpand}
        treeData={components}
      >
      </Tree>
	  );
	}

	onChange = e => {
    const searchTerm = e.target.value;
    let expandedKeys = [];
    this.props.tasks.taskMap.forEach((value, key) => {
      if (value.name.indexOf(searchTerm) > -1) {
        expandedKeys.push(key);
      }
    });
      
		this.setState({
		  expandedKeys,
		  searchValue: searchTerm,
		  autoExpandParent: true,
		});
  };

  optionalNoParentButton() {
    return (
      <div 
        style={{cursor: 'pointer'}}
        onClick={() => this.triggerParentSelection(null)}>
        Clear
      </div>
    )
  }
  
	render() {
	  return (
		<div>
			<Search
        style={{ marginBottom: 8 }}
        placeholder="Search" 
        onChange={this.onChange.bind(this)} 
        value={this.state.searchValue} 
        addonAfter={!this.props.onTaskSelected ? this.optionalNoParentButton() : null}
        autoFocus={this.props.shouldFocus}/>
			{this.renderTaskTree()}
		</div>
	  )
	}
  
  }
  
  export default TaskTree;