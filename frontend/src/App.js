import React, { Component } from "react";
import { Container, Row, Col } from 'react-grid-system';

import logo from "./logo.svg";
import Colors from "./colors";
import Board from "./components/Board.js"
import Task from "./components/Task.js"
import NewTaskButton from "./components/NewTaskButton.js"
import LoginPanel from "./components/LoginPanel.js"
import DrawerPanel from "./components/DrawerPanel.js"
import Taskk from "./Models.js"
import {getIdTree} from "./utils/algos.js"

import '../node_modules/antd/dist/antd.css';

import MissionCompleteApi from './utils/api';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      taskMap: new Map(),
      taskTree: [],
      appState: 'unknown'
    }
    this.api = new MissionCompleteApi();
    if (this.api.isLoggedIn()) {
      this.state.appState = 'logged-in'
    }
  }

  getAppContext() {
    return {
      api: this.api
    }
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

  handleLogout = () => {
    this.api.logout()
      .then(() => this.showLogin())
  }

  showLogin = () => {
    this.setState({appState: 'logged-out'});
  }

  showTaskPanel = () => {
    this.setState({appState: 'logged-in'})
    this.updateTasks();
  }

  attemptLogin = (loginValues) => {
    console.log(loginValues);
    this.api.login(loginValues.username, loginValues.password)
      .then(() => {this.showTaskPanel()})
      .catch((err) => {console.log(err)})
  }


  addTask(taskValues) {
	  console.log(taskValues);
	  this.api.addTask(taskValues)
	  .then((task) => {
		  this.updateTasks();
	  })
  }

  removeTask(task_id) {
	  console.log(task_id);
	  this.api.removeTask(task_id)
	  .then(() => { this.updateTasks(); })
  }

  updateTasks() {
    this.api.getTasks()
      .then((tasks) => {
        let newTasks = [];
        for (let task of tasks.data) {
          newTasks.push(new Taskk(task));
        }
        let {tree, taskMap} = getIdTree(newTasks);
        this.setState({taskMap: taskMap, taskTree: tree});
      })
      .catch((err) => {
        console.log(err);
        this.showLogin();
      });
  }

  getDrawer() {
    return (
      <DrawerPanel 
        handleLogout={this.handleLogout}
        tasks={{taskTree: this.state.taskTree, taskMap: this.state.taskMap}}/>
    )
  }

  renderTaskGraph() {
    let listOfTaskComps = [];
	let {taskTree, taskMap} = this.state;
	let removeTaskFunc = this.removeTask.bind(this);

    function recurseOverComps(currentTree, level) {
      let task = taskMap.get(currentTree.id);
      listOfTaskComps.push(<Task 
        key={task.id}
        x={100 + 100*level}
        y={50 + 200*listOfTaskComps.length}
        task={task} 
		removeTaskHandler={removeTaskFunc} />
      );
      for (let child of currentTree.children) {
        recurseOverComps(child, level + 1);
      }
    }

    for (let child of taskTree) {
      recurseOverComps(child, 0);
    }

    return listOfTaskComps;

  }

  getTasksPane() {
    return (
      <div>
        <Board>
          <NewTaskButton createNewTask={this.addTask.bind(this)}/>
          {this.renderTaskGraph()}
        </Board>
        {this.getDrawer()}
      </div>
    )
  }

  getLoginPane() {
    return (
      <div style={{height: "100%"}}>
        <LoginPanel context={this.getAppContext()} finish={this.showTaskPanel.bind(this)}/>
      </div>
    )
  }

  getRegistrationPane() {
    return (
      <div>
        Register
      </div>
    )
  }

  render() {
    return (
      <div id="primary-panel">
        {this.state.appState === 'unknown' && <div />}
        {this.state.appState === 'logged-out' && this.getLoginPane()}
        {this.state.appState === 'registering' && this.getRegistrationPane()}
        {this.state.appState === 'logged-in' && this.getTasksPane()}
      </div>
    );
  }
}

const styles = {

}

export default App;
