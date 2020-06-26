import React, { Component } from "react";

import { Button, Drawer } from 'antd';
import { MenuOutlined, ImportOutlined, CodeOutlined } from '@ant-design/icons';
import DevPreferences from './DevPreferences';
import TaskTree from './TaskTree';


class DrawerPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      isDevPrefsOpen: false
    }
  }

  componentDidMount() {

  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen })
  }

  renderDevModal() {
    return (
      <DevPreferences
        context={this.props.context}
        visible={this.state.isDevPrefsOpen}
        handleClose={() => this.setState({isDevPrefsOpen: false})}
        />
    )
  }

  render() {
    return (
      <div>
        <MenuOutlined style={styles.hamburger} onClick={this.toggle.bind(this)} />
        <Drawer
          title="Basic Drawer"
          placement="right"
          closable={false}
          onClose={this.toggle.bind(this)}
          visible={this.state.isOpen}
        >
		  <TaskTree tasks={this.props.tasks} onTaskSelected={this.props.onTaskSelected} shouldFocus={true} />
          {this.renderDevModal()}
          <Button type="link" icon={<CodeOutlined />} style={styles.devprefs} onClick={() => this.setState({isDevPrefsOpen: true})}>
            Show Dev Preferences
          </Button>
          <Button type="link" icon={<ImportOutlined />} style={styles.logout} onClick={this.props.handleLogout}>
            Logout
          </Button>
        </Drawer>
      </div>
    );
  }

}

const styles = {
  hamburger: {
    position: 'fixed',
    top: 32,
    right: 32
  },
  logout: {
    position: 'absolute',
    bottom: 16,
    left: 8
  },
  devprefs: {
    position: 'absolute',
    bottom: 32,
    left: 8
  }
}

export default DrawerPanel;