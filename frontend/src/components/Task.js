
import React, { Component } from "react";

import { Card, Button, Icon, Tooltip } from 'antd';

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
            <Icon type="download" key="createNext" />
          </Tooltip>,
          <Tooltip placement="bottom" title="Create New Branch">
            <Icon type="apartment" key="createBranch" />
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
            title={this.props.title} 
            actions={this.getActions()}
            extra={<a href="#">Edit</a>} 
            style={{ width: 300 }}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
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