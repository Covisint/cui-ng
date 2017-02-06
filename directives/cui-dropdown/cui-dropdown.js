angular.module('cui-ng')
.directive('cuiDropdown', ($compile) => {
    return {
        require: 'ngModel',
        restrict: 'E',
        scope: {
            ngModel: '=',
            options: '&',
            constraints: '&'
        },
        link: (scope, elem, attrs, ctrl) => {
            const id = scope.$id
            const inputName = (`cuiDropdown${id}`)
            let newScope
            let dropdownScope
            let currentIndex
            let itemSearchLetter = ''
            let itemSearchIndexes = []
            let itemSearchCurrentIndex
            let typeAheadSearch = ''

            const cuiDropdown = {
                initScope: () => {
                    if (attrs.ngRequired || attrs.required) {
                        ctrl.$validators['required'] = () => ctrl.$viewValue !== null
                    }
                    angular.forEach(cuiDropdown.watchers, (initWatcher) => {
                        initWatcher()
                    })
                    angular.forEach(cuiDropdown.scope, (value, key) => {
                        scope[key] = value
                    })
                },
                config: {
                    inputClass: attrs.class || 'cui-dropdown',
                    dropdownWrapperClass: attrs.dropdownClass || 'cui-dropdown__wrapper',
                    dropdownItemClass: attrs.dropdownItemClass || 'cui-dropdown__item',
                    attachment: attrs.attachment || 'top left',
                    targetAttachment: attrs.targetAttachment || 'top left',
                    offset: attrs.offset || '0 0',
                    defaultConstraints: [{ to: 'window', attachment: 'together none'}],
                    returnValue: attrs.returnValue,
                    displayValue: attrs.displayValue,
                    required: attrs.ngRequired || attrs.required || false,
                    defaultOption: angular.isDefined(attrs.defaultOption),
                    defaultOptionValue: attrs.defaultOption || '("select-one" | translate)'
                },
                selectors: {
                    $cuiDropdown: angular.element(elem),
                    $body: angular.element(document.body)
                },
                watchers: {
                    dropdownClick: () => {
                        // each dropdown item broadcasts the cui-dropdown scope id and passes the index of the choice
                        scope.$on(id.toString(), cuiDropdown.helpers.reassignModel)
                    },
                    languageChange: () => {
                        scope.$on('languageChange', cuiDropdown.helpers.handleLanguageChange)
                    },
                    model: () => {
                        scope.$watch('ngModel', (newModel, oldModel) => {
                            if(oldModel !== undefined) {
                                let indexInReturnValues = _.findIndex(cuiDropdown.helpers.getOptionReturnValues(), returnValue => {
                                    return returnValue === newModel
                                })
                                // if the new model isn't one of the return values assign the default / first option
                                if (indexInReturnValues === -1) indexInReturnValues = 0
                                cuiDropdown.helpers.reassignModel(null, indexInReturnValues)
                            }
                        })
                    },
                    options: () => {
                        scope.$watch(scope.options, (newOptions, oldOptions) => {
                            if (newOptions) {
                                cuiDropdown.helpers.setInitialInputValue()
                                cuiDropdown.render.currentValueBox()
                            }
                        },(newOptions, oldOptions) => !angular.equals(newOptions, oldOptions))
                    }
                },
                scope: {
                    toggleDropdown: () => {
                        if (!cuiDropdown.selectors.$dropdown) {
                            cuiDropdown.render.dropdown()
                            // Focus the first element when the dropdown opens
                            // to enable moving through the options via arrow keys
                            cuiDropdown.selectors.$dropdown[0].children[0].focus()
                        }
                        else cuiDropdown.scope.destroyDropdown()
                    },
                    destroyDropdown: () => {
                        if (cuiDropdown.selectors.$dropdown) {
                            dropdownScope.$destroy()
                            cuiDropdown.selectors.$dropdown.detach()
                            cuiDropdown.selectors.$dropdown = null
                            itemSearchLetter = ''
                            typeAheadSearch = ''
                        }
                    },
                    handleKeyup: (e) => {
                        if (([13, 32, 38, 40].indexOf(e.keyCode) > -1) && !cuiDropdown.selectors.$dropdown) {
                            cuiDropdown.scope.toggleDropdown()
                            cuiDropdown.selectors.$dropdown[0].children[0].focus()  
                        }
                    },
                    handleItemKeyup: (e) => {
                        const dropdownItems = cuiDropdown.selectors.$dropdown[0].children
                        const dropdownItemCount = dropdownItems.length

                        if (e.keyCode === 40) {
                            // Handle down arrow key press
                            let nextElementIndex = e.target.tabIndex + 1
                            if (nextElementIndex !== dropdownItemCount) dropdownItems[nextElementIndex].focus()
                        }
                        else if (e.keyCode === 38) {
                            // Handle up arrow key press
                            let nextElementIndex = e.target.tabIndex - 1
                            if (nextElementIndex !== -1) dropdownItems[nextElementIndex].focus()
                        }
                        else if (e.keyCode === 13 || e.keyCode === 32) {
                            // Select current dropdown item when pressing space or enter
                            cuiDropdown.helpers.reassignModel(e, e.target.tabIndex)
                        }
                        else {
                            // If a 'single-search' optional attribute is provided, we select/cycle based on
                            // the first letter only. Otherwise by default we run type-ahead selection.
                            if (attrs.hasOwnProperty('singleSearch')) cuiDropdown.scope.selectItemSingleSearch(e)
                            else cuiDropdown.scope.selectItemTypeAhead(e)
                        }
                    },
                    handleItemKeydown: (e) => {
                        // Hide the dropdown if we tab out of it and loses focus
                        if ([38, 40].indexOf(e.keyCode) > -1) {
                            e.preventDefault()
                        }
                        if (e.keyCode === 9) cuiDropdown.scope.destroyDropdown()
                    },
                    handleItemMouseover: (e) => {
                        // Focus the dropdown item we mouse over. This allows us to
                        // move up/down using the arrow keys from the current element
                        // we mouse over.
                        e.target.focus()
                    },
                    selectItemSingleSearch(e) {
                        const dropdownItems = cuiDropdown.selectors.$dropdown[0].children
                        const pressedKey = e.key.toLowerCase()

                        // If we are searching for the first time, or are pressing a new key,
                        // we generate an array containing the indexes of all dropdown items
                        // that start with that letter
                        if (!itemSearchLetter.length || pressedKey !== itemSearchLetter) {
                            itemSearchLetter = pressedKey
                            itemSearchCurrentIndex = 0
                            itemSearchIndexes = []

                            angular.forEach(dropdownItems, (item, index) => {
                                if (item.outerText) {
                                    if (pressedKey === item.outerText[0].toLowerCase()) {
                                        itemSearchIndexes.push(index)
                                    }
                                }
                            })
                        }

                        // Focus the appropriate dropdown item
                        dropdownItems[itemSearchIndexes[itemSearchCurrentIndex]] && dropdownItems[itemSearchIndexes[itemSearchCurrentIndex]].focus()

                        // Increment the current search index we are on to get the next item on the next keypress,
                        // or start back from the begining if we just saw the last item.
                        if (itemSearchIndexes.length > 1) {
                            if (itemSearchCurrentIndex+1 === itemSearchIndexes.length) {
                                itemSearchCurrentIndex = 0
                            }
                            else {
                                itemSearchCurrentIndex += 1
                            }
                        }
                    },
                    selectItemTypeAhead(e) {
                        const dropdownItems = cuiDropdown.selectors.$dropdown[0].children

                        if (e.keyCode === 8) {
                            typeAheadSearch = ''
                            dropdownItems[0].focus()
                        }
                        else {
                            let shouldContinue = true
                            typeAheadSearch += e.key.toLowerCase()

                            angular.forEach(dropdownItems, (item, index) => {
                                if (shouldContinue) {
                                    if (item.outerText.toLowerCase().indexOf(typeAheadSearch) >= 0) {
                                        dropdownItems[index].focus()
                                        shouldContinue = false
                                    }
                                }
                            })
                        }
                    }
                },
                helpers: {
                    getOptionDisplayValues: () => {
                        let displayValues = []
                        const { defaultOption, defaultOptionValue, displayValue } = cuiDropdown.config
                        if (defaultOption) displayValues.push(scope.$eval(defaultOptionValue)) // push an empty return option for error handling
                        angular.forEach(scope.options(), (value, key) => {
                            if (!displayValue) displayValues.push(value)
                            else {
                                const displayScope = {
                                    object: value,
                                    value,
                                    key
                                }
                                displayValues.push(scope.$eval(displayValue,displayScope))
                            }
                        })
                        return displayValues
                    },
                    getOptionReturnValues: () => {
                        let returnValues = []
                        const { defaultOption, returnValue } = cuiDropdown.config
                        if(defaultOption) returnValues.push(null) // if there's a default option it won't have any return value
                        angular.forEach(scope.options(),(value, key) => {
                            if (!returnValue) returnValues.push(value)

                            else {
                                const returnScope = {
                                    object : value,
                                    value,
                                    key
                                }
                                returnValues.push(scope.$eval(returnValue,returnScope))
                            }
                        })
                        return returnValues
                    },
                    getDropdownItem: (index,displayValue) => {
                        const ngClick = `$root.$broadcast('${id}', ${index})`;
                        return $compile(
                            `
                                <div class="${cuiDropdown.config.dropdownItemClass}" 
                                    ng-click="${ngClick}" 
                                    tabindex="${index}"
                                    ng-keyup="handleItemKeyup($event)"
                                    ng-keydown="handleItemKeydown($event)"
                                    ng-mousemove="handleItemMouseover($event)"
                                >
                                    ${displayValue}
                                </div>
                            `
                        )(scope)
                    },
                    setInitialInputValue: () => {
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues()
                        const returnValues = cuiDropdown.helpers.getOptionReturnValues()
                        if (!scope.ngModel) {
                            scope.displayValue = displayValues[0]
                            scope.ngModel = returnValues[0]
                            currentIndex = 0
                            return
                        }
                        const index = _.findIndex(returnValues, value => angular.equals(value, scope.ngModel))
                        if (index > -1) {
                            scope.displayValue = displayValues[index]
                            currentIndex = index
                        } else {
                            scope.displayValue = displayValues[0]
                            scope.ngModel = returnValues[0]
                            currentIndex = 0
                        }
                    },
                    reassignModel: (e, index) => {
                        if (typeof index === 'number') {
                          currentIndex = index
                        } else {
                          index = currentIndex
                        }
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues()
                        const returnValues=cuiDropdown.helpers.getOptionReturnValues()
                        scope.displayValue = displayValues[index]
                        scope.ngModel = returnValues[index]
                        cuiDropdown.scope.destroyDropdown()
                    },
                    handleLanguageChange: () => {
                        cuiDropdown.helpers.reassignModel()
                    }
                },
                render: {
                    currentValueBox: () => {
                        if(newScope) newScope.$destroy() // this makes sure that if the input has been rendered once the off click handler is removed
                        newScope = scope.$new()
                        const element = $compile(
                            `
                                <div class="${cuiDropdown.config.inputClass}" 
                                    tabindex="0" 
                                    ng-keyup="handleKeyup($event)" 
                                    ng-click="toggleDropdown()" 
                                    off-click="destroyDropdown()"
                                    id="cui-dropdown-${id}"
                                >
                                    {{displayValue}}
                                </div>
                            `
                        )(newScope)
                        cuiDropdown.selectors.$cuiDropdown.replaceWith(element)
                        cuiDropdown.selectors.$cuiDropdown = element
                    },
                    dropdown: () => {
                        if(dropdownScope) dropdownScope.$destroy()
                        dropdownScope = scope.$new()
                        const dropdown = $compile(
                        `
                            <div class="${cuiDropdown.config.dropdownWrapperClass}" 
                                tabindex="0"
                                off-click-filter="'#cui-dropdown-${id}'"
                            >
                            </div>
                        `
                        )(dropdownScope)
                        const displayValues = cuiDropdown.helpers.getOptionDisplayValues()
                        displayValues.forEach((value, i) => {
                            dropdown.append(cuiDropdown.helpers.getDropdownItem(i, value))
                        })
                        dropdown.width(cuiDropdown.selectors.$cuiDropdown.outerWidth() - 60)
                        cuiDropdown.selectors.$dropdown = dropdown
                        cuiDropdown.selectors.$body.append(dropdown)
                        new Tether({
                            element: cuiDropdown.selectors.$dropdown[0],
                            target: cuiDropdown.selectors.$cuiDropdown[0],
                            attachment: cuiDropdown.config.attachment,
                            targetAttachment: cuiDropdown.config.targetAttachment,
                            constraints: scope.constraints() || cuiDropdown.config.defaultConstraints
                        })
                    }
                }
            }
            cuiDropdown.initScope()
        }
    }
})