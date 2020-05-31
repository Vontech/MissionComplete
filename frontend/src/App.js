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
      window.scrollTo(5000 - 150, 5000 - 100);
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
    console.log("EDITING TASK ", task_id)
    console.log(properties)
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
        scrollToTask={this.scrollToTask.bind(this)}
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

    return (
      <div
        key={`${x1}-${y1}-${x2}-${y2}`}
        style={{
          position: 'absolute',
          left: x1,
          top: y1,
          width: width,
          height: height,
        }}>
        {!swapped ?
          BezierCurve(x2 - x1, y2 - y1, [0, 0], [0, height], [width, 0], [width, height], Colors.ARROW_GREY)
          : BezierCurve(x2 - x1, y2 - y1, [0, height], [0, 0], [width, height], [width, 0], Colors.ARROW_GREY)}
      </div>
    );
  }

  renderTaskGraph() {
    let x_scale = 1;
    let y_scale = 1;
    let listOfTaskComps = [];
    let listOfArrows = [];
    let { taskTree, taskMap } = this.state;
    if (!taskTree) {
      return null
    }
    let removeTaskFunc = this.removeTask.bind(this);
    let completeTaskFunc = this.toggleComplete.bind(this);
    let createChildTaskFunc = this.addTask.bind(this)
    let editTaskFunc = this.editTask.bind(this)
    let getContext = this.getAppContext.bind(this);
    const that = this;
    function recurseOverComps(currentTree) {
      if (currentTree.data.id != null) { // Only create node if not special root
        let task = taskMap.get(currentTree.data.id);
        let x_pos = 5000 + x_scale * currentTree.x;
        let y_pos = 5000 + y_scale * currentTree.y;
        listOfTaskComps.push(
          <Task
            context={getContext()}
            key={task.id}
            x={x_pos}
            y={y_pos}
            task={task}
            treeTaskData={currentTree.data}
            // TODO: These should all be combined into some task manager
            editTask={(properties) => editTaskFunc(task.id, properties)}
            removeTaskHandler={removeTaskFunc}
            completeTaskHandler={completeTaskFunc}
            createChildTask={createChildTaskFunc} />
        );
        for (let child of (currentTree.children || [])) {
          let child_x_y = recurseOverComps(child);
          listOfArrows.push(that.getDrawnArrowBetween(x_pos + 150, y_pos + 107, child_x_y[0] + 150, child_x_y[1]))
        }
        return [x_pos, y_pos];
      } else {
        for (let child of (currentTree.children || [])) {
          recurseOverComps(child);
        }
      }
    }

    recurseOverComps(taskTree);

    return listOfTaskComps;

  }

  getTasksPane() {
    return (
      <ArcherContainer 
        svgContainerStyle={{width: 10000}}
        strokeColor="#b8b8b8"
        strokeWidth={1.2}
        noCurves={true}
        >
        <GlobalHotKeys keyMap={this.keyMap} handlers={{ TOGGLE_SEARCH: this.toggleSearchModal.bind(this) }} />
        <Board>
          <NewTaskButton createNewTask={this.addTask.bind(this)} />
            {this.renderTaskGraph()}
        </Board>
        {this.getDrawer()}
        {this.state.searchModalVisible &&
          <SearchModal
            isVisible={this.state.searchModalVisible}
            tasks={this.state.taskMap}
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
