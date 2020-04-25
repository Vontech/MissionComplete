
import React, { Component } from "react";

import { Form, Input, Button, Checkbox, Row, Col, Drawer, Tree } from 'antd';
import { MenuOutlined, ImportOutlined, DownOutlined } from '@ant-design/icons';

const { TreeNode } = Tree;

class DrawerPanel extends Component {

    constructor(props) {
      super(props);
      this.state = {
          isOpen: false,
      }
    }

    componentDidMount() {

    }

    toggle() {
        this.setState({isOpen: !this.state.isOpen})
    }

    renderTaskTree() {

        let {taskTree, taskMap} = this.props.tasks;

        function recurseOverComps(currentTree) {
            let task = taskMap.get(currentTree.id);
            if (!currentTree.children) {
                return (<TreeNode 
                    key={task.id}
                    title={task.name} />);
            }
            return (
                <TreeNode 
                    key={task.id}
                    title={task.name}>
                        {currentTree.children.map((childTree) => {return recurseOverComps(childTree)})}
                    </TreeNode>
            );
        }

        let components = [];
        for (let child of taskTree) {
            components.push(recurseOverComps(child));
        }

        return (
            <Tree
              showLine={true}
              switcherIcon={<DownOutlined />}
              onSelect={() => {}}
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
    }
}

export default DrawerPanel;