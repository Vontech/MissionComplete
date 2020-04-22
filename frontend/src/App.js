import React, { Component } from "react";
import { Container, Row, Col } from 'react-grid-system';

import logo from "./logo.svg";
import Colors from "./colors";
import Board from "./components/Board.js"
import Task from "./components/Task.js"
import NewTaskButton from "./components/NewTaskButton.js"
import Taskk from "./Models.js"

import '../node_modules/antd/dist/antd.css';

import MissionCompleteApi from './utils/api';

import { Card, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      drawerVisible: true
    }
    this.api = new MissionCompleteApi();
    this.api.createUser('vontell', 'asdadad@gmail.com', 'wert', () => {
      this.api.login('vontell', 'wert', (resp) => {
        console.log('Access Token?'); console.log(localStorage.accessToken)
        this.api.getTasks(resp => {
          console.log("GETTING TASKS")
          console.log(resp);
        });
      });
    });
  }

  componentDidMount() {
    this.updateTasks()
  }

  showDrawer = () => {
    this.setState({
      drawerVisible: true,
    });
  };

  hideDrawer = () => {
    this.setState({
      drawerVisible: false,
    });
  }

  updateTasks() {
    this.api.getTasks((tasks) => {
      let newTasks = [];
      console.log(tasks)
      for (let task of tasks.data) {
        newTasks.push(new Taskk(task.name, task.notes));
      }
      this.setState({tasks: newTasks});
      console.log("GOT NEW TASKS")
      console.log(newTasks);
    })
  }

  getDrawer() {
    return (
      <Drawer
        title="Basic Drawer"
        placement="right"
        closable={false}
        onClose={this.hideDrawer}
        visible={this.state.drawerVisible}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    )
  }

  render() {
    return (
      <div>
        <Board>
          <NewTaskButton createNewTask={(task) => this.api.addTask(task, this.updateTasks.bind(this))}/>
          {this.state.tasks.map((task, i) => {
            return <Task 
                    x={600}
                    y={50 + 250*i}
                    title={task.title} />
          })}
        </Board>
        {this.getDrawer()}
      </div>
    );
  }
}

const styles = {

}

export default App;
