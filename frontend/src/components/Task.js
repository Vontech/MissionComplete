
import React, { Component } from "react";

import { Card, Button, Icon, Tooltip, Popconfirm, message, Skeleton, Avatar } from 'antd';
import { EditTwoTone, CheckCircleTwoTone, DeleteTwoTone } from '@ant-design/icons';
import defaultStyles from '../styles.js';

const { Meta } = Card;

class Task extends Component {

	state = {
		loading: false,
	}

    constructor(props) {
      super(props);
      this.state = {
        isHovered: false
      }
    }

    componentDidMount() {
		// this.setState({ loading: !this.state.loading });
    }

    getActions() {
      if (this.state.isHovered) {
        return [
			<Tooltip placement="bottom" title="Delete Task">
				<DeleteTwoTone twoToneColor="#eb2f96" key="delete"/>
          	</Tooltip>,
			<Tooltip placement="bottom" title="Edit Task">
				<EditTwoTone key="edit"/>
			</Tooltip>,
			<Tooltip placement="bottom" title="Mark as Done">
				<CheckCircleTwoTone twoToneColor="#52c41a" key="complete"/>
			</Tooltip>
        ]
      }
      return []
    }

	onTabChange(key) {
		console.log("Key: " + key);
	}

    setHover(isHovered) {
      this.setState({isHovered: isHovered})
    }

    render() {
      let propStyles = {'top': this.props.y, 'left': this.props.x}
      return (
        <div 
          style={{...styles.container, ...propStyles}}
          onMouseEnter={() => this.setHover(true)}
          onMouseLeave={() => this.setHover(false)}>
          <Card 
            actions={this.getActions()}
            style={{ width: 300 }}>
			<Skeleton loading={this.state.loading} avatar active>
				<Meta
					avatar={
						<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
					}
					title={this.props.task.name} 
					description={this.props.task.notes}
				/>
          	</Skeleton>
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