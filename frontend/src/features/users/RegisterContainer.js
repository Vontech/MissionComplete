import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UnlockOutlined } from '@ant-design/icons';

import { api } from '../../utils/api';

import { userStateUpdated, UserStatus } from './usersSlice';

export const RegistrationContainer = () => {

  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const moveToLogin = useCallback(
    () => dispatch(userStateUpdated(UserStatus.LOGGED_IN)),
    [dispatch]
  )

  const finishRegistering = useCallback(
    async () => dispatch(userStateUpdated(await api.isLoggedIn() ? UserStatus.LOGGED_IN : UserStatus.LOGGED_OUT)),
    [dispatch]
  )

  const handleRegistration = ({username, email, password, password_confirm}) => {

    if (password !== password_confirm) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    api.createUser(username, email, password)
      .then(() => {
        return api.login(username, password);
      })
      .then(() => {
        setIsLoading(false);
        finishRegistering()
      })
      .catch((err) => {
        console.log(err)
        setIsLoading(false)
        setErrorMessage('Incorrect username or password');
      })
  }

  return (
    <div className='center'>
      {errorMessage && 
        <Alert
          style={{ marginBottom: 24 }}
          message={errorMessage}
          type="error"
          showIcon
        />
      }
      <div style={styles.registrationForm}>
        <Form
          name="normal_registration"
          className="registration-form"
          initialValues={{}}
          onFieldsChange={() => setErrorMessage(null)}
          onFinish={handleRegistration}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input a username' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input an email' }]}
          >
            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" type="email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="password_confirm"
            rules={[{ required: true, message: 'Please input your password confirmation' }]}
          >
            <Input
              prefix={<UnlockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.fullWidth} loading={isLoading}>
              Create Account
            </Button><br /><br />
            <Button type="link" style={styles.fullWidth} onClick={moveToLogin}>
              Go to login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );

}

const styles = {
  fullWidth: {
    width: '100%'
  },
  registrationForm: {
    width: 350,
  },
}

export default RegistrationContainer;