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
import { message } from 'antd';

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

const BezierCurve = (
  viewBoxWidth,
  viewBoxHeight,
  startPoint,
  firstControlPoint,
  secondControlPoint,
  endPoint,
  stroke
) => {
  return (
    <svg 
      style={{width: viewBoxWidth, height: viewBoxHeight, zIndex: -10}}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
      <path
        d={`
          M ${startPoint}
          C ${firstControlPoint}
            ${secondControlPoint}
            ${endPoint}
        `}
        stroke={stroke}
        strokeWidth={2}
        fill={"#00000000"}
      />
    </svg>
  );
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      taskMap: new Map(),
      taskTree: [],
      appState: 'unknown',
      searchModalVisible: false,
      trackedTask: null
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
    this.trackNewTask(null)
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

  trackNewTask(id) {
    if (id == null) {
      window.scrollTo(5000-150, 5000-100);
      this.setState({trackedTask: null})
    } else {
      this.scrollToTask(id);
      this.setState({trackedTask: id})
    }
  }


  addTask(taskValues) {
    const that = this;
	  console.log(taskValues);
	  this.api.addTask(taskValues)
	  .then((task) => {
      this.updateTasks()
      .then(() => {
        that.trackNewTask(task.data._id);
      })
		  message.info(`Added task '${taskValues.name}'`);
    })
  }

  removeTask(task_id) {
	  this.api.removeTask(task_id)
	  .then(() => { this.updateTasks(); })
  }

  toggleComplete(updateValues) {
	  this.api.updateTask(updateValues)
	  .then(() => { this.updateTasks(); })
  }

  updateTasks() {
    return this.api.getTasks()
      .then((tasks) => {
        let newTasks = [];
        for (let task of tasks.data) {
          newTasks.push(new Taskk(task));
        }
        let {tree, taskMap} = getIdTree(newTasks);
        this.setState({taskMap: taskMap, taskTree: tree});

        if (this.state.trackedTask == null && tree.length > 0) {
          this.trackNewTask(tree[0].data.id);
        }

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
    if (!document.getElementById(taskId)) {
      return;
    }
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

  getDrawnArrowBetween(x1, y1, x2, y2) {

    let swapped = false;
    if (x1 > x2) {
      let temp = x1;
      x1 = x2;
      x2 = temp;
      swapped = true;
    }

    let height = y2 - y1;
    let width = x2 - x1;

    return <div style={{
      position: 'absolute',
      left: x1,
      top: y1,
      width: width,
      height: height,
    }}>
      {!swapped ? 
        BezierCurve(x2 - x1, y2 - y1, [0, 0], [0, height], [width, 0], [width, height], Colors.ARROW_GREY )
      : BezierCurve(x2 - x1, y2 - y1, [0, height], [0, 0], [width, height], [width, 0], Colors.ARROW_GREY )}
    </div>
  }

  renderTaskGraph() {
    let x_scale = 1;
    let y_scale = 1;
    let listOfTaskComps = [];
    let listOfArrows = [];
	  let {taskTree, taskMap} = this.state;
    let removeTaskFunc = this.removeTask.bind(this);
    let completeTaskFunc = this.toggleComplete.bind(this);
    let createChildTaskFunc = this.addTask.bind(this)
    const that = this;
    function recurseOverComps(currentTree) {
      console.log("NEW TREE", currentTree)
	  let task = taskMap.get(currentTree.data.id);
	  console.log("TREE", task);
      let x_pos = 5000 + x_scale*currentTree.x;
      let y_pos = 5000 + y_scale*currentTree.y;
      listOfTaskComps.push(
        <Task 
          key={task.id}
          x={x_pos}
          y={y_pos}
          task={task} 
          removeTaskHandler={removeTaskFunc}
          completeTaskHandler={completeTaskFunc}
          createChildTask={createChildTaskFunc} />
      );
      for (let child of (currentTree.children || [])) {
        let child_x_y = recurseOverComps(child);
        listOfArrows.push(that.getDrawnArrowBetween(x_pos + 150, y_pos + 107, child_x_y[0] + 150, child_x_y[1]))
      }

      return [x_pos, y_pos];
    }

    for (let root of taskTree) {
      recurseOverComps(root);
    }

    return listOfArrows.concat(listOfTaskComps);

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
        {/*BezierCurve(200, 200, "0 0", "20 50", "20 150", "200 200", "red" )*/}
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
