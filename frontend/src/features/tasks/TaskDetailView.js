import React, { useState, useRef, useCallback, useEffect } from 'react'
import Card from '../common/Card';
import { useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'

import { Button, Form, Input, DatePicker, Radio, Typography } from 'antd';
import { FlagTwoTone, FlagOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

import { COLORS, getDueDateColor, getPriorityTagSvg } from './utils';

var moment = require('moment');
const ReactMarkdown = require('react-markdown')
// const gfm = require('remark-gfm')

export const TaskDetailView = ({task}) => {

  console.log(task)

  return (
    <Card>
      <div>
        <div style={{display: 'flex'}}>
          <p style={STYLES.cardTitle}>{task.name}</p>
          <div style={{marginLeft: '12px', marginTop: '6px', display: 'inline'}}>
            {getPriorityTagSvg(task.priority, 18)}
          </div>
        </div>
        <div>
          {getDateText(task)}
        </div>
        <div style={{marginTop: '16px'}}>
          <ReactMarkdown plugins={[]} children={task.notes} />
        </div>
      </div>
    </Card>
  )

}

const DIMENSIONS = {
  CARD_WIDTH: 364,
  CARD_HEIGHT: 100,
  CARD_RADIUS: '12px',
  TITLE_SIZE: '20px',
  CAPTION_SIZE: '16px',
  CARD_BUTTON_HEIGHT: 32
}

const STYLES = {
  cardTitle: {
    padding: 0,
    margin: 0,
    fontWeight: 'bold',
    fontSize: DIMENSIONS.TITLE_SIZE,
    color: COLORS.BLACK,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }
}

function getDateText(task) {
  if (!task.dueDate) {
    return null;
  }
  return (
    <div style={{ color: getDueDateColor(task), fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 18}}>
      <ClockCircleOutlined style={{ marginRight: 8, fontSize: 18 }} />
      <span style={{ top: '-1px', position: 'relative' }}>{moment(task.dueDate).format('ddd, MMM D')}</span>
    </div>
  );
}

export default TaskDetailView;