import React, { Component } from "react";

class ProgressBar extends Component {

  componentDidMount() {
    
  }

  render() {
    return (
      <div style={{width: '100%', height: this.props.height, ...this.props.style}}>
        <div style={{
          height: this.props.height,
          backgroundColor: this.props.color,
          width: `${Math.floor(this.props.progress)}%`
        }}></div>
      </div>
    )
  }

}

export default ProgressBar;