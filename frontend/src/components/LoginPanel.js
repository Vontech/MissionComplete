import React, { Component } from "react";

import { Form, Input, Button, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

class LoginPanel extends Component {

    constructor(props) {
      super(props);
      this.state = {}
    }

    componentDidMount() {

    }

    render() {
        return (
            <div style={styles.loginForm} className="center">
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={this.props.handleLogin}
                    >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
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
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>

                        <Button styles={styles.loginFormForgot} className="login-form-forgot" onClick={() => {}} type='link'>
                            Forgot password
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={styles.loginFormButton}>
                            Log in
                        </Button>
                        Or <a href="">register now!</a>
                    </Form.Item>
                </Form>
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
    }
}

export default LoginPanel;