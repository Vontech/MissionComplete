import React, { Component } from "react";
import { Container, Row, Col } from 'react-grid-system';

import logo from "./logo.svg";
import Colors from "./colors";
import Board from "./components/Board.js"
import Task from "./components/Task.js"
import Taskk from "./Models.js"

import '../node_modules/antd/dist/antd.css';

import { Card } from 'antd';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: this.getExampleTasks()
    }
  }

  componentDidMount() {

  }

  getExampleTasks() {
    return {
      1: new Taskk("My First Task!", "Why hello there")
    }
  }

  render() {
    return (
      <Board>
        <Task 
          x={5500}
          y={5500}
          title="Create app infra" />
      </Board>
    );
  }
}

const styles = {

}

export default App;
