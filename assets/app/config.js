angular.module('app')
.config(function ($translateProvider, $locationProvider, $cuiIconProvider, $cuiI18nProvider, $stateProvider, $urlRouterProvider, $injector, localStorageServiceProvider, $paginationProvider, $cuiResizeHandlerProvider) {

    // This is the prefix to be used by the local storage module. Set this to whatever you'd like.
    localStorageServiceProvider.setPrefix('cui')

    // Base directory of your partials. Used to concatenate with the template name in the state definitions
    var templateBase = 'assets/app/directives-showcase/components/'

    var returnCtrlAs = function (name, asPrefix) {
        // Help function to build controller as syntax
        // returnCtrlAs('test', 'new') returns 'testCtrl as newTest'
        // returnCtrlAs('test') returns 'testCtrl as test'
        return name + 'Ctrl as ' + ( asPrefix? asPrefix : '' ) + ( asPrefix? name[0].toUpperCase() + name.slice(1,name.length) : name )
    }

    // We are using UI-router in this SDK, it's better than the baked in routing option for a multitude of reasons,
    // the biggest of them being the ability to set nested states with multiple views per state.
    // See more here https://github.com/angular-ui/ui-router
    $stateProvider
    .state('index', {
        url: '/',
        templateUrl: 'assets/common-templates/tableOfContents/tableOfContents.html',
    })
    .state('autoComplete', {
        url: '/auto-complete',
        templateUrl: templateBase + 'auto-complete/auto-complete.html',
        controller: returnCtrlAs('autoComplete')
    })
    .state('classToggle', {
        url: '/class-toggle',
        templateUrl: templateBase + 'class-toggle/class-toggle.html',
    })
    .state('cuiAuthorization', {
        url: '/cui-authorization',
        templateUrl: templateBase + 'cui-authorization/cui-authorization.html',
        controller: returnCtrlAs('cuiAuthorization')
    })
    .state('cuiAvatar', {
        url: '/cui-avatar',
        templateUrl: templateBase + 'cui-avatar/cui-avatar.html',
        controller: returnCtrlAs('cuiAvatar')
    })
    .state('cuiButton', {
        url: '/cui-button',
        templateUrl: templateBase + 'cui-button/cui-button.html',
        controller: returnCtrlAs('cuiButton')
    })
    .state('cuiDropdown', {
        url: '/cui-dropdown',
        templateUrl: templateBase + 'cui-dropdown/cui-dropdown.html',
        controller: returnCtrlAs('cuiDropdown')
    })
    .state('cuiExpandable', {
        url: '/cui-expandable',
        templateUrl: templateBase + 'cui-expandable/cui-expandable.html'
    })
    .state('cuiIcon', {
        url: '/cui-icon',
        templateUrl: templateBase + 'cui-icon/cui-icon.html'
    })
    .state('cuiPopover', {
        url: '/cui-popover',
        templateUrl: templateBase + 'cui-popover/cui-popover.html',
        controller: returnCtrlAs('cuiPopover')
    })
    .state('cuiResizeHandler', {
        url: '/cui-resize-handler',
        templateUrl: templateBase + 'cui-resize-handler/cui-resize-handler.html',
        controller: returnCtrlAs('cuiResizeHandler')
    })
    .state('cuiTable', {
        url: '/cui-table?page&pageSize&sortBy&sortType',
        templateUrl: templateBase + 'cui-table/cui-table.html',
        controller: returnCtrlAs('cuiTable')
    })
    .state('cuiTree', {
        url: '/cui-tree',
        templateUrl: templateBase + 'cui-tree/cui-tree.html',
        controller: returnCtrlAs('cuiTree')
    })
    .state('cuiTreeAdvanced', {
        url: '/cui-tree-advanced',
        templateUrl: templateBase + 'cui-tree-advanced/cui-tree-advanced.html',
        controller: returnCtrlAs('cuiTreeAdvanced')
    })
    .state('cuiWizard', {
        url: '/cui-wizard',
        templateUrl: templateBase + 'cui-wizard/cui-wizard.html'
    })
    .state('customError', {
        url: '/custom-error',
        templateUrl: templateBase + 'custom-error/custom-error.html',
        controller: returnCtrlAs('customError')
    })
    .state('focusIf', {
        url: '/focus-if',
        templateUrl: templateBase + 'focus-if/focus-if.html',
        controller: returnCtrlAs('focusIf')
    })
    .state('inlineEdit', {
        url: '/inline-edit',
        templateUrl: templateBase + 'inline-edit/inline-edit.html',
        controller: returnCtrlAs('inlineEdit')
    })
    .state('match', {
        url: '/match',
        templateUrl: templateBase + 'match/match.html',
        controller: returnCtrlAs('match')
    })
    .state('offClick', {
        url: '/off-click',
        templateUrl: templateBase + 'off-click/off-click.html',
        controller: returnCtrlAs('offClick')
    })
    .state('onEnter', {
        url: '/on-enter',
        templateUrl: templateBase + 'on-enter/on-enter.html',
        controller: returnCtrlAs('onEnter')
    })
    .state('paginate', {
        url: '/paginate',
        templateUrl: templateBase + 'paginate/paginate.html',
        controller: returnCtrlAs('paginate')
    })
    .state('passwordValidation', {
        url: '/password-validation',
        templateUrl: templateBase + 'password-validation/password-validation.html',
        controller: returnCtrlAs('passwordValidation')
    })
    .state('resultsPerPage', {
        url: '/results-per-page',
        templateUrl: templateBase + 'results-per-page/results-per-page.html',
        controller: returnCtrlAs('resultsPerPage')
    })
    .state('tagsInput', {
        url: '/tags-input',
        templateUrl: templateBase + 'tags-input/tags-input.html',
        controller: returnCtrlAs('tagsInput')
    })

    // This is used to remove the # from the URLs in an angular app. To be able to use this,
    // you'll require some server side config, so that every path serves the index.html file.
    // Rread more: https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode
    // $locationProvider.html5Mode(true);

    //fixes infinite digest loop with ui-router
    $urlRouterProvider.otherwise( function($injector) {
      var $state = $injector.get("$state");
      // this will be the state a user is directed to when angular can't find a match for the URL it receives.
      // You can use this to redirect to a 404 page
      $state.go('index')
    })

    if (appConfig.languages) {
        // This should not be altered, unless you want to get language files from a different location
        // than node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/
        if (!$cuiI18nProvider) {
            throw new Error('You have languages configured in your appConfig.json file, but you don\'t have cui-i18n installed and/or injected into your config block.')
            return
        }
        // This block of code will set language preference for you app based on the order you set them in appConfig.json
        $cuiI18nProvider.setLocaleCodesAndNames(appConfig.languages)
        var languageKeys = Object.keys($cuiI18nProvider.getLocaleCodesAndNames())

        var returnRegisterAvailableLanguageKeys = function() {
            // set unknown languages to reroute to prefered language
            var object = {'*': languageKeys[0]}
            languageKeys.forEach(function(languageKey) {
                //redirect language keys such as en_US to en or en-US to en
                object[languageKey + '*'] = languageKey
            })
            return object
        }

        $translateProvider
        .useLoader('LocaleLoader',{
            url: 'node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/',
            prefix: 'locale-',
            suffix: '.json'
        })
        .registerAvailableLanguageKeys(languageKeys, returnRegisterAvailableLanguageKeys())
        .uniformLanguageTag('java')
        .determinePreferredLanguage()
        .fallbackLanguage(languageKeys)

        $cuiI18nProvider.setLocalePreference(languageKeys)
    }

    if (appConfig.iconSets) {
        appConfig.iconSets.forEach(iconSet => {
            $cuiIconProvider.iconSet(iconSet.name, iconSet.path, iconSet.defaultViewBox || null)
        })
    }

    // Used for results-per-page and paginate
    if (appConfig.paginationOptions) {
        $paginationProvider.setPaginationOptions(appConfig.paginationOptions)
    }
    else throw new Error('You don\'t have any paginationOptions set in appConfig.json')

    // cui-resize-handler
    if (appConfig.breakpointOption) $cuiResizeHandlerProvider.setBreakpoint(appConfig.breakpointOption)
    else throw new Error('You don\'t have any breakpointOptions set in appConfig.json')
})

angular.module('app')
.run(['LocaleService','$cuiI18n','$cuiIcon','$rootScope','$state','$http','$templateCache','cui.authorization.routing','Menu',
    function(LocaleService,$cuiI18n,$cuiIcon,$rootScope,$state,$http,$templateCache,routing,Menu){

    if (appConfig.languages) {
        // This should not be altered, unless you want to get language files from
        // a different location than node_modules/@covisint/cui-i18n/dist/cui-i18n/angular-translate/
        if (!$cuiI18n) {
            throw new Error('You have languages configured in your appConfig.json file, but you don\'t have cui-i18n installed and/or injected into your config block.')
            return
        }

        var languageNameObject = $cuiI18n.getLocaleCodesAndNames()
        for(var LanguageKey in languageNameObject) {
            LocaleService.setLocales(LanguageKey, languageNameObject[LanguageKey])
        }
    }

    if (appConfig.iconSets) {
        if (!$cuiIcon) {
            throw new Error('You have icon sets configured in your appConfig.json file, but you don\'t have cui-icons installed and/or injected into your config block.')
            return
        }
        angular.forEach($cuiIcon.getIconSets(), function(iconSettings, namespace) {
            $http.get(iconSettings.path, {
                cache: $templateCache
            })
        })
    }
}])
