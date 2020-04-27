
import React, { Component } from "react";

import { Button, Icon, Tooltip, Popover, Form, Input, DatePicker, Radio } from 'antd';
import { PlusOutlined, FlagTwoTone } from '@ant-design/icons';
import EditTaskForm from "./EditTaskForm";


type Props = {
    
}

type State = {
    isVisible: Boolean,
}

class NewTaskButton extends Component<Props, State> {

    constructor(props) {
      super(props);
      this.state = {
		  isVisible: false,
	  }
    }

    componentDidMount() {

    }

    getForm() { return (<EditTaskForm onSubmitHelper={this.props.createNewTask} />);}

	togglePanelVisibility() {
		this.setState({isVisible: !this.state.isVisible})
	}

    render() {
      return (
        <div>
          <div style={styles.fixedBottomRight}>
            <Popover placement="rightBottom" title={'Create Task'} content={this.getForm()} visible={this.state.isVisible}>
              <Button size="large" icon={<PlusOutlined />} type="primary" shape="circle" onClick={this.togglePanelVisibility.bind(this)}>
              </Button>
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