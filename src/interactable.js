import React, { Component, cloneElement } from 'react'
import { findDOMNode } from 'react-dom'
import interact from 'interactjs'
import PropTypes from 'prop-types';
import _ from 'lodash'

export default class Interactable extends Component {
    static contextTypes = {
        interactableList: React.PropTypes.array,
        registration: React.PropTypes.func,
        deregistration: React.PropTypes.func,
        dragSnapGrid: React.PropTypes.object
    }

    cloneFunction = (event) => {
        var interaction = event.interaction;

            // if the pointer was moved while being held down
            // and an interaction hasn't started yet
            if (interaction.pointerIsDown && !interaction.interacting()) {
              var original = event.currentTarget,
                  // create a clone of the currentTarget element
                  clone = event.currentTarget.cloneNode(true);


              // start a drag interaction targeting the clone
              interaction.start({ name: 'drag' },
                                event.interactable,
                                clone);
            }
        }

    defaultDragOption = (event) => {
        this.translateElement(event, event.dx, event.dy)
    }

    // TODO: handle resize that doesn't overlap?
    _handleResize = (event) => {
        var target = event.target,
        x = (parseFloat(target.getAttribute('data-x')) || 0),
        y = (parseFloat(target.getAttribute('data-y')) || 0),
        newWidth = parseFloat(event.rect.width),
        newHeight = parseFloat(event.rect.height)

        if (!event.ctrlKey) {
            var startRect = event.interaction.target.getRect(event.target),
            current = {...startRect},
            edges = {...event.interaction.prepared.edges},
            dx = event.dx,
            dy = event.dy

            if (edges.top   ) { current.top    += dy; }
            if (edges.bottom) { current.bottom += dy; }
            if (edges.left  ) { current.left   += dx; }
            if (edges.right ) { current.right  += dx; }

            var rectangle = {...startRect}

            rectangle.top    = Math.min(current.top, startRect.bottom);
            rectangle.bottom = Math.max(current.bottom, startRect.top);
            rectangle.left   = Math.min(current.left, startRect.right);
            rectangle.right  = Math.max(current.right, startRect.left);

            newWidth  = rectangle.right  - rectangle.left;
            newHeight = rectangle.bottom - rectangle.top
        }

        target.style.width = newWidth + 'px'
        target.style.height = newHeight + 'px'

        // translate when resizing from top or left edges
        x += event.deltaRect.left
        y += event.deltaRect.top

        target.style.webkitTransform = target.style.transform =
            'translate(' + x + 'px,' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
    }

