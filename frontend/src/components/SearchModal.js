
import React, { Component } from "react";

import { Modal, AutoComplete } from 'antd';

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
    let nameMatchesNotes = option.task.notes.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
    return nameMatchesTitle || nameMatchesNotes
  }

  render() {
    return (
      <Modal
        className="searchModal"
        centered
        footer={null}
        title={null}
        closable={false}
        onCancel={this.props.onClickOutside}
        visible={this.props.isVisible}>
        <AutoComplete
          style={{
            width: '100%',
          }}
          size="large"
          autoFocus={true}
          options={this.getOptions()}
          placeholder="Search for a task..."
          filterOption={this.filterOption}
          onSelect={this.selectOption.bind(this)}
          defaultActiveFirstOption={true}
        />
      </Modal>
    );
  }

}

export default SearchModal;