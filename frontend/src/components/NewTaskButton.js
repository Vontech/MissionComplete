
import React, { Component } from "react";

import { Card, Button, Icon, Tooltip, Popover, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;


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

    onFinish = values => {
	  this.props.createNewTask(values);
	  this.togglePanelVisibility();
    };
  
    onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
    };

    getForm() {
      return (
        <div>
          <Form
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            layout="vertical"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            initialValues={{}}
            onValuesChange={() => {}}
            size={"medium"}
          >
            <Form.Item label="Task Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Notes" name="notes">
              <TextArea rows={2} />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 13, span: 12 }} style={{marginBottom: 0}}>
              <Button htmlType="submit" type="primary">Create</Button>
            </Form.Item>
          </Form>
        </div>
      );
	}
	
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