    // TODO: handle corner case snapping? If you don't need to hack it in then implement it
    // If a user is dragging an element rapidly around another one, (i think when the user flicks the element against the direction of travel it has the potential of
    // getting stuck)
    // Potential solution would be to check if the element will overlapp before every single translation?
    _handleDragsnap = (event) => {
        var currentRect = this.interact.getRect()
        var range = (this.props.snapRange) ? this.props.snapRage : 12
        var pointer = event.interaction.pointers[0]
        var overlappedElements = []

        // Larger the range, the larger the snapSen needs to be such that the element doesn't feel 'sticky' when snapped to another element
        var sensitivity = (this.props.snapSen) ? this.props.snapSen : 1.1

        var currentRectDx = {
            ...currentRect,
            left: currentRect.left + event.dx*sensitivity - range,
            right: currentRect.right + event.dx*sensitivity + range
        }

        var currentRectDy = {
            ...currentRect,
            top: currentRect.top + event.dy*sensitivity - range,
            bottom: currentRect.bottom + event.dy*sensitivity + range
        }

        var currentRectSnapY = {
            ...currentRect,
            top: currentRect.top - range,
            bottom: currentRect.bottom + range
        }
        // If it can snap let it snap
        var overlappingElementX = this.checkIfOverlapWithOtherElements(currentRectDx)
        var overlappingElementY = this.checkIfOverlapWithOtherElements(currentRectDy)
        var snappedElementY = this.checkIfOverlapWithOtherElements(currentRectSnapY)

        // This is to check the case where the user is dragging it through the element but pulls out halfway through
        if (snappedElementY) {
            var snappedRect = snappedElementY.getRect()
            if (currentRect.top >= snappedRect.bottom && pointer.pageY < currentRect.top + currentRect.height/4 && event.dy > 0) {
                this.translateElement(event, event.dx, 0)
                return
            } else if (currentRect.bottom <= snappedRect.top && pointer.pageY > currentRect.bottom - currentRect.height/4 && event.dy < 0) {
                this.translateElement(event, event.dx, 0)
                return
            }
        }

        if (overlappingElementX || overlappingElementY) {
            // If it's overlapping in the x and the mouse pointer is not within the overlapping element, we just need to snap it
            var dx, dy
            if (overlappingElementX) {
                const overlappingRectX = overlappingElementX.getRect()
                const distance = this.distanceBetweenTwoPoints(currentRect.left, overlappingRectX.left)
                const pointerPos = this.pointWithinRectX(pointer, overlappingRectX)
                dy = (overlappingElementY) ? (0) : event.dy

                if (overlappingRectX.right <= currentRect.left) {
                    dx = -(distance - overlappingRectX.width)
                } else if (overlappingRectX.left >= currentRect.right) {
                    dx = distance - currentRect.width
                }

                if (event.dx < 0) {
                    if (pointerPos === 'bottom') {
                        // If it's at the bottom, translate it to the bottom, we need two points here, we're moving diagonally
                        var distanceX = this.getXOverlapDistance(currentRect, overlappingRectX, -1)
                        var distanceY = this.getDistanceToBottom(currentRect, overlappingRectX)

                        dx = -distanceX
                        dy = distanceY
                    } else if (pointerPos === 'top'){
                        // Then the pointer is at the top, translate it to the top
                        var distanceX = this.getXOverlapDistance(currentRect, overlappingRectX, -1)
                        var distanceY = this.getDistanceToTop(currentRect, overlappingRectX)

                        dx = -distanceX
                        dy = -distanceY
                    }
                } else if (event.dx > 0) {
                    if (pointerPos === 'bottom') {
                        var distanceX = this.getXOverlapDistance(currentRect, overlappingRectX)
                        var distanceY = this.getDistanceToBottom(currentRect, overlappingRectX)

                        dx = distanceX
                        dy = distanceY
                    } else if (pointerPos === 'top') {
                        var distanceX = this.getXOverlapDistance(currentRect, overlappingRectX)
                        var distanceY = this.getDistanceToTop(currentRect, overlappingRectX)

                        dx = distanceX
                        dy = -distanceY
                    }
                }
                this.translateElement(event, dx, dy)
            }

            if (overlappingElementY) {
                const overlappingRectY = overlappingElementY.getRect()
                const distance = this.distanceBetweenTwoPoints(currentRect.top, overlappingRectY.top)
                dx = (overlappingElementX) ? (0) : event.dx

                // When the element is first snapping to the other element
                if (overlappingRectY.bottom <= currentRect.top) {
                    dy = overlappingRectY.height - distance
                } else if (currentRect.bottom <= overlappingRectY.top) {
                    dy = distance - currentRect.height
                }

                if (event.dy < 0) {
                    var modifiedRect = {...currentRect, top: overlappingRectY.top - currentRect.height, bottom: overlappingRectY.top }
                    var newRect = this.findRectPositionOfNonOverlap(modifiedRect, 'below')
                    if (pointer.pageY <= newRect.bottom) {
                        var distanceToOtherSide = this.distanceBetweenTwoPoints(currentRect.top, newRect.top)
                        dy = -distanceToOtherSide
                    }
                } else if (event.dy > 0) {
                    var modifiedRect = {...currentRect, top: overlappingRectY.bottom, bottom: overlappingRectY.bottom + currentRect.height}
                    var newRect = this.findRectPositionOfNonOverlap(modifiedRect, 'above')

                    if (pointer.pageY >= newRect.top) {
                        var distanceToOtherSide = this.distanceBetweenTwoPoints(currentRect.top, newRect.top)
                        dy = distanceToOtherSide
                    }
                }

                if (pointer.pageX <= overlappingRectY.left) {
                    if (this.pointWithinRectY(pointer, overlappingRectY)) {
                        dx = -(this.distanceBetweenTwoPoints(currentRect.left, overlappingRectY.left - currentRect.width))
                        dy = this.snapToYAxis(pointer ,currentRect, overlappingRectY)
                    }
                } else if (pointer.pageX >= overlappingRectY.right) {
                    if (this.pointWithinRectY(pointer, overlappingRectY)) {
                        dx = (this.distanceBetweenTwoPoints(currentRect.left, overlappingRectY.right))
                        dy = this.snapToYAxis(pointer, currentRect, overlappingRectY)
                    }
                }

                this.translateElement(event, dx, dy)
            }
        } else {
            this.translateElement(event, event.dx, event.dy)
        }
    }

