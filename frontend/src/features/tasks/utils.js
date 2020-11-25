import React, { useState } from 'react';

var moment = require('moment');

export const COLORS = {
  PRIORITY_RED: '#EB3B67',
  PRIORITY_ORANGE: '#FAAD53',
  PRIORITY_BLUE: '#2f54eb',
  ICON_GRAY: '#B0B7CB',
  ACCENT_GRAY: '#B0B7CB',
  BLACK: '#232227',
  BACKGROUND_GREY: '#F5F6F8',
  CARD_BACKGROUND: '#FFFFFF',
  PROGRESS_BACKGROUND: '#EAEFFE',
  PROGRESS_FOREGROUND: '#8F7CFF'
}

export function getDueDateColor(task) {
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

export function getPriorityTagSvg(priority, size) {
  if (priority == null || priority === 0) {
    return null;
  }
  var color = COLORS.PRIORITY_RED;
  if (priority === 1) {
    color = COLORS.PRIORITY_BLUE
  }
  if (priority === 2) {
    color = COLORS.PRIORITY_ORANGE
  }
  return (
    //<div style={{marginLeft: '12px', marginTop: '4px', display: 'inline'}}>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 64 64'
        width={size} height={size}
        fill={color}>
        <path d='M0 64 L64 64 L34 32 L64 0 L0 0 Z' />
      </svg>
    //</div>
  )
}