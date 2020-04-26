import React, { Component } from "react";
import { Container, Row, Col } from 'react-grid-system';
import {GlobalHotKeys} from "react-hotkeys";

import logo from "./logo.svg";
import Colors from "./colors";
import Board from "./components/Board.js"
import Task from "./components/Task.js"
import NewTaskButton from "./components/NewTaskButton.js"
import LoginPanel from "./components/LoginPanel.js"
import DrawerPanel from "./components/DrawerPanel.js"
import SearchModal from "./components/SearchModal.js"
import Taskk from "./Models.js"
import {getIdTree} from "./utils/algos.js"

import '../node_modules/antd/dist/antd.css';

import MissionCompleteApi from './utils/api';

import {Modal} from 'antd';

import {configure} from 'react-hotkeys';

configure({
  /**
   * The level of logging of its own behaviour React HotKeys should perform.
   */
  logLevel: 'none',

});

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      taskMap: new Map(),
      taskTree: [],
      appState: 'unknown',
      searchModalVisible: false
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
        console.log("ASDASDASDADS")
        console.log(taskMap);
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
        scrollToTask={this.scrollToTask.bind(this)}
        handleLogout={this.handleLogout}
        tasks={{taskTree: this.state.taskTree, taskMap: this.state.taskMap}}/>
    )
  }

  scrollToTask(taskId) {
    console.log(taskId);
    let positionY = document.getElementById(taskId).offsetTop;
    let positionX = document.getElementById(taskId).offsetLeft;

    document.getElementById(taskId).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    console.log(positionX, positionY);

  }

  keyMap = { TOGGLE_SEARCH: "Meta+k" };

  toggleSearchModal() {
    this.setState({searchModalVisible: !this.state.searchModalVisible})
  }

  renderTaskGraph() {
    let x_scale = 1;
    let y_scale = 1;
    let listOfTaskComps = [];
	  let {taskTree, taskMap} = this.state;
	  let removeTaskFunc = this.removeTask.bind(this);
    function recurseOverComps(currentTree) {
      console.log("NEW TREE", currentTree)
      let task = taskMap.get(currentTree.data.id);
      listOfTaskComps.push(
        <Task 
          key={task.id}
          x={1000 + x_scale*currentTree.x}
          y={50 + y_scale*currentTree.y}
          task={task} 
          removeTaskHandler={removeTaskFunc} />
      );
      for (let child of (currentTree.children || [])) {
        recurseOverComps(child);
      }
    }

    for (let root of taskTree) {
      recurseOverComps(root);
    }

    return listOfTaskComps;

  }

  getTasksPane() {
    return (
      <div>
        <GlobalHotKeys keyMap={this.keyMap} handlers={{ TOGGLE_SEARCH: this.toggleSearchModal.bind(this) }} />
        <Board>
          <NewTaskButton createNewTask={this.addTask.bind(this)}/>
          {this.renderTaskGraph()}
        </Board>
        {this.getDrawer()}
        {this.state.searchModalVisible && 
          <SearchModal 
            isVisible={this.state.searchModalVisible} 
            tasks={this.state.taskMap} 
            onClickOutside={() => this.setState({searchModalVisible: false})}
            selectTask={(task) => {
              
              this.setState({searchModalVisible: false}, () => {
                this.scrollToTask(task);
              })
            }} />
        }
        
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
