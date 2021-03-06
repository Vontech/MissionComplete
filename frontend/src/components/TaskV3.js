import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Taskk from "../Models.js"
import { ArcherElement } from 'react-archer';

import { EditTwoTone, DeleteTwoTone, ApartmentOutlined, CheckOutlined, FlagOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
var moment = require('moment');

const COLORS = {
  PRIORITY_RED: '#EB3B67',
  PRIORITY_ORANGE: '#FAAD53',
  ICON_GRAY: '#B0B7CB',
  ACCENT_GRAY: '#B0B7CB',
  BLACK: '#232227',
  BACKGROUND_GREY: '#F5F6F8',
  CARD_BACKGROUND: '#FFFFFF',
  PROGRESS_BACKGROUND: '#EAEFFE',
  PROGRESS_FOREGROUND: '#8F7CFF'
}

const DIMENSIONS = {
  CARD_WIDTH: 364,
  CARD_HEIGHT: 100,
  CARD_RADIUS: '12px',
  TITLE_SIZE: '20px',
  CAPTION_SIZE: '16px'
}

const STYLES = {
  taskContainer: {

  },
  cardContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      width: DIMENSIONS.CARD_WIDTH,
      //height: DIMENSIONS.CARD_HEIGHT,
      fontFamily: 'Avenir',
      cursor: 'pointer'
  },
  card: {
      background: COLORS.CARD_BACKGROUND,
      borderRadius: DIMENSIONS.CARD_RADIUS,
      minWidth: DIMENSIONS.CARD_WIDTH - 24 - 18,
      //minHeight: DIMENSIONS.CARD_HEIGHT,
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingTop: '20px',
      paddingBottom: '18px',
  },
  cardTitle: {
      padding: 0,
      margin: 0,
      fontWeight: 'bold',
      fontSize: DIMENSIONS.TITLE_SIZE,
      color: COLORS.BLACK,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
  },
  dueDate: {
      fontSize: DIMENSIONS.CAPTION_SIZE,
      fontWeight: 'bold',
      marginTop: '10px'
  },
  taskOptionButtonContainer: {
      background: COLORS.CARD_BACKGROUND,
      borderRadius: '8px',
      height: '32px',
      position: 'absolute',
      zIndex: 8
  }
}

