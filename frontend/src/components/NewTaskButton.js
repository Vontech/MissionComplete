
import React, { Component } from "react";

import { Card, Button, Icon, Tooltip, Popover, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;


type Props = {
    
}

type State = {
    
}

class NewTaskButton extends Component<Props, State> {

    constructor(props) {
      super(props);
      this.state = {}
    }

    componentDidMount() {

    }

    onFinish = values => {
      console.log('Success:', values);
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

    render() {
      return (
        <div>
          <div style={styles.fixedBottomRight}>
            <Popover placement="rightBottom" title={'Create Task'} content={this.getForm()} trigger="click">
              <Button size="large" icon={<PlusOutlined />} type="primary" shape="circle" onClick={() => {
                    this.props.createNewTask({
                        'name': Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                        'notes': "These are some notes"
                    })
                }}>
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