import React, { Component } from "react";

import { Tree, Input } from 'antd';
import { DownOutlined } from '@ant-design/icons';


const { TreeNode } = Tree;
const { Search } = Input;

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
    console.log(parentId);
    console.log(this.props.tasks.taskMap);
    console.log(this.props.tasks.taskMap.get(parentId));
    let name = this.props.tasks.taskMap.get(parentId).name;
    this.setState({searchValue: name})
  }

	renderTaskTree() {

    const that = this;

    console.log(this.props)
  
    let { taskTree, taskMap } = this.props.tasks;
    let searchValue = this.state.searchValue;


  
	  if (!taskTree || !taskMap || taskMap.size === 0) {
		  return null;
    }
    
    function getTitle(taskName) {
      const index = taskName.indexOf(searchValue);
      const beforeStr = taskName.substr(0, index);
      const afterStr = taskName.substr(index + searchValue.length);
      return (index > -1) ? (
          <span>
            {beforeStr}
            <span style={{color: '#f50'}}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{taskName}</span>
        );
    };
  
	  function recurseOverComps(currentTree) {
      let task = taskMap.get(currentTree.data.id);
      if (!currentTree.data.children || currentTree.data.children.length === 0) {
        return (
          <TreeNode
            disabled={that.props.disabledNodes ? that.props.disabledNodes.includes(task.id) : false}
            taskRef={currentTree}
            key={task.id}
            title={getTitle(task.name)} />);
      }
      return (
        <TreeNode
          taskRef={currentTree}
          key={task.id}
          disabled={that.props.disabledNodes ? that.props.disabledNodes.includes(task.id) : false}
          title={getTitle(task.name)}>
          {currentTree.children.map((childTree) => { return recurseOverComps(childTree) })}
        </TreeNode>
      );
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
      >
        {components}
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
    // console.log("expandedKeys", expandedKeys);
      
		this.setState({
		  expandedKeys,
		  searchValue: searchTerm,
		  autoExpandParent: true,
		});
  };
  
	render() {
	  return (
		<div>
			<Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.onChange.bind(this)} value={this.state.searchValue} />
			{this.renderTaskTree()}
		</div>
	  )
	}
  
  }
  
  export default TaskTree;