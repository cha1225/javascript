import React from 'react'
import { findDOMNode } from 'react-dom'
import interact from 'interactjs'
import PropTypes from 'prop-types';
import _ from 'lodash'

import Toolbox from './toolbox'
import Canvas from './canvas'


export default class Root extends React.Component {
    constructor() {
        super()
        this.state = {
            // Some state here
        }
    }

    placeHolderClick = () => {

    }

    render() {

        var width = parseFloat(this.props.size.width)
        var height = parseFloat(this.props.size.height)
        var ratio = this.props.ratio

        var canvasStyle = {
            width: width*ratio,
            height: height,
            backgroundColor: 'gray',
            float: 'left'
        }

        var toolboxStyle = {
            width: width*(1-ratio),
            height: height,
            backgroundColor: 'white',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'black ',
            float: 'left',
            overflowY: 'auto'
        }

        return (
            <div>
                <Canvas style={canvasStyle} widgets={this.props.widgets}/>
                <Toolbox style={toolboxStyle} widgetTypes={this.props.widgetTypes} toolBoxGrid={this.props.toolBoxGrid}/>
            </div>
        )
    }
}