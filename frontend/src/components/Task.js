import React, { Component } from "react";

import { Card, Popconfirm, Tooltip, message, Popover, Tag, Modal, Typography } from 'antd';
import { EditTwoTone, DeleteTwoTone, ApartmentOutlined, CheckOutlined, FlagOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import defaultStyles from '../styles.js';
import EditTaskForm from "./EditTaskForm";
import ProgressBar from "./ProgressBar";
import log from 'loglevel';

import { smoothScroll } from '../utils/ui';

import Linkify from 'react-linkify'
import { ArcherElement } from 'react-archer';

const { Paragraph } = Typography;
var moment = require('moment');

const PROGRESS_BAR_HEIGHT = 3

class Task extends Component {

  state = {
    show: false,
    isVisible: Boolean,
    priorityText: '',
    hoveringOverDate: false,
    isEditModalVisible: false
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
    if (this.props.task.completed) {
      return false;
    } else if (!this.props.task.dueDate) {
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
    let priorityColor, priorityText;
    // eslint-disable-next-line default-case
    switch (this.props.task.priority) {
      case 1: priorityColor = 'magenta'; priorityText = 'High'; break;
      case 2: priorityColor = 'purple'; priorityText = 'Medium'; break;
      case 3: priorityColor = 'blue'; priorityText = 'Low'; break;
    }
    if (this.props.task.completed) { priorityColor = false; }
    return {priorityColor, priorityText};
  }

  handleVisibleChange = (show) => {
    this.setState({ show });
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
      <EditTaskForm 
        tasks={this.props.tasks}
        context={'ADD'}
        initialValues={{
          parent: this.props.task.id
        }}
        onSubmit={(taskDetails) => {
          this.props.createChildTask(taskDetails);
          this.togglePanelVisibility();
      }} />
    );
  }

  togglePanelVisibility() {
    let newVisibility = !this.state.isVisible;
    this.setState({ isVisible: newVisibility }, () => {
      this.setHover(this.state.isVisible);
      if (newVisibility) {
        this.scrollToPanel();
      }
    })
  }

  setPanelVisibility(visible) {
    log.info("CALLED SET")
    this.setState({ isVisible: visible, isHovered: visible }, () => {
      if (visible) {
        this.scrollToPanel();
      }
    })
  }

  scrollToPanel() {
    let numCalls = 0;
    var checkExist = setInterval(function() {
        numCalls += 1
        if (document.getElementById('taskPopover')) {

          clearInterval(checkExist);
          smoothScroll(document.getElementById('taskPopover'), {
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          }).then(() => {
            document.querySelector('#taskPopover #name').focus()
          })
        }
        else if (numCalls > 10) {
          clearInterval(checkExist);
        }
    }, 100/6); // check every 100ms
  }

  toggleEditModalVisibility() {
    this.setState({ isEditModalVisible: !this.state.isEditModalVisible })
  }

  handleCancel = (e) => {
    this.setState({
    isEditModalVisible: false,
    });
  };

  getNewTaskTitle() {
    return (
      <div>
        Create Task
        <CloseOutlined style={{cursor: 'pointer', float: 'right', marginTop: 4}} onClick={() => this.setPanelVisibility(false)}/>
      </div>
    )
  }

  getActions() {
    if (this.state.isHovered || this.state.isVisible) {
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
          <EditTwoTone onClick={this.toggleEditModalVisibility.bind(this)} />
        </Tooltip>,
        <Popover 
          id="taskPopover"
          placement="rightBottom" 
          title={this.getNewTaskTitle()} 
          content={this.getForm()} 
          visible={this.state.isVisible} 
          trigger="click"
          onVisibleChange={this.setPanelVisibility.bind(this)} >
            <ApartmentOutlined key="createBranch"/>
        </Popover>
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

  render() {
    log.debug('Task.js render')
    let propStyles = { 'top': this.props.y, 'left': this.props.x - 150 }
    let priorityStyle = this.getPriorityTag();
    let dueDateColor = this.getDueDateColor();
    return (
      <div
        id={this.props.task.id}
        style={{ ...styles.container, ...propStyles, opacity: this.props.task.completed ? 0.5 : 1.0 }}
        onMouseEnter={() => this.setHover(true)}
        onMouseLeave={() => this.setHover(false)}>
        <ArcherElement
          id={this.props.task.id}
          relations={this.props.task.children.map((element) => {
            return {
              targetId: element,
              targetAnchor: 'top',
              sourceAnchor: 'bottom',
            }
          })}>
          <div>
            <Card
              className="taskCard"
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

              <div style={{paddingRight: 24, paddingLeft: 24}}>

                {this.props.task.notes &&
                  <Paragraph ellipsis={{ rows: 3, expandable: false }} >
                      <Linkify properties={{target: '_blank'}}>{this.props.task.notes}</Linkify>
                  </Paragraph>
                }

                {this.state.isHovered &&
                  <Tag 
                    icon={<ClockCircleOutlined />} color={dueDateColor}
                    style={(this.props.task.completed) ? styles.tag : {}}>
                    {this.props.task.dueDate ? moment(this.props.task.dueDate).format('ddd, MMM D') : 'No due date'}
                  </Tag>
                }

                {!this.state.isHovered && this.props.task.dueDate &&
                  <Tag 
                    icon={<ClockCircleOutlined />} color={this.getDueDateColor()}
                    style={(this.props.task.completed) ? styles.tag : {}}>
                    {moment(this.props.task.dueDate).format('ddd, MMM D')}
                  </Tag>
                }

                {(!this.props.task.priority || this.props.task.priority === 4) && this.state.isHovered && 
                  <Tag icon={<FlagOutlined />} color={priorityStyle.priorityColor}
                    style={(this.props.task.completed) ? styles.tag : {}}>
                    No Priority
                  </Tag>
                }
                
                {(this.props.task.priority !== 4) &&
                  <Tag icon={<FlagOutlined />} color={priorityStyle.priorityColor}
                    style={{ display: 'inline-block', cursor: 'pointer'}}>
                    {priorityStyle.priorityText}
                  </Tag>
                }

              </div>

              <div style={{marginBottom: 24 - (this.props.treeTaskData.numTotal > 0 ? PROGRESS_BAR_HEIGHT : 0)}} />

              {this.props.treeTaskData.numTotal > 0 && this.props.context.preferences.useProgressBars && 
                <ProgressBar 
                  progress={(this.props.treeTaskData.numCompleted / this.props.treeTaskData.numTotal) * 100.0}
                  color={defaultStyles.colors.progressGood}
                  height={PROGRESS_BAR_HEIGHT} />
              }

            </Card>

            <div style={{ position: 'absolute', right: 0, bottom: 30 }}>
              <Modal 
                title={'Edit Task'} 
                visible={this.state.isEditModalVisible}
                onCancel={this.handleCancel}
                footer={null}
                destroyOnClose={true}
                maskClosable={true} >
                <EditTaskForm
                  initialValues={{
                    name: this.props.task.name,
                    notes: this.props.task.notes,
                    priority: this.props.task.priority,
                    parent: this.props.task.parent,
                    dueDate: (this.props.task.dueDate) ? moment(this.props.task.dueDate) : null
                  }}
                  context='EDIT'
                  onSubmit={(updatedValues) => {
                    this.props.editTask(updatedValues);
                    this.setState({ isEditModalVisible: false });
                  }} 
                  thisTaskId={this.props.task.id}
                  onTaskSelected={this.props.onTaskSelected.bind(this)}
                  tasks={this.props.tasks} />
              </Modal>
            </div>
          </div>
        </ArcherElement>
      </div>
    )
  }

}

const styles = {
  container: {
    position: 'absolute',
    minWidth: '300px'
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
  tag: {
    display: 'inline-block', 
    cursor: 'pointer'
  },
}

export default Task;