function hexToRgbA(hex, alpha){
  var c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
    c= hex.substring(1).split('');
    if(c.length== 3){
      c= [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c= '0x'+c.join('');
    return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + alpha + ')';
  }
  else {
    var numbers = hex.substring(5)
    numbers = numbers.substring(0, numbers.length - 2);
    var rgba = numbers.split(',');
    return 'rgba('+[rgba[0], rgba[1], rgba[2]].join(',')+',' + alpha + ')';
  }
}


function getDueDateColor(task) {
  if (task.completed) {
    return COLORS.ICON_GRAY;
  } else if (!task.dueDate) {
    return COLORS.ICON_GRAY;
  } else if (moment(task.dueDate).isAfter(moment(), 'day')) {
    return COLORS.ICON_GRAY;
  } else if (moment(task.dueDate).isSame(moment(), 'day')) {
    return COLORS.PRIORITY_ORANGE;
  } else {
    return COLORS.PRIORITY_RED;
  }
}

function getDropShadowComponent(hovered) {
  return (
      <div style={{
          //filter: 'drop-shadow(0px 2px 50px #40000000)',
          boxShadow: hovered ? 'rgba(0, 0, 0, 0.35) 0px 2px 50px' : 'rgba(0, 0, 0, 0.20) 0px 2px 50px',
          width: 2 * DIMENSIONS.CARD_WIDTH / 3,
          height: DIMENSIONS.CARD_HEIGHT / 2,
          zIndex: 5,
          transition: '0.3s'
      }}>
      </div>
  )
}

function getPriorityTag(priority, size) {
  if (priority === 0) {
    return null;
  }
  var color = COLORS.PRIORITY_RED;
  if (priority === 1) {
    color = COLORS.PRIORITY_ORANGE;
  }
  return (
    <div style={{marginLeft: '12px', marginTop: '4px', display: 'inline'}}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 64 64'
        width={size} height={size}
        fill={color}>
        <path d='M0 64 L64 64 L34 32 L64 0 L0 0 Z' />
      </svg>
    </div>
  )
}

function getNotesTag() {
  return (
    <svg width="20" height="13" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.625 6.75H7.125V5.66667H0.625V6.75ZM0.625 0.25V1.33333H10.375V0.25H0.625ZM0.625 4.04167H10.375V2.95833H0.625V4.04167Z" fill="#B0B7CB"/>
    </svg>
  );
}

function getProgressBar(progress, height, width) {
  return (
    <div style={{borderRadius: '8px', height: height, width: width, backgroundColor: COLORS.PROGRESS_BACKGROUND}}>
      <div style={{width: '' + progress + '%', background: COLORS.PROGRESS_FOREGROUND, borderRadius: height/2, height: height}}></div>
    </div>
  )
}

function getCategoryTag(task) {
  if (!task.category) {
    return (<div></div>)
  }

  return (
    <div style={{
      backgroundColor: hexToRgbA(task.categoryColor, 0.14),
      padding: 4,
      paddingLeft: 10,
      paddingRight: 10,
      width: 'fit-content',
      borderRadius: 100,
      marginTop: 6,
      marginLeft: 14,
      marginRight: 14,
      overflow: 'hidden'
    }}>
      <p style={{
        color: task.categoryColor, 
        fontWeight: 'bolder', 
        fontSize: 14,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        margin: 0
        }}>
          {task.category}
        </p>
    </div>
  )

}

function getProfilePicture(imageSource, isFirst) {
  return (
    <div style={{display: 'inline', marginLeft: isFirst ? 0 : -10}}>
      <img 
        style={{width: 28, height: 28, borderRadius: 100}}
        src={imageSource} />
    </div>
  );
}

function getProfilePictures(task) {
  let pics = [
    "https://avatars0.githubusercontent.com/u/8053203?s=460&u=c07080d2d7457de295e46ac7efff1e391ea54267&v=4",
    "https://avatars2.githubusercontent.com/u/20176827?s=460&u=d166b912b6caee597d3a1eb7664385d404f875b4&v=4",
    "https://avatars0.githubusercontent.com/u/8053203?s=460&u=c07080d2d7457de295e46ac7efff1e391ea54267&v=4",
    "https://avatars2.githubusercontent.com/u/20176827?s=460&u=d166b912b6caee597d3a1eb7664385d404f875b4&v=4"
  ];
  return (
    <div style={{marginRight: 'auto'}}>
      {pics.map((val, i) => getProfilePicture(val, i === 0))}
    </div>
  )
}

export default function TaskV3({ task, progress, onTaskSelected, onTaskEdited, onTaskDeleted, onTaskCompleted, onChildCreated }) {

  const [hovered, setHovering] = useState(false);

  let cardScaling = hovered ? {
    transform: 'scale(1.05)',
    transition: '0.3s'
  } : {
    transform: 'scale(1.00)',
    transition: '0.3s'
  }

  let scaledProgress = (progress > 0 && progress < .16 ? .16 : progress) * 100;
  let progressText = Math.trunc(progress*100) + "%";

  return (
    <div>
    <div style={{ ...STYLES.cardContainer, ...cardScaling }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}>

      <div style={{ ...STYLES.card, zIndex: 10 }}>
        <div style={{display: 'flex'}}>
          <p style={STYLES.cardTitle}>{task.name}</p>
          {getPriorityTag(task.priority, 18)}
        </div>
        <div style={{display: 'flex'}}>
          <div>
            {task.dueDate &&
              <div style={{ color: getDueDateColor(task), ...STYLES.dueDate, whiteSpace: 'nowrap', }}>
                <ClockCircleOutlined style={{ marginRight: 8, fontSize: 18 }} />
                <span style={{ top: '-1px', position: 'relative' }}>{moment(task.dueDate).format('ddd, MMM D')}</span>
              </div>
            }
          </div>
          {getCategoryTag(task)}
          {task.notes && <span style={{ display: 'inline', float: 'right', marginTop: 13, marginLeft: 'auto' }}>{getNotesTag()}</span>}
        </div>
        <div style={{marginTop: '8px'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            {getProfilePictures(task)}
            <span style={{color: COLORS.ACCENT_GRAY, fontSize: 16, fontWeight: 'bold', marginRight: '6px'}}>{progressText}</span>
            <div style={{display: 'inline'}}>{getProgressBar(scaledProgress, 12, 75)}</div>
          </div>
        </div>
      </div>
      {/*this.getButtonPanel()*/}
      {/* <ArcherElement
        id={task.id}
        relations={task.children.map((element) => {
          return {
            targetId: element,
            targetAnchor: 'top',
            sourceAnchor: 'bottom',
          }
        })}> */}
        <div style={{
          position: 'absolute',
        }}>
          {getDropShadowComponent(hovered)}
        </div>
      {/* </ArcherElement> */}
    </div>
    </div>
  );
}

TaskV3.propTypes = {
  task: PropTypes.instanceOf(Taskk),
  onTaskSelected: PropTypes.func,
  onTaskEdited: PropTypes.func,
  onTaskDeleted: PropTypes.func,
  onTaskCompleted: PropTypes.func,
  onChildCreated: PropTypes.func,
};