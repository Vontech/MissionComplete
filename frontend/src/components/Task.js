
import React, { Component } from "react";

import { Card, Button, Icon, Tooltip, Popconfirm, message } from 'antd';
import { DownloadOutlined, ApartmentOutlined } from '@ant-design/icons';
import defaultStyles from '../styles.js';

type Props = {
    x: int,
    y: int,
    title: String,
    date: Any
  }

type State = {
    isHovered: Boolean
}

class Task extends Component<Props, State> {

    constructor(props) {
      super(props);
      this.state = {
        isHovered: false
      }
    }

    componentDidMount() {

    }

    getActions() {
      if (this.state.isHovered) {
        return [
          <Tooltip placement="bottom" title="Create Next">
            <DownloadOutlined key="createNext"/>
          </Tooltip>,
          <Tooltip placement="bottom" title="Create New Branch">
            <ApartmentOutlined key="createBranch"/>
          </Tooltip>
        ]
      }
      return []
    }

    setHover(isHovered) {
      this.setState({isHovered: isHovered})
    }

    render() {
      let propStyles = {'top': this.props.y, 'left': this.props.x}
      console.log(propStyles);
      return (
        <div 
          style={{...styles.container, ...propStyles}}
          onMouseEnter={() => this.setHover(true)}
          onMouseLeave={() => this.setHover(false)}>
          <Card 
            title={<i>{this.props.title}</i>} 
            actions={this.getActions()}
            extra={<a href="#">Edit</a>} 
            style={{ width: 300 }}>
              <div style={defaultStyles.DESCRIPTION}>
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
              </div>
            
            <Popconfirm
              title="Delete this task?"
              onConfirm={console.log("DELETE")}
              onCancel={console.log("DONT")}
              okText="Yes"
              cancelText="No"
            >
              <a href="#">Delete</a>
            </Popconfirm>,
          </Card>
        </div>
      )
    }

}

const styles = {
  container: {
    position: 'absolute'
  }
}

export default Task;