
import React, { Component } from "react";

const FPS = 80
const HOT_EDGE_WIDTH = 100;
const POWER_RAMP = 7.5;
const POWER_SCALE = .07;
const POWER_BUMP = 0.1;

type Props = {

}

type State = {
  // posX: int,
  // poxY: int
}

class Board extends Component<Props, State> {

    constructor(props) {
      super(props);
      this.container = React.createRef();
      this.activeScrollExecutor = null;
      this.posX = 0;
      this.posY = 0;
    }

    componentDidMount() {
      this.scroll(0, 0);
    }

    scroll(x, y) {
      window.scrollTo(x, y);
    }

    setScrollIncrementer(dx, dy) {
      clearInterval(this.activeScrollExecutor);
      if (dx !== 0 && dy !== 0) {
        this.activeScrollExecutor = setInterval(() => {
          // this.posX += dx/FPS;
          // this.posY += dy/FPS;
          // this.scroll(this.posX, this.posY);
          this.scroll(window.scrollX + dx/FPS, window.scrollY + dy/FPS)
        }, 1/FPS)
      } else {
        this.activeScrollExecutor = null;
      }
    }

    handleHotEdge(e) {
      let x = e.screenX;
      let y = e.screenY - 29;
      let height = window.innerHeight;
      let width = window.innerWidth;

      let originX = width / 2.0;
      let originY = height / 2.0;

      let leftEdgeX = HOT_EDGE_WIDTH;
      let topEdgeY = HOT_EDGE_WIDTH;
      let rightEdgeX = width - HOT_EDGE_WIDTH;
      let bottomEdgeY = height - HOT_EDGE_WIDTH;

      let possibleStrengths = [
        0,
        x - rightEdgeX, // On right of screen
        leftEdgeX - x, // On left of screen
        y - bottomEdgeY, // On bottom of screen
        topEdgeY - y // On top of screen
      ]

      let strength = Math.max(...possibleStrengths);

      if (strength === 0) {
        this.setScrollIncrementer(0, 0);
        return;
      }

      var vectorX = x - originX;
      var vectorY = y - originY;

      let norm = Math.sqrt(Math.pow(vectorX, 2.0) + Math.pow(vectorY, 2.0))
      vectorX /= norm
      vectorY /= norm

      console.log(vectorX, vectorY)

      // console.log(strength, vectorX, vectorY);

      let scrollAmount = POWER_SCALE * Math.exp(POWER_RAMP + strength/HOT_EDGE_WIDTH) + POWER_BUMP;

      this.setScrollIncrementer(vectorX * scrollAmount, vectorY * scrollAmount);

    }

    render() {
      return (
        <div 
          id="board" 
          onMouseMove={this.handleHotEdge.bind(this)}
          style={styles.infiniteContainer} 
          ref={(ref) => {this.container = ref}}>
          {this.props.children}
        </div>
      )
    }

}

const styles = {
  infiniteContainer: {
    background: '#efefef',
    width: '10000px',
    height: '10000px',
    scrollBehavior: 'smooth'
  }
}

export default Board;