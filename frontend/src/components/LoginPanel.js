import React, { Component } from "react";

import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UnlockOutlined } from '@ant-design/icons';

class LoginPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isRegistering: false,
      errorMessage: null,
      isLoading: null
    };
  }

  componentDidMount() {

  }

  toggleRegistration() {
    this.setState({ isRegistering: !this.state.isRegistering })
  }

  setError(message) {
    this.setState({ errorMessage: message })
  }

  handleLogin(loginValues) {
    this.setState({ isLoading: true })
    this.props.context.api.login(loginValues.username, loginValues.password)
      .then(() => {
        this.setState({ isLoading: false })
        this.props.finish()
      })
      .catch((err) => {
        console.log(err)
        this.setState({ isLoading: false })
        this.setError('Incorrect username or password');
      })
  }

  handleRegistration(registrationValues) {
    let rv = registrationValues

    if (rv.password !== rv.password_confirm) {
      this.setError('Passwords do not match');
      return;
    }

    this.setState({ isLoading: true })
    this.setState({ isLoading: false })
    this.props.context.api.createUser(rv.username, rv.email, rv.password)
      .then((result) => {
        return this.props.context.api.login(rv.username, rv.password);
      })
      .then((result) => {
        this.props.finish();
      })
      .catch((err) => {
        console.log(err);
        this.setError('Username or email already taken');
      })
  }

  renderLogin() {
    return (
      <div style={styles.loginForm}>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFieldsChange={() => this.setError(null)}
          onFinish={this.handleLogin.bind(this)}>
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
            <Button type="primary" htmlType="submit" style={styles.loginFormButton} loading={this.state.isLoading}>
              Log in
            </Button><br /><br />
            <Button type="link" style={styles.loginRegistrationButton} onClick={this.toggleRegistration.bind(this)}>
              Click to register
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  renderRegistration() {
    return (
      <div style={styles.registrationForm}>
        <Form
          name="normal_registration"
          className="registration-form"
          initialValues={{}}
          onFieldsChange={() => this.setError(null)}
          onFinish={this.handleRegistration.bind(this)}
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
            <Button type="primary" htmlType="submit" style={styles.loginFormButton} loading={this.state.isLoading}>
              Create Account
            </Button><br /><br />
            <Button type="link" style={styles.loginRegistrationButton} onClick={this.toggleRegistration.bind(this)}>
              Go to login
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  renderError() {
    return (
      <Alert
        style={{ marginBottom: 24 }}
        message={this.state.errorMessage}
        type="error"
        showIcon
      />
    )
  }

  render() {
    return (
      <div className="center">
        {this.state.errorMessage && this.renderError()}
        {this.state.isRegistering && this.renderRegistration()}
        {!this.state.isRegistering && this.renderLogin()}
      </div>
    );
  }

}

const styles = {
  loginForm: {
    maxWidth: 300,
  },
  loginFormForgot: {
    float: 'right'
  },
  loginFormButton: {
    width: '100%'
  },
  loginRegistrationButton: {
    width: '100%'
  },
  registrationForm: {
    width: 350,
  },
}

export default LoginPanel;