import React, { Component } from "react";

import { Button, Tooltip, Form, Input, DatePicker, Radio } from 'antd';
import { FlagTwoTone } from '@ant-design/icons';

const { TextArea } = Input;

class EditTaskForm extends Component {

	state = {
		isVisible: false,
	}

    constructor(props) {
      super(props);
      this.state = {
        
      }
    }

    componentDidMount() {}

	onFinish = values => {
		this.props.onSubmitHelper(values);
		this.toggleFormVisibility();
	};
	
	onFinishFailed = errorInfo => {
		console.log('Failed:', errorInfo);
	};

	toggleFormVisibility() {
		this.setState({isVisible: !this.state.isVisible})
	}

    render() {
      return (
        <Form
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            layout="vertical"
            onFinish={this.onFinish}
            onFinishFailed={this.onFinishFailed}
            initialValues={{}}
            onValuesChange={() => {}}
			size={"medium"}
			style={{ width: 300 }}
			visible={this.state.isVisible}
          >
            <Form.Item label="Task Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Notes" name="notes">
              <TextArea rows={3} />
            </Form.Item>
			<Form.Item label="Due Date" name="dueDate">
				<Tooltip placement="top">
					<DatePicker />
				</Tooltip>
			</Form.Item>
			<Form.Item label="Priority" name="priority">
				<Radio.Group onChange={() => console.log('changed')} defaultValue="a">
					<Radio.Button value="a"><FlagTwoTone twoToneColor="#f5222d"/></Radio.Button>
					<Radio.Button value="b"><FlagTwoTone twoToneColor="#fa541c"/></Radio.Button>
					<Radio.Button value="c"><FlagTwoTone twoToneColor="#fa8c16"/></Radio.Button>
					<Radio.Button value="d"><FlagTwoTone twoToneColor="#8c8c8c"/></Radio.Button>
				</Radio.Group>
			</Form.Item>
			
            <Form.Item  style={{marginBottom: 0}}>
              <Button htmlType="submit" type="primary" onClick={this.toggleFormVisibility.bind(this)}>Create Task</Button>
            </Form.Item>
          </Form>
      )
    }

}

const styles = {

}

export default EditTaskForm;