    getXOverlapDistance = (currentRect, overlappingRectX, multipler = 1) => {
        return this.distanceBetweenTwoPoints(currentRect.left, currentRect.left + multipler*12)
    }

    getDistanceToTop = (currentRect, overlappingRectX) => {
        return this.distanceBetweenTwoPoints(currentRect.top, overlappingRectX.top - currentRect.height)
    }

    getDistanceToBottom = (currentRect, overlappingRectX) => {
        return this.distanceBetweenTwoPoints(currentRect.top, overlappingRectX.bottom)
    }

    snapToYAxis = (pointer, currentRect, overlappingRect) => {
        if (currentRect.bottom <= overlappingRect.top) {
            return (this.distanceBetweenTwoPoints(currentRect.top, pointer.pageY + 7 - currentRect.height))
        } else if (currentRect.top >= overlappingRect.bottom) {
            return -(this.distanceBetweenTwoPoints(currentRect.top, pointer.pageY - 7))
        }
    }

    // Recursively checks if the rect that is passed down with its relative position to the other element will overlap (with future iterations)
    findRectPositionOfNonOverlap = (rect, direction) => {
        var modifiedRect,
        nextDirection,
        overlapped = false
        _.forEach(this.context.interactableList, (element) => {
            if (element !== this.interact) {
                var otherRect = element.getRect()

                if (this.checkIfRectsOverlap(rect, otherRect)) {
                    overlapped = true
                    if (direction === 'right') {
                        modifiedRect = {...rect, right: otherRect.left, left: otherRect.left - rect.width}
                        nextDirection = 'right'
                        return false
                    } else if (direction === 'left') {
                        modifiedRect = {...rect, right: otherRect.right + rect.width, left: otherRect.right}
                        nextDirection = 'left'
                        return false
                    } else if (direction === 'below') {
                        modifiedRect = {...rect, top: otherRect.top - rect.height , bottom: otherRect.top}
                        nextDirection = 'below'
                        return false
                    } else if (direction === 'above') {
                        modifiedRect = {...rect, top: otherRect.bottom, bottom: otherRect.bottom + rect.height}
                        nextDirection = 'above'
                        return false
                    }
                }
            }
        })

        if (!overlapped) {
            return rect
        }

        return this.findRectPositionOfNonOverlap(modifiedRect, nextDirection)
    }

    // Returns the overlapping interactable object else it returns an empty object
    // You could probably do this in log(n) time instead of (n)
    checkIfOverlapWithOtherElements = (rect) => {
        var overlappingElement = false
        _.forEach(this.context.interactableList, (element) => {
            if (this.interact !== element) {
                // Make sure that they are on the same layer for them to check if they are overlapped
                if (this.checkIfRectsOverlap(rect, element.getRect()) && element.layer === this.interact.layer) {
                    overlappingElement = element
                }
            }
        })

        return overlappingElement
    }

