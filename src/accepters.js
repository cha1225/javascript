import React, { Component } from 'react'
import interact from 'interactjs'
import { findDOMNode } from 'react-dom'
import _ from 'lodash'


export default class Accepter extends Component {

    componentDidMount () {
        this.interact = interact(findDOMNode(this))
        this.setinteractions()
    }

    setinteractions = () => {
        const defaultDropzoneOptions = {
            accept: '*',
            overlap: 'center' ,
            ondragenter: function (event) {
                // related issue https://github.com/taye/interact.js/issues/79
                // Find why on the first dragenter it doesn't snap to the center of the accepter
                // Maybe keep all of the old settings from snap into a variable, overwrite them when it enters,
                // Then after it leaves, restore the old snap settings?
                var test = interact(event.target)
                var test1 = interact(event)

                var dropRect = interact.getElementRect(event.target),
                // calculate the middle of the current dropzone
                centerDrop = {
                    x: dropRect.left + dropRect.width/2,
                    y: dropRect.top + dropRect.height/2,
                    range: Math.max(dropRect.height/2, dropRect.width/2)
                }

                var previousSnapTargets = event.draggable.options.drag.snap.targets
                // First check if this dropRect already exists or not (since the user can drag it out and back in)
                if (_.some(previousSnapTargets, centerDrop)) {
                    return
                }

                // Check if it's null
                if (!previousSnapTargets) {
                    previousSnapTargets = []
                }

                previousSnapTargets.unshift(centerDrop)
                // Just testing, make a copy of the options for draggable
                // Here, we're overriding all of the previous snaps,
                // Change it so that we're just adding a new one
                var temp = {... event.draggable.options.drag, snap: {
                    targets: previousSnapTargets,
                    relativePoints: [{x: 0.5, y: 0.5}],
                    enabled: true,
                    endOnly:false,
                    range: Infinity
                }}
                event.draggable.options.drag = temp

            },

            ondragleave: (event) => {
                // Now we have to find and remove the target that correlates to the current accepter
                var dropRect = interact.getElementRect(event.target)

                const targetToFind = {
                    x: dropRect.left + dropRect.width/2,
                    y: dropRect.top + dropRect.height/2,
                    range: Math.max(dropRect.height/2, dropRect.width/2)
                }
                var index = _.findIndex(event.draggable.options.drag.snap.targets, targetToFind)
                var arrayCopy = event.draggable.options.drag.snap.targets.slice()
                arrayCopy.splice(index,1)

                var temp = {
                    ...event.draggable.options.drag.snap, targets: arrayCopy
                }

                event.draggable.options.drag.snap = temp
                console.log({...event})
            }
        }

        this.interact.dropzone(defaultDropzoneOptions)
    }

    render () {
        return (
            <div style={this.props.style}>
            </div>
        )
    }
}