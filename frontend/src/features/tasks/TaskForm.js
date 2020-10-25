import React, { useState, useRef, useCallback, useEffect } from 'react'

import Card from '../common/Card';
import TaskTree from './TaskTree';
import { addNewTask, updateTask } from './tasksSlice'


import { useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'

import { Button, Form, Input, DatePicker, Radio, Typography } from 'antd';
import { FlagTwoTone, FlagOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

export const TaskForm = ({initialValues = {}, onFormSubmitted = (values) => {}, onFormCancelled = () => {}, editMode = false}) => {

  const dispatch = useDispatch()
  const [form] = Form.useForm();

  const [isProcessing, setIsProcessing] = useState(false)
  const [createError, setCreateError] = useState(null)

  const onSubmit = useCallback(
    async (fieldValues) => {
      setIsProcessing(true);
      setCreateError(true);

      var values;

      // priority value cannot be undefined, prevents Cast to Number error
      fieldValues.priority = fieldValues.priority || 4;
      fieldValues.parent = fieldValues.parent == null ? '' : fieldValues.parent;

      if (fieldValues.dueDate === undefined) {
        delete fieldValues.dueDate;
        values = fieldValues;
      } else {
        values = {
          ...fieldValues,
          'dueDate': fieldValues.dueDate,
        };
      }

      if (!editMode) {
        try {
          const resultAction = await dispatch(
            addNewTask(values)
          )
          let result = unwrapResult(resultAction);
          console.log(result)
          setIsProcessing(false);
          onFormSubmitted(result);
        } catch (err) {
          setIsProcessing(false);
          setCreateError('Error creating task - please try again')
          form.setFieldsValue(fieldValues)
        }
      } else {
        values.task_id = initialValues._id
        try {
          const resultAction = await dispatch(
            updateTask(values)
          )
          let result = unwrapResult(resultAction);
          console.log(result)
          setIsProcessing(false);
          onFormSubmitted(result);
        } catch (err) {
          setIsProcessing(false);
          setCreateError('Error updating task - please try again')
          form.setFieldsValue(fieldValues)
        }
      }

    },
    [dispatch, onFormSubmitted]
  )

  useEffect(() => form.resetFields(), [initialValues]);

  return (
    <Card>
      <div>
        <Form
          form={form}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          hideRequiredMark={true}
          onFinish={onSubmit}
          onFinishFailed={console.log}
          initialValues={initialValues}
          size={"medium"}
        >
          <Form.Item label="Task Name" name="name" rules={[{ required: true }]}>
            <Input autoFocus={true}/>
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Due Date" name="dueDate">
            <DatePicker format='MM/DD/YYYY' />
          </Form.Item>
          <Form.Item label="Priority" name="priority">
            <Radio.Group>
              <Radio.Button value={1}><FlagTwoTone twoToneColor="#eb2f96" /></Radio.Button>
              <Radio.Button value={2}><FlagTwoTone twoToneColor="#722ed1" /></Radio.Button>
              <Radio.Button value={3}><FlagTwoTone twoToneColor="#2f54eb" /></Radio.Button>
              <Radio.Button value={4}><FlagOutlined style={{ color: "#595959" }} /></Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Parent" name="parent" style={{marginBottom: createError ? 12 : null}}>
            <TaskTree maxHeight="150px"/>
          </Form.Item>
          {createError && <Text type="danger">{createError}</Text>}
          {createError && <div style={{height: "12px"}}></div>}
          <Form.Item style={{ marginBottom: 0}}>
            <Button
              loading={isProcessing}
              htmlType="submit"
              type="primary"
              style={{}}
            >
              {editMode ? 'Update Task' : 'Add Task'}
            </Button>
            <Button
              danger
              style={{
                float: 'right'
              }}
              onClick={() => {
                if (editMode) {
                  onFormCancelled()
                } else {
                  form.resetFields() 
                  setCreateError(null)
                }
              }}
            >
              {editMode ? 'Cancel' : 'Clear'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Card>
  )
}

export default TaskForm;