
import React, { Component } from "react";

import { EditTwoTone, DeleteTwoTone, ApartmentOutlined, CheckOutlined, FlagOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
var moment = require('moment');

const COLORS = {
    PRIORITY_RED: '#EB3B67',
    PRIORITY_ORANGE: '#FAAD53',
    ICON_GRAY: '#B0B7CB',
    ACCENT_GRAY: '#B0B7CB',
    BLACK: '#232227',
    BACKGROUND_GREY: '#F5F6F8',
    CARD_BACKGROUND: '#FFFFFF'
}

const DIMENSIONS = {
    CARD_WIDTH: 300,
    CARD_HEIGHT: 100,
    CARD_RADIUS: '12px',
    TITLE_SIZE: '20px',
    CAPTION_SIZE: '16px'
}

const STYLES = {
    cardContainer: {
        position: 'absolute',
        width: DIMENSIONS.CARD_WIDTH,
        height: DIMENSIONS.CARD_HEIGHT,
        fontFamily: 'Avenir'
    },
    card: {
        background: COLORS.CARD_BACKGROUND,
        borderRadius: DIMENSIONS.CARD_RADIUS,
        minHeight: '100%',
        minWidth: '100%',
        paddingLeft: '24px',
        paddingRight: '18px',
        paddingTop: '20px',
        paddingBottom: '18px',
        position: 'absolute'
    },
    cardTitle: {
        padding: 0,
        margin: 0,
        fontWeight: 'bold',
        fontSize: DIMENSIONS.TITLE_SIZE,
        color: COLORS.BLACK
    },
    dueDate: {
        fontSize: DIMENSIONS.CAPTION_SIZE,
        fontWeight: 'bold',
        marginTop: '2px'
    }
}

class TaskV2 extends Component {

    state = {
      
    }
  
    constructor(props) {
      super(props);
      this.state = {
        isHovered: false,
      }
    }
  
    componentDidMount() {
      
    }

    getPositionStyle() {
        return { 'top': this.props.y, 'left': this.props.x - 150 }
    }

    getDueDateColor() {
        if (this.props.task.completed) {
          return COLORS.ICON_GRAY;
        } else if (!this.props.task.dueDate) {
          return COLORS.ICON_GRAY;
        } else if (moment(this.props.task.dueDate).isAfter(moment(), 'day')) {
          return COLORS.ICON_GRAY;
        } else if (moment(this.props.task.dueDate).isSame(moment(), 'day')) {
          return COLORS.PRIORITY_ORANGE;
        } else {
          return COLORS.PRIORITY_RED;
        }
      }

    getDropShadowComponent() {
        return (
            <div style={{
                //filter: 'drop-shadow(0px 2px 50px #40000000)',
                boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 50px',
                width: DIMENSIONS.CARD_WIDTH / 1.3,
                height: DIMENSIONS.CARD_HEIGHT / 2,
                zIndex: 5
            }}>
            </div>
        )
    }

    render() {
        return (
            <div style={{...STYLES.cardContainer, ...this.getPositionStyle()}}>
                
                <div style={{...STYLES.card, zIndex: 10}}>
                    <div>
                        <p style={STYLES.cardTitle}>{this.props.task.name}</p>
                    </div>
                    <div>
                        {this.props.task.dueDate && 
                            <div style={{color: this.getDueDateColor(), ...STYLES.dueDate}}>
                                <ClockCircleOutlined  style={{marginRight: 8, fontSize: 18}}/>
                                <span style={{top: '-1px', position: 'relative'}}>{moment(this.props.task.dueDate).format('ddd, MMM D')}</span>
                            </div>
                        }
                       
                        <p></p>
                    </div>
                    
                </div>
                <div style={{
                    position: 'absolute',
                    top: DIMENSIONS.CARD_HEIGHT / 2 + 10,
                    left: (DIMENSIONS.CARD_WIDTH - (DIMENSIONS.CARD_WIDTH / 1.3))/2.0
                }}>
                    {this.getDropShadowComponent()}
                </div>
            </div>
        )
    }

}

export default TaskV2;