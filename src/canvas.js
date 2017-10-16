import React, { Component, cloneElement } from 'react'
import { findDOMNode } from 'react-dom'
import interact from 'interactjs'
import PropTypes from 'prop-types';
import _ from 'lodash'


export default class Canvas extends Component {
    static childContextTypes = {
        registration: React.PropTypes.func,
        deregistration: React.PropTypes.func,
        interactableList: React.PropTypes.array,
        dragSnapGrid: React.PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = {
          interactableList: [],
          interactableInCanvas: []
        };
      }

    registration = (interactable) => {
        this.setState((state) => (
            {
                interactableList: [...state.interactableList, interactable]
            })
        )
    }

    deregistration = (interactable) => {
        var temp = this.state.interactableList.slice()
        _.filter(temp, (element) => {
            if (element !== interactable) {
                return true
            }
        })

        this.setState((state) => (
            {
                interactableList: temp
            }
        ))
    }

    getChildContext() {
        return {
            registration: this.registration,
            deregistration: this.deregistration,
            interactableList: this.state.interactableList,
            dragSnapGrid: this.props.dragSnapGrid
        }
    }

    _handleDragEnter = (event) => {
        var interactable = interact(event.relatedTarget)
        this.setState(state => {
            interactableInCanvas: [...state.interactableInCanvas, interactable]
        })
    }

    _handleDragLeave = (event) => {
        var interactable = interact(event.relatedTarget)
        var temp = this.state.interactableList.slice()
        _.filter(temp, (element) => {
            if (element !== interactable) {
                return true
            }
        })

        this.setState((state) => (
            {
                interactableInCanvas: temp
            }
        ))
    }

    render() {
        // We need to render not the children, but the actual widgets that are passed down to it?

        return (
            <div style={this.props.style}>
                {this.props.children}
            </div>
        )
    }

    componentDidMount() {
        this.interact = interact(findDOMNode(this))
        this.setInteractions()

        // Do something concerning this.props.widgets here
    }

    // Do we need the canvas to have dropzone properties? Probably not
    setInteractions() {
        // Make the dropzone and everytime something
        var dropzoneOptions = {
            accept: '*',
            overlap: 0.1,
            ondragenter: this._handleDragEnter,
            ondragleave: this._handleDragLeave
        }
        this.interact.dropzone(dropzoneOptions)
    }
}

