
import React, { Component } from "react";

import { Card, Popconfirm, Tooltip, message, Popover, Typography, Tag, Input, DatePicker } from 'antd';
import { EditTwoTone, DeleteTwoTone, ApartmentOutlined, CheckOutlined, FlagOutlined, ClockCircleOutlined } from '@ant-design/icons';
import defaultStyles from '../styles.js';
import EditTaskForm from "./EditTaskForm";

const { Meta } = Card;
const { Text } = Typography;
var moment = require('moment');

class Task extends Component {

  state = {
    show: false,
    isVisible: Boolean,
    priorityText: '',
    titleIsEditing: false,
    hoveringOverDate: false
  }

  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
    }
  }

  componentDidMount() {
    
  }

  getDueDateColor() {
    console.log(this.props.task.dueDate)
    if (!this.props.task.dueDate) {
      return '#cdcdcd';
    } else if (moment(this.props.task.dueDate).isAfter(moment(), 'day')) {
      return '#85a5ff';
    } else if (moment(this.props.task.dueDate).isSame(moment(), 'day')) {
      return '#ffc069';
    } else {
      return '#ff7875';
    }
  }

  getPriorityTag() {
    // eslint-disable-next-line default-case
    switch (this.props.task.priority) {
      case 1:
        return { priorityColor: 'magenta', priorityText: 'High' };
      case 2:
        return { priorityColor: 'purple', priorityText: 'Medium' };
      case 3:
        return { priorityColor: 'blue', priorityText: 'Low' };
    }
    return null;
  }

  handleVisibleChange = (show) => {
    this.setState({ show })
  }

  mouseOver = () => {
    this.setState({
      show: true,
    })
  }

  mouseOut = () => {
    this.setState({
      show: false,
    })
  }

  getForm() {
    return (
      <EditTaskForm onSubmit={(taskDetails) => {
        taskDetails['parent'] = this.props.task.id;
        console.log(taskDetails);
        this.props.createChildTask(taskDetails);
        this.togglePanelVisibility();
      }} />
    );
  }

  togglePanelVisibility() {
    this.setState({ isVisible: !this.state.isVisible })
  }

  getActions() {
    if (this.state.isHovered) {
      return [
        <Tooltip placement="bottom" title="Delete Task" visible={this.state.show}>
          <Popconfirm
            title="Delete this task?"
            onConfirm={this.deleteTask.bind(this)}
            onCancel={() => { return }}
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
    this.setState({ isHovered: isHovered })
  }

  getTitle() {
    if (!this.state.titleIsEditing) {
      return (
        <Meta
          onClick={() => this.setState({titleIsEditing: true})}
          title={this.props.task.name}
        />
      )
    } else {
      return  (
        <Input 
          size="large" 
          onPressEnter={(ev) => {
            this.props.editTask({'name': ev.target.value})
            this.setState({titleIsEditing: false})
          }}
          defaultValue={this.props.task.name} />
      )
    }
  }

  render() {
    let propStyles = { 'top': this.props.y, 'left': this.props.x }
    let priorityStyle = this.getPriorityTag();
    return (
      <div
        id={this.props.task.id}
        style={{ ...styles.container, ...propStyles, opacity: this.props.task.completed ? 0.5 : 1.0 }}
        onMouseEnter={() => this.setHover(true)}
        onMouseLeave={() => this.setHover(false)}>
        <Card
          actions={this.getActions()}
          title={this.getTitle()}
          style={{ width: 300 }}
          extra={
            <Tooltip placement="top" title="Mark as Done">
              <CheckOutlined
                style={this.props.task.completed ? styles.completedCheckStyle : styles.uncompletedCheckStyle}
                onClick={this.toggleComplete.bind(this)} />
            </Tooltip>
          }>
          <p>{this.props.task.notes}</p>

          

          <Tag icon={<ClockCircleOutlined />} color={this.getDueDateColor()}
            style={{display: 'inline-block'}}>
            {this.props.task.dueDate ? moment(this.props.task.dueDate).format('ddd, MMM D') : 'No due date'}
          </Tag>
          
          {priorityStyle && <Tag icon={<FlagOutlined />} color={priorityStyle.priorityColor}
            style={{ display: 'inline-block'}}>
            {priorityStyle.priorityText}
          </Tag>}


        </Card>
        <div style={{ position: 'absolute', right: 0, bottom: 30 }}>
          <Popover placement="rightBottom" title={'Create Task'} content={this.getForm()} visible={this.state.isVisible} >
          </Popover>
        </div>
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
    borderRadius: '20px',
    marginLeft: '16px'
  },
  uncompletedCheckStyle: {
    fontSize: '12px',
    backgroundColor: '#ffffff',
    color: '#52c41a',
    padding: '5px',
    border: '1px solid #52c41a',
    borderRadius: '20px',
    marginLeft: '16px'
  },
  dueDate: {
    borderRadius: '4px',
    padding: '4px 10px',
    marginBottom: '0px',
    marginRight: '10px'
  },
}

export default Task;