
import React, { Component } from "react";

import { Card, Button, Icon, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';


type Props = {
    
}

type State = {
    
}

class NewTaskButton extends Component<Props, State> {

    constructor(props) {
      super(props);
      this.state = {}
    }

    componentDidMount() {

    }

    render() {
      return (
        <div>
            <Button icon={<PlusOutlined />} type="primary" shape="circle" onClick={() => {
                this.props.createNewTask({
                    'name': Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                    'notes': "These are some notes"
                })
            }}>
            </Button>
        </div>
      )
    }

}

const styles = {
  container: {
    position: 'absolute'
  }
}

export default NewTaskButton;