
import React, { Component } from "react";

import { Button, Popover } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import EditTaskForm from "./EditTaskForm";

class NewTaskButton extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
    }
  }

  componentDidMount() {

  }

  getForm() {
    return (
      <EditTaskForm 
        tasks={this.props.tasks} 
        onSubmit={this.props.createNewTask} 
        onClose={() => this.setPanelVisibility(false)}
        context='ADD' />
    );
  }

  togglePanelVisibility() {
    this.setState({ isVisible: !this.state.isVisible })
  }

  setPanelVisibility(visibility) {
    this.setState({ isVisible: visibility })
  }

  render() {
    return (
      <div>
        <div style={styles.fixedBottomRight}>
          <Popover
            placement="rightBottom"
            title={'Create Task'}
            content={this.getForm()}
            trigger="click"
            visible={this.state.isVisible}
            onVisibleChange={this.setPanelVisibility.bind(this)}
          >
            <Button
              size="large"
              icon={<PlusOutlined />}
              type="primary"
              shape="circle"
              onClick={this.togglePanelVisibility.bind(this)}
            />
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
  fixedBottomRight: {
    position: 'fixed',
    bottom: 32,
    left: 32
  }
}

export default NewTaskButton;