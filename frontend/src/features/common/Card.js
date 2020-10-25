import React, { useRef, useEffect, useState } from 'react';

export const Card = (props) => {

  const parentRef = useRef(null);
  const [cardDim, setCardDim] = useState({width: 0, height: 0});
  
  useEffect (() => {
    if(parentRef.current) {
      let height = parentRef.current.offsetHeight;
      let width  = parentRef.current.offsetWidth;
      setCardDim({height, width})
    }
  }, [parentRef]);

  return (
    <div>
      <div 
        ref={parentRef}
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
        }}>
        {props.children}
      </div>
        {/* Drop Shadow */}
      <div style={{
        position: 'absolute',
        top: cardDim.height / 2,
        left: cardDim.width / 6,
        zIndex: -1,
        clear: 'both'
      }}>
        <div style={{
            boxShadow: false ? 'rgba(0, 0, 0, 0.35) 0px 2px 50px' : 'rgba(0, 0, 0, 0.20) 0px 2px 50px',
            width: 2 * cardDim.width / 3,
            height: cardDim.height / 2,
            zIndex: 5,
        }}>
        </div>
      </div>
      
    </div>
  )

}

export default Card;