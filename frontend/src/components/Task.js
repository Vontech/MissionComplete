
import React, { Component } from "react";

import { Card, Popconfirm, Skeleton, Tooltip, message } from 'antd';
import { EditTwoTone, CheckCircleTwoTone, DeleteTwoTone, ApartmentOutlined, setTwoToneColor, CheckOutlined } from '@ant-design/icons';
import defaultStyles from '../styles.js';

const { Meta } = Card;

class Task extends Component {

	state = {
		loading: false,
		show: false,
		checkStyle: {},
	}

    constructor(props) {
      super(props);
      this.state = {
        isHovered: false
      }
    }

    componentDidMount() {
		// this.setState({ loading: !this.state.loading });
		this.updateCheckboxStyle();
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
			<Tooltip placement="bottom" title="Create Child">
				<ApartmentOutlined key="createBranch"/>
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
		this.updateCheckboxStyle(!this.props.task.completed);
	}

	updateCheckboxStyle(useCompletedStyle) {
		if (useCompletedStyle) {
			this.setState({
				checkStyle: { fontSize: '12px', backgroundColor: '#52c41a', color: '#ffffff', padding: '5px', border: '1px solid #52c41a', borderRadius: '20px' }
			});
		} else {
			this.setState({
				checkStyle: { fontSize: '12px', backgroundColor: '#ffffff', color: '#52c41a', padding: '5px', border: '1px solid #52c41a', borderRadius: '20px' }
			});
		}
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
					<CheckOutlined style={this.state.checkStyle} onClick={this.toggleComplete.bind(this)} />
				</Tooltip>
			}>
			<Skeleton loading={this.state.loading} avatar active>
				<Meta description={this.props.task.notes} />
          	</Skeleton>
          </Card>
        </div>
      )
    }

}

const styles = {
  container: {
    position: 'absolute'
  }
}

export default Task;