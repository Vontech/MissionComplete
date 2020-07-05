
import React, { Component } from "react";

import { Modal } from 'antd';
import TaskTree from './TaskTree'

class SearchModal extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {

  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen })
  }

  getOptions() {
    let options = Array.from(this.props.tasks, ([id, value]) => {
      return {
        value: value.name,
        id: id,
        task: value
      }
    });
    return options;
  }

  selectOption(value, option) {
    this.props.selectTask(option.id);
  }

  filterOption(inputValue, option) {
    let nameMatchesTitle = option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
    let nameMatchesNotes = option.task.notes ? option.task.notes.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 : false
    return nameMatchesTitle || nameMatchesNotes
  }

  render() {
    console.log(this.props)
    return (
      <Modal
        className="searchModal"
        centered
        footer={null}
        title={null}
        closable={false}
        onCancel={this.props.onClickOutside}
        visible={this.props.isVisible}>
		    <TaskTree tasks={this.props.tasks} onTaskSelected={this.props.selectTask} shouldFocus={true} />
      </Modal>
    );
  }

}

export default SearchModal;