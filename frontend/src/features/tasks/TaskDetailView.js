import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'

import { Button, Form, Input, DatePicker, Radio, Typography } from 'antd';
import { FlagTwoTone, FlagOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const ReactMarkdown = require('react-markdown')
// const gfm = require('remark-gfm')

import Card from '../common/Card';

export const TaskDetailView = ({task}) => {

  console.log(task)

  return (
    <Card>
      <div>
        <div style={{display: 'flex'}}>
          <p style={STYLES.cardTitle}>{task.name}</p>
          {getPriorityTag(task.priority, 18)}
        </div>
        <div style={{marginTop: '16px'}}>
          <ReactMarkdown plugins={[]} children={task.notes} />
        </div>
      </div>
    </Card>
  )

}

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

export default TaskDetailView;