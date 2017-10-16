import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import interact from 'interactjs'
import _ from 'lodash'

export default class Toolbox extends React.Component {
    // What should the toolbox do?
    // Have place holder objects of all the things that can be dropped into the canvas
    // Then have a 'ghost' that is shown of the real element when it is being dragged across the canvas
    // Things to do:
    // How are objects added to the toolbox?
    // Which component (canvas or toolbox) has the masterlist of all the components that can be added to the page?
    //
    // First learn how to make a ghost when dragging something I guess

    componentDidMount() {

    }

    _handlePlaceholderOnClick = (event) => {
        debugger
    }

    _handleOnDrag = (event) => {
        debugger
    }

    renderPlaceholders = (width, height, placeHolder) => {
        return (
            <div style={{width: width, height: height, borderStyle: 'solid', borderWidth: '1px', borderColor: 'black ', float: 'left', position: 'relative'}}
                onClick={this._handlePlaceholderOnClick}>
                {placeHolder}
            </div>
        )
    }

    render() {
        // First, we need to know how big the toolbox is to make an effective grid
        var width = parseFloat(this.props.style.width)
        var height = parseFloat(this.props.style.height)
        var placeHolders = []
        var widgetTypes = {...this.props.widgetTypes}
        var widthPerCell = (width/this.props.toolBoxGrid.x) // Needs to take in account if there is a scroll bar for the y or not
        var heightPerCell = (height/this.props.toolBoxGrid.y)

        _.forIn(widgetTypes, (value, key) => {
            placeHolders.push(this.renderPlaceholders(widthPerCell, heightPerCell, value.placeholder))
        })

        return (
            <div style={this.props.style}>
                {placeHolders}
            </div>
        )
    }
}