    checkIfSnappedToOtherElements = (rect) => {
        var snappedElement = false
        _.forEach(this.context.interactableList, (element) => {
            if (this.interact !== element) {
                if (this.checkIfRectsSnap(rect, element.getRect())) {
                    snappedElement = element
                }
            }
        })

        return snappedElement
    }

    // Checks if two rectangles are overlapping by checking if they are not overlapping (touching does not count as overlapping)
    checkIfRectsOverlap = (currentRect, otherRect) => {
        if ((currentRect.left >= otherRect.right) ||
            (otherRect.left >= currentRect.right)) {
                return false
            }

        if ((currentRect.bottom <= otherRect.top) ||
            (otherRect.bottom <= currentRect.top)) {
                return false
            }

        return true
    }

    checkIfRectsSnap = (currentRect, otherRect) => {
        if (currentRect.left === otherRect.right || currentRect.right === otherRect.left) {
            return true
        }

        if (currentRect.bottom === otherRect.top || currentRect.top === otherRect.bottom) {
            return true
        }

        return false
    }

    // A special case overlapp checker that checks if elements are purely within another, (touching does not count)
    checkIfWithinOtherElements = (rect) => {
        var within = false
        _.forEach(this.context.interactableList, (element) => {
            if (this.interact !== element) {
                if (this.checkIfRectsWithin(rect, element.getRect())) {
                    within = true
                }
            }
        })
        return within
    }

    checkIfRectsWithin = (currentRect, otherRect) => {
        var x = false, y = false
        if ((currentRect.left > otherRect.left && currentRect.left < otherRect.right) ||
        (currentRect.right < otherRect.right && currentRect.right > otherRect.left)) {
            x = true
        }

        if ((currentRect.top > otherRect.top && currentRect.top < otherRect.bottom) ||
            (currentRect.bottom < otherRect.bottom && currentRect.bottom > otherRect.top)) {
            y = true
        }

        return (x && y)
    }

    distanceBetweenTwoPoints = (pointA, pointB) => {
        return Math.abs(pointA - pointB)
    }

    pointWithinRectX = (pointer, Rect) => {
        if (pointer.pageX >= Rect.left && pointer.pageX <= Rect.right) {
            if (pointer.pageY >= Rect.top + (Rect.height/2)) {
                return 'bottom'
            } else {
                return 'top'
            }
        }

        return false
    }

    pointWithinRectY = (pointer, Rect) => {
        if (pointer.pageY >= Rect.top && pointer.pageY <= Rect.bottom) {
            return true
        }
    }

    translateElement = (event, dx, dy) => {
        const target = event.target
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + dx
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + dy

        target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)'

        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
    }

	render() {
		return (
            <div style={this.props.style}>
                {this.props.children}
            </div>
        )
    }

    componentDidMount() {
      this.interact = interact(findDOMNode(this))
      this.setInteractions()
      this.context.registration(this.interact)
    }

    componentWillUnmount () {
        this.context.deregistration(this.interact)
    }

	setInteractions() {
        const defaultDraggableOptions = {
            autoScroll: false,
            onmove: this.defaultDragOption,
        }

        const defaultResizableOptions = {
            autoScroll: false,
            edges: { left: true, right: true, bottom: true, top: true },
            preserveAspectRatio: true,
            onmove: this._handleResize
        }

		if (this.props.draggable) {
            var draggableObject = {...defaultDraggableOptions}
            this.interact.layer = 'A'

            if(this.context.dragSnapGrid) {
                draggableObject = {...draggableObject, snap: {
                    targets: [
                        interact.createSnapGrid(this.context.dragSnapGrid)
                    ]
                }}
            }

            if (this.props.snapRange || this.props.nooverlap) {
                draggableObject = {...draggableObject, onmove: this._handleDragsnap}
                this.interact.layer = 'B'
            }

            if (this.props.test) {
                draggableObject = {
                    manualStart: true,
                    onmove: this.cloneFunction
                }
            }

            this.interact.draggable(draggableObject)
        }

		if (this.props.resizable) {
            var resizableObject = {...defaultResizableOptions}

            if (this.props.resizeSnapgrid) {
                resizableObject = {...resizableObject, snap: {
                    targets: [
                        interact.createSnapGrid(this.props.resizeSnapgrid)
                    ]
                }}
            }
            this.interact.resizable(resizableObject)
        }
    }
}

