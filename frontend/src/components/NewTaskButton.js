
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
    return (<EditTaskForm onSubmit={this.props.createNewTask} context='ADD' />);
  }

  togglePanelVisibility() {
    this.setState({ isVisible: !this.state.isVisible })
  }

  render() {
    return (
      <div>
        <div style={styles.fixedBottomRight}>
		  <Popover 
			  placement="rightBottom" 
			  title={'Create Task'} 
			  content={this.getForm()} 
			  visible={this.state.isVisible} 
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