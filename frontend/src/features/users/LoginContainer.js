import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { api } from '../../utils/api';

import { userStateUpdated, UserStatus } from './usersSlice';

import logo from '../../static/MCLogo.png';

// const task = useSelector(state => selectTaskById(state, taskId))

export const LoginContainer = () => {

  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const moveToRegistration = useCallback(
    () => dispatch(userStateUpdated(UserStatus.REGISTERING)),
    [dispatch]
  )

  const finishLogin = useCallback(
    async () => window.location.reload(),//dispatch(userStateUpdated(await api.isLoggedIn() ? UserStatus.LOGGED_IN : UserStatus.LOGGED_OUT)),
    [dispatch]
  )

  const handleLogin = ({username, password}) => {
    setErrorMessage(null);
    setIsLoading(true);
    api.login(username, password)
      .then(() => {
        setIsLoading(false);
        finishLogin();
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
      <div style={{textAlign: 'center', marginBottom: '24px'}}>
        <img 
          style={{
            width: '72px',
            height: '72px'
          }}
          src={logo} 
          alt="Mission Complete logo"/>
      </div>
      <div style={styles.loginForm}>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFieldsChange={() => setErrorMessage(null)}
          onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]} >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" autoFocus/>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}>
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Button styles={styles.loginFormForgot} className="login-form-forgot" onClick={() => { }} type='link'>
              Forgot password
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={styles.fullWidth} loading={isLoading}>
              Log in
            </Button><br /><br />
            <Button type="link" style={styles.fullWidth} onClick={moveToRegistration}>
              Click to register
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

const styles = {
  loginForm: {
    maxWidth: 300,
  },
  loginFormForgot: {
    float: 'right'
  },
  fullWidth: {
    width: '100%'
  },
}

export default LoginContainer