import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export const FeedbackForm = () => {

  let onOpen = () => {
    window.typeformEmbed.makePopup('https://nyk5y8vq03a.typeform.com/to/WOejKedS', {
          hideHeaders: true,
          hideFooter: true
        }).open();
  }

  return (
    <div 
      style={{
        cursor: 'pointer',
        position: 'fixed', 
        borderRadius: '1000px',
        bottom: '16px', 
        right: '16px',
        background: 'rgb(235, 59, 103)',
        color: 'white',
        fontSize: '14px',
        fontFamily: "'Noto Sans JP', sans-serif",
        fontWeight: 'bold',
        paddingTop: '8px', 
        paddingBottom: '8px',
        paddingLeft: '12px',
        paddingRight: '12px'
      }}
      onClick={onOpen}
    >
      Provide Feedback
    </div>
  )

}

export default FeedbackForm;