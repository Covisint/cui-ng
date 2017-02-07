'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

// cui-ng build Tue Feb 07 2017 13:13:50

;(function (angular) {
    'use strict';
    angular.module('cui-ng', []);

    angular.module('cui-ng').
    provider('$cuiI18n', [function () {
        var preferenceArray, listOfLocaleCodesAndNames;

        this.setLocalePreference = function (newPreferenceArray) {
            preferenceArray = newPreferenceArray;
        };

        this.setLocaleCodesAndNames = function (newPreferenceObject) {
            listOfLocaleCodesAndNames = newPreferenceObject;
        };

        this.getLocaleCodesAndNames = function () {
            return listOfLocaleCodesAndNames;
        };

        this.getInternationalizedName = function (preferedLanguage, languageObjectArray) {
            var languageObjectToUse;
            languageObjectToUse = _.find(languageObjectArray, function (languageObject) {
                return languageObject.lang === preferedLanguage;
            });
            if (languageObjectToUse != undefined) return languageObjectToUse.text || languageObjectToUse.value; // if the language being used by the user has a translation
            else {
                    if (!preferenceArray) {// if a preference array hasn't been set
                        console.log('You need to configure you prefered language array with cuiI18n.setLocalePreference');
                        return;
                    }
                    for (var i = 0; i <= preferenceArray.length; i++) {
                        languageObjectToUse = _.find(languageObjectArray, function (languageObject) {
                            return languageObject.lang === preferenceArray[i];
                        });
                        if (languageObjectToUse != undefined) return languageObjectToUse.text || languageObjectToUse.value;
                    }
                }
        };

        this.$get = function () {
            return this;
        };
    }]);

    angular.module('cui-ng').
    provider('$pagination', [function () {var _this2 = this;
        var paginationOptions = void 0;
        var userValue = void 0;

        this.setPaginationOptions = function (valueArray) {
            paginationOptions = valueArray;
        };

        this.getPaginationOptions = function () {
            return paginationOptions;
        };

        this.setUserValue = function (value) {// sets the user value so that other pages that use that directive will have that value saved
            try {
                localStorage.setItem('cui.resultsPerPage', value);
            }
            catch (e) {}
            userValue = value;
        };

        this.getUserValue = function () {
            try {
                userValue = parseInt(localStorage.getItem('cui.resultsPerPage'));
            }
            catch (e) {}
            return userValue;
        };

        this.$get = function () {return _this2;};
    }]);


    angular.module('cui-ng').
    factory('PubSub', ['$timeout', function ($timeout) {
        /**
                                                         * Alias a method while keeping the context correct,
                                                         * to allow for overwriting of target method.
                                                         *
                                                         * @param {String} fn The name of the target method.
                                                         * @returns {Function} The aliased method.
                                                         */
        function alias(fn) {
            return function closure() {
                return this[fn].apply(this, arguments);
            };
        }

        var PubSub = {
            topics: {}, // Storage for topics that can be broadcast or listened to.
            subUid: -1 // A topic identifier.
        };

        /**
            * Subscribe to events of interest with a specific topic name and a
            * callback function, to be executed when the topic/event is observed.
            *
            * @param topic {String} The topic name.
            * @param callback {Function} Callback function to execute on event.
            * @param once {Boolean} Checks if event will be triggered only one time (optional).
            * @returns number token
            */
        PubSub.subscribe = function (topic, callback, once) {
            var token = this.subUid += 1,
            obj = {};

            if (!this.topics[topic]) {
                this.topics[topic] = [];
            }

            obj.token = token;
            obj.callback = callback;
            obj.once = !!once;

            this.topics[topic].push(obj);

            return token;
        };

        /**
            * Subscribe to events of interest setting a flag
            * indicating the event will be published only one time.
            *
            * @param topic {String} The topic name.
            * @param callback {Function} Callback function to execute on event.
            */
        PubSub.subscribeOnce = function (topic, callback) {
            return this.subscribe(topic, callback, true);
        };

        /**
            * Publish or broadcast events of interest with a specific
            * topic name and arguments such as the data to pass along.
            *
            * @param topic {String} The topic name.
            * @param args {Object || Array} The data to be passed.
            * @return bool false if topic does not exist.
            * @returns bool true if topic exists and event is published.
            */
        PubSub.publish = function (topic, args) {
            var that = this,
            subscribers,
            len;

            if (!this.topics[topic]) {
                return false;
            }

            $timeout(function () {
                subscribers = that.topics[topic];
                len = subscribers ? subscribers.length : 0;

                while (len) {
                    len -= 1;
                    subscribers[len].callback(topic, args);

                    // Unsubscribe from event based on tokenized reference,
                    // if subscriber's property once is set to true.
                    if (subscribers[len].once === true) {
                        that.unsubscribe(subscribers[len].token);
                    }
                }
            }, 0);

            return true;
        };

        /**
            * Unsubscribe from a specific topic, based on  the topic name,
            * or based on a tokenized reference to the subscription.
            *
            * @param t {String || Object} Topic name or subscription referenece.
            * @returns {*} bool false if argument passed does not match a subscribed event.
            */
        PubSub.unsubscribe = function (t) {
            var prop,
            len,
            tf = false;

            for (prop in this.topics) {
                if (this.topics.hasOwnProperty(prop)) {
                    if (this.topics[prop]) {
                        len = this.topics[prop].length;

                        while (len) {
                            len -= 1;

                            // If t is a tokenized reference to the subscription.
                            // Removes one subscription from the array.
                            if (this.topics[prop][len].token === t) {
                                this.topics[prop].splice(len, 1);
                                return t;
                            }

                            // If t is the event type.
                            // Removes all the subscriptions that match the event type.
                            if (prop === t) {
                                this.topics[prop].splice(len, 1);
                                tf = true;
                            }
                        }

                        if (tf === true) {
                            return t;
                        }
                    }
                }
            }

            return false;
        };

        /**
            * Alias for public methods.
            * subscribe     -> on
            * subscribeOnce -> once
            * publish       -> trigger
            * unsubscribe   -> off
            */
        PubSub.on = alias('subscribe');
        PubSub.once = alias('subscribeOnce');
        PubSub.trigger = alias('publish');
        PubSub.off = alias('unsubscribe');

        return PubSub;
    }]);

    angular.module('cui-ng').
    filter('cuiI18n', ['LocaleService', '$cuiI18n', function (LocaleService, $cuiI18n) {
        return function (languageObjectArray) {
            return $cuiI18n.getInternationalizedName(LocaleService.getLocaleCode(), languageObjectArray);
        };
    }]);

    angular.module('cui-ng').
    directive('autoComplete', ['$q', '$parse', '$http', '$sce', '$timeout', '$templateCache', '$interpolate', function ($q, $parse, $http, $sce, $timeout, $templateCache, $interpolate) {
        // keyboard events
        var KEY_DW = 40;
        var KEY_RT = 39;
        var KEY_UP = 38;
        var KEY_LF = 37;
        var KEY_ES = 27;
        var KEY_EN = 13;
        var KEY_TAB = 9;

        var MIN_LENGTH = 3;
        var MAX_LENGTH = 524288; // the default max length per the html maxlength attribute
        var PAUSE = 500;
        var BLUR_TIMEOUT = 200;

        // string constants
        var REQUIRED_CLASS = 'autocomplete-required';
        var TEXT_SEARCHING = 'Searching...';
        var TEXT_NORESULTS = 'No results found';
        var TEMPLATE_URL = '/angucomplete-alt/index.html';

        // Set the default template for this directive
        $templateCache.put(TEMPLATE_URL,
        '<div class="angucomplete-holder" ng-class="{\'angucomplete-dropdown-visible\': showDropdown}">' +
        '  <input id="{{id}}_value" name="{{inputName}}" ng-class="{\'ng-valid\': notEmpty}" ng-model="searchStr" ng-disabled="disableInput" type="{{inputType}}" placeholder="{{placeholder}}" maxlength="{{maxlength}}" ng-focus="onFocusHandler()" class="{{inputClass}}" ng-focus="resetHideResults()" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" ng-change="inputChangeHandler(searchStr)"/>' +
        '  <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-show="showDropdown">' +
        '    <div class="angucomplete-searching" ng-show="searching" ng-bind="textSearching"></div>' +
        '    <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)" ng-bind="textNoResults"></div>' +
        '    <div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)" ng-mouseenter="hoverRow($index)" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}">' +
        '      <div ng-if="imageField" class="angucomplete-image-holder">' +
        '        <img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/>' +
        '        <div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div>' +
        '      </div>' +
        '      <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>' +
        '      <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>' +
        '      <div ng-if="matchClass && result.description && result.description != \'\'" class="angucomplete-description" ng-bind-html="result.description"></div>' +
        '      <div ng-if="!matchClass && result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div>' +
        '    </div>' +
        '  </div>' +
        '</div>');


        function link(scope, elem, attrs, ctrl) {
            var inputField = elem.find('input');
            var minlength = MIN_LENGTH;
            var searchTimer = null;
            var hideTimer;
            var requiredClassName = REQUIRED_CLASS;
            var responseFormatter;
            var validState = null;
            var httpCanceller = null;
            var dd = elem[0].querySelector('.angucomplete-dropdown');
            var isScrollOn = false;
            var mousedownOn = null;
            var unbindInitialValue;
            var displaySearching;
            var displayNoResults;

            elem.on('mousedown', function (event) {
                if (event.target.id) {
                    mousedownOn = event.target.id;
                    if (mousedownOn === scope.id + '_dropdown') {
                        document.body.addEventListener('click', clickoutHandlerForDropdown);
                    }
                } else
                {
                    mousedownOn = event.target.className;
                }
            });

            scope.currentIndex = scope.focusFirst ? 0 : null;
            scope.searching = false;
            unbindInitialValue = scope.$watch('initialValue', function (newval) {
                if (newval) {
                    // remove scope listener
                    unbindInitialValue();
                    // change input
                    handleInputChange(newval, true);
                }
            });

            if (attrs.fieldRequired !== undefined) {
                scope.$watch('fieldRequired', function (newval, oldval) {
                    if (!newval || newval === {}) {
                        ctrl[scope.inputName].$setValidity('required', false);
                    } else
                    if (newval && newval !== {}) {
                        ctrl[scope.inputName].$setValidity('required', true);
                    }
                });
            }

            scope.$on('angucomplete-alt:changeInput', function (event, elementId, newval) {
                if (!!elementId && elementId === scope.id) {
                    handleInputChange(newval);
                }
            });

            function handleInputChange(newval, initial) {
                if (newval) {
                    if ((typeof newval === 'undefined' ? 'undefined' : _typeof(newval)) === 'object') {
                        scope.searchStr = extractTitle(newval);
                        callOrAssign({ originalObject: newval });
                    } else if (typeof newval === 'string' && newval.length > 0) {
                        scope.searchStr = newval;
                    } else {
                        if (console && console.error) {
                            console.error('Tried to set ' + (!!initial ? 'initial' : '') + ' value of angucomplete to', newval, 'which is an invalid value');
                        }
                    }

                    handleRequired(true);
                }
            }

            // #194 dropdown list not consistent in collapsing (bug).
            function clickoutHandlerForDropdown(event) {
                mousedownOn = null;
                scope.hideResults(event);
                document.body.removeEventListener('click', clickoutHandlerForDropdown);
            }

            // for IE8 quirkiness about event.which
            function ie8EventNormalizer(event) {
                return event.which ? event.which : event.keyCode;
            }

            function callOrAssign(value) {
                if (typeof scope.selectedObject === 'function') {
                    scope.selectedObject(value);
                } else
                {
                    scope.selectedObject = value;
                }

                if (value) {
                    handleRequired(true);
                } else
                {
                    handleRequired(false);
                }
            }

            function callFunctionOrIdentity(fn) {
                return function (data) {
                    return scope[fn] ? scope[fn](data) : data;
                };
            }

            function setInputString(str) {
                callOrAssign({ originalObject: str });

                if (scope.clearSelected) {
                    scope.searchStr = null;
                }
                clearResults();
            }

            function extractTitle(data) {
                // split title fields and run extractValue for each and join with ' '
                return scope.titleField.split(',').
                map(function (field) {
                    return extractValue(data, field);
                }).
                join(' ');
            }

            function extractValue(obj, key) {
                var keys, result;
                if (key) {
                    keys = key.split('.');
                    result = obj;
                    for (var i = 0; i < keys.length; i++) {
                        result = result[keys[i]];
                    }
                } else
                {
                    result = obj;
                }
                return result;
            }

            function findMatchString(target, str) {
                var result, matches, re;
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
                // Escape user input to be treated as a literal string within a regular expression
                re = new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                if (!target) {return;}
                if (!target.match || !target.replace) {target = target.toString();}
                matches = target.match(re);
                if (matches) {
                    result = target.replace(re,
                    '<span class="' + scope.matchClass + '">' + matches[0] + '</span>');
                } else
                {
                    result = target;
                }
                return $sce.trustAsHtml(result);
            }

            function handleRequired(valid) {
                scope.notEmpty = valid;
                validState = scope.searchStr;
            }

            function keyupHandler(event) {
                var which = ie8EventNormalizer(event);
                if (which === KEY_LF || which === KEY_RT) {
                    // do nothing
                    return;
                }

                if (which === KEY_UP || which === KEY_EN) {
                    event.preventDefault();
                } else
                if (which === KEY_DW) {
                    event.preventDefault();
                    if (!scope.showDropdown && scope.searchStr && scope.searchStr.length >= minlength) {
                        initResults();
                        scope.searching = true;
                        searchTimerComplete(scope.searchStr);
                    }
                } else
                if (which === KEY_ES) {
                    clearResults();
                    scope.$apply(function () {
                        inputField.val(scope.searchStr);
                    });
                } else
                {
                    if (minlength === 0 && !scope.searchStr) {
                        return;
                    }

                    if (!scope.searchStr || scope.searchStr === '') {
                        scope.showDropdown = false;
                    } else if (scope.searchStr.length >= minlength) {
                        initResults();

                        if (searchTimer) {
                            $timeout.cancel(searchTimer);
                        }

                        scope.searching = true;

                        searchTimer = $timeout(function () {
                            searchTimerComplete(scope.searchStr);
                        }, scope.pause);
                    }

                    if (validState && validState !== scope.searchStr && !scope.clearSelected) {
                        scope.$apply(function () {
                            callOrAssign();
                        });
                    }
                }
            }

            function handleOverrideSuggestions(event) {
                if (scope.overrideSuggestions &&
                !(scope.selectedObject && scope.selectedObject.originalObject === scope.searchStr)) {
                    if (event) {
                        event.preventDefault();
                    }

                    // cancel search timer
                    $timeout.cancel(searchTimer);
                    // cancel http request
                    cancelHttpRequest();

                    setInputString(scope.searchStr);
                }
            }

            function dropdownRowOffsetHeight(row) {
                var css = getComputedStyle(row);
                return row.offsetHeight +
                parseInt(css.marginTop, 10) + parseInt(css.marginBottom, 10);
            }

            function dropdownHeight() {
                return dd.getBoundingClientRect().top +
                parseInt(getComputedStyle(dd).maxHeight, 10);
            }

            function dropdownRow() {
                return elem[0].querySelectorAll('.angucomplete-row')[scope.currentIndex];
            }

            function dropdownRowTop() {
                return dropdownRow().getBoundingClientRect().top - (
                dd.getBoundingClientRect().top +
                parseInt(getComputedStyle(dd).paddingTop, 10));
            }

            function dropdownScrollTopTo(offset) {
                dd.scrollTop = dd.scrollTop + offset;
            }

            function updateInputField() {
                var current = scope.results[scope.currentIndex];
                if (scope.matchClass) {
                    inputField.val(extractTitle(current.originalObject));
                } else
                {
                    inputField.val(current.title);
                }
            }

            function keydownHandler(event) {
                var which = ie8EventNormalizer(event);
                var row = null;
                var rowTop = null;

                if (which === KEY_EN && scope.results) {
                    if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
                        event.preventDefault();
                        scope.selectResult(scope.results[scope.currentIndex]);
                    } else {
                        handleOverrideSuggestions(event);
                        clearResults();
                    }
                    scope.$apply();
                } else if (which === KEY_DW && scope.results) {
                    event.preventDefault();
                    if (scope.currentIndex + 1 < scope.results.length && scope.showDropdown) {
                        scope.$apply(function () {
                            scope.currentIndex++;
                            updateInputField();
                        });

                        if (isScrollOn) {
                            row = dropdownRow();
                            if (dropdownHeight() < row.getBoundingClientRect().bottom) {
                                dropdownScrollTopTo(dropdownRowOffsetHeight(row));
                            }
                        }
                    }
                } else if (which === KEY_UP && scope.results) {
                    event.preventDefault();
                    if (scope.currentIndex >= 1) {
                        scope.$apply(function () {
                            scope.currentIndex--;
                            updateInputField();
                        });

                        if (isScrollOn) {
                            rowTop = dropdownRowTop();
                            if (rowTop < 0) {
                                dropdownScrollTopTo(rowTop - 1);
                            }
                        }
                    } else
                    if (scope.currentIndex === 0) {
                        scope.$apply(function () {
                            scope.currentIndex = -1;
                            inputField.val(scope.searchStr);
                        });
                    }
                } else if (which === KEY_TAB) {
                    if (scope.results && scope.results.length > 0 && scope.showDropdown) {
                        if (scope.currentIndex === -1 && scope.overrideSuggestions) {
                            // intentionally not sending event so that it does not
                            // prevent default tab behavior
                            handleOverrideSuggestions();
                        } else
                        {
                            if (scope.currentIndex === -1) {
                                scope.currentIndex = 0;
                            }
                            scope.selectResult(scope.results[scope.currentIndex]);
                            scope.$digest();
                        }
                    } else
                    {
                        // no results
                        // intentionally not sending event so that it does not
                        // prevent default tab behavior
                        if (scope.searchStr && scope.searchStr.length > 0) {
                            handleOverrideSuggestions();
                        }
                    }
                } else if (which === KEY_ES) {
                    // This is very specific to IE10/11 #272
                    // without this, IE clears the input text
                    event.preventDefault();
                }
            }

            function httpSuccessCallbackGen(str) {
                return function (responseData, status, headers, config) {
                    // normalize return obejct from promise
                    if (!status && !headers && !config && responseData.data) {
                        responseData = responseData.data;
                    }
                    scope.searching = false;
                    processResults(
                    extractValue(responseFormatter(responseData), scope.remoteUrlDataField),
                    str);
                };
            }

            function httpErrorCallback(errorRes, status, headers, config) {
                // cancelled/aborted
                if (status === 0 || status === -1) {return;}

                // normalize return obejct from promise
                if (!status && !headers && !config) {
                    status = errorRes.status;
                }
                if (scope.remoteUrlErrorCallback) {
                    scope.remoteUrlErrorCallback(errorRes, status, headers, config);
                } else
                {
                    if (console && console.error) {
                        console.error('http error');
                    }
                }
            }

            function cancelHttpRequest() {
                if (httpCanceller) {
                    httpCanceller.resolve();
                }
            }

            function getRemoteResults(str) {
                var params = {},
                url = scope.remoteUrl + encodeURIComponent(str);
                if (scope.remoteUrlRequestFormatter) {
                    params = { params: scope.remoteUrlRequestFormatter(str) };
                    url = scope.remoteUrl;
                }
                if (!!scope.remoteUrlRequestWithCredentials) {
                    params.withCredentials = true;
                }
                cancelHttpRequest();
                httpCanceller = $q.defer();
                params.timeout = httpCanceller.promise;
                $http.get(url, params).
                success(httpSuccessCallbackGen(str)).
                error(httpErrorCallback);
            }

            function getRemoteResultsWithCustomHandler(str) {
                cancelHttpRequest();

                httpCanceller = $q.defer();

                scope.remoteApiHandler(str, httpCanceller.promise).
                then(httpSuccessCallbackGen(str)).
                catch(httpErrorCallback);

                /* IE8 compatible
                                          scope.remoteApiHandler(str, httpCanceller.promise)
                                            ['then'](httpSuccessCallbackGen(str))
                                            ['catch'](httpErrorCallback);
                                          */
            }

            function clearResults() {
                scope.showDropdown = false;
                scope.results = [];
                if (dd) {
                    dd.scrollTop = 0;
                }
            }

            function initResults() {
                scope.showDropdown = displaySearching;
                scope.currentIndex = scope.focusFirst ? 0 : -1;
                scope.results = [];
            }

            function getLocalResults(str) {
                var i,match,s,value,
                searchFields = scope.searchFields.split(','),
                matches = [];
                if (typeof scope.parseInput() !== 'undefined') {
                    str = scope.parseInput()(str);
                }
                for (i = 0; i < scope.localData.length; i++) {
                    match = false;

                    for (s = 0; s < searchFields.length; s++) {
                        value = extractValue(scope.localData[i], searchFields[s]) || '';
                        match = match || value.toString().toLowerCase().indexOf(str.toString().toLowerCase()) >= 0;
                    }

                    if (match) {
                        matches[matches.length] = scope.localData[i];
                    }
                }

                scope.searching = false;
                processResults(matches, str);
            }

            function checkExactMatch(result, obj, str) {
                if (!str) {return false;}
                for (var key in obj) {
                    if (obj[key].toLowerCase() === str.toLowerCase()) {
                        scope.selectResult(result);
                        return true;
                    }
                }
                return false;
            }

            function searchTimerComplete(str) {
                // Begin the search
                if (!str || str.length < minlength) {
                    return;
                }
                if (scope.localData) {
                    scope.$apply(function () {
                        getLocalResults(str);
                    });
                } else
                if (scope.remoteApiHandler) {
                    getRemoteResultsWithCustomHandler(str);
                } else {
                    getRemoteResults(str);
                }
            }

            function processResults(responseData, str) {
                var i, description, image, text, formattedText, formattedDesc;

                if (responseData && responseData.length > 0) {
                    scope.results = [];

                    for (i = 0; i < responseData.length; i++) {
                        if (scope.titleField && scope.titleField !== '') {
                            text = formattedText = extractTitle(responseData[i]);
                        }

                        description = '';
                        if (scope.descriptionField) {
                            description = formattedDesc = extractValue(responseData[i], scope.descriptionField);
                        }

                        image = '';
                        if (scope.imageField) {
                            image = extractValue(responseData[i], scope.imageField);
                        }

                        if (scope.matchClass) {
                            formattedText = findMatchString(text, str);
                            formattedDesc = findMatchString(description, str);
                        }

                        scope.results[scope.results.length] = {
                            title: formattedText,
                            description: formattedDesc,
                            image: image,
                            originalObject: responseData[i] };

                    }

                } else {
                    scope.results = [];
                }

                if (scope.autoMatch && scope.results.length === 1 &&
                checkExactMatch(scope.results[0],
                { title: text, desc: description || '' }, scope.searchStr)) {
                    scope.showDropdown = false;
                } else if (scope.results.length === 0 && !displayNoResults) {
                    scope.showDropdown = false;
                } else {
                    scope.showDropdown = true;
                }
            }

            function showAll() {
                if (scope.localData) {
                    processResults(scope.localData, '');
                } else
                if (scope.remoteApiHandler) {
                    getRemoteResultsWithCustomHandler('');
                } else
                {
                    getRemoteResults('');
                }
            }

            scope.onFocusHandler = function () {
                if (scope.focusIn) {
                    scope.focusIn();
                }
                if (minlength === 0 && (!scope.searchStr || scope.searchStr.length === 0)) {
                    scope.currentIndex = scope.focusFirst ? 0 : scope.currentIndex;
                    scope.showDropdown = true;
                    showAll();
                }
            };

            scope.hideResults = function () {
                if (mousedownOn && (
                mousedownOn === scope.id + '_dropdown' ||
                mousedownOn.indexOf('angucomplete') >= 0)) {
                    mousedownOn = null;
                } else
                {
                    hideTimer = $timeout(function () {
                        clearResults();
                        scope.$apply(function () {
                            if (scope.searchStr && scope.searchStr.length > 0) {
                                inputField.val(scope.searchStr);
                            }
                        });
                    }, BLUR_TIMEOUT);
                    cancelHttpRequest();

                    if (scope.focusOut) {
                        scope.focusOut();
                    }

                    if (scope.overrideSuggestions) {
                        if (scope.searchStr && scope.searchStr.length > 0 && scope.currentIndex === -1) {
                            handleOverrideSuggestions();
                        }
                    }
                }
            };

            scope.resetHideResults = function () {
                if (hideTimer) {
                    $timeout.cancel(hideTimer);
                }
            };

            scope.hoverRow = function (index) {
                scope.currentIndex = index;
            };

            scope.selectResult = function (result) {
                // Restore original values
                if (scope.matchClass) {
                    result.title = extractTitle(result.originalObject);
                    result.description = extractValue(result.originalObject, scope.descriptionField);
                }

                if (scope.clearSelected) {
                    scope.searchStr = null;
                } else
                {
                    scope.searchStr = result.title;
                }
                callOrAssign(result);
                clearResults();
            };

            scope.inputChangeHandler = function (str) {
                if (str.length < minlength) {
                    cancelHttpRequest();
                    clearResults();
                } else
                if (str.length === 0 && minlength === 0) {
                    scope.searching = false;
                    showAll();
                }

                if (scope.inputChanged) {
                    str = scope.inputChanged(str);
                }
                return str;
            };

            // check required
            if (scope.fieldRequiredClass && scope.fieldRequiredClass !== '') {
                requiredClassName = scope.fieldRequiredClass;
            }

            // check min length
            if (scope.minlength && scope.minlength !== '') {
                minlength = parseInt(scope.minlength, 10);
            }

            // check pause time
            if (!scope.pause) {
                scope.pause = PAUSE;
            }

            // check clearSelected
            if (!scope.clearSelected) {
                scope.clearSelected = false;
            }

            // check override suggestions
            if (!scope.overrideSuggestions) {
                scope.overrideSuggestions = false;
            }

            // check required field
            if (scope.fieldRequired && ctrl) {
                // check initial value, if given, set validitity to true
                if (scope.initialValue) {
                    handleRequired(true);
                } else
                {
                    handleRequired(false);
                }
            }

            scope.inputType = attrs.type ? attrs.type : 'text';

            // set strings for "Searching..." and "No results"
            scope.textSearching = attrs.textSearching ? attrs.textSearching : TEXT_SEARCHING;
            scope.textNoResults = attrs.textNoResults ? attrs.textNoResults : TEXT_NORESULTS;
            displaySearching = scope.textSearching === 'false' ? false : true;
            displayNoResults = scope.textNoResults === 'false' ? false : true;

            // set max length (default to maxlength deault from html
            scope.maxlength = attrs.maxlength ? attrs.maxlength : MAX_LENGTH;

            // register events
            inputField.on('keydown', keydownHandler);
            inputField.on('keyup', keyupHandler);

            // set response formatter
            responseFormatter = callFunctionOrIdentity('remoteUrlResponseFormatter');

            // set isScrollOn
            $timeout(function () {
                var css = getComputedStyle(dd);
                isScrollOn = css.maxHeight && css.overflowY === 'auto';
            });
        }

        return {
            restrict: 'EA',
            require: '^?form',
            scope: {
                selectedObject: '=',
                disableInput: '=',
                initialValue: '=',
                localData: '=',
                remoteUrlRequestFormatter: '=',
                remoteUrlRequestWithCredentials: '@',
                remoteUrlResponseFormatter: '=',
                remoteUrlErrorCallback: '=',
                remoteApiHandler: '=',
                id: '@',
                type: '@',
                placeholder: '@',
                remoteUrl: '@',
                remoteUrlDataField: '@',
                titleField: '@',
                descriptionField: '@',
                imageField: '@',
                inputClass: '@',
                pause: '@',
                searchFields: '@',
                minlength: '@',
                matchClass: '@',
                clearSelected: '@',
                overrideSuggestions: '@',
                fieldRequired: '=',
                fieldRequiredClass: '@',
                inputChanged: '=',
                autoMatch: '@',
                focusOut: '&',
                focusIn: '&',
                inputName: '@',
                focusFirst: '@',
                parseInput: '&' },

            templateUrl: function templateUrl(element, attrs) {
                return attrs.templateUrl || TEMPLATE_URL;
            },
            compile: function compile(tElement) {
                var startSym = $interpolate.startSymbol();
                var endSym = $interpolate.endSymbol();
                if (!(startSym === '{{' && endSym === '}}')) {
                    var interpolatedHtml = tElement.html().
                    replace(/\{\{/g, startSym).
                    replace(/\}\}/g, endSym);
                    tElement.html(interpolatedHtml);
                }
                return link;
            } };

    }]);





    angular.module('cui-ng').
    directive('classToggle', function () {
        return {
            restrict: 'EAC',
            scope: true,
            link: function link(scope, elem, attrs) {
                // assign a default "toggled" class
                var toggledClass = attrs.toggledClass || 'class-toggle-' + scope.$id;
                var elementClass = function elementClass() {return elem.attr('class') || '';};
                var checkIfToggled = function checkIfToggled(elementClass) {
                    scope.toggled = elementClass.indexOf(toggledClass) >= 0;
                };

                scope.toggleClass = function () {
                    elem.toggleClass(toggledClass);
                };
                scope.toggleOn = function () {
                    if (!scope.toggled) scope.toggleClass();
                };
                scope.toggleOff = function () {
                    if (scope.toggled) scope.toggleClass();
                };

                scope.$watch(elementClass, checkIfToggled);
            } };

    });


    angular.module('cui-ng').
    directive('cuiAvatar', ['$http', '$filter', function ($http, $filter) {
        return {
            restrict: 'A',
            scope: {
                cuiAvatar: '=',
                cuiAvatarNames: '=',
                cuiAvatarEmail: '=' },

            compile: function compile() {
                return {
                    pre: function pre(scope, elem, attrs) {
                        var cuiAvatar = {
                            selectors: {
                                $elem: angular.element(elem[0]) },

                            config: {
                                colorClassPrefix: attrs.cuiAvatarColorClassPrefix || false,
                                colorCount: attrs.cuiAvatarColorCount || 0,
                                cuiI18nFilter: angular.isDefined(attrs.cuiAvatarCuii18nFilter) || false,
                                maxNumberOfInitials: attrs.cuiAvatarMaxNumInitials || 2 },

                            watchers: function watchers() {
                                scope.$watch('cuiAvatar', function (newAvatar) {
                                    if (newAvatar) cuiAvatar.update();
                                });
                                scope.$watch('cuiAvatarNames', function (newNameArray) {
                                    if (newNameArray) cuiAvatar.update();
                                });
                                scope.$watch('cuiAvatarEmail', function (newEmail) {
                                    if (newEmail) cuiAvatar.update();
                                });
                            },
                            helpers: {
                                isColorClassApplied: function isColorClassApplied() {
                                    return _.find(cuiAvatar.selectors.$elem[0].classList, function (className) {return className.indexOf(cuiAvatar.config.colorClassPrefix) > -1;});
                                },
                                applyRandomColorClass: function applyRandomColorClass() {
                                    var classNumberToApply = Math.floor(Math.random() * cuiAvatar.config.colorCount + 1);
                                    cuiAvatar.selectors.$elem[0].classList.add(cuiAvatar.config.colorClassPrefix + classNumberToApply);
                                    cuiAvatar.config.colorClassAdded = cuiAvatar.config.colorClassPrefix + classNumberToApply;
                                },
                                getInitialsToDisplay: function getInitialsToDisplay() {
                                    var internationalizedName = void 0;
                                    var nameToDisplay = '';
                                    if (cuiAvatar.config.cuiI18nFilter) {
                                        internationalizedName = $filter('cuiI18n')(scope.cuiAvatarNames).split(' ');
                                    }
                                    (internationalizedName || scope.cuiAvatarNames).forEach(function (nameSection, i) {
                                        if (i < cuiAvatar.config.maxNumberOfInitials) {
                                            if (!nameSection) return;
                                            nameToDisplay += nameSection[0].toUpperCase();
                                        }
                                    });
                                    return nameToDisplay;
                                } },

                            render: {
                                nameBackground: function nameBackground() {
                                    if (cuiAvatar.config.colorClassPrefix) {
                                        if (cuiAvatar.config.colorCount === 0) {
                                            throw 'For cui-avatar if you specify color class prefix you must specify the a cui-avatar-color-count';
                                        }

                                        if (cuiAvatar.helpers.isColorClassApplied()) return;else
                                        cuiAvatar.helpers.applyRandomColorClass();
                                    }
                                },
                                initials: function initials() {
                                    if (!scope.cuiAvatarNames) return;
                                    cuiAvatar.selectors.$elem[0].innerHTML = '<div class="cui-avatar__initials"></div>';
                                    cuiAvatar.selectors.$initials = angular.element(cuiAvatar.selectors.$elem[0].childNodes[0]);
                                    cuiAvatar.selectors.$initials[0].innerHTML = cuiAvatar.helpers.getInitialsToDisplay();
                                },
                                image: function image() {
                                    var applyImage = function applyImage(imgSrc) {
                                        // remove the random color class added before applying an image
                                        if (cuiAvatar.config.colorClassAdded) cuiAvatar.selectors.$elem[0].classList.remove(cuiAvatar.config.colorClassAdded);
                                        cuiAvatar.selectors.$elem[0].innerHTML = '<div class="cui-avatar__image-container"></div>';
                                        cuiAvatar.selectors.$image = angular.element(cuiAvatar.selectors.$elem[0].childNodes[0]);
                                        cuiAvatar.selectors.$image[0].style.backgroundImage = 'url("' + imgSrc + '")';
                                    };
                                    var img = new Image();
                                    if (scope.cuiAvatar && scope.cuiAvatar !== '') {
                                        img.src = scope.cuiAvatar;
                                        img.onload = applyImage(img.src);
                                    } else
                                    if (scope.cuiAvatarEmail) {(function () {
                                            var hashedEmail = md5(scope.cuiAvatarEmail);
                                            // ?d=404 tells gravatar not to give me a default gravatar
                                            $http.get('https://www.gravatar.com/avatar/' + hashedEmail + '?d=404').
                                            then(function (res) {// If the user has a gravatar account and has set a picture
                                                img.src = 'https://www.gravatar.com/avatar/' + hashedEmail;
                                                img.onload = applyImage(img.src);
                                            });})();
                                    } else
                                    return;
                                } },

                            update: function update() {
                                cuiAvatar.render.nameBackground();
                                cuiAvatar.render.initials();
                                cuiAvatar.render.image();
                            } };

                        cuiAvatar.render.nameBackground();
                        cuiAvatar.render.initials();
                        cuiAvatar.render.image();
                        cuiAvatar.watchers();
                    } };

            } };

    }]);

    angular.module('cui-ng').
    directive('cuiButton', function () {return {
            restrict: 'E',
            transclude: true,
            scope: {
                errorIf: '=',
                loadingIf: '=',
                successIf: '=',
                disableIf: '=',
                errorMessage: '@',
                loadingMessage: '@',
                successMessage: '@',
                buttonClick: '&' },

            link: function link(scope, elem, attrs) {
                attrs.hasOwnProperty('errorMessage') ? scope.errorMessage = attrs['errorMessage'] : scope.errorMessage = 'Error';
                attrs.hasOwnProperty('loadingMessage') ? scope.loadingMessage = attrs['loadingMessage'] : scope.loadingMessage = 'Loading';
                attrs.hasOwnProperty('successMessage') ? scope.successMessage = attrs['successMessage'] : scope.successMessage = 'Success';
            },
            template: '\n        <button class="cui-button cui-button--error-alt" ng-if="errorIf" ng-click="buttonClick()" ng-disabled="disableIf">\n          {{errorMessage}}\n        </button>\n        <button class="cui-button cui-button--loading-alt" ng-if="loadingIf" ng-disabled="disableIf">\n          <span>{{loadingMessage}}</span>\n          <div class="cui-button__ellipses"></div>\n          <div class="cui-button__ellipses"></div>\n          <div class="cui-button__ellipses"></div>\n        </button>\n        <button class="cui-button cui-button--success" ng-if="successIf" ng-disabled="disableIf">\n          {{successMessage}}\n          <svg class="cui-button__check" width="21px" height="16px" viewBox="0 0 21 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n              <title>check</title>\n              <g id="check" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n                  <path d="M0.824056194,14.5726523 C1.60584855,15.3483885 2.86333934,15.3420834 3.63455864,14.5567179 L11.8587648,6.18165837 C12.62917,5.39712184 13.9014742,5.37922301 14.6979727,6.13923477 L17.3615817,8.68082663 C18.1592277,9.44193325 19.4283055,9.41819274 20.1974828,8.62642494 L19.932337,8.89935798 C20.700916,8.10820614 20.673432,6.84262122 19.8821394,6.08333201 L14.6486407,1.06149931 C13.8523384,0.297402956 12.5724404,0.323089801 11.8099641,1.09847731 L1.07504371,12.0151757 C0.303588289,12.7996944 0.31135936,14.063927 1.09376039,14.8402672 L0.824056194,14.5726523 Z" fill="currentColor" transform="translate(10.500000, 7.826229) rotate(-180.000000) translate(-10.500000, -7.826229) "></path>\n              </g>\n          </svg>\n        </button>\n        <ng-transclude ng-if="!loadingIf && !errorIf && !successIf" ng-click="buttonClick()" ng-disabled="disableIf">\n        </ng-translude>\n    ' };});
























    angular.module('cui-ng').
    directive('cuiDropdown', ['$compile', function ($compile) {
        return {
            require: 'ngModel',
            restrict: 'E',
            scope: {
                ngModel: '=',
                options: '&',
                constraints: '&' },

            link: function link(scope, elem, attrs, ctrl) {
                var id = scope.$id;
                var inputName = 'cuiDropdown' + id;
                var newScope = void 0;
                var dropdownScope = void 0;
                var currentIndex = void 0;
                var itemSearchLetter = '';
                var itemSearchIndexes = [];
                var itemSearchCurrentIndex = void 0;
                var typeAheadSearch = '';

                var cuiDropdown = {
                    initScope: function initScope() {
                        if (attrs.ngRequired || attrs.required) {
                            ctrl.$validators['required'] = function () {return ctrl.$viewValue !== null;};
                        }
                        angular.forEach(cuiDropdown.watchers, function (initWatcher) {
                            initWatcher();
                        });
                        angular.forEach(cuiDropdown.scope, function (value, key) {
                            scope[key] = value;
                        });
                    },
                    config: {
                        inputClass: attrs.class || 'cui-dropdown',
                        dropdownWrapperClass: attrs.dropdownClass || 'cui-dropdown__wrapper',
                        dropdownItemClass: attrs.dropdownItemClass || 'cui-dropdown__item',
                        attachment: attrs.attachment || 'top left',
                        targetAttachment: attrs.targetAttachment || 'top left',
                        offset: attrs.offset || '0 0',
                        defaultConstraints: [{ to: 'window', attachment: 'together none' }],
                        returnValue: attrs.returnValue,
                        displayValue: attrs.displayValue,
                        required: attrs.ngRequired || attrs.required || false,
                        defaultOption: angular.isDefined(attrs.defaultOption),
                        defaultOptionValue: attrs.defaultOption || '("select-one" | translate)' },

                    selectors: {
                        $cuiDropdown: angular.element(elem),
                        $body: angular.element(document.body) },

                    watchers: {
                        dropdownClick: function dropdownClick() {
                            // each dropdown item broadcasts the cui-dropdown scope id and passes the index of the choice
                            scope.$on(id.toString(), cuiDropdown.helpers.reassignModel);
                        },
                        languageChange: function languageChange() {
                            scope.$on('languageChange', cuiDropdown.helpers.handleLanguageChange);
                        },
                        model: function model() {
                            scope.$watch('ngModel', function (newModel, oldModel) {
                                if (oldModel !== undefined) {
                                    var indexInReturnValues = _.findIndex(cuiDropdown.helpers.getOptionReturnValues(), function (returnValue) {
                                        return returnValue === newModel;
                                    });
                                    // if the new model isn't one of the return values assign the default / first option
                                    if (indexInReturnValues === -1) indexInReturnValues = 0;
                                    cuiDropdown.helpers.reassignModel(null, indexInReturnValues);
                                }
                            });
                        },
                        options: function options() {
                            scope.$watch(scope.options, function (newOptions, oldOptions) {
                                if (newOptions) {
                                    cuiDropdown.helpers.setInitialInputValue();
                                    cuiDropdown.render.currentValueBox();
                                }
                            }, function (newOptions, oldOptions) {return !angular.equals(newOptions, oldOptions);});
                        } },

                    scope: {
                        toggleDropdown: function toggleDropdown() {
                            if (!cuiDropdown.selectors.$dropdown) {
                                cuiDropdown.render.dropdown();
                                // Focus the first element when the dropdown opens
                                // to enable moving through the options via arrow keys
                                cuiDropdown.selectors.$dropdown[0].children[0].focus();
                            } else
                            cuiDropdown.scope.destroyDropdown();
                        },
                        destroyDropdown: function destroyDropdown() {
                            if (cuiDropdown.selectors.$dropdown) {
                                dropdownScope.$destroy();
                                cuiDropdown.selectors.$dropdown.detach();
                                cuiDropdown.selectors.$dropdown = null;
                                itemSearchLetter = '';
                                typeAheadSearch = '';
                            }
                        },
                        handleKeyup: function handleKeyup(e) {
                            if ([13, 32, 38, 40].indexOf(e.keyCode) > -1 && !cuiDropdown.selectors.$dropdown) {
                                cuiDropdown.scope.toggleDropdown();
                                cuiDropdown.selectors.$dropdown[0].children[0].focus();
                            }
                        },
                        handleItemKeyup: function handleItemKeyup(e) {
                            var dropdownItems = cuiDropdown.selectors.$dropdown[0].children;
                            var dropdownItemCount = dropdownItems.length;

                            if (e.keyCode === 40) {
                                // Handle down arrow key press
                                var nextElementIndex = e.target.tabIndex + 1;
                                if (nextElementIndex !== dropdownItemCount) dropdownItems[nextElementIndex].focus();
                            } else
                            if (e.keyCode === 38) {
                                // Handle up arrow key press
                                var _nextElementIndex = e.target.tabIndex - 1;
                                if (_nextElementIndex !== -1) dropdownItems[_nextElementIndex].focus();
                            } else
                            if (e.keyCode === 13 || e.keyCode === 32) {
                                // Select current dropdown item when pressing space or enter
                                cuiDropdown.helpers.reassignModel(e, e.target.tabIndex);
                            } else
                            {
                                // If a 'single-search' optional attribute is provided, we select/cycle based on
                                // the first letter only. Otherwise by default we run type-ahead selection.
                                if (attrs.hasOwnProperty('singleSearch')) cuiDropdown.scope.selectItemSingleSearch(e);else
                                cuiDropdown.scope.selectItemTypeAhead(e);
                            }
                        },
                        handleItemKeydown: function handleItemKeydown(e) {
                            // Hide the dropdown if we tab out of it and loses focus
                            if ([38, 40].indexOf(e.keyCode) > -1) {
                                e.preventDefault();
                            }
                            if (e.keyCode === 9) cuiDropdown.scope.destroyDropdown();
                        },
                        handleItemMouseover: function handleItemMouseover(e) {
                            // Focus the dropdown item we mouse over. This allows us to
                            // move up/down using the arrow keys from the current element
                            // we mouse over.
                            e.target.focus();
                        },
                        selectItemSingleSearch: function selectItemSingleSearch(e) {
                            var dropdownItems = cuiDropdown.selectors.$dropdown[0].children;
                            var pressedKey = e.key.toLowerCase();

                            // If we are searching for the first time, or are pressing a new key,
                            // we generate an array containing the indexes of all dropdown items
                            // that start with that letter
                            if (!itemSearchLetter.length || pressedKey !== itemSearchLetter) {
                                itemSearchLetter = pressedKey;
                                itemSearchCurrentIndex = 0;
                                itemSearchIndexes = [];

                                angular.forEach(dropdownItems, function (item, index) {
                                    if (item.outerText) {
                                        if (pressedKey === item.outerText[0].toLowerCase()) {
                                            itemSearchIndexes.push(index);
                                        }
                                    }
                                });
                            }

                            // Focus the appropriate dropdown item
                            dropdownItems[itemSearchIndexes[itemSearchCurrentIndex]] && dropdownItems[itemSearchIndexes[itemSearchCurrentIndex]].focus();

                            // Increment the current search index we are on to get the next item on the next keypress,
                            // or start back from the begining if we just saw the last item.
                            if (itemSearchIndexes.length > 1) {
                                if (itemSearchCurrentIndex + 1 === itemSearchIndexes.length) {
                                    itemSearchCurrentIndex = 0;
                                } else
                                {
                                    itemSearchCurrentIndex += 1;
                                }
                            }
                        },
                        selectItemTypeAhead: function selectItemTypeAhead(e) {
                            var dropdownItems = cuiDropdown.selectors.$dropdown[0].children;

                            if (e.keyCode === 8) {
                                typeAheadSearch = '';
                                dropdownItems[0].focus();
                            } else
                            {(function () {
                                    var shouldContinue = true;
                                    typeAheadSearch += e.key.toLowerCase();

                                    angular.forEach(dropdownItems, function (item, index) {
                                        if (shouldContinue) {
                                            if (typeAheadSearch.length === 1) {
                                                if (item.outerText[0].toLowerCase() === typeAheadSearch) {
                                                    dropdownItems[index].focus();
                                                    shouldContinue = false;
                                                }
                                            } else
                                            if (item.outerText.toLowerCase().indexOf(typeAheadSearch) >= 0) {
                                                dropdownItems[index].focus();
                                                shouldContinue = false;
                                            }
                                        }
                                    });})();
                            }
                        } },

                    helpers: {
                        getOptionDisplayValues: function getOptionDisplayValues() {
                            var displayValues = [];var _cuiDropdown$config =
                            cuiDropdown.config,defaultOption = _cuiDropdown$config.defaultOption,defaultOptionValue = _cuiDropdown$config.defaultOptionValue,displayValue = _cuiDropdown$config.displayValue;
                            if (defaultOption) displayValues.push(scope.$eval(defaultOptionValue)); // push an empty return option for error handling
                            angular.forEach(scope.options(), function (value, key) {
                                if (!displayValue) displayValues.push(value);else
                                {
                                    var displayScope = {
                                        object: value,
                                        value: value,
                                        key: key };

                                    displayValues.push(scope.$eval(displayValue, displayScope));
                                }
                            });
                            return displayValues;
                        },
                        getOptionReturnValues: function getOptionReturnValues() {
                            var returnValues = [];var _cuiDropdown$config2 =
                            cuiDropdown.config,defaultOption = _cuiDropdown$config2.defaultOption,returnValue = _cuiDropdown$config2.returnValue;
                            if (defaultOption) returnValues.push(null); // if there's a default option it won't have any return value
                            angular.forEach(scope.options(), function (value, key) {
                                if (!returnValue) returnValues.push(value);else

                                {
                                    var returnScope = {
                                        object: value,
                                        value: value,
                                        key: key };

                                    returnValues.push(scope.$eval(returnValue, returnScope));
                                }
                            });
                            return returnValues;
                        },
                        getDropdownItem: function getDropdownItem(index, displayValue) {
                            var ngClick = '$root.$broadcast(\'' + id + '\', ' + index + ')';
                            return $compile('\n                                <div class="' +

                            cuiDropdown.config.dropdownItemClass + '" \n                                    ng-click="' +
                            ngClick + '" \n                                    tabindex="' +
                            index + '"\n                                    ng-keyup="handleItemKeyup($event)"\n                                    ng-keydown="handleItemKeydown($event)"\n                                    ng-mousemove="handleItemMouseover($event)"\n                                >\n                                    ' +




                            displayValue + '\n                                </div>\n                            ')(


                            scope);
                        },
                        setInitialInputValue: function setInitialInputValue() {
                            var displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                            var returnValues = cuiDropdown.helpers.getOptionReturnValues();
                            if (!scope.ngModel) {
                                scope.displayValue = displayValues[0];
                                scope.ngModel = returnValues[0];
                                currentIndex = 0;
                                return;
                            }
                            var index = _.findIndex(returnValues, function (value) {return angular.equals(value, scope.ngModel);});
                            if (index > -1) {
                                scope.displayValue = displayValues[index];
                                currentIndex = index;
                            } else {
                                scope.displayValue = displayValues[0];
                                scope.ngModel = returnValues[0];
                                currentIndex = 0;
                            }
                        },
                        reassignModel: function reassignModel(e, index) {
                            if (typeof index === 'number') {
                                currentIndex = index;
                            } else {
                                index = currentIndex;
                            }
                            var displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                            var returnValues = cuiDropdown.helpers.getOptionReturnValues();
                            scope.displayValue = displayValues[index];
                            scope.ngModel = returnValues[index];
                            cuiDropdown.scope.destroyDropdown();
                        },
                        handleLanguageChange: function handleLanguageChange() {
                            cuiDropdown.helpers.reassignModel();
                        } },

                    render: {
                        currentValueBox: function currentValueBox() {
                            if (newScope) newScope.$destroy(); // this makes sure that if the input has been rendered once the off click handler is removed
                            newScope = scope.$new();
                            var element = $compile('\n                                <div class="' +

                            cuiDropdown.config.inputClass + '" \n                                    tabindex="0" \n                                    ng-keyup="handleKeyup($event)" \n                                    ng-click="toggleDropdown()" \n                                    off-click="destroyDropdown()"\n                                    id="cui-dropdown-' +




                            id + '"\n                                >\n                                    {{displayValue}}\n                                </div>\n                            ')(




                            newScope);
                            cuiDropdown.selectors.$cuiDropdown.replaceWith(element);
                            cuiDropdown.selectors.$cuiDropdown = element;
                        },
                        dropdown: function dropdown() {
                            if (dropdownScope) dropdownScope.$destroy();
                            dropdownScope = scope.$new();
                            var dropdown = $compile('\n                            <div class="' +

                            cuiDropdown.config.dropdownWrapperClass + '" \n                                tabindex="0"\n                                off-click-filter="\'#cui-dropdown-' +

                            id + '\'"\n                            >\n                            </div>\n                        ')(



                            dropdownScope);
                            var displayValues = cuiDropdown.helpers.getOptionDisplayValues();
                            displayValues.forEach(function (value, i) {
                                dropdown.append(cuiDropdown.helpers.getDropdownItem(i, value));
                            });
                            dropdown.width(cuiDropdown.selectors.$cuiDropdown.outerWidth() - 60);
                            cuiDropdown.selectors.$dropdown = dropdown;
                            cuiDropdown.selectors.$body.append(dropdown);
                            new Tether({
                                element: cuiDropdown.selectors.$dropdown[0],
                                target: cuiDropdown.selectors.$cuiDropdown[0],
                                attachment: cuiDropdown.config.attachment,
                                targetAttachment: cuiDropdown.config.targetAttachment,
                                constraints: scope.constraints() || cuiDropdown.config.defaultConstraints });

                        } } };


                cuiDropdown.initScope();
            } };

    }]);

    angular.module('cui-ng').
    directive('cuiExpandable', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            transclude: true,
            link: function link(scope, elem, attrs, ctrl, transclude) {
                var newScope = scope.$new();
                scope.$on('$destroy', function () {return newScope.$destroy();});

                transclude(newScope, function (clone, innerScope) {
                    elem.append(clone);
                });

                var expandableBody = angular.element(elem[0].querySelector('cui-expandable-body'));
                expandableBody.hide(); // hide the body by default

                var toggleClass = function toggleClass() {
                    elem.toggleClass('expanded');
                };
                var toggleBody = function toggleBody() {
                    expandableBody.animate({ 'height': 'toggle' }, parseInt(elem.attr('transition-speed') || 300), 'linear');
                };

                newScope.toggleExpand = function (event) {
                    // this way labels won't toggle expand twice
                    if (event && event.target.tagName === 'INPUT' && event.target.labels && event.target.labels.length > 0) return;
                    toggleClass();
                };
                newScope.expand = function () {
                    if (!newScope.expanded) toggleClass();
                };
                newScope.collapse = function () {
                    if (newScope.expanded) toggleClass();
                };
                newScope.$watch(function () {return elem.attr('class') || '';}, function (newValue, oldValue) {
                    if (oldValue === newValue && newValue.indexOf('expanded') > -1) {// if the element the expanded class put in by default
                        newScope.expanded = true;
                        toggleBody();
                    } else
                    if (newValue.indexOf('expanded') === -1) {
                        if (newScope.expanded === true) toggleBody();
                        newScope.expanded = false;
                    } else
                    {
                        if (newScope.expanded === false) toggleBody();
                        newScope.expanded = true;
                    }
                });
            } };

    }]);

    angular.module('cui-ng').
    provider('$cuiIcon', function () {
        var iconSets = {};

        this.iconSet = function (namespace, path, viewBox) {
            iconSets[namespace] = { path: path, viewBox: viewBox };
        };

        this.getIconSets = function () {return iconSets;};

        this.getIconSet = function (namespace) {
            if (!iconSets[namespace]) {
                throw new Error('The icon collection with the namespace ' + namespace + ' is not yet defined in the $cuiIcon provider.');
            }
            return iconSets[namespace];
        };

        this.$get = function () {
            return this;
        };
    });

    angular.module('cui-ng').
    directive('cuiIcon', ['$cuiIcon', function ($cuiIcon) {
        return {
            restrict: 'E',
            scope: {},
            link: function link(scope, elem, attrs) {
                var icon = attrs.cuiSvgIcon;
                var viewBox = void 0;
                var preserveaspectratio = void 0;
                var svgClass = void 0;
                var useClass = void 0;
                var path = void 0;

                attrs.preserveaspectratio ?
                preserveaspectratio = 'preserveAspectRatio="' + attrs.preserveaspectratio + '"' :
                preserveaspectratio = '';
                attrs.svgClass ?
                svgClass = 'class="' + attrs.svgClass + '"' :
                svgClass = '';
                attrs.viewbox ?
                viewBox = 'viewBox="' + attrs.viewbox + '"' :
                viewBox = '';
                attrs.useClass ?
                useClass = 'class="' + attrs.useClass + '"' :
                useClass = '';

                if (icon && icon.indexOf('.svg') > -1) {// if the path is directly specified
                    path = icon;
                } else if (icon) {// if the icon is pointing at a namespace put into the provider
                    var _icon$split = icon.split(':'),_icon$split2 = _slicedToArray(_icon$split, 2),iconNamespace = _icon$split2[0],iconId = _icon$split2[1];
                    path = $cuiIcon.getIconSet(iconNamespace).path + '#' + iconId;
                    if (viewBox === '' && $cuiIcon.getIconSet(iconNamespace).viewBox) {
                        viewBox = 'viewBox="' + $cuiIcon.getIconSet(iconNamespace).viewBox + '"';
                    }
                } else throw new Error('You need to define a cui-svg-icon attribute for cui-icon');

                var newSvg = $('<svg xmlns="http://www.w3.org/2000/svg" ' +
                preserveaspectratio + ' ' + svgClass + ' ' + viewBox + '>\n                    <use xlink:href="' +
                path + '" ' + useClass + '></use>\n                </svg>');



                angular.element(elem).replaceWith(newSvg);
            } };

    }]);

    angular.module('cui-ng').
    factory('CuiPopoverHelpers', function () {
        var cuiPopoverHelpers = {
            getResetStyles: function getResetStyles() {
                return {
                    'margin-right': '',
                    'margin-left': '',
                    'margin-bottom': '',
                    'margin-top': '',
                    'left': '',
                    'top': '',
                    'bottom': '',
                    'right': '' };

            },
            getAttachmentFromPosition: function getAttachmentFromPosition(position) {
                switch (position) {
                    case 'top':
                        return 'bottom center';
                    case 'bottom':
                        return 'top center';
                    case 'right':
                        return 'middle left';
                    case 'left':
                        return 'middle right';}

            },
            invertAttachmentPartial: function invertAttachmentPartial(partial) {
                switch (partial) {
                    case 'top':
                        return 'bottom';
                    case 'bottom':
                        return 'top';
                    case 'left':
                        return 'right';
                    case 'right':
                        return 'left';}

            },
            parsePositionArray: function parsePositionArray(positionArray) {
                var genericPositions = [
                { position: 'bottom' },
                { position: 'top' },
                { position: 'right' },
                { position: 'left' }];
                // these are objects to facilitate the reposition function
                var positions = [];
                if (typeof positionArray === 'undefined') {
                    positions.push.apply(positions, genericPositions);
                } else
                {
                    positionArray.forEach(function (position, i) {
                        switch (position) {
                            case 'any':
                                positions.push.apply(positions, genericPositions);
                                break;
                            case 'invert':
                                positions.push(
                                Object.assign({}, positionArray[i - 1], {
                                    position: cuiPopoverHelpers.invertAttachmentPartial(positionArray[i - 1].position) }));


                                break;
                            default:
                                positions.push(position);}

                    });
                }
                return positions;
            },
            parseOffset: function parseOffset(offset) {
                var splitOffset = offset.split(' ');
                var verticalOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(splitOffset[0]);
                var horizontalOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(splitOffset[1]);
                return { verticalOffset: verticalOffset, horizontalOffset: horizontalOffset };
            },
            parseAttachment: function parseAttachment(attachment) {var _attachment$split =
                attachment.split(' '),_attachment$split2 = _slicedToArray(_attachment$split, 2),verticalAttachment = _attachment$split2[0],horizontalAttachment = _attachment$split2[1];
                return { verticalAttachment: verticalAttachment, horizontalAttachment: horizontalAttachment };
            },
            getTetherOffset: function getTetherOffset(position, offset) {var _cuiPopoverHelpers$pa =
                cuiPopoverHelpers.parseOffset(offset),verticalOffset = _cuiPopoverHelpers$pa.verticalOffset,horizontalOffset = _cuiPopoverHelpers$pa.horizontalOffset;

                switch (position) {
                    case 'top':
                    case 'bottom':
                        return '0 ' + horizontalOffset.amount * -1 + horizontalOffset.units;
                    default:
                        return verticalOffset.amount * -1 + verticalOffset.units + ' 0';}

            },
            invertAttachment: function invertAttachment(attachment) {var _cuiPopoverHelpers$pa2 =
                cuiPopoverHelpers.parseAttachment(attachment),verticalAttachment = _cuiPopoverHelpers$pa2.verticalAttachment,horizontalAttachment = _cuiPopoverHelpers$pa2.horizontalAttachment;
                return invertAttachmentPartial(verticalAttachment) + ' ' + invertAttachmentPartial(horizontalAttachment);
            },
            getOffsetAndUnitsOfOffset: function getOffsetAndUnitsOfOffset(offsetPartial) {
                var amount = void 0;
                var units = void 0;
                switch (offsetPartial.indexOf('%')) {
                    case -1:
                        amount = window.parseInt(offsetPartial.split('px')[0]);
                        units = 'px';
                        break;
                    default:
                        amount = window.parseInt(offsetPartial.split('%')[0]);
                        units = '%';}

                return { amount: amount, units: units };
            },
            getPointerOffset: function getPointerOffset(opts) {var
                position = opts.position,offsetBetweenPointerAndContent = opts.offsetBetweenPointerAndContent,popoverHeight = opts.popoverHeight,popoverWidth = opts.popoverWidth,pointerHeight = opts.pointerHeight,pointerWidth = opts.pointerWidth,containerHeight = opts.containerHeight,containerWidth = opts.containerWidth,distanceBetweenTargetAndPopover = opts.distanceBetweenTargetAndPopover;
                var contentOffset = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(offsetBetweenPointerAndContent);
                var contentOffsetCompensation = function contentOffsetCompensation() {
                    switch (position) {
                        case 'top':
                        case 'bottom':
                            return {
                                'margin-left': '50%',
                                'left': contentOffset.amount * -1 + contentOffset.units };

                        case 'left':
                        case 'right':
                            switch (contentOffset.amount) {
                                case 0:
                                    return {
                                        'top': '50%' };

                                default:
                                    var topMargin = void 0;
                                    contentOffset.units === '%' ?
                                    topMargin = containerHeight * (contentOffset.amount * -1 / 100) :
                                    topMargin = contentOffset.amount + contentOffset.units;
                                    return {
                                        'top': '50%',
                                        'margin-top': topMargin };}}



                };

                var containerPadding = cuiPopoverHelpers.getContainerPaddings(opts);
                var pointerOffset = function pointerOffset() {
                    switch (position) {
                        case 'top':
                            return {
                                bottom: '1px',
                                transform: 'translate(-50%,' + (-Math.ceil(parseFloat(containerPadding['padding-bottom'])) + pointerHeight) + 'px)' };

                        case 'bottom':
                            return {
                                top: '1px',
                                transform: 'translate(-50%,' + (Math.ceil(parseFloat(containerPadding['padding-top'])) - pointerHeight) + 'px)' };

                        case 'left':
                            return {
                                right: parseFloat(containerPadding['padding-right']) - pointerHeight + 'px',
                                transform: 'translate(-1px,-50%)' };

                        case 'right':
                            return {
                                left: parseFloat(containerPadding['padding-left']) - pointerHeight + 'px',
                                transform: 'translate(1px,-50%)' };}


                };

                return Object.assign({}, cuiPopoverHelpers.getResetStyles(), pointerOffset(), contentOffsetCompensation());
            },
            getPointerBorderStyles: function getPointerBorderStyles(opts) {var
                position = opts.position,pointerHeight = opts.pointerHeight,pointerWidth = opts.pointerWidth;
                var transparentHorizontalBorder = pointerWidth + 'px solid transparent';
                var transparentVerticalBorder = pointerHeight + 'px solid transparent';
                if (position === 'top' || position === 'bottom') {
                    return {
                        'border-right': transparentHorizontalBorder,
                        'border-left': transparentHorizontalBorder,
                        'border-bottom': transparentVerticalBorder,
                        'border-top': transparentVerticalBorder };

                } else return {
                    'border-right': transparentVerticalBorder,
                    'border-left': transparentVerticalBorder,
                    'border-bottom': transparentHorizontalBorder,
                    'border-top': transparentHorizontalBorder };

            },
            getPointerStyles: function getPointerStyles(opts) {var
                element = opts.element,position = opts.position,offsetBetweenPointerAndContent = opts.offsetBetweenPointerAndContent,popoverHeight = opts.popoverHeight,popoverWidth = opts.popoverWidth,pointerHeight = opts.pointerHeight,pointerWidth = opts.pointerWidth,containerHeight = opts.containerHeight,containerWidth = opts.containerWidth,distanceBetweenTargetAndPopover = opts.distanceBetweenTargetAndPopover;
                var colorOfPopoverBackground = element.css('backgroundColor'),
                stylesOfVisibleBorder = pointerHeight + 'px solid ' + colorOfPopoverBackground;

                return Object.assign({ position: 'absolute' },
                cuiPopoverHelpers.getPointerOffset(opts),
                cuiPopoverHelpers.getPointerBorderStyles(opts), _defineProperty({},

                'border-' + position, stylesOfVisibleBorder));


            },
            getPointer: function getPointer(opts) {
                var $pointer = $('<span class="cui-popover__pointer"></span>');
                $pointer.css(cuiPopoverHelpers.getPointerStyles(opts));
                return $pointer;
            },
            getPopoverMargins: function getPopoverMargins(position, pointerHeight) {
                var margin = pointerHeight + 'px';
                return {
                    'margin-top': position === 'bottom' ? margin : '',
                    'margin-right': position === 'left' ? margin : '',
                    'margin-bottom': position === 'top' ? margin : '',
                    'margin-left': position === 'right' ? margin : '' };

            },
            getContainerPaddings: function getContainerPaddings(opts) {var
                position = opts.position,offsetBetweenPointerAndContent = opts.offsetBetweenPointerAndContent,popoverHeight = opts.popoverHeight,popoverWidth = opts.popoverWidth,pointerHeight = opts.pointerHeight,distanceBetweenTargetAndPopover = opts.distanceBetweenTargetAndPopover;
                var padding = cuiPopoverHelpers.getOffsetAndUnitsOfOffset(distanceBetweenTargetAndPopover);var

                paddingTop = '',paddingBottom = '',paddingRight = '',paddingLeft = '';

                if (position === 'top' || position === 'bottom') {
                    var verticalPadding = void 0;
                    switch (padding.units) {
                        default: // 'px' or ''
                            verticalPadding = padding.amount + padding.units;
                            break;
                        case '%':
                            var heightOfContainer = popoverHeight + pointerHeight;
                            verticalPadding = heightOfContainer * (padding.amount / 100) + 'px';}

                    position === 'top' ?
                    paddingBottom = verticalPadding :
                    paddingTop = verticalPadding;
                } else {
                    var horizontalPadding = void 0;
                    switch (padding.units) {
                        default: // 'px' or ''
                            horizontalPadding = padding.amount + padding.units;
                            break;
                        case '%':
                            var widthOfContainer = popoverWidth + pointerHeight;
                            horizontalPadding = widthOfContainer * (padding.amount / 100) + 'px';}

                    position === 'left' ?
                    paddingRight = horizontalPadding :
                    paddingLeft = horizontalPadding;
                }

                return {
                    'padding-top': paddingTop || '',
                    'padding-right': paddingRight || '',
                    'padding-bottom': paddingBottom || '',
                    'padding-left': paddingLeft || '' };

            } };


        return cuiPopoverHelpers;

    });


    angular.module('cui-ng').
    directive('cuiPopover', ['CuiPopoverHelpers', '$compile', '$timeout', '$interval', function (CuiPopoverHelpers, $compile, $timeout, $interval) {
        return {
            restrict: 'EA',
            compile: function compile() {
                return {
                    pre: function pre(scope, elem, attrs) {
                        var self = void 0;
                        var popoverTether = [],repositionedTether = void 0,tetherAttachmentInterval = void 0,targetElementPositionInterval = void 0,elementHtmlInterval = void 0,_elementHtml = void 0,cuiPopoverConfig = {},positions = void 0,positionInUse = void 0,trialPosition = void 0;

                        var cuiPopover = {
                            init: function init() {
                                elem.css({ opacity: '0', 'pointer-events': 'none', position: 'fixed', right: '0' }); // hide the original element.

                                self = this;
                                positionInUse = 0; // using the default position when we init
                                if (!attrs.popoverPositions) throw new Error('You must define popover-positions for the cui-popover directive.');
                                positions = scope.$eval(attrs.popoverPositions);
                                positions = CuiPopoverHelpers.parsePositionArray(positions);
                                self.config(positions[positionInUse]);
                                self.selectors[positionInUse] = {};
                                $timeout(function () {return self.render.popoverContainer(positionInUse);});

                                angular.forEach(self.watchers, function (initWatcher) {
                                    initWatcher();
                                });
                            },
                            config: function config(opts) {
                                var _this = cuiPopoverConfig;
                                _this.element = elem;
                                _this.target = attrs.target;
                                _this.targetModifier = attrs.targetModifier || undefined;

                                _this.pointerHeight = attrs.pointerHeight && window.parseInt(attrs.pointerHeight) || 14;
                                _this.pointerWidth = attrs.pointerWidth && window.parseInt(attrs.pointerWidth) || 9;

                                _this.popoverWidth = elem.outerWidth();
                                _this.popoverHeight = elem.outerHeight();

                                _this.position = opts.position;
                                var popoverOffsetAttribute = (opts && opts.popoverOffset || attrs.popoverOffset || '0 0').split(' ');
                                var offsetBetweenPointerAndContent = opts && opts.contentOffset || attrs.contentOffset || '0';

                                var offset = void 0,targetOffset = void 0,targetAndPopoverOffset = void 0,pointerOffset = void 0,containerWidth = void 0,containerHeight = void 0;

                                if (_this.position === 'top' || _this.position === 'bottom') {var _popoverOffsetAttribu = _slicedToArray(
                                    popoverOffsetAttribute, 2);targetAndPopoverOffset = _popoverOffsetAttribu[0];pointerOffset = _popoverOffsetAttribu[1];
                                    offset = ['0', offsetBetweenPointerAndContent].join(' ');
                                    targetOffset = ['0', pointerOffset].join(' ');
                                    containerWidth = _this.popoverWidth;
                                    containerHeight = _this.popoverHeight + _this.pointerHeight;
                                } else
                                {var _popoverOffsetAttribu2 = _slicedToArray(
                                    popoverOffsetAttribute, 2);pointerOffset = _popoverOffsetAttribu2[0];targetAndPopoverOffset = _popoverOffsetAttribu2[1];
                                    offset = [offsetBetweenPointerAndContent, '0'].join(' ');
                                    targetOffset = [pointerOffset, '0'].join(' ');
                                    containerWidth = _this.popoverWidth + _this.pointerHeight;
                                    containerHeight = _this.popoverHeight;
                                }

                                _this.distanceBetweenTargetAndPopover = targetAndPopoverOffset;
                                _this.offsetBetweenPointerAndContent = offsetBetweenPointerAndContent;
                                _this.offset = offset;
                                _this.targetOffset = targetOffset;
                                _this.containerHeight = containerHeight;
                                _this.containerWidth = containerWidth;

                                _this.attachment = CuiPopoverHelpers.getAttachmentFromPosition(_this.position);
                                _this.targetAttachment = CuiPopoverHelpers.getAttachmentFromPosition(CuiPopoverHelpers.invertAttachmentPartial(_this.position));
                            },
                            helpers: {
                                getTetherOptions: function getTetherOptions() {var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.selectors.$container[0];var opts = arguments[1];var
                                    target = opts.target,position = opts.position,offset = opts.offset,targetOffset = opts.targetOffset,targetModifier = opts.targetModifier,attachment = opts.attachment,targetAttachment = opts.targetAttachment;
                                    return {
                                        target: target,
                                        targetModifier: targetModifier,
                                        attachment: attachment,
                                        targetAttachment: targetAttachment,
                                        targetOffset: targetOffset,
                                        offset: CuiPopoverHelpers.getTetherOffset(position, offset),
                                        element: element,
                                        constraints: [{ to: 'window', attachment: 'none none' }] };

                                } },

                            watchers: {
                                position: function position() {
                                    tetherAttachmentInterval = $interval(function () {
                                        if (!popoverTether[positionInUse] || !popoverTether[positionInUse].element) return;
                                        if (positions.length === 1) self.newMode('normal');else
                                        {
                                            if (popoverTether[positionInUse].element.classList.contains('tether-out-of-bounds')) self.newMode('try-another');else
                                            self.newMode('normal');
                                        }
                                    }, 100, 0, false);
                                },
                                elementHtml: function elementHtml() {
                                    elementHtmlInterval = $interval(function () {
                                        var elemHtml = elem.html();
                                        if (elemHtml !== _elementHtml) {// if the element html is different than what we have cached
                                            _elementHtml = elemHtml;
                                            cuiPopover.render.newHtml();
                                        }
                                    }, 100, 0, false);
                                },
                                targetElementPosition: function targetElementPosition() {
                                    targetElementPositionInterval = $interval(function () {
                                        scope.targetPosition = self.selectors.$target.offset();
                                    }, 50, 0, false);

                                    scope.$watch('targetPosition', function (newPosition) {
                                        newPosition && popoverTether[positionInUse].position();
                                    }, function (newPosition, oldPosition) {return newPosition.top !== oldPosition.top || newPosition.left !== oldPosition.left;});
                                },
                                scopeDestroy: function scopeDestroy() {
                                    scope.$on('$destroy', function () {
                                        $interval.cancel(tetherAttachmentInterval);
                                        $interval.cancel(targetElementPositionInterval);
                                        $interval.cancel(elementHtmlInterval);
                                        popoverTether[positionInUse].destroy();
                                        self.selectors[positionInUse].$contentBox && self.selectors[positionInUse].$contentBox.detach();
                                        self.selectors[positionInUse].$container && self.selectors[positionInUse].$container.detach();
                                        self.selectors[positionInUse].$pointer && self.selectors[positionInUse].$pointer.detach();
                                    });
                                } },

                            selectors: {
                                $target: angular.element(document.querySelector(attrs.target)) },

                            render: {
                                contentBox: function contentBox(positionIndex) {var
                                    getPointer = CuiPopoverHelpers.getPointer,getPopoverMargins = CuiPopoverHelpers.getPopoverMargins,getContainerPaddings = CuiPopoverHelpers.getContainerPaddings;
                                    var opts = cuiPopoverConfig;

                                    var cloneElem = angular.element(elem).clone(true, true);
                                    cloneElem.css({ opacity: '', 'pointer-events': '', position: '', right: '' });
                                    // append the cui-popover to the container and apply the margins to make room for the pointer
                                    cloneElem.css(getPopoverMargins(opts.position, opts.pointerHeight));

                                    if (self.selectors[positionIndex].$contentBox) {
                                        self.selectors[positionIndex].$contentBox.detach();
                                    }
                                    self.selectors[positionIndex].$container.append(cloneElem);
                                    var newContentBox = self.selectors[positionIndex].$container[0].childNodes[1];
                                    self.selectors[positionIndex].$contentBox = angular.element(newContentBox);
                                },
                                popoverContainer: function popoverContainer(positionIndex) {var
                                    getPointer = CuiPopoverHelpers.getPointer,getPopoverMargins = CuiPopoverHelpers.getPopoverMargins,getContainerPaddings = CuiPopoverHelpers.getContainerPaddings;
                                    var opts = cuiPopoverConfig;
                                    var $container = $('<div class="cui-popover__container"></div>');
                                    var $pointer = getPointer(opts);

                                    // apply stylings to the container
                                    $container.css(getContainerPaddings(opts));
                                    self.selectors[positionIndex].$container = $container;
                                    self.selectors[positionIndex].$container[0].style.opacity = '0';

                                    // append the pointer to the container
                                    $container.append($pointer);
                                    self.selectors[positionIndex].$pointer = $pointer;

                                    // render the actual content of the popover
                                    cuiPopover.render.contentBox(positionIndex);

                                    angular.element(document.body).append($container);
                                    popoverTether[positionIndex] = new Tether(self.helpers.getTetherOptions($container, opts));

                                },
                                newHtml: function newHtml() {
                                    cuiPopover.render.contentBox(positionInUse);
                                } },

                            newMode: function newMode(_newMode) {var
                                getPointer = CuiPopoverHelpers.getPointer,getPopoverMargins = CuiPopoverHelpers.getPopoverMargins,getContainerPaddings = CuiPopoverHelpers.getContainerPaddings;
                                var opts = cuiPopoverConfig;
                                switch (_newMode) {
                                    case 'normal': // if we can show the popover in the current position
                                        if (self.selectors[positionInUse].$container[0].style.opacity === '0') {
                                            $timeout(function () {
                                                popoverTether[positionInUse].position();
                                                self.selectors[positionInUse].$container[0].style.opacity = '1';
                                            });
                                        }
                                        break;
                                    case 'try-another':
                                        self.tryAnotherPosition();
                                        break;}

                            },
                            tryAnotherPosition: function tryAnotherPosition() {
                                if (typeof trialPosition === 'undefined' && positionInUse === 0) trialPosition = 1;else
                                if (typeof trialPosition === 'undefined') trialPosition = 0;else
                                trialPosition++;

                                if (trialPosition === positionInUse) return;
                                if (trialPosition === positions.length) {
                                    trialPosition = undefined; // next tryAnotherPosition will try the first position in the array of positions provided
                                    return;
                                }

                                if (trialPosition === positions.length - 1) {// if we reached the last position
                                    if (positions[trialPosition] === 'hide') {// and none of them were able to show and 'hide' was passed as last fallback, hide element.
                                        if (self.selectors[positionInUse].$container[0].style.opacity === '0') self.selectors[positionInUse].$container[0].style.opacity = '1';
                                        trialPosition = undefined;
                                        return;
                                    }
                                }

                                if (typeof self.selectors[trialPosition] !== 'undefined') delete self.selectors[trialPosition];
                                self.selectors[trialPosition] = {};
                                var opts = positions[trialPosition];
                                self.config(opts);
                                self.render.popoverContainer(trialPosition);


                                if (!popoverTether[trialPosition].element.classList.contains('tether-out-of-bounds')) {// if the new element isn't OOB then use it.
                                    self.selectors[positionInUse].$container.detach();
                                    popoverTether[positionInUse].destroy();
                                    delete self.selectors[positionInUse];
                                    positionInUse = trialPosition;
                                    trialPosition = undefined;
                                    if (self.selectors[positionInUse].$container[0].style.opacity === '0') self.selectors[positionInUse].$container[0].style.opacity = '1';
                                } else
                                {// else just remove all references to it and this function will run again by itself
                                    self.selectors[trialPosition].$container.detach();
                                    popoverTether[trialPosition].destroy();
                                    delete self.selectors[trialPosition];
                                }

                            } };

                        cuiPopover.init();
                    } };

            } };

    }]);

    angular.module('cui-ng').
    directive('cuiResizeHandler', ['$cuiResizeHandler', '$window', function ($cuiResizeHandler, $window) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                showIf: '=',
                breakpoint: '=' },

            link: function link(scope, elem, attrs) {
                var elementHandler = function elementHandler(breakpoint) {
                    if (scope.breakpoint) {
                        if (attrs.hasOwnProperty('mobile') && $window.innerWidth < scope.breakpoint) scope.showIf = true;else
                        if (attrs.hasOwnProperty('desktop') && $window.innerWidth >= scope.breakpoint) scope.showIf = true;else
                        scope.showIf = false;
                    } else
                    {
                        if (attrs.hasOwnProperty('mobile') && $window.innerWidth < breakpoint) scope.showIf = true;else
                        if (attrs.hasOwnProperty('desktop') && $window.innerWidth >= breakpoint) scope.showIf = true;else
                        scope.showIf = false;
                    }
                    scope.$evalAsync(scope);
                };

                var getScreenState = function getScreenState(customBreakpoint) {
                    if (customBreakpoint) {
                        if ($window.innerWidth < customBreakpoint) return 'mobile';else
                        return 'desktop';
                    } else
                    {
                        if ($window.innerWidth < $cuiResizeHandler.breakpoint) return 'mobile';else
                        return 'desktop';
                    }
                };

                var getBreakpoint = function getBreakpoint() {
                    if (scope.breakpoint) return scope.breakpoint;else
                    return $cuiResizeHandler.breakpoint;
                };

                var resizeHandler = _.throttle(function () {
                    $cuiResizeHandler.callHandlers();
                }, 300);

                $cuiResizeHandler.setHandler(scope.$id, elementHandler, getBreakpoint());
                $cuiResizeHandler.callHandlers();
                $window.onresize = resizeHandler;

                scope.$on('$destroy', function () {
                    $cuiResizeHandler.destroyElement(scope.$id);
                });
            },
            template: '\n\t\t\t<div ng-if="showIf"><ng-transclude></ng-transclude></div>\n\t\t' };



    }]);


    angular.module('cui-ng').
    provider('$cuiResizeHandler', function () {var _this3 = this;

        var resizeProvider = {};
        var resizeHandlerFunctions = {};

        this.breakpoint = 700;

        this.setHandler = function (scopeId, handlerFunction, breakpoint) {
            resizeHandlerFunctions[scopeId] = {
                handler: handlerFunction,
                breakpoint: breakpoint };

        };

        this.getHandler = function (scopeId) {
            return resizeHandlerFunctions[scopeId];
        };

        this.callHandlers = function () {
            for (var key in resizeHandlerFunctions) {
                resizeHandlerFunctions[key].handler(resizeHandlerFunctions[key].breakpoint);
            }
        };

        this.destroyElement = function (scopeId) {
            delete resizeHandlerFunctions[scopeId];
        };

        this.setBreakpoint = function (breakpoint) {
            _this3.breakpoint = breakpoint;
        };

        this.getBreakpoint = function () {
            return _this3.breakpoint;
        };

        this.$get = function () {
            return _this3;
        };
    });


    angular.module('cui-ng').
    directive('cuiTable', ['$pagination', '$q', function ($pagination, $q) {return {
            restrict: 'E',
            transclude: true,
            scope: {
                cuiTableConfig: '=?' },

            link: function link(scope, iElem, iAttrs) {

                var initScope = function initScope() {
                    if (!scope.cuiTableConfig) scope.cuiTableConfig = {};

                    if (scope.cuiTableConfig.paginate) {
                        var requiredOptions = ['recordCount', 'pageSize', 'initialPage', 'onPageChange'];
                        try {
                            requiredOptions.forEach(function (requiredOption) {
                                if (scope.cuiTableConfig[requiredOption] == undefined) {
                                    throw new Error('Cui-table error : if pagination is enabled then cui-table-config must have .' + requiredOption);
                                }
                            });
                        }
                        catch (e) {
                            throw new Error(e);
                        }
                    }
                };

                try {
                    initScope();
                }
                catch (e) {
                    console.error(e);
                    return;
                }

                var initPageChangeHandler = function initPageChangeHandler() {
                    scope.cuiTableConfig.pageChangeHandler = function (page) {
                        scope.cuiTableConfig.onPageChange(page, scope.cuiTableConfig.pageSize);
                    };
                };

                var watchers = {
                    pageSize: scope.$watch('cuiTableConfig.pageSize', function (newPageSize, oldPageSize) {
                        if (!scope.cuiTableConfig.hasOwnProperty('pageChangeHandler')) initPageChangeHandler();
                        if (newPageSize && oldPageSize && newPageSize !== oldPageSize) {
                            scope.cuiTableConfig.pageChangeHandler(1);
                        }
                    }),
                    count: scope.$watch('cuiTableConfig.recordCount', function (newRecordCount, oldRecordCount) {
                        if (!scope.cuiTableConfig.hasOwnProperty('pageChangeHandler')) initPageChangeHandler();
                        if (newRecordCount && oldRecordCount && newRecordCount !== oldRecordCount) {
                            scope.cuiTableConfig.pageChangeHandler(1);
                            scope.cuiTableConfig.reRenderPaginate();
                        }
                    }) };


                scope.$on('$destroy', function () {
                    angular.forEach(watchers, function (cancelWatcher) {cancelWatcher();});
                });

            },
            template: '\n        <div>\n            <div class="cui-flex-table">\n                <ng-transclude></ng-transclude>\n            </div>\n            <div class="cui-paginate__container" ng-if="cuiTableConfig.paginate">\n                <span class="cui-paginate__results-label">\n                    {{\'cui-num-results-page\' | translate}}\n                </span>\n                <results-per-page class="cui-paginate__select" ng-model="cuiTableConfig.pageSize"></results-per-page>\n                <paginate class="cui-paginate"\n                    results-per-page="cuiTableConfig.pageSize"\n                    count="cuiTableConfig.recordCount"\n                    on-page-change="cuiTableConfig.pageChangeHandler"\n                    ng-model="cuiTableConfig.initalPage"\n                    attach-rerender-to="cuiTableConfig.reRenderPaginate">\n                </paginate>\n            </div>\n        </div>\n    ' };}]);






















    angular.module('cui-ng').
    directive('cuiTableHeader', ['$filter', function ($filter) {return {
            restrict: 'E',
            scope: {
                headers: '=',
                sorting: '=?',
                sortingCallbacks: '=?' },

            link: function link(scope) {
                if (scope.sortingCallbacks) {
                    scope.cuiTableHeader = {};
                    scope.headers.forEach(function (header) {
                        var translatedHeader = $filter('translate')(header).toLowerCase();
                        scope.cuiTableHeader[translatedHeader + 'Callback'] = scope.sortingCallbacks[translatedHeader] || angular.noop;
                    });
                    scope.cuiTableHeader.invertSortingDirection = function () {
                        if (scope.sorting.sortType === 'asc') {
                            scope.sorting.sortType = 'desc';
                            return 'desc';
                        } else
                        {
                            scope.sorting.sortType = 'asc';
                            return 'asc';
                        }
                    };
                }

                scope.headerCallbackHandler = function (header) {
                    var translatedHeader = $filter('translate')(header).toLowerCase();
                    if (scope.sorting && scope.sortingCallbacks) {
                        if (!scope.sorting.hasOwnProperty('sortType')) scope.sorting['sortType'] = 'asc';
                        if (scope.sorting.sortBy === translatedHeader) scope.cuiTableHeader.invertSortingDirection();
                        scope.cuiTableHeader[translatedHeader + 'Callback']();
                    }
                };

                scope.shouldShowCaret = function (header) {
                    if (scope.sorting && scope.sortingCallbacks) {
                        var translatedHeader = $filter('translate')(header).toLowerCase();
                        if (scope.sorting.sortBy === translatedHeader) return true;else
                        return false;
                    }
                };
            },
            template: '\n        <div class="cui-flex-table__th cui-flex-table__th--c">\n            <div class="cui-flex-table__avatar-col" ng-click="headerCallbackHandler(headers[0])">\n                <span class="cui-flex-table__th-container">\n                    {{headers[0] | translate}}\n                    <svg class="cui-flex-table__th-arrow"\n                        viewBox="0 0 216 146"\n                        ng-if="shouldShowCaret(headers[0])"\n                        ng-class="\'cui-flex-table__th-arrow--\' + sorting.sortType"\n                    >\n                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="node_modules/@covisint/cui-icons/dist/font-awesome/font-awesome-out.svg#arrowhead5" class="svg"></use>\n                    </svg>\n                </span>\n            </div>\n\n            <div class="cui-flex-table__mobile-stack">\n                <div class="cui-flex-table__left"></div>\n                <div ng-class="{\'cui-flex-table__middle\':$middle, \'cui-flex-table__right\':$last}" \n                    ng-repeat="header in headers" \n                    ng-click="headerCallbackHandler(header)"\n                    ng-if="!$first"\n                >\n                    {{header | translate}}\n                    <svg class="cui-flex-table__th-arrow" style="position:inherit"\n                        viewBox="0 0 216 146"\n                        ng-if="shouldShowCaret(header)"\n                        ng-class="\'cui-flex-table__th-arrow--\' + sorting.sortType">\n                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="node_modules/@covisint/cui-icons/dist/font-awesome/font-awesome-out.svg#arrowhead5" class="svg"></use>\n                    </svg>\n                </div>\n            </div>\n        </div>\n    ' };}]);



































    angular.module('cui-ng').
    directive('cuiTableRow', function () {return {
            restrict: 'E',
            transclude: true,
            template: '<ng-transclude></ng-transclude>' };});



    var defaults = {
        cuiTreeNest0Class: 'cui-tree--nesting-0',
        cuiTreeNestXClass: 'cui-tree--nested',
        cuiTreeLeafWrapper: '<div class="cui-tree__leaf"></div>',
        cuiTreeLastLeafClass: 'cui-tree__leaf--last',
        cuiTreeBranchWrapper: '<div class="cui-tree__branch"></div>',
        cuiTreeLastBranchClass: 'cui-tree__branch--last',
        cuiTreeNestPrefix: 'cui-tree--nesting-' };


    var cuiTreeHelpers = {
        getDisplayValue: function getDisplayValue(scope, opts, object) {var
            cuiTreeLeafDisplay = opts.cuiTreeLeafDisplay;
            var propertiesToDisplay = cuiTreeLeafDisplay.split('+');

            return scope.$eval(cuiTreeLeafDisplay, { object: object });
        },
        getClassListForNestingLevel: function getClassListForNestingLevel(opts, nesting) {var
            cuiTreeNestPrefix = opts.cuiTreeNestPrefix,cuiTreeNest0Class = opts.cuiTreeNest0Class,cuiTreeNestXClass = opts.cuiTreeNestXClass;
            var classList = [];
            switch (nesting) {
                case 0:
                    classList.push(cuiTreeNest0Class || defaults.cuiTreeNest0Class);
                    break;
                default:
                    classList.push((cuiTreeNestPrefix || defaults.cuiTreeNestPrefix) + nesting);
                    classList.push(cuiTreeNestXClass || defaults.cuiTreeNestXClass);}
            ;
            return classList;
        },
        getElements: function getElements(scope, opts, objects, leafClickCallback) {var nesting = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;var
            getElements = cuiTreeHelpers.getElements,getDisplayValue = cuiTreeHelpers.getDisplayValue,getClassListForNestingLevel = cuiTreeHelpers.getClassListForNestingLevel;var
            cuiTreeBranchWrapper = opts.cuiTreeBranchWrapper,cuiTreeLeafWrapper = opts.cuiTreeLeafWrapper,cuiTreeLastLeafClass = opts.cuiTreeLastLeafClass,cuiTreeLastBranchClass = opts.cuiTreeLastBranchClass;
            var $node = $('<div></div>');
            getClassListForNestingLevel(opts, nesting).forEach(function (className) {return $node[0].classList.add(className);});
            objects.forEach(function (object, i) {
                var $leafInner = $('<span>' + getDisplayValue(scope, opts, object) + '</span>');
                var $leafWrapper = $(cuiTreeLeafWrapper || defaults.cuiTreeLeafWrapper);
                if (leafClickCallback) $leafWrapper[0].addEventListener("click", function (e) {leafClickCallback(object, this, e);}, true);
                $leafWrapper.append($leafInner);
                if (i === objects.length - 1) $leafWrapper[0].classList.add(cuiTreeLastLeafClass || defaults.cuiTreeLastLeafClass); // add class to last leaf of each indent level.
                if (object.children) {// if it has children creat a new branch for the leaf and it's children
                    var $branchWrapper = $(cuiTreeBranchWrapper || defaults.cuiTreeBranchWrapper).append($leafWrapper);
                    if (i === objects.length - 1) $branchWrapper[0].classList.add(cuiTreeLastBranchClass || defaults.cuiTreeLastBranchClass);
                    $branchWrapper.append(getElements(scope, opts, object.children, leafClickCallback, nesting + 1)); // recursively gets the child nodes
                    $node.append($branchWrapper);
                } else
                {
                    $node.append($leafWrapper);
                }
            });
            return $node;
        } };


    var cuiTree = {
        pre: function pre(scope, elem, attrs) {
            var $tree = void 0;
            var leafClickCallback = scope.$eval(attrs.cuiTreeLeafClickCallback);

            var renderTree = function renderTree(tree) {
                if ($tree) {
                    $tree.detach();
                    $tree.children().unbind();
                }
                $tree = cuiTreeHelpers.getElements(scope, attrs, tree, leafClickCallback);
                elem.append($tree);
            };

            scope.$watch(function () {return scope.$eval(attrs.cuiTree);}, function (newTree) {
                if (newTree) renderTree(newTree);
            }, true);

            scope.$on('$destroy', function () {
                $tree.children().unbind();
            });
        } };


    angular.module('cui-ng').
    directive('cuiTree', [function () {
        return {
            restrict: 'A',
            scope: true,
            compile: function compile() {
                return cuiTree;
            } };

    }]);

    angular.module('cui-ng').
    directive('cuiWizardProto', ['$timeout', '$compile', '$window', '$rootScope', '$document',
    function ($timeout, $compile, $window, $rootScope, $document) {
        return {
            restrict: 'E',
            scope: true,
            link: function link(scope, elem, attrs) {
                var numberOfSteps, invalidForm, mobileStack, $steps, bar, $indicatorContainer, clickableIndicators, minimumPadding,
                snap, $body, $mobileSteps, $cuiExpandableTitle, $stepIndicatorContainer;

                var init = function init() {
                    invalidForm = [];
                    mobileStack = attrs.mobileStack !== undefined;
                    $steps = angular.element(elem[0].querySelectorAll('step'));
                    numberOfSteps = $steps.length;
                    bar = attrs.bar !== undefined && numberOfSteps !== 1;
                    $indicatorContainer = angular.element(elem[0].querySelector('indicator-container'));
                    $indicatorContainer.append('<div class="cui-steps"></div>');
                    $stepIndicatorContainer = angular.element($indicatorContainer[0].querySelector('.cui-steps'));
                    $window = angular.element($window);
                    scope.currentStep = Number(elem[0].attributes.step.value);
                    clickableIndicators = attrs.clickableIndicators;
                    minimumPadding = attrs.minimumPadding;
                    snap = angular.element(document.querySelector('snap-content'));
                    $body = angular.element('body');
                    scope.wizardFinished = false;
                    scope.next = function (state) {
                        if (state) scope.goToState(state);else
                        {
                            scope.currentStep++;
                            updateIndicators();
                            updateBar();
                            updateStep();
                        }
                        if (!scope.wizardFinished && scope.currentStep === numberOfSteps) scope.wizardFinished = true;
                        calculateWhereToScroll();
                    };
                    scope.previous = function (state) {
                        if (state) {
                            scope.goToState(state);
                        } else
                        {
                            scope.currentStep--;
                            updateIndicators();
                            updateBar();
                            updateStep();
                        }
                        calculateWhereToScroll();
                    };
                    scope.goToStep = function (step) {
                        if (step === scope.currentStep) return;
                        scope.currentStep = step;
                        updateIndicators();
                        updateBar();
                        updateStep();
                        calculateWhereToScroll();
                        if (!scope.wizardFinished && scope.currentStep === numberOfSteps) scope.wizardFinished = true;
                    };
                    scope.goToState = function (state) {
                        if (state === 'default') return;
                        $rootScope.$broadcast('stepChange', { state: state });
                    };
                    scope.nextWithErrorChecking = function (form, nextState) {
                        if (!form.$valid) {
                            angular.forEach(form.$error, function (field) {
                                angular.forEach(field, function (errorField) {
                                    errorField.$setTouched();
                                });
                            });
                            invalidForm[scope.currentStep] = true;
                        } else
                        {
                            invalidForm[scope.currentStep] = false;
                            calculateWhereToScroll();
                            if (nextState) {
                                scope.goToState(nextState);
                            } else
                            {scope.next();}
                        }
                    };
                    if (isNaN(scope.currentStep)) scope.currentStep = 1; // check if step is not a number, only runs once
                    else if (scope.currentStep > numberOfSteps) scope.currentStep = numberOfSteps;else
                        if (scope.currentStep < 1) scope.currentStep = 1;
                    createIndicators();
                    createBar();
                    if (mobileStack) createMobileStack();
                    if (bar) updateBar();
                    updateIndicators();
                    makeSureTheresRoom();
                    watchForWindowResize();
                    listenForLanguageChange();
                    observeStepAttr();
                },
                // creates indicators inside of <indicator-container>
                createIndicators = function createIndicators() {
                    var stepTitles = [],
                    stepIcons = [];
                    scope.defaultString = 'default';
                    scope.stepStates = [];
                    for (var i = 0; i < numberOfSteps; i++) {
                        stepTitles[i] = $steps[i].attributes.title.value;
                        if ($steps[i].attributes.state) {
                            scope.stepStates[i] = '' + $steps[i].attributes.state.value + '';
                        }
                        if ($steps[i].attributes.icon) {
                            stepIcons[i] = '' + $steps[i].attributes.icon.value + '';
                        }
                    }
                    scope.icons = [];
                    stepTitles.forEach(function (e, i) {
                        var div;
                        if (stepIcons[i] !== undefined) {
                            if (stepIcons[i].indexOf('.') > -1) {
                                scope.icons[i] = '<div class="icon-container"><div class="icon"><img src="' + stepIcons[i] + '" class="cui-icon-rotate"/></div></div>';
                            } else
                            {
                                scope.icons[i] = '<div class="icon-container"><div class="icon"><cui-icon cui-svg-icon="' + stepIcons[i] + '" svg-class="cui-icon-rotate"></cui-icon></div></div>'; // adding svg-class for now until new wizard is out.
                            }
                        }
                        if (clickableIndicators !== undefined && scope.icons[i] !== undefined) {
                            div = angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-' + i + '" ng-click="goToStep(' + (
                            i + 1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' +
                            stepTitles[i] + scope.icons[i] + '</span>');
                            div[0].style.cursor = 'pointer';
                        } else
                        if (clickableIndicators !== undefined && !scope.icons[i]) {
                            div = angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-' + i + '" ng-click="goToStep(' + (
                            i + 1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' +
                            stepTitles[i] + '</span>');
                            div[0].style.cursor = 'pointer';
                        } else
                        {
                            div = angular.element('<span class="step-indicator" id="cui-wizard-ref-pointer-' + i + '">' + stepTitles[i] + (
                            scope.icons[i] ? scope.icons[i] : '') +
                            '</span>');
                        }
                        var compiled = $compile(div)(scope);
                        $stepIndicatorContainer.append(compiled);
                    });
                    scope.$indicators = angular.element(elem[0].querySelectorAll('.step-indicator'));
                },
                createBar = function createBar() {
                    //create a bar
                    if (bar) {
                        angular.element($indicatorContainer).append('<div class="steps-bar"></div>');
                        scope.$bar = $('.steps-bar');
                        scope.$bar[0].innerHTML = '<div class="steps-bar-fill"></div>';
                        scope.$barFill = $('.steps-bar-fill');
                    }
                },
                // updates the current active indicator. Removes active class from other elements.
                updateIndicators = function updateIndicators() {
                    $timeout(function () {
                        for (var i = 0; i < $steps.length; i++) {
                            $steps[i].classList.remove('active');
                            scope.$indicators[i].classList.remove('active');
                            if (mobileStack) {$mobileSteps[i].classList.remove('expanded');}
                            if (i < scope.currentStep - 1) {
                                scope.$indicators[i].classList.add('visited');
                                if (mobileStack) {$mobileSteps[i].classList.add('visited');}
                            } else
                            {
                                scope.$indicators[i].classList.remove('visited');
                                if (mobileStack) {$mobileSteps[i].classList.remove('visited');}
                            }
                        }
                        $steps[scope.currentStep - 1].classList.add('active');
                        scope.$indicators[scope.currentStep - 1].classList.add('active');
                        if (mobileStack) {$mobileSteps[scope.currentStep - 1].classList.add('expanded');}
                    });
                },
                updateBar = function updateBar() {
                    if (!bar) return;
                    $timeout(function () {
                        scope.$bar[0].style.left = scope.$indicators[0].scrollWidth / 2 + 'px';
                        scope.$bar[0].style.right = scope.$indicators[scope.$indicators.length - 1].scrollWidth / 2 + 'px';
                        if (scope.currentStep == 1) {
                            scope.$barFill[0].style.width = '0px';
                        } else
                        {
                            scope.$barFill[0].style.width = scope.$indicators[scope.currentStep - 1].offsetLeft - scope.$indicators[0].scrollWidth / 2 +
                            scope.$indicators[scope.currentStep - 1].scrollWidth / 2 + 'px';
                        }
                    });
                },
                createMobileStack = function createMobileStack() {
                    angular.forEach($steps, function (step, i) {
                        var ngIncludeSrc;
                        if (step.innerHTML.indexOf('<!-- ngInclude:') > -1) {
                            ngIncludeSrc = step.innerHTML.split('<!-- ngInclude:')[1].split(' -->')[0];
                        }
                        step.classList.add('desktop-element');
                        var newElement = $compile(
                        '<cui-expandable class="cui-expandable mobile-element">' +
                        '<cui-expandable-title class="cui-expandable__title"' + (
                        clickableIndicators !== undefined ? 'ng-click="goToStep(' + (
                        i + 1) + ');goToState(\'' + (scope.stepStates[i] || scope.defaultString) + '\')">' : '>') + (
                        scope.icons[i] ? scope.icons[i] : '') + '<span>' + step.title + '</span></cui-expandable-title>' +
                        '<cui-expandable-body class="cui-expandable__body">' + (
                        ngIncludeSrc ? '<div ng-include="' + ngIncludeSrc + '"></div>' : step.innerHTML) + '</cui-expandable-body>' +
                        '</cui-expandable>')(scope);
                        angular.element(elem[0]).append(newElement);
                    });
                    $mobileSteps = angular.element(elem[0].querySelectorAll('cui-expandable.mobile-element'));
                },
                debounce = function debounce(func, wait, immediate) {
                    var timeout;
                    return function () {
                        var context = this,args = arguments;
                        var later = function later() {
                            timeout = null;
                            if (!immediate) {func.apply(context, args);}
                        };
                        var callNow = immediate && !timeout;
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                        if (callNow) func.apply(context, args);
                    };
                },
                getIndicatorsWidth = function getIndicatorsWidth() {
                    var totalWidth = 0;
                    for (var i = 0; i < numberOfSteps; i++) {
                        totalWidth += scope.$indicators[i].scrollWidth;
                    }
                    //adds the minimum padding between the steps.
                    return totalWidth + (Number(minimumPadding) || 0) * (numberOfSteps - 1);
                },
                getIndicatorContainerWidth = function getIndicatorContainerWidth() {
                    return $indicatorContainer[0].clientWidth;
                },
                onlyShowCurrentIndicator = function onlyShowCurrentIndicator() {
                    $indicatorContainer[0].classList.add('small');
                    updateBar();
                },
                showAllIndicators = function showAllIndicators() {
                    $indicatorContainer[0].classList.remove('small');
                    updateBar();
                },
                //makes sure there's still room for the step indicators, has a debounce on it so it
                //doesn't fire too often.
                makeSureTheresRoom = debounce(function () {
                    updateBar();
                    var indicatorsWidth = getIndicatorsWidth();
                    var indicatorContainerWidth = getIndicatorContainerWidth();
                    if (indicatorContainerWidth < indicatorsWidth &&
                    indicatorContainerWidth < Math.max(scope.indicatorsWidth || 0, indicatorsWidth)) {
                        scope.indicatorsWidth = indicatorsWidth;
                        onlyShowCurrentIndicator();
                    } else
                    if (indicatorContainerWidth > scope.indicatorsWidth) {
                        showAllIndicators();
                    }
                }, 40),
                watchForWindowResize = function watchForWindowResize() {
                    $window.bind('resize', function () {
                        makeSureTheresRoom();
                    });
                },
                listenForLanguageChange = function listenForLanguageChange() {
                    scope.$on('languageChange', function () {
                        showAllIndicators();
                        makeSureTheresRoom();
                    });
                },
                calculateWhereToScroll = function calculateWhereToScroll() {
                    var wizardOffset;
                    $cuiExpandableTitle = angular.element(elem[0].querySelector('cui-expandable.mobile-element>cui-expandable-title'));
                    if ($cuiExpandableTitle.length !== 0) {
                        var titleHeight = $cuiExpandableTitle[0].clientHeight;
                    } else
                    var titleHeight = 0;
                    if (snap.length !== 0) {
                        var snapOffset = snap.scrollTop();
                        wizardOffset = elem[0].getBoundingClientRect().top;
                        scrollTo(snapOffset + wizardOffset + titleHeight * (scope.currentStep - 1));
                    } else
                    {
                        var bodyOffset = $body.scrollTop();
                        wizardOffset = elem[0].getBoundingClientRect().top;
                        scrollTo(bodyOffset + wizardOffset + titleHeight * (scope.currentStep - 1));
                    }
                },
                scrollTo = function scrollTo(position) {
                    if (snap.length !== 0) snap.animate({ scrollTop: position }, 300, 'linear');else
                    $body.animate({ scrollTop: position }, 300, 'linear');
                },
                updateStep = function updateStep() {
                    attrs.$set('step', scope.currentStep);
                },
                observeStepAttr = function observeStepAttr() {
                    attrs.$observe('step', function (newStep) {
                        if (isNaN(newStep)) {
                            scope.currentStep = 1;
                        } else
                        if (newStep > numberOfSteps) {
                            scope.currentStep = numberOfSteps;
                        } else
                        if (newStep < 1) {
                            scope.currentStep = 1;
                        } else
                        {
                            scope.currentStep = newStep;
                        }
                        updateIndicators();
                    });
                };
                init();
            } };

    }]);

    angular.module('cui-ng').
    directive('cuiWizard', ['$timeout', '$compile', '$window', '$rootScope', function ($timeout, $compile, $window, $rootScope) {
        return {
            restrict: 'E',
            scope: true,
            link: function link(scope, elem, attrs) {
                var cuiWizard = {
                    initScope: function initScope() {
                        Object.keys(cuiWizard.scope).forEach(function (property) {
                            scope[property] = cuiWizard.scope[property];
                        });
                    },
                    config: {
                        bar: attrs.bar !== undefined,
                        clickableIndicators: attrs.clickableIndicators !== undefined,
                        dirtyValidation: attrs.dirtyValidation !== undefined,
                        minimumPadding: attrs.minimumPadding || 0,
                        mobileStack: attrs.mobileStack !== undefined,
                        mobileStackBreakingPoint: parseInt(attrs.mobileStack) },

                    selectors: {
                        $wizard: angular.element(elem[0]),
                        $steps: angular.element(elem[0].querySelectorAll('step')),
                        $indicatorContainer: angular.element(elem[0].querySelectorAll('indicator-container')),
                        $window: angular.element($window),
                        $body: angular.element('body') },

                    helpers: {
                        isFormValid: function isFormValid(form) {
                            // Custom dirty-validation behavior
                            if (cuiWizard.config.dirtyValidation && !form.$valid) {
                                cuiWizard.helpers.setErrorFieldsToDirty(form);
                                return false;
                            }
                            // Default behavior
                            else if (!form.$valid) {
                                    cuiWizard.helpers.setErrorFieldsToTouched(form);
                                    return false;
                                }
                            return true;
                        },
                        setErrorFieldsToDirty: function setErrorFieldsToDirty(form) {
                            angular.forEach(form.$error, function (field) {
                                angular.forEach(field, function (errorField) {
                                    errorField.$setDirty();
                                });
                            });
                        },
                        setErrorFieldsToTouched: function setErrorFieldsToTouched(form) {
                            angular.forEach(form.$error, function (field) {
                                angular.forEach(field, function (errorField) {
                                    errorField.$setTouched();
                                });
                            });
                        },
                        getStepInfo: function getStepInfo(step) {// step goes from 0 to numberOfSteps
                            var $step = cuiWizard.selectors.$steps[step];
                            return {
                                stepTitle: $step.attributes['step-title'].value,
                                icon: $step.attributes.icon ? $step.attributes.icon.value : false,
                                state: $step.attributes.state ? $step.attributes.state.value : false };

                        },
                        getIconMarkup: function getIconMarkup(icon) {
                            if (!icon) return '';
                            var iconMarkup = void 0;
                            switch (icon.indexOf('.')) {
                                case -1:
                                    iconMarkup = '<cui-icon cui-svg-icon="' + icon + '" svg-class="icon-svg"></cui-icon>';
                                    break;
                                default:
                                    iconMarkup = '<img src="' + icon + '" class="cui-icon-rotate"/>';}
                            ;

                            return '<div class="icon-container">\n                                    <div class="icon">\n                                        ' +

                            iconMarkup + '\n                                    </div>\n                                </div>';


                        },
                        getNgClickForIndicator: function getNgClickForIndicator(stepNumber, stepState) {// stepNUmber from 0 to numberOfSteps
                            if (!cuiWizard.config.clickableIndicators) return '';else
                            return 'ng-click="goToStep(' + (stepNumber + 1) + (',' + stepState || '') + ')"';
                        },
                        getIndicatorMarkup: function getIndicatorMarkup(stepNumber) {// stepNUmber from 0 to numberOfSteps
                            var step = cuiWizard.helpers.getStepInfo(stepNumber);
                            var indicatorClass = void 0;
                            stepNumber + 1 === cuiWizard.scope.currentStep ? indicatorClass = 'active' : stepNumber + 1 < cuiWizard.scope.currentStep ? indicatorClass = 'visited' : indicatorClass = '';
                            return '<span class="step-indicator ' + indicatorClass + '" ' + cuiWizard.helpers.getNgClickForIndicator(stepNumber, step.state) + '>\n                                    <span class="step-indicator__title">' +
                            step.stepTitle + '</span> ' + cuiWizard.helpers.getIconMarkup(step.icon) + '\n                                </span>';

                        },
                        getIndicatorsWidth: function getIndicatorsWidth() {
                            var totalWidth = 0;
                            cuiWizard.selectors.$indicators.each(function (i, indicator) {
                                totalWidth += $(indicator).width();
                            });
                            return totalWidth;
                        },
                        thereIsRoomForIndicators: function thereIsRoomForIndicators() {
                            if (cuiWizard.helpers.getIndicatorsWidth() + cuiWizard.config.minimumPadding * (cuiWizard.config.numberOfSteps - 1) <
                            cuiWizard.selectors.$indicatorContainer.width()) return true;
                            return false;
                        },
                        debounce: function debounce(func, wait, immediate) {
                            var timeout = void 0;
                            return function () {
                                var context = this,args = arguments;
                                var later = function later() {
                                    timeout = null;
                                    if (!immediate) {func.apply(context, args);}
                                };
                                var callNow = immediate && !timeout;
                                clearTimeout(timeout);
                                timeout = setTimeout(later, wait);
                                if (callNow) func.apply(context, args);
                            };
                        },
                        resizeHandler: function resizeHandler() {
                            cuiWizard.helpers.debounce(function () {
                                if (cuiWizard.config.bar) cuiWizard.reRender.bar(cuiWizard.scope.currentStep);
                                if (cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                    cuiWizard.config.stepsCollapsed = false;
                                    cuiWizard.selectors.$indicatorContainer.removeClass('small');
                                } else
                                if (!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                    cuiWizard.config.stepsCollapsed = true;
                                    cuiWizard.selectors.$indicatorContainer.addClass('small');
                                }
                                if (cuiWizard.config.mobileStack && cuiWizard.selectors.$window.width() <= cuiWizard.config.mobileStackBreakingPoint && !cuiWizard.config.mobileMode) {
                                    cuiWizard.selectors.$expandables.forEach(function (expandable, e) {
                                        expandable.attr('transition-speed', 300);
                                        expandable.addClass('mobile-element');
                                    });
                                    cuiWizard.config.mobileMode = true;
                                } else
                                if (cuiWizard.config.mobileStack && cuiWizard.selectors.$window.width() > cuiWizard.config.mobileStackBreakingPoint && cuiWizard.config.mobileMode) {
                                    cuiWizard.selectors.$expandables.forEach(function (expandable, e) {
                                        expandable.attr('transition-speed', 0);
                                        expandable.removeClass('mobile-element');
                                    });
                                    cuiWizard.config.mobileMode = false;
                                }
                            }, 200)();
                        },
                        scrollToStep: function scrollToStep(newStep) {
                            var firstExpandableTitle = angular.element(cuiWizard.selectors.$expandables[0].children()[0]);
                            var firstExpandableOffset = firstExpandableTitle.offset();
                            var titleHeight = firstExpandableTitle[0].scrollHeight;
                            cuiWizard.selectors.$body.animate({ scrollTop: firstExpandableOffset.top + titleHeight * (newStep - 1) }, 300, 'linear');
                        } },

                    scope: {
                        currentStep: Number(elem[0].attributes.step.value),
                        wizardFinished: false,
                        next: function next(state) {// state is optional
                            if (state) cuiWizard.scope.goToState(state);else
                            cuiWizard.update(cuiWizard.scope.currentStep + 1);
                        },
                        nextWithErrorChecking: function nextWithErrorChecking(form, state) {
                            if (cuiWizard.helpers.isFormValid(form)) cuiWizard.scope.next(state);
                        },
                        previous: function previous(state) {
                            if (state) cuiWizard.scope.goToSate(state);else
                            cuiWizard.update(cuiWizard.scope.currentStep - 1);
                        },
                        goToStep: function goToStep(newStep, state) {
                            if (newStep === cuiWizard.scope.currentStep) return;
                            if (state) cuiWizard.scope.goToState(state);
                            cuiWizard.update(newStep);
                        },
                        goToState: function goToState(state) {
                            $rootScope.$broadcast('stepChange', { state: state, element: elem });
                        } },

                    watchers: {
                        init: function init() {
                            cuiWizard.watchers.windowResize();
                            cuiWizard.watchers.languageChange();
                        },
                        windowResize: function windowResize() {
                            cuiWizard.selectors.$window.bind('resize', cuiWizard.helpers.resizeHandler);
                        },
                        languageChange: function languageChange() {
                            scope.$on('languageChange', function () {
                                if (cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                    cuiWizard.config.stepsCollapsed = false;
                                    cuiWizard.selectors.$indicatorContainer.removeClass('small');
                                } else
                                if (!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                    cuiWizard.config.stepsCollapsed = true;
                                    cuiWizard.selectors.$indicatorContainer.addClass('small');
                                }
                                if (cuiWizard.config.bar) cuiWizard.reRender.bar(cuiWizard.scope.currentStep);
                            });
                        } },

                    render: {
                        indicators: function indicators() {
                            cuiWizard.selectors.$indicatorContainer.append('<div class="cui-steps"></div>');
                            cuiWizard.selectors.$stepIndicatorContainer = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.cui-steps'));
                            cuiWizard.selectors.$steps.each(function (i, step) {
                                var indicator = angular.element(cuiWizard.helpers.getIndicatorMarkup(i)),
                                compiledIndicator = $compile(indicator)(scope);
                                cuiWizard.selectors.$stepIndicatorContainer.append(compiledIndicator);
                            });
                            cuiWizard.selectors.$indicators = angular.element(cuiWizard.selectors.$stepIndicatorContainer[0].querySelectorAll('.step-indicator'));
                            cuiWizard.config.numberOfSteps = cuiWizard.selectors.$indicators.length;
                        },
                        bar: function bar() {
                            $timeout(function () {
                                cuiWizard.selectors.$indicatorContainer.append('<div class="steps-bar"><div class="steps-bar-fill"></div></div>');
                                cuiWizard.selectors.$bar = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.steps-bar'));
                                cuiWizard.selectors.$barFill = angular.element(cuiWizard.selectors.$indicatorContainer[0].querySelector('.steps-bar-fill'));
                                cuiWizard.selectors.$bar[0].style.left = cuiWizard.selectors.$indicators[0].scrollWidth / 2 + 'px'; // bar starts at the center point of the 1st inicator
                                cuiWizard.selectors.$bar[0].style.right = cuiWizard.selectors.$indicators[cuiWizard.config.numberOfSteps - 1].scrollWidth / 2 + 'px'; // ends at center of last indicator
                                if (cuiWizard.scope.currentStep === 1) cuiWizard.selectors.$barFill[0].style.width = '0px';else
                                {
                                    cuiWizard.selectors.$barFill[0].style.width = cuiWizard.selectors.$indicators[cuiWizard.scope.currentStep - 1].offsetLeft - cuiWizard.selectors.$indicators[0].scrollWidth / 2 + cuiWizard.selectors.$indicators[cuiWizard.scope.currentStep - 1].scrollWidth / 2 + 'px';
                                }
                            });
                        },
                        steps: function steps() {
                            if (!cuiWizard.config.mobileStack) return;
                            cuiWizard.selectors.$expandables = [];
                            cuiWizard.selectors.$steps.each(function (i, step) {
                                var stepInfo = cuiWizard.helpers.getStepInfo(i);
                                var expandableClass = '';
                                if (cuiWizard.scope.currentStep === i + 1) {
                                    $(step).addClass('active');
                                    expandableClass = 'expanded';
                                }
                                var expandable = $($compile( // compile a new expandable
                                '<cui-expandable class="cui-expandable cui-expandable--wizard ' + expandableClass + '" transition-speed="0">\n                                    <cui-expandable-title class="cui-expandable__title cui-expandable__title--wizard">\n                                        ' +

                                cuiWizard.helpers.getIndicatorMarkup(i) + '\n                                    </cui-expandable-title>\n                                    <cui-expandable-body class="cui-expandable__body cui-expandable__body--wizard"></cui-expandable-body>\n                                </cui-expandable>')(



                                scope));
                                expandable.insertBefore(step);
                                $(step).detach().appendTo(expandable.children()[1]);
                                cuiWizard.selectors.$expandables.push($(step).parent().parent());
                            });
                        } },

                    reRender: {
                        indicators: function indicators(newStep, oldStep) {// newStep goes from 1 to numberOfSteps+1
                            cuiWizard.selectors.$indicators.each(function (i, indicator) {
                                if (i + 1 < newStep) $(indicator).addClass('visited');else
                                $(indicator).removeClass('visited');
                            });
                            cuiWizard.selectors.$indicators[oldStep - 1].classList.remove('active');
                            cuiWizard.selectors.$indicators[newStep - 1].classList.add('active');
                        },
                        steps: function steps(newStep, oldStep) {
                            cuiWizard.selectors.$expandables.forEach(function (expandable, i) {
                                if (i + 1 < newStep) expandable.addClass('visited');else
                                expandable.removeClass('visited');
                            });
                            cuiWizard.selectors.$steps[oldStep - 1].classList.remove('active');
                            cuiWizard.selectors.$steps[newStep - 1].classList.add('active');
                            cuiWizard.selectors.$expandables[oldStep - 1].removeClass('expanded');
                            cuiWizard.selectors.$expandables[newStep - 1].addClass('expanded');
                            cuiWizard.selectors.$expandables[oldStep - 1][0].querySelector('.step-indicator').classList.remove('active');
                            cuiWizard.selectors.$expandables[newStep - 1][0].querySelector('.step-indicator').classList.add('active');
                        },
                        indicatorContainer: function indicatorContainer() {
                            if (cuiWizard.helpers.thereIsRoomForIndicators() && cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed = false;
                                cuiWizard.selectors.$indicatorContainer.removeClass('small');
                            } else
                            if (!cuiWizard.helpers.thereIsRoomForIndicators() && !cuiWizard.config.stepsCollapsed) {
                                cuiWizard.config.stepsCollapsed = true;
                                cuiWizard.selectors.$indicatorContainer.addClass('small');
                            }
                        },
                        bar: function bar(newStep) {
                            if (newStep === 1) cuiWizard.selectors.$barFill[0].style.width = '0px';else
                            {
                                cuiWizard.selectors.$barFill[0].style.width = cuiWizard.selectors.$indicators[newStep - 1].offsetLeft - cuiWizard.selectors.$indicators[0].scrollWidth / 2 + cuiWizard.selectors.$indicators[newStep - 1].scrollWidth / 2 + 'px';
                            }
                        } },

                    update: function update(newStep, oldStep) {
                        if (cuiWizard.config.mobileMode) cuiWizard.helpers.scrollToStep(newStep);
                        cuiWizard.reRender.indicators(newStep, cuiWizard.scope.currentStep);
                        if (cuiWizard.config.mobileStack) cuiWizard.reRender.steps(newStep, cuiWizard.scope.currentStep);
                        if (cuiWizard.config.bar) cuiWizard.reRender.bar(newStep);
                        scope.currentStep = cuiWizard.scope.currentStep = newStep;
                        if (newStep === cuiWizard.config.numberOfSteps) scope.wizardFinished = cuiWizard.scope.wizardFinished = true;
                        attrs.$set('step', newStep);
                    } };

                cuiWizard.initScope();
                cuiWizard.render.indicators();
                if (cuiWizard.config.bar) cuiWizard.render.bar();
                cuiWizard.render.steps();
                cuiWizard.watchers.init();
                cuiWizard.selectors.$window.resize();
            } };

    }]);

    angular.module('cui-ng').
    directive('customError', ['$q', function ($q) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                customError: '=',
                customErrorLoading: '=?' },

            link: function link(scope, attrs, ele, ctrl) {
                var promises = {};

                scope.$watch(function () {return ctrl.$modelValue;}, function (newValue, oldValue) {
                    angular.forEach(scope.customError, function (checkFunction, errorName) {
                        var checkFunctionReturn = checkFunction(newValue);

                        if (typeof checkFunctionReturn === 'boolean') {
                            ctrl.$setValidity(errorName, checkFunctionReturn);
                        } else
                        {
                            scope.customErrorLoading = true;

                            if (!promises[errorName]) promises[errorName] = [checkFunctionReturn.promise];else
                            promises[errorName].push(checkFunctionReturn.promise);

                            $q.all(promises[errorName]).then(function (res) {
                                ctrl.$setValidity(errorName, checkFunctionReturn.valid(res[promises[errorName].length - 1]));
                                scope.customErrorLoading = false;
                            },
                            function (err) {
                                checkFunctionReturn.catch && checkFunctionReturn.catch(err);
                                scope.customErrorLoading = false;
                            });
                        }
                    });
                }, function (newValue, oldValue) {return newValue !== oldValue;});
            } };

    }]);


    angular.module('cui-ng').
    directive('focusIf', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function link(scope, elem, attrs) {
                var element = elem[0];

                var focus = function focus(condition) {
                    if (condition) {
                        $timeout(function () {
                            element.focus();
                        }, scope.$eval(attrs.focusDelay) || 0);
                    }
                };

                if (attrs.focusIf) {
                    scope.$watch(attrs.focusIf, focus);
                } else {
                    focus(true);
                }
            } };

    }]);

    angular.module('cui-ng').
    directive('inlineEdit', ['$compile', '$timeout', '$filter', function ($compile, $timeout, $filter) {
        return {
            restrict: 'E',
            scope: {
                model: '=',
                type: '@',
                options: '=',
                display: '=',
                localData: '=',
                saveCallback: '&onSave',
                tempEditCallback: '&onEdit',
                hideSaveButton: '=hideSaveIf' },

            link: function link(scope, ele, attrs) {
                var inlineEdit = {
                    init: function init() {
                        angular.forEach(inlineEdit.scope, function (initScope) {
                            initScope();
                        });
                    },
                    config: {
                        valueClass: attrs.valueClass || "cui-field-val__val",
                        inputClass: attrs.inputClass || "cui-field-val__val",
                        labelClass: attrs.labelClass || "cui-field-val__field",
                        wrapperClass: attrs.wrapperClass || "cui-field-val" },

                    scope: {
                        init: function init() {
                            scope.edit = false;
                            scope.focus = false;
                        },
                        functions: function functions() {
                            scope.toggleEdit = function () {
                                scope.focus = scope.edit = !scope.edit;
                                if (scope.tempEditCallback) scope.editChangeCallback(scope.edit);
                            };
                            scope.matchModels = function () {
                                scope.editInput = scope.model;
                            };
                            scope.saveInput = function () {
                                scope.model = scope.editInput;
                                if (scope.saveCallback()) {
                                    $timeout(function () {
                                        scope.saveCallback()();
                                    });
                                }
                                inlineEdit.helpers.setDisplayValue();
                            };
                            scope.parseKeyCode = function (e) {
                                switch (event.which) {
                                    case 13:
                                        scope.saveInput();
                                        scope.toggleEdit();
                                        break;
                                    case 27:
                                        scope.toggleEdit();
                                        break;}

                            };
                            scope.editChangeCallback = function (editMode) {
                                if (editMode === false) {
                                    scope.tempEditCallback() && scope.tempEditCallback()(undefined);
                                    return;
                                }
                                scope.tempEditCallback() && scope.tempEditCallback()(scope.editInput);
                            };
                        },
                        watchers: function watchers() {
                            scope.$watch('display', inlineEdit.helpers.setDisplayValue);
                            scope.$watch('model', inlineEdit.helpers.setDisplayValue);
                        } },


                    helpers: {
                        getLabel: function getLabel() {
                            var label = void 0;
                            if (attrs.label !== undefined) return '{{\'' + attrs.label + '\'| translate}}';else
                            if (attrs.name !== undefined) return attrs.name;else
                            throw new Error('Inline-edit needs 1 of the following attributes: label or name.');
                        },
                        getInput: function getInput() {
                            attrs.type = attrs.type || 'text';
                            switch (attrs.type) {
                                case 'dropdown':
                                    return '<select ng-model="$parent.editInput" class="' + inlineEdit.config.inputClass + '" ng-init="matchModels()" ng-options="' + attrs.optionsExpression + '"\n                  ng-if="edit" ng-change="editChangeCallback()"></select>';

                                case 'auto-complete':
                                    return '<div auto-complete selected-object="$parent.editInput" local-data="localData" search-fields="' + attrs.searchFields + '"\n                  title-field="' +
                                    attrs.titleField + '" input-class="' + inlineEdit.config.inputClass + '" match-class="highlight" ng-init="matchModels()" auto-match="true"\n                  ng-if="edit" ng-keypress="parseKeyCode($event)" initial-value="$parent.editInput.title" input-changed="editChangeCallback()"></div>';

                                default:
                                    return '<input type="' + attrs.type + '" ng-model="$parent.editInput" class="' + inlineEdit.config.inputClass + '"\n                  ng-init="matchModels()" ng-if="edit" ng-keyup="parseKeyCode($event)" focus-if="focus" ng-change="editChangeCallback()"/>';}



                        },
                        setDisplayValue: function setDisplayValue() {
                            if (attrs.type === "password") {
                                scope.displayValue = Array(scope.model ? scope.model.length + 1 : 0).join('•');
                            } else
                            scope.displayValue = scope.display || scope.model;
                        } },

                    render: function render() {
                        var element = $compile('<div class="' +
                        inlineEdit.config.wrapperClass + '">\n                <span class="' +
                        inlineEdit.config.labelClass + '">' + inlineEdit.helpers.getLabel() + '</span>\n                <span ng-if="!edit" class="' +
                        inlineEdit.config.valueClass + '">{{displayValue}}</span>' + inlineEdit.helpers.getInput() + '\n            </div>\n            <span class="cui-link" ng-click="toggleEdit()" ng-if="!edit">{{"cui-edit" | translate}}</span>\n            <span class="cui-link" ng-if="edit && !hideSaveButton" ng-click="saveInput();toggleEdit();">{{"cui-update" | translate}}</span>\n            <span class="cui-link" ng-if="edit" ng-click="toggleEdit()">{{"cui-cancel" | translate}}</span>')(




                        scope);
                        angular.element(ele[0]).html(element);
                    } };

                inlineEdit.init();
                inlineEdit.render();
            } };

    }]);



    angular.module('cui-ng').
    directive('match', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function link(scope, element, attrs, ctrl) {
                var checkIfMatch = function checkIfMatch(values) {
                    ctrl.$setValidity('match', values[0] === (values[1] || ''));
                };

                scope.$watch(function () {return [scope.$eval(attrs.match), ctrl.$viewValue];}, checkIfMatch, function (newValues, oldValues) {return !angular.equals(newValues, oldValues);});
            } };

    }]);

    angular.module('cui-ng').
    directive('offClickFilter', ['OffClickFilterCache', '$parse', function (OffClickFilterCache, $parse) {
        var filters = void 0;

        return {
            restrict: 'A',
            compile: function compile(elem, attrs) {
                return function (scope, element) {
                    filters = $parse(attrs.offClickFilter)(scope).split(',').map(function (x) {return x.trim();});

                    filters.forEach(function (filter) {
                        OffClickFilterCache[filter] ? OffClickFilterCache[filter].push(element[0]) : OffClickFilterCache[filter] = [element[0]];
                    });

                    scope.$on('$destroy', function () {
                        filters.forEach(function (filter) {
                            if (OffClickFilterCache[filter].length > 1) {
                                OffClickFilterCache[filter].splice(OffClickFilterCache[filter].indexOf(element[0]), 1);
                            } else
                            {
                                OffClickFilterCache[filter] = null;
                                delete OffClickFilterCache[filter];
                            }
                        });
                        element = null;
                    });
                };
            } };

    }]);

    angular.module('cui-ng').
    directive('offClick', ['$rootScope', '$parse', 'OffClickFilterCache', function ($rootScope, $parse, OffClickFilterCache) {
        var id = 0;
        var listeners = {};
        // add variable to detect touch users moving..
        var touchMove = false;

        var targetInFilter = function targetInFilter(target, elms) {
            if (!target || !elms) return false;
            var elmsLen = elms.length;
            for (var i = 0; i < elmsLen; ++i) {
                var currentElem = elms[i];
                var containsTarget = false;
                try {
                    containsTarget = currentElem.contains(target);
                } catch (e) {
                    // If the node is not an Element (e.g., an SVGElement) node.contains() throws Exception in IE,
                    // see https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
                    // In this case we use compareDocumentPosition() instead.
                    if (typeof currentElem.compareDocumentPosition !== 'undefined') {
                        containsTarget = currentElem === target || Boolean(currentElem.compareDocumentPosition(target) & 16);
                    }
                }

                if (containsTarget) {
                    return true;
                }
            }
            return false;
        };

        var offClickEventHandler = function offClickEventHandler(event) {
            // If event is a touchmove adjust touchMove state
            if (event.type === 'touchmove') {
                touchMove = true;
                // And end function
                return false;
            }
            // This will always fire on the touchend after the touchmove runs...
            if (touchMove) {
                // Reset touchmove to false
                touchMove = false;
                // And end function
                return false;
            }
            var target = event.target || event.srcElement;
            angular.forEach(listeners, function (listener, i) {
                var filters = OffClickFilterCache['*'] || [];
                if (listener.elm.id && listener.elm.id !== '') {
                    if (OffClickFilterCache['#' + listener.elm.id]) filters = filters.concat(OffClickFilterCache['#' + listener.elm.id]);
                }
                // classList is an object in IE10 and 11 iirc, using angular.forEach to iterate both over an array or object values
                angular.forEach(listener.elm.classList, function (className) {
                    if (OffClickFilterCache['.' + className]) filters = filters.concat(OffClickFilterCache['.' + className]);
                });
                if (!(listener.elm.contains(target) || targetInFilter(target, filters))) {
                    $rootScope.$evalAsync(function () {
                        listener.cb(listener.scope, {
                            $event: event });

                    });
                }

            });
        };


        // Add event listeners to handle various events. Destop will ignore touch events
        document.addEventListener("touchmove", offClickEventHandler, true);
        document.addEventListener("touchend", offClickEventHandler, true);
        document.addEventListener('click', offClickEventHandler, true);


        return {
            restrict: 'A',
            compile: function compile(elem, attrs) {
                var fn = $parse(attrs.offClick);

                var elmId = id++;
                var removeWatcher = void 0;

                return function (scope, element) {
                    var on = function on() {
                        listeners[elmId] = {
                            elm: element[0],
                            cb: fn,
                            scope: scope };

                    };

                    var off = function off() {
                        listeners[elmId] = null;
                        delete listeners[elmId];
                    };

                    if (attrs.offClickIf) {
                        removeWatcher = $rootScope.$watch(function () {return $parse(attrs.offClickIf)(scope);}, function (newVal) {
                            newVal && on() || !newVal && off();
                        });
                    } else on();

                    scope.$on('$destroy', function () {
                        off();
                        if (removeWatcher) {
                            removeWatcher();
                        }
                        element = null;
                    });
                };
            } };

    }]);

    angular.module('cui-ng').
    factory('OffClickFilterCache', function () {
        var filterCache = {};
        return filterCache;
    });

    angular.module('cui-ng').
    directive('onEnter', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function link(scope, element, attrs, ctrl) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {(function () {
                            event.preventDefault();
                            var callback = scope.$eval(attrs.onEnter);
                            $timeout(function () {
                                callback(ctrl.$viewValue);
                            });})();
                    }
                });

                scope.$on('destroy', function () {
                    element.unbind();
                });
            } };

    }]);

    angular.module('cui-ng').
    directive('paginate', ['$compile', '$timeout', '$window', '$pagination', function ($compile, $timeout, $window, $pagination) {
        return {
            restrict: 'AE',
            scope: {
                resultsPerPage: '&',
                count: '&',
                onPageChange: '&',
                page: '=ngModel',
                attachRerenderTo: '=' },

            link: function link(scope, elem, attrs) {
                var resizeInterval = void 0;
                var paginate = {
                    initScope: function initScope() {
                        scope.paginate = {
                            currentPage: scope.page ? paginate.helpers.normalizePage(scope.page) : 1 };

                        paginate.helpers.updateConfig();
                        paginate.render.pageContainer();
                        if (attrs.attachRerenderTo) scope.attachRerenderTo = paginate.scope.updateConfigAndReRender;
                        angular.forEach(paginate.scope, function (func, key) {
                            scope.paginate[key] = func;
                        });
                    },
                    selectors: {
                        $paginate: angular.element(elem[0]) },

                    config: {
                        pageClass: attrs.pageClass || 'cui-paginate__page',
                        activePageClass: attrs.activePageClass || 'cui-paginate__page--active',
                        ellipsesClass: attrs.ellipsesClass || 'cui-paginate__ellipses',
                        previousClass: attrs.previousNextClass || 'cui-paginate__previous',
                        nextClass: attrs.previousNextClass || 'cui-paginate__next',
                        pageContainerClass: attrs.pageContainerClass || 'cui-paginate__page-container',
                        ellipsesButton: attrs.ellipses || '...',
                        previousButton: attrs.previousButton || '',
                        nextButton: attrs.nextButton || '',
                        hidePagination: attrs.hidePagination || true },

                    watchers: {
                        resultsPerPage: function resultsPerPage() {
                            scope.$watch(scope.resultsPerPage, function (newCount, oldCount) {
                                if (newCount && oldCount && newCount !== oldCount) {
                                    scope.page = scope.paginate.currentPage = 1;
                                    paginate.helpers.updateConfig();
                                    paginate.scope.reRender();
                                    $timeout(function () {
                                        if (scope.onPageChange()) scope.onPageChange()(scope.paginate.currentPage);
                                    });
                                }
                            });
                        },
                        page: function page() {
                            scope.$watch('page', function (newPage, oldPage) {
                                if (newPage && newPage !== scope.paginate.currentPage) {
                                    scope.page = scope.paginate.currentPage = paginate.helpers.normalizePage(newPage);
                                    paginate.helpers.updateConfig();
                                    paginate.scope.reRender();
                                }
                            });
                        },
                        paginateResize: function paginateResize() {
                            angular.element($window).bind('resize', paginate.helpers.newresizeHandler);
                        },
                        scopeDestroy: function scopeDestroy() {
                            scope.$on('$destroy', function () {
                                angular.element($window).off('resize');
                            });
                        } },

                    helpers: {
                        updateConfig: function updateConfig() {
                            paginate.config.numberOfPages = paginate.helpers.getNumberOfPages();
                            paginate.config.howManyPagesWeCanShow = paginate.helpers.howManyPagesWeCanShow();
                        },
                        getNumberOfPages: function getNumberOfPages() {return Math.ceil(scope.count() / scope.resultsPerPage());},
                        getWidthOfAPage: function getWidthOfAPage() {return paginate.helpers.getWidthOfElement($(paginate.render.pageNumber(1)));},
                        getAvailableSpaceForPages: function getAvailableSpaceForPages() {
                            var paginateWidth = paginate.config.width || paginate.selectors.$paginate.width();
                            var previousWidth = paginate.helpers.getWidthOfElement(paginate.render.previousButton());
                            var nextWidth = paginate.helpers.getWidthOfElement(paginate.render.nextButton());
                            return paginateWidth - (previousWidth + nextWidth) - 1; // - 1 because at certain widths the width() method was off by a pixel
                        },
                        getWidthOfElement: function getWidthOfElement(element) {// this appends the element to the body, get its width, and removes it. Used for measuring.
                            element.appendTo(document.body);
                            var width = element.outerWidth(true);
                            element.remove();
                            return width;
                        },
                        howManyPagesWeCanShow: function howManyPagesWeCanShow() {return Math.floor(paginate.helpers.getAvailableSpaceForPages() / paginate.helpers.getWidthOfAPage());},
                        handleStepChange: function handleStepChange() {
                            scope.page = scope.paginate.currentPage = paginate.helpers.normalizePage(scope.paginate.currentPage);
                            $timeout(function () {
                                if (scope.onPageChange()) scope.onPageChange()(scope.paginate.currentPage);
                                paginate.scope.reRender();
                            });
                        },
                        resizeHandler: function resizeHandler() {
                            paginate.helpers.updateConfig();
                            paginate.scope.reRender();
                            scope.$apply();
                        },
                        whatEllipsesToShow: function whatEllipsesToShow() {
                            if (paginate.config.numberOfPages <= paginate.config.howManyPagesWeCanShow) return 'none';else
                            if (scope.paginate.currentPage < paginate.config.howManyPagesWeCanShow / 2 + 1) return 'right';else
                            if (scope.paginate.currentPage < paginate.config.numberOfPages - paginate.config.howManyPagesWeCanShow / 2) return 'both';else
                            return 'left';
                        },
                        normalizePage: function normalizePage(pageNumber) {
                            var page = parseInt(pageNumber);
                            if (page <= paginate.config.numberOfPages && page >= 1) {
                                return page;
                            } else
                            if (page < 1) {
                                return 1;
                            } else
                            return paginate.config.numberOfPages;
                        } },

                    scope: {
                        previous: function previous() {
                            if (scope.paginate.currentPage > 1) {
                                scope.paginate.currentPage--;
                                paginate.helpers.handleStepChange();
                            }
                        },
                        next: function next() {
                            if (scope.paginate.currentPage + 1 <= paginate.config.numberOfPages) {
                                scope.paginate.currentPage++;
                                paginate.helpers.handleStepChange();
                            }
                        },
                        goToPage: function goToPage(page) {
                            if (page === scope.paginate.currentPage) return;
                            scope.paginate.currentPage = paginate.helpers.normalizePage(page);
                            paginate.helpers.handleStepChange();
                        },
                        reRender: function reRender() {
                            paginate.selectors.$pageContainer.replaceWith(paginate.render.pageContainer());
                        },
                        updateConfigAndReRender: function updateConfigAndReRender() {
                            paginate.helpers.updateConfig();
                            if (scope.paginate.currentPage > paginate.config.numberOfPages) {
                                scope.page = scope.paginate.currentPage = paginate.helpers.normalizePage(scope.paginate.currentPage);
                                paginate.scope.reRender();
                            } else
                            {
                                paginate.scope.reRender();
                            }
                        } },

                    render: {
                        init: function init() {
                            scope.options = $pagination.getPaginationOptions();
                            if (scope.count() <= scope.options.intervals[0] && scope.options.hidePaginationUnderMin === true) paginate.selectors.$paginate.parent('.cui-paginate__container').css({ 'display': 'none' });
                            paginate.selectors.$paginate.append(paginate.render.previousButton());
                            paginate.selectors.$paginate.append(paginate.render.pageContainer());
                            paginate.selectors.$paginate.append(paginate.render.nextButton());
                        },
                        previousButton: function previousButton() {
                            var previousButton = $compile('<span ng-click="paginate.previous()" class="' +
                            paginate.config.previousClass + '">\n                                ' +
                            paginate.config.previousButton + '\n                            </span>')(

                            scope);
                            return previousButton;
                        },
                        nextButton: function nextButton() {
                            var nextButton = $compile('<span ng-click="paginate.next()" class="' +
                            paginate.config.nextClass + '">\n                                ' +
                            paginate.config.nextButton + '\n                            </span>')(

                            scope);
                            return nextButton;
                        },
                        ellipses: function ellipses(page) {
                            var ngClick = 'ng-click="paginate.goToPage(' + page + ')"';
                            var ellipses = $compile('<span ' + ngClick + ' class="' + paginate.config.ellipsesClass + '">' + paginate.config.ellipsesButton + '</span>')(scope);
                            return ellipses;
                        },
                        pageNumber: function pageNumber(page, active) {
                            var activeClass = void 0,ngClick = void 0;
                            ngClick = 'ng-click="paginate.goToPage(' + page + ')"';
                            active ? activeClass = '' + paginate.config.activePageClass : activeClass = '';
                            var button = $compile('<span ' + ngClick + ' class="' + paginate.config.pageClass + ' ' + activeClass + '">' + page + '</span>')(scope);
                            return button;
                        },
                        pagesXToY: function pagesXToY(x, y) {
                            var pages = [];
                            do {
                                var page = paginate.render.pageNumber(x, x === (scope.paginate.currentPage || scope.page));
                                pages.push(page);
                                x++;
                            } while (
                            x <= y);
                            return pages;
                        },
                        pageNumbers: function pageNumbers() {
                            var whatEllipsesToShow = paginate.helpers.whatEllipsesToShow();
                            var pages = [];
                            switch (whatEllipsesToShow) {
                                case 'none':
                                    pages.push(paginate.render.pagesXToY(1, paginate.config.numberOfPages));
                                    break;
                                case 'right':
                                    var ellipsesPoint = paginate.config.howManyPagesWeCanShow - 1;
                                    pages.push(paginate.render.pagesXToY(1, ellipsesPoint - 1));
                                    pages.push(paginate.render.ellipses(ellipsesPoint));
                                    pages.push(paginate.render.pageNumber(paginate.config.numberOfPages));
                                    break;
                                case 'left':
                                    var ellipsesPointLeft = paginate.config.numberOfPages - (paginate.config.howManyPagesWeCanShow - 2);
                                    pages.push(paginate.render.pageNumber(1));
                                    pages.push(paginate.render.ellipses(ellipsesPointLeft));
                                    pages.push(paginate.render.pagesXToY(ellipsesPointLeft + 1, paginate.config.numberOfPages));
                                    break;
                                case 'both':
                                    var firstEllipsesPoint = scope.paginate.currentPage - (Math.ceil(paginate.config.howManyPagesWeCanShow / 2) - 2);
                                    var secondEllipsesPoint = scope.paginate.currentPage + (Math.floor(paginate.config.howManyPagesWeCanShow / 2) - 1);
                                    pages.push(paginate.render.pageNumber(1));
                                    pages.push(paginate.render.ellipses(firstEllipsesPoint));
                                    pages.push(paginate.render.pagesXToY(firstEllipsesPoint + 1, secondEllipsesPoint - 1));
                                    pages.push(paginate.render.ellipses(secondEllipsesPoint));
                                    pages.push(paginate.render.pageNumber(paginate.config.numberOfPages));
                                    break;}
                            ;
                            return pages;
                        },
                        pageContainer: function pageContainer() {
                            var pageContainer = $('<span class="' + paginate.config.pageContainerClass + '"></span>');
                            paginate.selectors.$pageContainer = pageContainer;
                            paginate.render.pageNumbers().forEach(function (page) {
                                pageContainer.append(page);
                            });
                            return pageContainer;
                        } } };



                $timeout(function () {
                    paginate.initScope();
                    paginate.render.init();
                    angular.forEach(paginate.watchers, function (initWatcher) {
                        initWatcher();
                    });
                });
            } };

    }]);

    angular.module('cui-ng').
    factory('CuiPasswordInfo', [function () {
        var policies = {};
        var info = {};
        return { info: info, policies: policies };
    }]).
    factory('CuiPasswordValidators', ['CuiPasswordInfo', function (CuiPasswordInfo) {
        RegExp.escape = function (text) {return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");};

        var validators = function validators(policies, id) {
            CuiPasswordInfo.info[id] = {}; // Initialize the object that holds the info for this password validation (disallowedWords, disallowedChars)
            return {
                lowercase: function lowercase(modelValue, viewValue) {
                    if (!modelValue) return false;
                    if (getValidators(policies, id).complex(modelValue, viewValue)) return true;
                    return (/.*[a-z].*/.test(viewValue));
                },
                uppercase: function uppercase(modelValue, viewValue) {
                    if (!modelValue) return false;
                    if (getValidators(policies, id).complex(modelValue, viewValue)) return true;
                    return (/.*[A-Z].*/.test(viewValue));
                },
                number: function number(modelValue, viewValue) {
                    if (!modelValue) return false;
                    if (getValidators(policies, id).complex(modelValue, viewValue)) return true;
                    return (/.*[0-9].*/.test(viewValue));
                },
                special: function special(modelValue, viewValue) {
                    if (!modelValue) return false;
                    if (getValidators(policies, id).complex(modelValue, viewValue)) return true;
                    return !/^[a-z0-9]+$/i.test(viewValue);
                },
                complex: function complex(modelValue, viewValue) {
                    if (!modelValue) return false;
                    var numberOfUsedClasses = 0;
                    if (policies.allowLowerChars) {
                        if (/.*[a-z].*/.test(viewValue)) numberOfUsedClasses++;
                    }
                    if (policies.allowUpperChars) {
                        if (/.*[A-Z].*/.test(viewValue)) numberOfUsedClasses++;
                    }
                    if (policies.allowSpecialChars) {
                        if (!/^[a-z0-9]+$/i.test(viewValue)) numberOfUsedClasses++;
                    }
                    if (policies.allowNumChars) {
                        if (/.*[0-9].*/.test(viewValue)) numberOfUsedClasses++;
                    }
                    return numberOfUsedClasses >= policies.requiredNumberOfCharClasses;
                },
                lowercaseNotAllowed: function lowercaseNotAllowed(modelValue, viewValue) {
                    if (!viewValue) return true;
                    return !/.*[a-z].*/.test(viewValue);
                },
                uppercaseNotAllowed: function uppercaseNotAllowed(modelValue, viewValue) {
                    if (!viewValue) return true;
                    return !/.*[A-Z].*/.test(viewValue);
                },
                numberNotAllowed: function numberNotAllowed(modelValue, viewValue) {
                    if (!viewValue) return true;
                    return !/.*[0-9].*/.test(viewValue);
                },
                specialNotAllowed: function specialNotAllowed(modelValue, viewValue) {
                    if (!viewValue) return true;
                    return (/^[a-z0-9]+$/i.test(viewValue));
                },
                disallowedChars: function disallowedChars(modelValue, viewValue) {
                    if (!viewValue) return true;
                    var valid = true;
                    var disallowedChars = [];
                    policies.disallowedChars.split('').forEach(function (disallowedChar) {
                        if (viewValue.indexOf(disallowedChar) > -1) {
                            valid = false;
                            disallowedChars.push(disallowedChar);
                        }
                    });
                    CuiPasswordInfo.info[id].disallowedChars = disallowedChars.join(', ');
                    return valid;
                },
                disallowedWords: function disallowedWords(modelValue, viewValue) {
                    if (!viewValue) return true;
                    var valid = true;
                    var disallowedWords = [];
                    policies.disallowedWords.forEach(function (word) {
                        if (viewValue.toUpperCase().indexOf(word.toUpperCase()) > -1) {
                            valid = false;
                            disallowedWords.push(word);
                        }
                    });
                    CuiPasswordInfo.info[id].disallowedWords = disallowedWords.join(', ');
                    return valid;
                },
                length: function length(modelValue, viewValue) {
                    if (!modelValue) return false;
                    return viewValue.length <= policies.max && viewValue.length >= policies.min;
                } };

        };

        var getValidators = function getValidators(parsedPolicies, id) {
            var validator = {};
            var passwordValidators = Object.assign({}, validators(parsedPolicies, id));
            var trueFunction = function trueFunction() {return true;};

            CuiPasswordInfo.policies[id] = parsedPolicies;

            validator.complex = passwordValidators.complex;

            // if lower chars are not allowed add a check to see if there's a lowercase in the input
            if (parsedPolicies.allowLowerChars) {
                validator.lowercase = passwordValidators.lowercase;
                validator.lowercaseNotAllowed = trueFunction;
            } else
            {
                validator.lowercase = trueFunction;
                validator.lowercaseNotAllowed = passwordValidators.lowercaseNotAllowed;
            }

            if (parsedPolicies.allowUpperChars) {
                validator.uppercase = passwordValidators.uppercase;
                validator.uppercaseNotAllowed = trueFunction;
            } else
            {
                validator.uppercase = trueFunction;
                validator.uppercaseNotAllowed = passwordValidators.uppercaseNotAllowed;
            }

            if (parsedPolicies.allowNumChars) {
                validator.number = passwordValidators.number;
                validator.numberNotAllowed = trueFunction;
            } else
            {
                validator.number = trueFunction;
                validator.numberNotAllowed = passwordValidators.numberNotAllowed;
            }

            if (parsedPolicies.allowSpecialChars) {
                validator.special = passwordValidators.special;
                validator.specialNotAllowed = trueFunction;
            } else
            {
                validator.special = trueFunction;
                validator.specialNotAllowed = passwordValidators.specialNotAllowed;
            }

            if (parsedPolicies.disallowedChars) {
                validator.disallowedChars = passwordValidators.disallowedChars;
            }

            if (parsedPolicies.disallowedWords) {
                validator.disallowedWords = passwordValidators.disallowedWords;
            }

            if (parsedPolicies.min || parsedPolicies.max) {
                validator.length = passwordValidators.length;
            }

            return validator;
        };

        return { getValidators: getValidators };
    }]).
    factory('CuiPasswordPolicies', ['CuiPasswordValidators', 'CuiPasswordInfo', function (CuiPasswordValidators, CuiPasswordInfo) {
        var policy = {
            parse: function parse(policies) {
                var newParsedPolicies = {};
                if (policies.length) {// if we received an array
                    policies.forEach(function (policyRulesObject) {
                        Object.keys(policyRulesObject).forEach(function (policyKey) {
                            newParsedPolicies[policyKey] = policyRulesObject[policyKey];
                        });
                    });
                } else
                newParsedPolicies = Object.assign({}, policies);
                return newParsedPolicies;
            } };

        return policy;
    }]).
    directive('passwordValidation', ['CuiPasswordPolicies', 'CuiPasswordValidators', function (CuiPasswordPolicies, CuiPasswordValidators) {
        return {
            require: 'ngModel',
            scope: {
                passwordValidation: '=' },

            restrict: 'A',
            link: function link(scope, elem, attrs, ctrl) {
                var passwordValidationKey = scope.$id;
                ctrl.passwordValidationKey = passwordValidationKey;

                scope.$watch('passwordValidation', function (newPasswordValidationRules) {
                    if (newPasswordValidationRules) {
                        var parsedPolicies = CuiPasswordPolicies.parse(newPasswordValidationRules);
                        var validators = CuiPasswordValidators.getValidators(parsedPolicies, passwordValidationKey);
                        angular.forEach(validators, function (checkFunction, validationName) {
                            ctrl.$validators[validationName] = checkFunction;
                        });
                        ctrl.$validate();
                    }
                });
            } };

    }]).
    directive('passwordPopover', ['CuiPasswordInfo', function (CuiPasswordInfo) {
        return {
            restrict: 'A',
            link: function link(scope, elem, attrs) {
                var passwordValidationKey = scope.$eval(attrs.ngMessages.replace('.$error', '.passwordValidationKey')); // get the passwordValidationKey from the input it's applied to

                scope.$watchCollection(function () {return CuiPasswordInfo.info[passwordValidationKey];}, function (newPasswordInfo) {
                    if (newPasswordInfo) {
                        Object.keys(newPasswordInfo).forEach(function (key) {
                            scope[key] = newPasswordInfo[key];
                        });
                    }
                });

                scope.$watchCollection(function () {return CuiPasswordInfo.policies[passwordValidationKey];}, function (newPasswordPolicies) {
                    if (newPasswordPolicies) scope.policies = Object.assign({}, newPasswordPolicies);
                });

                scope.$watchCollection(function () {return scope.$eval(attrs.ngMessages);}, function (newErrorObject) {
                    if (newErrorObject) scope.errors = Object.assign({}, newErrorObject);
                });
            } };

    }]);

    angular.module('cui-ng').
    directive('resultsPerPage', ['$compile', '$pagination', function ($compile, $pagination) {
        return {
            restrict: 'E',
            scope: {
                selected: '=ngModel' },

            link: function link(scope, elem, attrs) {
                var resultsPerPage = {
                    initScope: function initScope() {
                        scope.options = $pagination.getPaginationOptions();
                        scope.selected = $pagination.getUserValue() || scope.options.intervals[0];
                        scope.intervals = scope.options.intervals;

                        scope.$watch('selected', function (selected) {
                            $pagination.setUserValue(selected);
                            scope.selected = selected;
                        });
                    },
                    config: {
                        selectClass: attrs.class || 'cui-dropdown' },

                    render: function render() {
                        var element = $compile('<cui-dropdown class="' + resultsPerPage.config.selectClass + '" dropdown-class="cui-dropdown__wrapper cui-dropdown--results-per-page" ng-model="selected" options="intervals"></cui-dropdown>')(scope);
                        angular.element(elem).replaceWith(element);
                    } };

                resultsPerPage.initScope();
                resultsPerPage.render();
            } };

    }]);

    var KEYS = {
        backspace: 8,
        tab: 9,
        enter: 13,
        escape: 27,
        space: 32,
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        delete: 46,
        comma: 188 };


    var MAX_SAFE_INTEGER = 9007199254740991;
    var SUPPORTED_INPUT_TYPES = ['text', 'email', 'url'];

    angular.module('cui-ng').
    directive('tagsInput', ["$timeout", "$document", "$window", "tagsInputConfig", "tiUtil", function ($timeout, $document, $window, tagsInputConfig, tiUtil) {
        function TagList(options, events, onTagAdding, onTagRemoving) {
            var self = {},getTagText,setTagText,tagIsValid;

            getTagText = function getTagText(tag) {
                return tiUtil.safeToString(tag[options.displayProperty]);
            };

            setTagText = function setTagText(tag, text) {
                tag[options.displayProperty] = text;
            };

            tagIsValid = function tagIsValid(tag) {
                var tagText = getTagText(tag);

                return tagText &&
                tagText.length >= options.minLength &&
                tagText.length <= options.maxLength &&
                options.allowedTagsPattern.test(tagText) &&
                !tiUtil.findInObjectArray(self.items, tag, options.keyProperty || options.displayProperty) &&
                onTagAdding({ $tag: tag });
            };

            self.items = [];

            self.addText = function (text) {
                var tag = {};
                setTagText(tag, text);
                return self.add(tag);
            };

            self.add = function (tag) {
                var tagText = getTagText(tag);

                if (options.replaceSpacesWithDashes) {
                    tagText = tiUtil.replaceSpacesWithDashes(tagText);
                }

                setTagText(tag, tagText);

                if (tagIsValid(tag)) {
                    self.items.push(tag);
                    events.trigger('tag-added', { $tag: tag });
                } else
                if (tagText) {
                    events.trigger('invalid-tag', { $tag: tag });
                }

                return tag;
            };

            self.remove = function (index) {
                var tag = self.items[index];

                if (onTagRemoving({ $tag: tag })) {
                    self.items.splice(index, 1);
                    self.clearSelection();
                    events.trigger('tag-removed', { $tag: tag });
                    return tag;
                }
            };

            self.select = function (index) {
                if (index < 0) {
                    index = self.items.length - 1;
                } else
                if (index >= self.items.length) {
                    index = 0;
                }

                self.index = index;
                self.selected = self.items[index];
            };

            self.selectPrior = function () {
                self.select(--self.index);
            };

            self.selectNext = function () {
                self.select(++self.index);
            };

            self.removeSelected = function () {
                return self.remove(self.index);
            };

            self.clearSelection = function () {
                self.selected = null;
                self.index = -1;
            };

            self.clearSelection();

            return self;
        }

        function validateType(type) {
            return SUPPORTED_INPUT_TYPES.indexOf(type) !== -1;
        }

        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                tags: '=ngModel',
                text: '=?',
                onTagAdding: '&',
                onTagAdded: '&',
                onInvalidTag: '&',
                onTagRemoving: '&',
                onTagRemoved: '&',
                onTagClicked: '&' },

            replace: false,
            transclude: true,
            templateUrl: 'ngTagsInput/tags-input.html',
            controller: ["$scope", "$attrs", "$element", function ($scope, $attrs, $element) {
                $scope.events = tiUtil.simplePubSub();

                tagsInputConfig.load('tagsInput', $scope, $attrs, {
                    template: [String, 'ngTagsInput/tag-item.html'],
                    type: [String, 'text', validateType],
                    placeholder: [String, ''],
                    tabindex: [Number, null],
                    removeTagSymbol: [String, String.fromCharCode(215)],
                    replaceSpacesWithDashes: [Boolean, true],
                    minLength: [Number, 3],
                    maxLength: [Number, MAX_SAFE_INTEGER],
                    addOnEnter: [Boolean, true],
                    addOnSpace: [Boolean, false],
                    addOnComma: [Boolean, true],
                    addOnBlur: [Boolean, true],
                    addOnPaste: [Boolean, false],
                    pasteSplitPattern: [RegExp, /,/],
                    allowedTagsPattern: [RegExp, /.+/],
                    enableEditingLastTag: [Boolean, false],
                    minTags: [Number, 0],
                    maxTags: [Number, MAX_SAFE_INTEGER],
                    displayProperty: [String, 'text'],
                    keyProperty: [String, ''],
                    allowLeftoverText: [Boolean, false],
                    addFromAutocompleteOnly: [Boolean, false],
                    spellcheck: [Boolean, true] });


                $scope.tagList = new TagList($scope.options, $scope.events,
                tiUtil.handleUndefinedResult($scope.onTagAdding, true),
                tiUtil.handleUndefinedResult($scope.onTagRemoving, true));

                this.registerAutocomplete = function () {
                    var input = $element.find('input');

                    return {
                        addTag: function addTag(tag) {
                            return $scope.tagList.add(tag);
                        },
                        focusInput: function focusInput() {
                            input[0].focus();
                        },
                        getTags: function getTags() {
                            return $scope.tagList.items;
                        },
                        getCurrentTagText: function getCurrentTagText() {
                            return $scope.newTag.text();
                        },
                        getOptions: function getOptions() {
                            return $scope.options;
                        },
                        on: function on(name, handler) {
                            $scope.events.on(name, handler);
                            return this;
                        } };

                };

                this.registerTagItem = function () {
                    return {
                        getOptions: function getOptions() {
                            return $scope.options;
                        },
                        removeTag: function removeTag(index) {
                            if ($scope.disabled) {
                                return;
                            }
                            $scope.tagList.remove(index);
                        } };

                };
            }],
            link: function link(scope, element, attrs, ngModelCtrl) {
                var hotkeys = [KEYS.enter, KEYS.comma, KEYS.space, KEYS.backspace, KEYS.delete, KEYS.left, KEYS.right],
                tagList = scope.tagList,
                events = scope.events,
                options = scope.options,
                input = element.find('input'),
                validationOptions = ['minTags', 'maxTags', 'allowLeftoverText'],
                setElementValidity;

                setElementValidity = function setElementValidity() {
                    ngModelCtrl.$setValidity('maxTags', tagList.items.length <= options.maxTags);
                    ngModelCtrl.$setValidity('minTags', tagList.items.length >= options.minTags);
                    ngModelCtrl.$setValidity('leftoverText', scope.hasFocus || options.allowLeftoverText ? true : !scope.newTag.text());
                };

                ngModelCtrl.$isEmpty = function (value) {
                    return !value || !value.length;
                };

                scope.newTag = {
                    text: function text(value) {
                        if (angular.isDefined(value)) {
                            scope.text = value;
                            events.trigger('input-change', value);
                        } else
                        {
                            return scope.text || '';
                        }
                    },
                    invalid: null };


                scope.track = function (tag) {
                    return tag[options.keyProperty || options.displayProperty];
                };

                scope.$watch('tags', function (value) {
                    if (value) {
                        tagList.items = tiUtil.makeObjectArray(value, options.displayProperty);
                        scope.tags = tagList.items;
                    } else
                    {
                        tagList.items = [];
                    }
                });

                scope.$watch('tags.length', function () {
                    setElementValidity();

                    // ngModelController won't trigger validators when the model changes (because it's an array),
                    // so we need to do it ourselves. Unfortunately this won't trigger any registered formatter.
                    ngModelCtrl.$validate();
                });

                attrs.$observe('disabled', function (value) {
                    scope.disabled = value;
                });

                scope.eventHandlers = {
                    input: {
                        keydown: function keydown($event) {
                            events.trigger('input-keydown', $event);
                        },
                        focus: function focus() {
                            if (scope.hasFocus) {
                                return;
                            }

                            scope.hasFocus = true;
                            events.trigger('input-focus');
                        },
                        blur: function blur() {
                            $timeout(function () {
                                var activeElement = $document.prop('activeElement'),
                                lostFocusToBrowserWindow = activeElement === input[0],
                                lostFocusToChildElement = element[0].contains(activeElement);

                                if (lostFocusToBrowserWindow || !lostFocusToChildElement) {
                                    scope.hasFocus = false;
                                    events.trigger('input-blur');
                                }
                            });
                        },
                        paste: function paste($event) {
                            $event.getTextData = function () {
                                var clipboardData = $event.clipboardData || $event.originalEvent && $event.originalEvent.clipboardData;
                                return clipboardData ? clipboardData.getData('text/plain') : $window.clipboardData.getData('Text');
                            };
                            events.trigger('input-paste', $event);
                        } },

                    host: {
                        click: function click() {
                            if (scope.disabled) {
                                return;
                            }
                            input[0].focus();
                        } },

                    tag: {
                        click: function click(tag) {
                            events.trigger('tag-clicked', { $tag: tag });
                        } } };



                events.
                on('tag-added', scope.onTagAdded).
                on('invalid-tag', scope.onInvalidTag).
                on('tag-removed', scope.onTagRemoved).
                on('tag-clicked', scope.onTagClicked).
                on('tag-added', function () {
                    scope.newTag.text('');
                }).
                on('tag-added tag-removed', function () {
                    scope.tags = tagList.items;
                    // Ideally we should be able call $setViewValue here and let it in turn call $setDirty and $validate
                    // automatically, but since the model is an array, $setViewValue does nothing and it's up to us to do it.
                    // Unfortunately this won't trigger any registered $parser and there's no safe way to do it.
                    ngModelCtrl.$setDirty();
                }).
                on('invalid-tag', function () {
                    scope.newTag.invalid = true;
                }).
                on('option-change', function (e) {
                    if (validationOptions.indexOf(e.name) !== -1) {
                        setElementValidity();
                    }
                }).
                on('input-change', function () {
                    tagList.clearSelection();
                    scope.newTag.invalid = null;
                }).
                on('input-focus', function () {
                    element.triggerHandler('focus');
                    ngModelCtrl.$setValidity('leftoverText', true);
                }).
                on('input-blur', function () {
                    if (options.addOnBlur && !options.addFromAutocompleteOnly) {
                        tagList.addText(scope.newTag.text());
                    }
                    element.triggerHandler('blur');
                    setElementValidity();
                }).
                on('input-keydown', function (event) {
                    var key = event.keyCode,
                    addKeys = {},
                    shouldAdd,shouldRemove,shouldSelect,shouldEditLastTag;

                    if (tiUtil.isModifierOn(event) || hotkeys.indexOf(key) === -1) {
                        return;
                    }

                    addKeys[KEYS.enter] = options.addOnEnter;
                    addKeys[KEYS.comma] = options.addOnComma;
                    addKeys[KEYS.space] = options.addOnSpace;

                    shouldAdd = !options.addFromAutocompleteOnly && addKeys[key];
                    shouldRemove = (key === KEYS.backspace || key === KEYS.delete) && tagList.selected;
                    shouldEditLastTag = key === KEYS.backspace && scope.newTag.text().length === 0 && options.enableEditingLastTag;
                    shouldSelect = (key === KEYS.backspace || key === KEYS.left || key === KEYS.right) && scope.newTag.text().length === 0 && !options.enableEditingLastTag;

                    if (shouldAdd) {
                        tagList.addText(scope.newTag.text());
                    } else
                    if (shouldEditLastTag) {
                        var tag;

                        tagList.selectPrior();
                        tag = tagList.removeSelected();

                        if (tag) {
                            scope.newTag.text(tag[options.displayProperty]);
                        }
                    } else
                    if (shouldRemove) {
                        tagList.removeSelected();
                    } else
                    if (shouldSelect) {
                        if (key === KEYS.left || key === KEYS.backspace) {
                            tagList.selectPrior();
                        } else
                        if (key === KEYS.right) {
                            tagList.selectNext();
                        }
                    }

                    if (shouldAdd || shouldSelect || shouldRemove || shouldEditLastTag) {
                        event.preventDefault();
                    }
                }).
                on('input-paste', function (event) {
                    if (options.addOnPaste) {
                        var data = event.getTextData();
                        var tags = data.split(options.pasteSplitPattern);

                        if (tags.length > 1) {
                            tags.forEach(function (tag) {
                                tagList.addText(tag);
                            });
                            event.preventDefault();
                        }
                    }
                });
            } };

    }])


    /**
         * @ngdoc directive
         * @name tiTagItem
         * @module ngTagsInput
         *
         * @description
         * Represents a tag item. Used internally by the tagsInput directive.
         */.
    directive('tiTagItem', ["tiUtil", function (tiUtil) {
        return {
            restrict: 'E',
            require: '^tagsInput',
            template: '<ng-include src="$$template"></ng-include>',
            scope: { data: '=' },
            link: function link(scope, element, attrs, tagsInputCtrl) {
                var tagsInput = tagsInputCtrl.registerTagItem(),
                options = tagsInput.getOptions();

                scope.$$template = options.template;
                scope.$$removeTagSymbol = options.removeTagSymbol;

                scope.$getDisplayText = function () {
                    return tiUtil.safeToString(scope.data[options.displayProperty]);
                };
                scope.$removeTag = function () {
                    tagsInput.removeTag(scope.$index);
                };

                scope.$watch('$parent.$index', function (value) {
                    scope.$index = value;
                });
            } };

    }])


    /**
         * @ngdoc directive
         * @name autoComplete
         * @module ngTagsInput
         *
         * @description
         * Provides autocomplete support for the tagsInput directive.
         *
         * @param {expression} source Expression to evaluate upon changing the input content. The input value is available as
         *    $query. The result of the expression must be a promise that eventually resolves to an array of strings.
         * @param {string=} [template=NA] URL or id of a custom template for rendering each element of the autocomplete list.
         * @param {string=} [displayProperty=tagsInput.displayText] Property to be rendered as the autocomplete label.
         * @param {number=} [debounceDelay=100] Amount of time, in milliseconds, to wait before evaluating the expression in
         *    the source option after the last keystroke.
         * @param {number=} [minLength=3] Minimum number of characters that must be entered before evaluating the expression
         *    in the source option.
         * @param {boolean=} [highlightMatchedText=true] Flag indicating that the matched text will be highlighted in the
         *    suggestions list.
         * @param {number=} [maxResultsToShow=10] Maximum number of results to be displayed at a time.
         * @param {boolean=} [loadOnDownArrow=false] Flag indicating that the source option will be evaluated when the down arrow
         *    key is pressed and the suggestion list is closed. The current input value is available as $query.
         * @param {boolean=} [loadOnEmpty=false] Flag indicating that the source option will be evaluated when the input content
         *    becomes empty. The $query variable will be passed to the expression as an empty string.
         * @param {boolean=} [loadOnFocus=false] Flag indicating that the source option will be evaluated when the input element
         *    gains focus. The current input value is available as $query.
         * @param {boolean=} [selectFirstMatch=true] Flag indicating that the first match will be automatically selected once
         *    the suggestion list is shown.
         */.
    directive('autoComplete', ["$document", "$timeout", "$sce", "$q", "tagsInputConfig", "tiUtil", function ($document, $timeout, $sce, $q, tagsInputConfig, tiUtil) {
        function SuggestionList(loadFn, options, events) {
            var self = {},getDifference,lastPromise,getTagId;

            getTagId = function getTagId() {
                return options.tagsInput.keyProperty || options.tagsInput.displayProperty;
            };

            getDifference = function getDifference(array1, array2) {
                return array1.filter(function (item) {
                    return !tiUtil.findInObjectArray(array2, item, getTagId(), function (a, b) {
                        if (options.tagsInput.replaceSpacesWithDashes) {
                            a = tiUtil.replaceSpacesWithDashes(a);
                            b = tiUtil.replaceSpacesWithDashes(b);
                        }
                        return tiUtil.defaultComparer(a, b);
                    });
                });
            };

            self.reset = function () {
                lastPromise = null;

                self.items = [];
                self.visible = false;
                self.index = -1;
                self.selected = null;
                self.query = null;
            };
            self.show = function () {
                if (options.selectFirstMatch) {
                    self.select(0);
                } else
                {
                    self.selected = null;
                }
                self.visible = true;
            };
            self.load = tiUtil.debounce(function (query, tags) {
                self.query = query;

                var promise = $q.when(loadFn({ $query: query }));
                lastPromise = promise;

                promise.then(function (items) {
                    if (promise !== lastPromise) {
                        return;
                    }

                    items = tiUtil.makeObjectArray(items.data || items, getTagId());
                    items = getDifference(items, tags);
                    self.items = items.slice(0, options.maxResultsToShow);

                    if (self.items.length > 0) {
                        self.show();
                    } else
                    {
                        self.reset();
                    }
                });
            }, options.debounceDelay);

            self.selectNext = function () {
                self.select(++self.index);
            };
            self.selectPrior = function () {
                self.select(--self.index);
            };
            self.select = function (index) {
                if (index < 0) {
                    index = self.items.length - 1;
                } else
                if (index >= self.items.length) {
                    index = 0;
                }
                self.index = index;
                self.selected = self.items[index];
                events.trigger('suggestion-selected', index);
            };

            self.reset();

            return self;
        }

        function scrollToElement(root, index) {
            var element = root.find('li').eq(index),
            parent = element.parent(),
            elementTop = element.prop('offsetTop'),
            elementHeight = element.prop('offsetHeight'),
            parentHeight = parent.prop('clientHeight'),
            parentScrollTop = parent.prop('scrollTop');

            if (elementTop < parentScrollTop) {
                parent.prop('scrollTop', elementTop);
            } else
            if (elementTop + elementHeight > parentHeight + parentScrollTop) {
                parent.prop('scrollTop', elementTop + elementHeight - parentHeight);
            }
        }

        return {
            restrict: 'E',
            require: '^tagsInput',
            scope: { source: '&' },
            templateUrl: 'ngTagsInput/auto-complete.html',
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
                $scope.events = tiUtil.simplePubSub();

                tagsInputConfig.load('autoComplete', $scope, $attrs, {
                    template: [String, 'ngTagsInput/auto-complete-match.html'],
                    debounceDelay: [Number, 100],
                    minLength: [Number, 3],
                    highlightMatchedText: [Boolean, true],
                    maxResultsToShow: [Number, 10],
                    loadOnDownArrow: [Boolean, false],
                    loadOnEmpty: [Boolean, false],
                    loadOnFocus: [Boolean, false],
                    selectFirstMatch: [Boolean, true],
                    displayProperty: [String, ''] });


                $scope.suggestionList = new SuggestionList($scope.source, $scope.options, $scope.events);

                this.registerAutocompleteMatch = function () {
                    return {
                        getOptions: function getOptions() {
                            return $scope.options;
                        },
                        getQuery: function getQuery() {
                            return $scope.suggestionList.query;
                        } };

                };
            }],
            link: function link(scope, element, attrs, tagsInputCtrl) {
                var hotkeys = [KEYS.enter, KEYS.tab, KEYS.escape, KEYS.up, KEYS.down],
                suggestionList = scope.suggestionList,
                tagsInput = tagsInputCtrl.registerAutocomplete(),
                options = scope.options,
                events = scope.events,
                shouldLoadSuggestions;

                options.tagsInput = tagsInput.getOptions();

                shouldLoadSuggestions = function shouldLoadSuggestions(value) {
                    return value && value.length >= options.minLength || !value && options.loadOnEmpty;
                };

                scope.addSuggestionByIndex = function (index) {
                    suggestionList.select(index);
                    scope.addSuggestion();
                };

                scope.addSuggestion = function () {
                    var added = false;

                    if (suggestionList.selected) {
                        tagsInput.addTag(angular.copy(suggestionList.selected));
                        suggestionList.reset();
                        tagsInput.focusInput();

                        added = true;
                    }
                    return added;
                };

                scope.track = function (item) {
                    return item[options.tagsInput.keyProperty || options.tagsInput.displayProperty];
                };

                tagsInput.
                on('tag-added tag-removed invalid-tag input-blur', function () {
                    suggestionList.reset();
                }).
                on('input-change', function (value) {
                    if (shouldLoadSuggestions(value)) {
                        suggestionList.load(value, tagsInput.getTags());
                    } else
                    {
                        suggestionList.reset();
                    }
                }).
                on('input-focus', function () {
                    var value = tagsInput.getCurrentTagText();
                    if (options.loadOnFocus && shouldLoadSuggestions(value)) {
                        suggestionList.load(value, tagsInput.getTags());
                    }
                }).
                on('input-keydown', function (event) {
                    var key = event.keyCode,
                    handled = false;

                    if (tiUtil.isModifierOn(event) || hotkeys.indexOf(key) === -1) {
                        return;
                    }

                    if (suggestionList.visible) {

                        if (key === KEYS.down) {
                            suggestionList.selectNext();
                            handled = true;
                        } else
                        if (key === KEYS.up) {
                            suggestionList.selectPrior();
                            handled = true;
                        } else
                        if (key === KEYS.escape) {
                            suggestionList.reset();
                            handled = true;
                        } else
                        if (key === KEYS.enter || key === KEYS.tab) {
                            handled = scope.addSuggestion();
                        }
                    } else
                    {
                        if (key === KEYS.down && scope.options.loadOnDownArrow) {
                            suggestionList.load(tagsInput.getCurrentTagText(), tagsInput.getTags());
                            handled = true;
                        }
                    }

                    if (handled) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        return false;
                    }
                });

                events.on('suggestion-selected', function (index) {
                    scrollToElement(element, index);
                });
            } };

    }]).


    directive('tiAutocompleteMatch', ["$sce", "tiUtil", function ($sce, tiUtil) {
        return {
            restrict: 'E',
            require: '^autoComplete',
            template: '<ng-include src="$$template"></ng-include>',
            scope: { data: '=' },
            link: function link(scope, element, attrs, autoCompleteCtrl) {
                var autoComplete = autoCompleteCtrl.registerAutocompleteMatch(),
                options = autoComplete.getOptions();

                scope.$$template = options.template;
                scope.$index = scope.$parent.$index;

                scope.$highlight = function (text) {
                    if (options.highlightMatchedText) {
                        text = tiUtil.safeHighlight(text, autoComplete.getQuery());
                    }
                    return $sce.trustAsHtml(text);
                };
                scope.$getDisplayText = function () {
                    return tiUtil.safeToString(scope.data[options.displayProperty || options.tagsInput.displayProperty]);
                };
            } };

    }]).

    directive('tiTranscludeAppend', function () {
        return function (scope, element, attrs, ctrl, transcludeFn) {
            transcludeFn(function (clone) {
                element.append(clone);
            });
        };
    }).

    directive('tiAutosize', ["tagsInputConfig", function (tagsInputConfig) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function link(scope, element, attrs, ctrl) {
                var threshold = tagsInputConfig.getTextAutosizeThreshold(),
                span,resize;

                span = angular.element('<span class="cui-tags__registered-tag"></span>');
                span.css('display', 'none').
                css('visibility', 'hidden').
                css('width', 'auto').
                css('white-space', 'pre');

                element.parent().append(span);

                resize = function resize(originalValue) {
                    var value = originalValue,width;

                    if (angular.isString(value) && value.length === 0) {
                        value = attrs.placeholder;
                    }

                    if (value) {
                        span.text(value);
                        span.css('display', '');
                        width = span.prop('offsetWidth');
                        span.css('display', 'none');
                    }

                    element.css('width', width ? width + threshold + 'px' : '');

                    return originalValue;
                };

                ctrl.$parsers.unshift(resize);
                ctrl.$formatters.unshift(resize);

                attrs.$observe('placeholder', function (value) {
                    if (!ctrl.$modelValue) {
                        resize(value);
                    }
                });
            } };

    }]).

    directive('tiBindAttrs', function () {
        return function (scope, element, attrs) {
            scope.$watch(attrs.tiBindAttrs, function (value) {
                angular.forEach(value, function (value, key) {
                    attrs.$set(key, value);
                });
            }, true);
        };
    }).

    provider('tagsInputConfig', function () {
        var globalDefaults = {},
        interpolationStatus = {},
        autosizeThreshold = 3;

        /**
                                * @ngdoc method
                                * @name tagsInputConfig#setDefaults
                                * @description Sets the default configuration option for a directive.
                                *
                                * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
                                * @param {object} defaults Object containing options and their values.
                                *
                                * @returns {object} The service itself for chaining purposes.
                                */
        this.setDefaults = function (directive, defaults) {
            globalDefaults[directive] = defaults;
            return this;
        };

        /**
            * @ngdoc method
            * @name tagsInputConfig#setActiveInterpolation
            * @description Sets active interpolation for a set of options.
            *
            * @param {string} directive Name of the directive to be configured. Must be either 'tagsInput' or 'autoComplete'.
            * @param {object} options Object containing which options should have interpolation turned on at all times.
            *
            * @returns {object} The service itself for chaining purposes.
            */
        this.setActiveInterpolation = function (directive, options) {
            interpolationStatus[directive] = options;
            return this;
        };

        /**
            * @ngdoc method
            * @name tagsInputConfig#setTextAutosizeThreshold
            * @description Sets the threshold used by the tagsInput directive to re-size the inner input field element based on its contents.
            *
            * @param {number} threshold Threshold value, in pixels.
            *
            * @returns {object} The service itself for chaining purposes.
            */
        this.setTextAutosizeThreshold = function (threshold) {
            autosizeThreshold = threshold;
            return this;
        };

        this.$get = ["$interpolate", function ($interpolate) {
            var converters = {};
            converters[String] = function (value) {return value;};
            converters[Number] = function (value) {return parseInt(value, 10);};
            converters[Boolean] = function (value) {return value.toLowerCase() === 'true';};
            converters[RegExp] = function (value) {return new RegExp(value);};

            return {
                load: function load(directive, scope, attrs, options) {
                    var defaultValidator = function defaultValidator() {return true;};

                    scope.options = {};

                    angular.forEach(options, function (value, key) {
                        var type, localDefault, validator, converter, getDefault, updateValue;

                        type = value[0];
                        localDefault = value[1];
                        validator = value[2] || defaultValidator;
                        converter = converters[type];

                        getDefault = function getDefault() {
                            var globalValue = globalDefaults[directive] && globalDefaults[directive][key];
                            return angular.isDefined(globalValue) ? globalValue : localDefault;
                        };

                        updateValue = function updateValue(value) {
                            scope.options[key] = value && validator(value) ? converter(value) : getDefault();
                        };

                        if (interpolationStatus[directive] && interpolationStatus[directive][key]) {
                            attrs.$observe(key, function (value) {
                                updateValue(value);
                                scope.events.trigger('option-change', { name: key, newValue: value });
                            });
                        } else
                        {
                            updateValue(attrs[key] && $interpolate(attrs[key])(scope.$parent));
                        }
                    });
                },
                getTextAutosizeThreshold: function getTextAutosizeThreshold() {
                    return autosizeThreshold;
                } };

        }];
    }).

    factory('tiUtil', ["$timeout", function ($timeout) {
        var self = {};

        self.debounce = function (fn, delay) {
            var timeoutId;
            return function () {
                var args = arguments;
                $timeout.cancel(timeoutId);
                timeoutId = $timeout(function () {fn.apply(null, args);}, delay);
            };
        };

        self.makeObjectArray = function (array, key) {
            if (!angular.isArray(array) || array.length === 0 || angular.isObject(array[0])) {
                return array;
            }

            var newArray = [];
            array.forEach(function (item) {
                var obj = {};
                obj[key] = item;
                newArray.push(obj);
            });
            return newArray;
        };

        self.findInObjectArray = function (array, obj, key, comparer) {
            var item = null;
            comparer = comparer || self.defaultComparer;

            array.some(function (element) {
                if (comparer(element[key], obj[key])) {
                    item = element;
                    return true;
                }
            });

            return item;
        };

        self.defaultComparer = function (a, b) {
            // I'm aware of the internationalization issues regarding toLowerCase()
            // but I couldn't come up with a better solution right now
            return self.safeToString(a).toLowerCase() === self.safeToString(b).toLowerCase();
        };

        self.safeHighlight = function (str, value) {
            if (!value) {
                return str;
            }

            function escapeRegexChars(str) {
                return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
            }

            str = self.encodeHTML(str);
            value = self.encodeHTML(value);

            var expression = new RegExp('&[^;]+;|' + escapeRegexChars(value), 'gi');
            return str.replace(expression, function (match) {
                return match.toLowerCase() === value.toLowerCase() ? '<em>' + match + '</em>' : match;
            });
        };

        self.safeToString = function (value) {
            return angular.isUndefined(value) || value === null ? '' : value.toString().trim();
        };

        self.encodeHTML = function (value) {
            return self.safeToString(value).
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;');
        };

        self.handleUndefinedResult = function (fn, valueIfUndefined) {
            return function () {
                var result = fn.apply(null, arguments);
                return angular.isUndefined(result) ? valueIfUndefined : result;
            };
        };

        self.replaceSpacesWithDashes = function (str) {
            return self.safeToString(str).replace(/\s/g, '-');
        };

        self.isModifierOn = function (event) {
            return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
        };

        self.simplePubSub = function () {
            var events = {};
            return {
                on: function on(names, handler) {
                    names.split(' ').forEach(function (name) {
                        if (!events[name]) {
                            events[name] = [];
                        }
                        events[name].push(handler);
                    });
                    return this;
                },
                trigger: function trigger(name, args) {
                    var handlers = events[name] || [];
                    handlers.every(function (handler) {
                        return self.handleUndefinedResult(handler, true)(args);
                    });
                    return this;
                } };

        };

        return self;
    }]).

    run(["$templateCache", function ($templateCache) {
        $templateCache.put('ngTagsInput/tags-input.html',
        "<div class=\"cui-tags__host\" tabindex=\"-1\" ng-click=\"eventHandlers.host.click()\" ti-transclude-append><div class=\"cui-tags__container\" ng-class=\"{'cui-tags__container--focused': hasFocus}\"><ul class=\"cui-tags__tag-list\"><li class=\"cui-tags__tag\" ng-repeat=\"tag in tagList.items track by track(tag)\" ng-class=\"{'cui-tags__tag--selected': tag == tagList.selected }\" ng-click=\"eventHandlers.tag.click(tag)\"><ti-tag-item data=\"::tag\"></ti-tag-item></li></ul><input class=\"cui-tags__input\" autocomplete=\"off\" ng-model=\"newTag.text\" ng-model-options=\"{getterSetter: true}\" ng-keydown=\"eventHandlers.input.keydown($event)\" ng-focus=\"eventHandlers.input.focus($event)\" ng-blur=\"eventHandlers.input.blur($event)\" ng-paste=\"eventHandlers.input.paste($event)\" ng-trim=\"false\" ng-class=\"{'cui-tags__input--invalid': newTag.invalid}\" ng-disabled=\"disabled\" ti-bind-attrs=\"{type: options.type, placeholder: options.placeholder, tabindex: options.tabindex, spellcheck: options.spellcheck}\" ti-autosize></div></div>");


        $templateCache.put('ngTagsInput/tag-item.html',
        "<span ng-bind=\"$getDisplayText()\"></span> <a class=\"cui-tags__remove\" ng-click=\"$removeTag()\" ng-bind=\"::$$removeTagSymbol\"></a>");


        $templateCache.put('ngTagsInput/auto-complete.html',
        "<div class=\"autocomplete\" ng-if=\"suggestionList.visible\"><ul class=\"suggestion-list\"><li class=\"suggestion-item\" ng-repeat=\"item in suggestionList.items track by track(item)\" ng-class=\"{selected: item == suggestionList.selected}\" ng-click=\"addSuggestionByIndex($index)\" ng-mouseenter=\"suggestionList.select($index)\"><ti-autocomplete-match data=\"::item\"></ti-autocomplete-match></li></ul></div>");


        $templateCache.put('ngTagsInput/auto-complete-match.html',
        "<span ng-bind-html=\"$highlight($getDisplayText())\"></span>");

    }]);

    angular.module('cui-ng').
    directive('tether', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            restrict: 'A',
            scope: true,
            link: function link(scope, elem, attrs) {
                var tether = void 0;
                elem[0].classList.add('hide--opacity'); // this fixes the incorrect positioning when it first renders
                $timeout(function () {
                    tether = new Tether({
                        element: elem,
                        target: attrs.target,
                        attachment: attrs.attachment || 'top center',
                        targetAttachment: attrs.targetAttachment || 'bottom center',
                        offset: attrs.offset || '0 0',
                        targetOffset: attrs.targetOffset || '0 0',
                        targetModifier: attrs.targetModifier || undefined,
                        constraints: scope.$eval(attrs.constraints) || undefined });

                }).
                then(function () {
                    tether.position();
                    elem[0].classList.remove('hide--opacity');
                });
            } };

    }]);

    angular.module('cui-ng').
    directive('uiSrefActiveFor', ['$state', 'PubSub', function ($state, PubSub) {
        return {
            restrict: 'A',
            compile: function compile() {
                return {
                    pre: function pre(scope, elem, attrs) {
                        var active = void 0,
                        classList = attrs.uiSrefActiveForClasses ? attrs.uiSrefActiveForClasses.split(',').map(function (x) {return x.trim();}) : ['active'];

                        var handleStateChange = function handleStateChange(e, _ref) {var toState = _ref.toState;
                            if (toState.name.indexOf(attrs.uiSrefActiveFor) >= 0 && !active) {
                                classList.forEach(function (className) {return elem[0].classList.add(className);});
                                active = true;
                            } else
                            if (toState.name.indexOf(attrs.uiSrefActiveFor) < 0 && active) {
                                classList.forEach(function (className) {return elem[0].classList.remove(className);});
                                active = false;
                            }
                        };

                        var unsub = PubSub.subscribe('stateChange', handleStateChange);

                        handleStateChange(null, { toState: $state.current });

                        scope.$on('$destroy', function () {
                            PubSub.unsubscribe(unsub);
                        });
                    } };

            } };

    }]);

    angular.module('cui-ng').
    directive('uiSrefActiveNested', ['$state', 'PubSub', function ($state, PubSub) {
        return {
            restrict: 'A',
            compile: function compile() {
                return {
                    pre: function pre(scope, elem, attrs) {
                        var parentState = void 0;
                        if (!attrs.uiSref) {
                            throw 'ui-sref-active-nested can only be used on elements with a ui-sref attribute';
                            return;
                        }
                        // if this element is a link to a state that is nested
                        if (attrs.uiSref.indexOf('.') > -1) {
                            parentState = attrs.uiSref.split('.')[0];
                        }
                        // else if it's a parent state
                        else parentState = attrs.uiSref;

                        var applyActiveClassIfNestedState = function applyActiveClassIfNestedState(e, _ref2) {var toState = _ref2.toState;
                            if (toState.name.indexOf('.') > -1 && toState.name.split('.')[0] === parentState) {
                                elem[0].classList.add(attrs.uiSrefActiveNested);
                            } else
                            if (toState.name.indexOf('.') === -1 && toState.name === parentState) {
                                elem[0].classList.add(attrs.uiSrefActiveNested);
                            } else
                            elem[0].classList.remove(attrs.uiSrefActiveNested);
                        };

                        var unsub = PubSub.subscribe('stateChange', applyActiveClassIfNestedState);

                        applyActiveClassIfNestedState(null, { toState: $state.current });

                        scope.$on('$destroy', function () {
                            PubSub.unsubscribe(unsub);
                        });
                    } };

            } };

    }]);

    var goToState = function goToState($state, $rootScope, stateName, toState, toParams, fromState, fromParams) {
        $state.go(stateName, toParams, { notify: false }).then(function () {
            $rootScope.$broadcast('$stateChangeSuccess', { toState: toState, toParams: toParams, fromState: fromState, fromParams: fromParams });
        });
    };


    angular.module('cui.authorization', []).
    factory('cui.authorization.routing', ['cui.authorization.authorize', '$timeout', '$rootScope', '$state', function (authorize, $timeout, $rootScope, $state) {
        var routing = function routing(toState, toParams, fromState, fromParams, userEntitlements) {var loginRequiredState = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'loginRequired';var nonAuthState = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 'notAuthorized';

            var authorized = void 0;

            if (toState.access !== undefined) {
                authorized = authorize.authorize(toState.access.loginRequired, toState.access.requiredEntitlements, toState.access.entitlementType, userEntitlements);

                var stateName = void 0;

                switch (authorized) {
                    case 'login required':
                        stateName = loginRequiredState;
                    case 'not authorized':
                        stateName = nonAuthState;
                    default:
                        break;
                    case 'authorized':
                        stateName = toState.name;
                        break;}
                ;

                goToState($state, $rootScope, stateName, toState, toParams, fromState, fromParams);
            } else
            {
                goToState($state, $rootScope, toState.name, toState, toParams, fromState, fromParams);
            }
        };

        return routing;
    }]).
    factory('cui.authorization.authorize', [function () {
        var authorize = function authorize(loginRequired, requiredEntitlements) {var entitlementType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'atLeastOne';var userEntitlements = arguments[3];
            var loweredPermissions = [],
            hasPermission = true,
            result = 'not authorized';

            if (loginRequired === true && userEntitlements === undefined) {
                result = 'login required';
            } else
            if (loginRequired === true && userEntitlements !== undefined && (requiredEntitlements === undefined || requiredEntitlements.length === 0)) {
                // Login is required but no specific permissions are specified.
                result = 'authorized';
            } else
            if (requiredEntitlements) {
                angular.forEach(userEntitlements, function (permission) {
                    loweredPermissions.push(permission.toLowerCase());
                });
                for (var i = 0; i < requiredEntitlements.length; i++) {
                    var permission = requiredEntitlements[i].toLowerCase();

                    if (entitlementType === 'all') {
                        hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                        // i1f all the permissions are required and hasPermission is false there is no point carrying on
                        if (hasPermission === false) break;
                    } else
                    if (entitlementType === 'atLeastOne') {
                        hasPermission = loweredPermissions.indexOf(permission) > -1;
                        // if we only need one of the permissions and we have it there is no point carrying on
                        if (hasPermission) break;
                    }
                }
                result = hasPermission ? 'authorized' : 'not authorized';
            }
            return result;
        };

        return { authorize: authorize };
    }]).
    directive('cuiAccess', ['cui.authorization.authorize', function (authorize) {
        return {
            restrict: 'A',
            scope: {
                userEntitlements: '=',
                cuiAccess: '=' },

            link: function link(scope, elem, attrs) {
                var requiredEntitlements = scope.cuiAccess && scope.cuiAccess.requiredEntitlements || [];
                var entitlementType = scope.cuiAccess && scope.cuiAccess.entitlementType || 'atLeastOne';

                var notAuthorizedClasses = attrs.notAuthorizedClasses && attrs.notAuthorizedClasses.split(',').map(function (className) {return className.trim();});
                var initalDisplay = elem.css('display');

                var giveAuth = function giveAuth() {
                    if (notAuthorizedClasses) {
                        notAuthorizedClasses.forEach(function (className) {return elem[0].classList.remove(className);});
                    } else
                    elem.css('display', initalDisplay);
                };

                var removeAuth = function removeAuth() {
                    if (notAuthorizedClasses) {
                        notAuthorizedClasses.forEach(function (className) {return elem[0].classList.add(className);});
                    } else
                    elem.css('display', 'none');
                };


                scope.$watch('userEntitlements', function () {
                    var authorized = authorize.authorize(true, requiredEntitlements, entitlementType, scope.userEntitlements);
                    if (authorized !== 'authorized') removeAuth();else
                    giveAuth();
                });
            } };

    }]);


})(angular);
//# sourceMappingURL=cui-ng.js.map
