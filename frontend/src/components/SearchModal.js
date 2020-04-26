
import React, { Component } from "react";

import { Modal, AutoComplete } from 'antd';
import {  } from '@ant-design/icons';

const options = [
    {
      value: 'Burns Bay Road',
      task: 'test'
    },
    {
      value: 'Downing Street',
    },
    {
      value: 'Wall Street',
    },
  ];

class SearchModal extends Component {

    constructor(props) {
      super(props);
      this.state = {}
    //   this.searchBarRef = React.createRef();
    }

    componentDidMount() {
        console.log("INSIDE SEARCH")
        console.log(this.props)
    }

    // componentDidUpdate(prevProps) {
    //     if (this.props.isVisible && this.searchBarRef.current) {
    //         this.searchBarRef.current.focus()
    //     }
    // }

    toggle() {
        this.setState({isOpen: !this.state.isOpen})
    }

    getOptions() {
        let options = Array.from(this.props.tasks, ([id, value]) => {
            return {
                value: value.name,
                id: id
            }
        });
        return options;
    }

    selectOption(value, option) {
        this.props.selectTask(option.id);
    }

    render() {
        return (
            <Modal
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
                    autoFocus={true}
                    options={this.getOptions()}
                    placeholder="Search for a task..."
                    filterOption={(inputValue, option) => {
                        return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }}
                    onSelect={this.selectOption.bind(this)}
                    defaultActiveFirstOption={true}
                />
            </Modal>
        );
    }

}

const styles = {

}

export default SearchModal;