Interactable.propTypes = {
	children: React.PropTypes.node.isRequired,
	draggable: React.PropTypes.bool,
	draggableOptions: React.PropTypes.object,
	resizable: React.PropTypes.bool,
	resizableOptions: React.PropTypes.object
}

/*
            var dx, dy
            if (overlappingElementX) {
                var overlappingRect = overlappingElementX.getRect()
                if (overlappingRect.left >= currentRect.right) {

                    const distance = this.distanceBetweenTwoPoints(currentRect.left, overlappingRect.left)
                    dx = distance - currentRect.width
                    dy = (overlappingElementY) ? (0) : event.dy
                    var modifiedRect = {...currentRect, left: overlappingRect.right, right: overlappingRect.right + currentRect.width}

                    var newRectRight = this.findRectPositionOfNonOverlap(modifiedRect, 'left')

                    // Put these the overlapping element and see if this solves the problem of the mouse moving
                    var newRectAbove =
                    var newRectBelow =

                    if (pointer.pageX >= newRect.left) {
                        var distanceToOtherSide = this.distanceBetweenTwoPoints(currentRect.left, newRect.left)
                        dx = distanceToOtherSide
                    }

                } else if (overlappingRect.right <= currentRect.left) {
                    const distance = this.distanceBetweenTwoPoints(currentRect.left, overlappingRect.left)
                    dx = overlappingRect.width - distance
                    dy = (overlappingElementY) ? (0) : event.dy
                    var modifiedRect = {...currentRect, left: overlappingRect.left - currentRect.width, right: overlappingRect.left}
                    var newRect = this.findRectPositionOfNonOverlap(modifiedRect, 'right')

                    if (pointer.pageX <= newRect.right) {
                        var distanceToOtherSide = this.distanceBetweenTwoPoints(currentRect.left, newRect.left)
                        dx = -distanceToOtherSide
                    }
                }

                this.translateElement(event, dx, dy)
            }

            if (overlappingElementY) {
                var overlappingRect = overlappingElementY.getRect()
                if (overlappingRect.bottom <= currentRect.top) {
                    const distance = this.distanceBetweenTwoPoints(currentRect.top, overlappingRect.top)
                    dx = (overlappingElementX) ? (0) : event.dx
                    dy = overlappingRect.height - distance

                    var modifiedRect = {...currentRect, top: overlappingRect.top - currentRect.height, bottom: overlappingRect.top }
                    var newRect = this.findRectPositionOfNonOverlap(modifiedRect, 'below')

                    if (pointer.pageY <= newRect.bottom) {
                        var distanceToOtherSide = this.distanceBetweenTwoPoints(currentRect.top, newRect.top)
                        dy = -distanceToOtherSide
                    }

                } else if (currentRect.bottom <= overlappingRect.top) {
                    const distance = this.distanceBetweenTwoPoints(currentRect.top, overlappingRect.top)
                    dx = (overlappingElementX) ? (0) : event.dx
                    dy = distance - currentRect.height

                    var modifiedRect = {...currentRect, top: overlappingRect.bottom, bottom: overlappingRect.bottom + currentRect.height}
                    var newRect = this.findRectPositionOfNonOverlap(modifiedRect, 'above')
                    if (pointer.pageY >= newRect.top) {
                        var distanceToOtherSide = this.distanceBetweenTwoPoints(currentRect.top, newRect.top)
                        dy = distanceToOtherSide
                    }
                }

                this.translateElement(event, dx, dy)
            }


*/