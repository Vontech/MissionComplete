
import React, { Component } from "react";

import { Button, Drawer, Tree } from 'antd';
import { MenuOutlined, ImportOutlined, DownOutlined, CodeOutlined } from '@ant-design/icons';

import DevPreferences from './DevPreferences';

const { TreeNode } = Tree;

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

  renderTaskTree() {

    let { taskTree, taskMap } = this.props.tasks;

    if (!taskTree) {
      return null;
    }

    function recurseOverComps(currentTree) {
      let task = taskMap.get(currentTree.data.id);
      if (!currentTree.data.children || currentTree.data.children.length === 0) {
        return (<TreeNode
          taskRef={currentTree}
          key={task.id}
          title={task.name} />);
      }
      return (
        <TreeNode
          taskRef={currentTree}
          key={task.id}
          title={task.name}>
          {currentTree.children.map((childTree) => { return recurseOverComps(childTree) })}
        </TreeNode>
      );
    }

    let components = [];
    for (let root of taskTree.children) {
      components.push(recurseOverComps(root));
    }

    return (
      <Tree
        showLine={true}
        switcherIcon={<DownOutlined />}
        onSelect={(ids) => { this.props.scrollToTask(ids[0]) }}
      >
        {components}
      </Tree>
    );
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
          {this.renderTaskTree()}
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