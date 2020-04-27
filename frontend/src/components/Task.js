
import React, { Component } from "react";

import { Card, Popconfirm, Skeleton, Tooltip, message, Popover } from 'antd';
import { EditTwoTone, CheckCircleTwoTone, DeleteTwoTone, ApartmentOutlined, setTwoToneColor, CheckOutlined } from '@ant-design/icons';
import defaultStyles from '../styles.js';
import EditTaskForm from "./EditTaskForm";

const { Meta } = Card;

class Task extends Component {

	state = {
		show: false,
		isVisible: Boolean,
	}

    constructor(props) {
      super(props);
      this.state = {
        isHovered: false
      }
    }

    componentDidMount() {
	}
	
	handleVisibleChange = (show) => {
		this.setState({show})
	}
	
	mouseOver = () => {
		this.setState({
			show: true,
		})
	}
	
	mouseOut = () => {
		console.log("called");
		this.setState({
			show: false,
		})
	}

	getForm() { return (<EditTaskForm onSubmitHelper={() => console.log("FILL THIS IN")} />); }

	togglePanelVisibility() {
		this.setState({isVisible: !this.state.isVisible})
	}

    getActions() {
      if (this.state.isHovered) {
        return [
			<Tooltip placement="bottom" title="Delete Task" visible={this.state.show}>
				<Popconfirm
				title="Delete this task?"
				onConfirm={this.deleteTask.bind(this)}
				onCancel={() => {return}}
				okText="Yes"
				cancelText="No"
				placement="bottom"
				onVisibleChange={this.handleVisibleChange}>
					<DeleteTwoTone twoToneColor="#eb2f96" onMouseEnter={this.mouseOver} onMouseLeave={this.mouseOut} onClick={this.mouseOut} />
				</Popconfirm>
			</Tooltip>,
			<Tooltip placement="bottom" title="Edit Task">
				<EditTwoTone />
			</Tooltip>,
			<Tooltip placement="bottom" title="Create Child" >
				<ApartmentOutlined key="createBranch" onClick={this.togglePanelVisibility.bind(this)} />
				<Popover placement="rightBottom" title={'Create Task'} content={this.getForm()} visible={this.state.isVisible} >
				</Popover>
			</Tooltip>
        ]
      }
      return []
    }

	deleteTask() {
		this.props.removeTaskHandler(this.props.task.id);
		message.info(`Deleted task '${this.props.task.name}'`);
	}

	toggleComplete() {
		this.props.completeTaskHandler({ task_id: this.props.task.id, completed: !this.props.task.completed });
	}

    setHover(isHovered) {
      this.setState({isHovered: isHovered})
    }

    render() {
      let propStyles = {'top': this.props.y, 'left': this.props.x}
      return (
        <div 
          id={this.props.task.id}
          style={{...styles.container, ...propStyles}}
          onMouseEnter={() => this.setHover(true)}
          onMouseLeave={() => this.setHover(false)}>
		  <Card 
			actions={this.getActions()}
			title={this.props.task.name}
			style={{ width: 300 }}
			extra={
				<Tooltip placement="top" title="Mark as Done">
					<CheckOutlined 
						style={this.props.task.completed ? styles.completedCheckStyle : styles.uncompletedCheckStyle} 
						onClick={this.toggleComplete.bind(this)} />
				</Tooltip>
			}>
			<Meta description={this.props.task.notes} />
          </Card>
        </div>
      )
    }

}

const styles = {
  container: {
    position: 'absolute'
  },
  completedCheckStyle: {
	fontSize: '12px', 
	backgroundColor: '#52c41a', 
	color: '#ffffff', 
	padding: '5px', 
	border: '1px solid #52c41a', 
	borderRadius: '20px'
  },
  uncompletedCheckStyle: {
	fontSize: '12px', 
	backgroundColor: '#ffffff', 
	color: '#52c41a', 
	padding: '5px', 
	border: '1px solid #52c41a', 
	borderRadius: '20px'
  }
}

export default Task;