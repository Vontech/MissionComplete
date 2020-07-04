
import React, { Component } from "react";

import { Modal, Form, Switch } from 'antd';

class DevPreferences extends Component {

  constructor(props) {
    super(props)
    this.form = null;
    this.state = {
      devPreferences: {}
    }
  }

  componentDidMount() {
    this.props.context.api.getPreferences()
      .then((res) => {
        this.setState({devPreferences: res.data})
        this.updateCurrentFields()
      })
  }

  updateCurrentFields() {
    if (this.form) {
      console.log("Setting values")
      console.log(this.state.devPreferences)
      this.form.setFieldsValue(this.state.devPreferences)
    }
  }

  onApply = (values) => {
    // Apply settings
    this.props.context.api.savePreferences(values)
      .then((res) => {
        this.setState({devPreferences: res.data})
        this.updateCurrentFields()
        this.props.context.updatePrefs(res.data)
        this.props.handleClose()
      })
  };

  setRef(ref) {
    this.form = ref;
    this.updateCurrentFields()
  }

  render() {
    return (
      <div>
        <Modal
          title="Developer Preferences"
          visible={this.props.visible}
          onCancel={this.props.handleClose}
          okText="Apply"
          onOk={() => {
            this.onApply(this.form.getFieldsValue())
          }}>
          <div>
            <Form
              layout="horizontal"
              size="small"
              ref={this.setRef.bind(this)}>
              <Form.Item label="Show Progress Bars" name="useProgressBars" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }

}

export default DevPreferences;