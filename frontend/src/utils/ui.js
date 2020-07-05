

/* 
 *
 * Promised based scrollIntoView( { behavior: 'smooth' } )
 * @param { Element } elem
 **  ::An Element on which we'll call scrollIntoView
 * @param { object } [options]
 **  ::An optional scrollIntoViewOptions dictionary
 * @return { Promise } (void)
 **  ::Resolves when the scrolling ends
 *
 */
export function smoothScroll( elem, options ) {
    return new Promise( (resolve) => {
      if( !( elem instanceof Element ) ) {
        throw new TypeError( 'Argument 1 must be an Element' );
      }
      let same = 0; // a counter
      let lastPos = null; // last known Y position
      // pass the user defined options along with our default
      const scrollOptions = Object.assign( { behavior: 'smooth' }, options );
  
      // let's begin
      elem.scrollIntoView( scrollOptions );
      requestAnimationFrame( check );
      
      // this function will be called every painting frame
      // for the duration of the smooth scroll operation
      function check() {
        // check our current position
        const newPos = elem.getBoundingClientRect().top;
        
        if( newPos === lastPos ) { // same as previous
          if(same ++ > 2) { // if it's more than two frames
  /* @todo: verify it succeeded
   * if(isAtCorrectPosition(elem, options) {
   *   resolve();
   * } else {
   *   reject();
   * }
   * return;
   */
            return resolve(); // we've come to an halt
          }
        }
        else {
          same = 0; // reset our counter
          lastPos = newPos; // remember our current position
        }
        // check again next painting frame
        requestAnimationFrame(check);
      }
    });
  }