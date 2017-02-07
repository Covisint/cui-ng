angular.module('cui-ng')
.directive('cuiPopover', (CuiPopoverHelpers, $compile, $timeout, $interval) => {
    return {
        restrict: 'EA',
        compile: () => {
            return {
                pre: (scope, elem, attrs) => {
                    let self
                    let popoverTether=[],repositionedTether, tetherAttachmentInterval, targetElementPositionInterval, elementHtmlInterval, elementHtml, cuiPopoverConfig = {}, positions, positionInUse, trialPosition

                    const cuiPopover = {
                        init:function(){
                            elem.css({opacity:'0', 'pointer-events':'none', position:'fixed', right:'0'}) // hide the original element.

                            self=this
                            positionInUse = 0 // using the default position when we init
                            if(!attrs.popoverPositions) throw new Error('You must define popover-positions for the cui-popover directive.')
                            positions = scope.$eval(attrs.popoverPositions)
                            positions = CuiPopoverHelpers.parsePositionArray(positions)
                            self.config(positions[positionInUse])
                            self.selectors[positionInUse]={}
                            $timeout(()=> self.render.popoverContainer(positionInUse))

                            angular.forEach(self.watchers, (initWatcher) => {
                                initWatcher()
                            })
                        },
                        config:(opts) => {
                                const _this = cuiPopoverConfig
                                _this.element = elem
                                _this.target = attrs.target
                                _this.targetModifier = attrs.targetModifier || undefined

                                _this.pointerHeight = attrs.pointerHeight && window.parseInt(attrs.pointerHeight) || 14
                                _this.pointerWidth = attrs.pointerWidth && window.parseInt(attrs.pointerWidth) || 9

                                _this.popoverWidth = elem.outerWidth()
                                _this.popoverHeight = elem.outerHeight()

                                _this.position = opts.position
                                const popoverOffsetAttribute = (opts && opts.popoverOffset || attrs.popoverOffset || '0 0').split(' ')
                                const offsetBetweenPointerAndContent = (opts && opts.contentOffset || attrs.contentOffset || '0')

                                let offset, targetOffset, targetAndPopoverOffset, pointerOffset, containerWidth, containerHeight

                                if(_this.position === 'top' || _this.position === 'bottom'){
                                    [ targetAndPopoverOffset, pointerOffset ] = popoverOffsetAttribute
                                    offset = ['0', offsetBetweenPointerAndContent].join(' ')
                                    targetOffset = ['0', pointerOffset].join(' ')
                                    containerWidth = _this.popoverWidth
                                    containerHeight = _this.popoverHeight + _this.pointerHeight
                                }
                                else {
                                    [ pointerOffset, targetAndPopoverOffset ] = popoverOffsetAttribute
                                    offset = [offsetBetweenPointerAndContent, '0'].join(' ')
                                    targetOffset = [pointerOffset,'0'].join(' ')
                                    containerWidth = _this.popoverWidth + _this.pointerHeight
                                    containerHeight = _this.popoverHeight
                                }

                                _this.distanceBetweenTargetAndPopover = targetAndPopoverOffset
                                _this.offsetBetweenPointerAndContent = offsetBetweenPointerAndContent
                                _this.offset = offset
                                _this.targetOffset = targetOffset
                                _this.containerHeight = containerHeight
                                _this.containerWidth = containerWidth

                                _this.attachment = CuiPopoverHelpers.getAttachmentFromPosition(_this.position)
                                _this.targetAttachment = CuiPopoverHelpers.getAttachmentFromPosition(CuiPopoverHelpers.invertAttachmentPartial(_this.position))
                        },
                        helpers: {
                            getTetherOptions:( element = self.selectors.$container[0], opts ) => {
                                const { target, position, offset, targetOffset, targetModifier, attachment, targetAttachment } = opts
                                return {
                                    target,
                                    targetModifier,
                                    attachment,
                                    targetAttachment,
                                    targetOffset,
                                    offset : CuiPopoverHelpers.getTetherOffset(position,offset),
                                    element : element,
                                    constraints:  [{ to: 'window', attachment: 'none none' }]
                                }
                            }
                        },
                        watchers:{
                            position:() => {
                                tetherAttachmentInterval = $interval(() => {
                                    if(!popoverTether[positionInUse] || !popoverTether[positionInUse].element) return
                                    if(positions.length === 1) self.newMode('normal')
                                    else {
                                        if(popoverTether[positionInUse].element.classList.contains('tether-out-of-bounds')) self.newMode('try-another')
                                        else self.newMode('normal')
                                    }
                                }, 100, 0, false)
                            },
                            elementHtml:() => {
                                elementHtmlInterval=$interval(()=>{
                                    let elemHtml = elem.html()
                                    if(elemHtml !== elementHtml) { // if the element html is different than what we have cached
                                        elementHtml = elemHtml
                                        cuiPopover.render.newHtml()
                                    }
                                }, 100, 0, false)
                            },
                            targetElementPosition:() => {
                                targetElementPositionInterval=$interval(() => {
                                    scope.targetPosition = self.selectors.$target.offset()
                                }, 50, 0, false)

                                scope.$watch('targetPosition',(newPosition) => {
                                    newPosition && popoverTether[positionInUse].position()
                                },(newPosition,oldPosition) => newPosition.top !== oldPosition.top || newPosition.left !== oldPosition.left )
                            },
                            scopeDestroy:() => {
                                scope.$on('$destroy',() => {
                                    $interval.cancel(tetherAttachmentInterval)
                                    $interval.cancel(targetElementPositionInterval)
                                    $interval.cancel(elementHtmlInterval)
                                    popoverTether[positionInUse].destroy()
                                    self.selectors[positionInUse].$contentBox && self.selectors[positionInUse].$contentBox.detach()
                                    self.selectors[positionInUse].$container && self.selectors[positionInUse].$container.detach()
                                    self.selectors[positionInUse].$pointer && self.selectors[positionInUse].$pointer.detach()
                                })
                            }
                        },
                        selectors:{
                            $target:angular.element(document.querySelector(attrs.target))
                        },
                        render:{
                            contentBox: (positionIndex) => {
                                const { getPointer, getPopoverMargins, getContainerPaddings } = CuiPopoverHelpers
                                const opts = cuiPopoverConfig

                                const cloneElem = angular.element(elem).clone(true,true)
                                cloneElem.css({opacity:'','pointer-events':'',position:'',right:''})
                                // append the cui-popover to the container and apply the margins to make room for the pointer
                                cloneElem.css(getPopoverMargins(opts.position, opts.pointerHeight))

                                if (self.selectors[positionIndex].$contentBox) {
                                    self.selectors[positionIndex].$contentBox.detach()
                                }
                                self.selectors[positionIndex].$container.append(cloneElem)
                                const newContentBox = self.selectors[positionIndex].$container[0].childNodes[1]
                                self.selectors[positionIndex].$contentBox = angular.element(newContentBox)
                            },
                            popoverContainer:(positionIndex) => {
                                const { getPointer, getPopoverMargins, getContainerPaddings } = CuiPopoverHelpers
                                const opts = cuiPopoverConfig
                                const $container = $('<div class="cui-popover__container"></div>')
                                const $pointer = getPointer(opts)

                                // apply stylings to the container
                                $container.css(getContainerPaddings(opts))
                                self.selectors[positionIndex].$container = $container
                                self.selectors[positionIndex].$container[0].style.opacity = '0'

                                // append the pointer to the container
                                $container.append($pointer)
                                self.selectors[positionIndex].$pointer = $pointer

                                // render the actual content of the popover
                                cuiPopover.render.contentBox(positionIndex)

                                angular.element(document.body).append($container)
                                popoverTether[positionIndex] = new Tether(self.helpers.getTetherOptions($container,opts))

                            },
                            newHtml:() => {
                                cuiPopover.render.contentBox(positionInUse)
                            }
                        },
                        newMode:(newMode) => {
                            const { getPointer, getPopoverMargins, getContainerPaddings } = CuiPopoverHelpers
                            const opts = cuiPopoverConfig
                            switch(newMode){
                                case 'normal': // if we can show the popover in the current position
                                    if(self.selectors[positionInUse].$container[0].style.opacity === '0'){
                                        $timeout(()=>{
                                            popoverTether[positionInUse].position()
                                            self.selectors[positionInUse].$container[0].style.opacity = '1'
                                        })
                                    }
                                    break
                                case 'try-another':
                                    self.tryAnotherPosition()
                                    break
                            }
                        },
                        tryAnotherPosition:() => {
                            if(typeof trialPosition === 'undefined' && positionInUse===0) trialPosition = 1
                            else if(typeof trialPosition === 'undefined') trialPosition = 0
                            else trialPosition ++

                            if(trialPosition === positionInUse) return
                            if(trialPosition === positions.length) {
                                trialPosition = undefined // next tryAnotherPosition will try the first position in the array of positions provided
                                return
                            }

                            if(trialPosition === positions.length-1){ // if we reached the last position
                                if(positions[trialPosition] === 'hide') { // and none of them were able to show and 'hide' was passed as last fallback, hide element.
                                    if(self.selectors[positionInUse].$container[0].style.opacity === '0') self.selectors[positionInUse].$container[0].style.opacity = '1'
                                    trialPosition = undefined
                                    return
                                }
                            }

                            if(typeof self.selectors[trialPosition]!=='undefined') delete self.selectors[trialPosition]
                            self.selectors[trialPosition]={}
                            const opts = positions[trialPosition]
                            self.config(opts)
                            self.render.popoverContainer(trialPosition)


                            if(!popoverTether[trialPosition].element.classList.contains('tether-out-of-bounds')){ // if the new element isn't OOB then use it.
                                self.selectors[positionInUse].$container.detach()
                                popoverTether[positionInUse].destroy()
                                delete self.selectors[positionInUse]
                                positionInUse = trialPosition
                                trialPosition = undefined
                                if(self.selectors[positionInUse].$container[0].style.opacity === '0') self.selectors[positionInUse].$container[0].style.opacity = '1'
                            }
                            else { // else just remove all references to it and this function will run again by itself
                                self.selectors[trialPosition].$container.detach()
                                popoverTether[trialPosition].destroy()
                                delete self.selectors[trialPosition]
                            }

                        }
                    }
                    cuiPopover.init()
                }
            }
        }
    }
})