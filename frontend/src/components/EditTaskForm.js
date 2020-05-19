import React, { Component } from "react";

import { Button, Form, Input, DatePicker, Radio } from 'antd';
import { FlagTwoTone, FlagOutlined } from '@ant-design/icons';

const { TextArea } = Input;
var moment = require('moment');

class EditTaskForm extends Component {

  state = {
    isVisible: false,
  }

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() { }

  onFinish = fieldValues => {
	var values;
	
	// priority value cannot be undefined, prevents Cast to Number error
	fieldValues.priority = fieldValues.priority || 4;

    if (fieldValues.dueDate === undefined) {
      delete fieldValues.dueDate;
      values = fieldValues;
    } else {
      values = {
		...fieldValues,
        'dueDate': fieldValues.dueDate,
      };
	}
	this.props.onSubmit(values);
    this.toggleFormVisibility();
  };

  onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  toggleFormVisibility() {
    this.setState({ isVisible: !this.state.isVisible })
  }

  onChange(date, dateString) {
    console.log(date, dateString);
  }

  // Disable past days (cannot have due date in the past)
  getDisabledDates(date) {
    if (date <= moment().subtract(1, 'days')) {
      return true;
    } else {
      return false;
    }
  }

  renderSubmitButton() {
	  let buttonText;
	  let buttonStyle = {};
	  if (this.props.context === 'EDIT') {
		buttonText = 'Update Task';
		buttonStyle = {
			float: 'right'
		}
	  } else {
		buttonText = 'Create Task';
	  }
	  return (
		<Form.Item style={{ marginBottom: 0 }}>
			<Button 
				htmlType="submit" 
				type="primary" 
				onClick={this.toggleFormVisibility.bind(this)}
				style={buttonStyle}
			>
				{buttonText}
			</Button>
	  	</Form.Item>
	  )
  }

  getFormStyle() {
	  if (this.props.context === 'EDIT') {
		  return {}
	  } else {
		  return { width: 300 }
	  }
  }

  render() {
    return (
      <Form
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        layout="vertical"
        onFinish={this.onFinish}
        onFinishFailed={this.onFinishFailed}
        initialValues={this.props.initialValues}
        onValuesChange={() => { }}
		size={"medium"}
		style={this.getFormStyle()}
        visible={this.state.isVisible}
      >
        <Form.Item label="Task Name" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Due Date" name="dueDate">
          <DatePicker
            onChange={this.onChange.bind(this)}
            format='MM/DD/YYYY'
            disabledDate={this.getDisabledDates.bind(this)} />
        </Form.Item>
        <Form.Item label="Priority" name="priority">
          <Radio.Group onChange={() => console.log('changed')} defaultValue={4}>
            <Radio.Button value={1}><FlagTwoTone twoToneColor="#eb2f96" /></Radio.Button>
            <Radio.Button value={2}><FlagTwoTone twoToneColor="#722ed1" /></Radio.Button>
            <Radio.Button value={3}><FlagTwoTone twoToneColor="#2f54eb" /></Radio.Button>
            <Radio.Button value={4}><FlagOutlined style={{ color: "#595959" }} /></Radio.Button>
          </Radio.Group>
        </Form.Item>

		{this.renderSubmitButton()}
      </Form>
    )
  }
}

export default EditTaskForm;