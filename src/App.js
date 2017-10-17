import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Interactive from './interactable'
import ReactDOM from 'react-dom';
import Canvas from './canvas'
import Accepter from './accepters'
import Root from './root'
import Dog from './dogg.jpg'

const style = {
  backgroundColor: 'gray',
  width: '1000px',
  height: '1000px'
}

const fillerStyle = {
  width: '100%',
  height: '100%',
  maxWidth:'100%',
  maxHeight:'100%'
}

const testStyle1 = {
  width: '100px',
  height: '200px',
  position: 'absolute',
  left: '1400px',
  top: '50px'
}

const testStyle2 = {
  width: '150px',
  height: '200px',
  position: 'absolute',
  left: '750px',
  top: '500px'
}

const testStyle3 = {
  width: '75px',
  height: '75px',
  position: 'absolute',
  left: '1100px',
  top: '150px'
}

const testStyle4 = {
  width: '100px',
  height: '100px',
  position: 'absolute',
  left: '0px',
  top: '150px'
}

const testStyle7 = {

}

var width = 100,
height = 100,
left = 120,
top = 50,
number = 20

const testStyle5 = {
  width: '200px',
  height: '150px',
  position: 'absolute',
  left: '1000px',
  top: '500px'
}

const testStyle6 = {
  width: '175px',
  height: '250px',
  position: 'absolute',
  left: '1300px',
  top: '500px'
}

const canvasStyle = {

}


class App extends Component {

  renderGrid = () => {
    return (
      <Accepter style={{float: 'left', width: width, height: height, backgroundColor:'LightGray', borderStyle: 'solid'}}/>
    )
  }

  renderLineOfCircles = () => {
    return (
      <svg style={{position: 'absolute', top: top, left: left }} height="25" width="25">
        <circle cx="12" cy="12" r="2.5" stroke="black" fill="red"/>
      </svg>
    )
  }

  renderLineOfSquares = () => {
    return (
      <Interactive style={{  width: '20px', height: '20px', position: 'absolute', left: left, top: top}}
        resizable draggable nooverlap>
        <button style={fillerStyle}>  </button>
      </Interactive>
    )
  }

  test = (event) => {
    debugger
  }

  render() {
    const board = []
    //for (var i = 0; i < 4; i++) {
    //  board.push(this.renderGrid())
    //}

    left = 1000
    top = 300
    const circles = []
    //for (var i = 0; i < 7; i++) {
    //  circles.push(this.renderLineOfCircles())
    //  top += 15
    //}

    left = 120
    top = 50

    const squares = []
    //for (var i = 0; i < 8; i++) {
    //  squares.push(this.renderLineOfSquares())
    //  left += number
    //  number +=25
    //}

    left = 120
    number = 40
    const verticalSquares = []
    //for (var i = 0; i < 20; i++) {
    //  verticalSquares.push(this.renderLineOfSquares())
    //  top += number
    //  number += 5
    //}

    const WidgetTypes = {
      Button: {
        component: <button style={fillerStyle}> No overlap </button>,
        placeholder: <h> Place Holder </h>
      },
      Filler: {
        placeholder: <h> Place Holder </h>
      },
      Filler1: {
        placeholder: <h> Place Holder </h>
      },
    }

    const Widgets = [
      {type: 'button', style: {testStyle2}}
    ]


    return (
    <div className="App">
      <Canvas className='dropzone' style={{flexWrap: 'wrap', width: '1000px', height: '750px', backgroundColor: 'gray'}} isDropzone>
        <Interactive style={testStyle6} draggable resizable nooverlap>
          <button style={fillerStyle}> Snap to edges Test using snap targets</button>
        </Interactive>
        <Interactive style={testStyle4} draggable resizable nooverlap>
          <button style={fillerStyle}> Snap to edges Test using snap targets</button>
        </Interactive>
        <Interactive style={testStyle5} draggable resizable resizeSnapgrid={{x: 50, y:50}}>
          <button style={fillerStyle}> Snap to edges Test </button>
        </Interactive>
      </Canvas>
    </div>
    );
  }
}

export default App;

/*
        <Interactive style={testStyle2}
          resizable draggable nooverlap>
          <button style={fillerStyle}> No overlap </button>
        </Interactive>
        <Interactive style={testStyle1} draggable test1>
          <button style={fillerStyle}> Test Smooth</button>
        </Interactive>
                <Interactive style={testStyle4}
          resizable draggable nooverlap>
          <button style={fillerStyle}> No overlap </button>
        </Interactive
                <Interactive style={testStyle3} draggable test>
          <button style={fillerStyle}> Test using snapPoints</button>
        </Interactive>
        <Interactive style={testStyle1} draggable resizable snapRange={50} snapSen={3}>
          <button style={fillerStyle}> Snapper</button>
        </Interactive>
        <Interactive style={testStyle6} draggable resizable snapRange={14}>
          <button style={fillerStyle}> Snap to edges Test using snap targets</button>
        </Interactive>
              <Interactive style={testStyle5} draggable snapRange={14} resizable resizeSnapgrid={{x: 50, y:50}}>
          <button style={fillerStyle}> Snap to edges Test </button>
        </Interactive>

      <Canvas className='dropzone' style={{flexWrap: 'wrap', width: '1000px', height: '750px', backgroundColor: 'gray'}} isDropzone>
      {board}
      {squares}
      {verticalSquares}
      {circles}
        <Interactive style={testStyle2}
          resizable draggable nooverlap>
          <button style={fillerStyle}> No overlap </button>
        </Interactive>>
        <Interactive style={testStyle4} draggable>
          <button style={fillerStyle}> Can overlap</button>
        </Interactive>
        <Interactive style={testStyle1} draggable resizable snapRange={50} snapSen={3}>
          <button style={fillerStyle}> Snapper</button>
        </Interactive>
        <Interactive style={testStyle6} draggable resizable snapRange={14}>
          <button style={fillerStyle}> Snap to edges Test using snap targets</button>
        </Interactive>
        <Interactive style={testStyle5} draggable snapRange={14} resizable resizeSnapgrid={{x: 50, y:50}}>
          <button style={fillerStyle}> Snap to edges Test </button>
        </Interactive>
        <Interactive style={testStyle3} draggable test>
            <button style={fillerStyle}> Testing cloning or (ghosting) </button>
        </Interactive>
        <svg style={{left: '1750px', top: '250px', position: 'absolute', height: '300px', width: '10px' }}>
          <line x1="0" y1="0" x2="0" y2="300" style={{stroke:'black', width: 3, position: 'absolute'}} />
        </svg>

        <svg style={{left: '1900px', top: '250px', position: 'absolute', height: '300px', width: '10px' }}>
          <line x1="0" y1="0" x2="0" y2="300" style={{stroke:'black', width: 3, position: 'absolute'}} />
        </svg>
      </Canvas>
      <button onClick={this.test}> Press me to clone </button>

      <Root ratio={0.7} size={{width: '1000px', height: '650px'}} widgetTypes={WidgetTypes} widgets={Widgets} toolBoxGrid={{x: 2, y: 5}}/>
*/