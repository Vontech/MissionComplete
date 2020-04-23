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

import '../node_modules/antd/dist/antd.css';

import MissionCompleteApi from './utils/api';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      appState: 'unknown'
    }
    this.api = new MissionCompleteApi();
    if (this.api.isLoggedIn()) {
      this.state.appState = 'logged-in'
    }
    // this.api.login('vontell', 'wert', (resp) => {
    //   console.log('Access Token?'); console.log(localStorage.accessToken)
    //   this.api.getTasks(resp => {
    //     console.log("GETTING TASKS")
    //     console.log(resp);
    //   });
    // });
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

  updateTasks() {
    this.api.getTasks()
      .then((tasks) => {
        let newTasks = [];
        console.log(tasks)
        for (let task of tasks.data) {
          newTasks.push(new Taskk(task));
        }
        this.setState({tasks: newTasks});
        console.log("GOT NEW TASKS")
        console.log(newTasks);
      })
      .catch((err) => {
        this.showLogin();
      });
  }

  getDrawer() {
    return (
      <DrawerPanel handleLogout={this.handleLogout}/>
    )
  }

  getTasksPane() {
    return (
      <div>
        <Board>
          <NewTaskButton createNewTask={this.addTask.bind(this)}/>
          {this.state.tasks.map((task, i) => {
            return <Task 
                    x={600}
                    y={50 + 250*i}
                    task={task} />
          })}
        </Board>
        {this.getDrawer()}
      </div>
    )
  }

  getLoginPane() {
    return (
      <Row style={{height: "100%"}}>
        <Col>
          <LoginPanel handleLogin={this.attemptLogin}/>
        </Col>
      </Row>
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
