import React, { Component } from "react";
import { GlobalHotKeys } from "react-hotkeys";

import Colors from "./colors";
import Board from "./components/Board.js"
import Task from "./components/Task.js"
import NewTaskButton from "./components/NewTaskButton.js"
import LoginPanel from "./components/LoginPanel.js"
import DrawerPanel from "./components/DrawerPanel.js"
import SearchModal from "./components/SearchModal.js"
import Taskk from "./Models.js"
import { getIdTree } from "./utils/algos.js"
import { message } from 'antd';

import { ArcherContainer } from 'react-archer';

import '../node_modules/antd/dist/antd.css';

import MissionCompleteApi from './utils/api';

import { configure } from 'react-hotkeys';

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
      style={{ width: viewBoxWidth, height: viewBoxHeight, zIndex: -10 }}
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
      taskTree: null,
      appState: 'unknown',
      searchModalVisible: false,
      trackedTask: null,
      preferences: {}
    }
    this.api = new MissionCompleteApi();
    if (this.api.isLoggedIn()) {
      this.state.appState = 'logged-in'
    }
  }

  getAppContext() {
    return {
      api: this.api,
      updatePrefs: this.udpdatePreferences.bind(this),
      preferences: this.state.preferences
    }
  }

  componentDidMount() {
    this.updateTasks()
    this.trackNewTask(null)

    this.api.getPreferences()
      .then((result) => console.log(result))
      .catch((result) => console.log(result))

    this.api.getPreferences()
      .then((res) => {
        this.udpdatePreferences(res.data)
      })

  }

  udpdatePreferences(newPreferences) {
    this.setState({preferences: newPreferences});
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
    this.setState({ appState: 'logged-out' });
  }

  showTaskPanel = () => {
    this.setState({ appState: 'logged-in' })
    this.updateTasks();
  }

  attemptLogin = (loginValues) => {
    console.log(loginValues);
    this.api.login(loginValues.username, loginValues.password)
      .then(() => { this.showTaskPanel() })
      .catch((err) => { console.log(err) })
  }

  trackNewTask(id) {
    if (id == null) {
      //window.scrollTo(5000 - 150, 5000 - 100);
      this.setState({ trackedTask: null })
    } else {
      this.scrollToTask(id);
      this.setState({ trackedTask: id })
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

  editTask(task_id, properties) {
    properties['task_id'] = task_id
    this.api.updateTask(properties)
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
        let { tree, taskMap } = getIdTree(newTasks);
        this.setState({ taskMap: taskMap, taskTree: tree });

        if (this.state.trackedTask == null && tree && tree.children && tree.children.length > 0) {
          this.trackNewTask(tree.children[0].data.id);
        }

        console.log("TASKS UPDATED")
        console.log(this.state)

      })
      .catch((err) => {
        console.log(err);
        this.showLogin();
      });
  }

  getDrawer() {
    return (
      <DrawerPanel
        context={this.getAppContext()}
        onTaskSelected={this.scrollToTask.bind(this)}
        handleLogout={this.handleLogout}
        tasks={{ taskTree: this.state.taskTree, taskMap: this.state.taskMap }} />
    )
  }

  scrollToTask(taskId) {
    if (!document.getElementById(taskId)) {
      return;
    }

    document.getElementById(taskId).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

  }

  keyMap = { TOGGLE_SEARCH: "Meta+k" };

  toggleSearchModal() {
    this.setState({ searchModalVisible: !this.state.searchModalVisible })
  }

  renderTaskGraph() {
    let x_scale = 1;
    let y_scale = 1;
    let horizontal_padding = 500;
    let vertical_padding = 500;
    let listOfTaskComps = [];
    let { taskTree, taskMap } = this.state;
    if (!taskTree) {
      return null
    }
    let removeTaskFunc = this.removeTask.bind(this);
    let completeTaskFunc = this.toggleComplete.bind(this);
    let createChildTaskFunc = this.addTask.bind(this)
    let editTaskFunc = this.editTask.bind(this)
    let getContext = this.getAppContext.bind(this);

    // Keep track of the tree size
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    function recurseOverComps(currentTree) {
      if (currentTree.data.id != null) { // Only create node if not special root
        let task = taskMap.get(currentTree.data.id);
        // let x_pos = 5000 + x_scale * currentTree.x;
        // let y_pos = 5000 + y_scale * currentTree.y;
        let x_pos = x_scale * currentTree.x;
        let y_pos = y_scale * currentTree.y;

        minX = Math.min(minX, x_pos); 
        minY = Math.min(minY, y_pos);
        maxX = Math.max(maxX, x_pos);
        maxY = Math.max(maxY, y_pos);

        listOfTaskComps.push([
          task.id,
          x_pos,
          y_pos,
          task,
          currentTree.data,
        ]);

        for (let child of (currentTree.children || [])) {
          recurseOverComps(child);
        }
        return [x_pos, y_pos];
      } else {
        for (let child of (currentTree.children || [])) {
          recurseOverComps(child);
        }
      }
    }

    recurseOverComps(taskTree);

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    let width = Math.max(maxX - minX + horizontal_padding, vw);
    let height = Math.max(maxY - minY + vertical_padding, vh);

    let horizontalOffset = (-1 * minX) + horizontal_padding/2;
    if ((-1*minX) < (vw/2 - horizontal_padding/2)) {
      horizontalOffset = (vw/2)// + minX + horizontal_padding/2 - 150;
    }
    
    const that = this;
    let taskViews = listOfTaskComps.map((propArr) => {
      return (<Task
        context={getContext()}
        key={propArr[0]}
        x={propArr[1] + horizontalOffset}
        y={propArr[2]}
        task={propArr[3]}
        treeTaskData={propArr[4]}
        onTaskSelected={that.scrollToTask.bind(that)}
			  tasks={{ taskTree: that.state.taskTree, taskMap: that.state.taskMap }}
        // TODO: These should all be combined into some task manager
        editTask={(properties) => editTaskFunc(propArr[0], properties)}
        removeTaskHandler={removeTaskFunc}
        completeTaskHandler={completeTaskFunc}
        createChildTask={createChildTaskFunc} 
      />)
    })

    return (
      <div style={{width: width, height: height}}>
        <div>
          {taskViews}
        </div>
      </div>
    );

  }

  getTasksPane() {
    let renderedTaskGraph = this.renderTaskGraph()
    let paneWidth = renderedTaskGraph ? renderedTaskGraph.props.style.width : 0
    return (
      <ArcherContainer 
        svgContainerStyle={{}/*{width: 10000}*/}
        strokeColor="#b8b8b8"
        strokeWidth={1.2}
        noCurves={true}
        style={{width: paneWidth}}
        >
        <GlobalHotKeys keyMap={this.keyMap} handlers={{ TOGGLE_SEARCH: this.toggleSearchModal.bind(this) }} />
        <div style={{background: '#efefef', width: paneWidth}}>
          <NewTaskButton createNewTask={this.addTask.bind(this)} tasks={{ taskTree: this.state.taskTree, taskMap: this.state.taskMap }}/>
          {renderedTaskGraph}
        </div>
        {this.getDrawer()}
        {this.state.searchModalVisible &&
          <SearchModal
            isVisible={this.state.searchModalVisible}
			      tasks={{ taskTree: this.state.taskTree, taskMap: this.state.taskMap }}
            onClickOutside={() => this.setState({ searchModalVisible: false })}
            selectTask={(task) => {
                this.setState({ searchModalVisible: false }, () => {
                this.scrollToTask(task);
              })
            }} />
        }

      </ArcherContainer>
    )
  }

  getLoginPane() {
    return (
      <div style={{ height: "100%" }}>
        <LoginPanel context={this.getAppContext()} finish={this.showTaskPanel.bind(this)} />
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

export default App;
