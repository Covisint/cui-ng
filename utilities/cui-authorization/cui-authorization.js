// -----------------------
// deprecated...
// -----------------------
const goToState = ($state,$rootScope,stateName,toState,toParams,fromState,fromParams) => {
  $state.go(stateName,toParams,{ notify:false }).then(()=>{
    $rootScope.$broadcast('$stateChangeSuccess',{toState,toParams,fromState,fromParams});
  });
};
// -----------------------


angular.module('cui.authorization',[])


// -----------------------
// new...
// -----------------------
.factory('cui.authorization.evalRouteRequest', ['cui.authorization.permitted', '$rootScope', '$state', (permitted, $rootScope, $state) => {
  const evalRouteRequest = (toState, toParams, fromState, fromParams, nonAuthState='notAuthorized') => {

    let resolvedState = permitted(toState.access.permittedLogic, toState.access.roles, toState.access.entitlements) ? toState.name : nonAuthState;
    cui.log('cui.authorization.evalRouteRequest', resolvedState, toState, toParams);

    $state.go(resolvedState, toParams, {notify: false}).then( () => {
      $rootScope.$broadcast('$stateChangeSuccess', {toState, toParams, fromState, fromParams});
    });
  };

  return evalRouteRequest;
}])
.factory('cui.authorization.permitted', [() => {
  function permitted(logic, roles, entitlements) {
    function hasAny(superset, subset) {
      return ! _.isEmpty( _.intersection(subset, superset) );
    }
    function hasAll(superset, subset) {
      return _.isEmpty( _.difference(subset, superset) );
    }
    function has(obj, superset) {
      if (obj) {
        if (obj.all) {
          return hasAll(superset, obj.all);
        } else if (obj.any) {
          return hasAny(superset, obj.any);
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    var rc = false;
    var hasRoles = false;
    var hasEntitlements = false;

    if (logic) {
      if (logic.all) {
        hasRoles = has(logic.all.roles, roles);
        hasEntitlements = has(logic.all.entitlements, entitlements);
        rc = hasRoles && hasEntitlements;
      } else if (logic.any) {
        hasRoles = has(logic.any.roles, roles);
        hasEntitlements = has(logic.any.entitlements, entitlements);
        rc = hasRoles || hasEntitlements;
      } else {
        rc = false;
      }
    } else {
      rc = true;
    }

    cui.log('cui.authorization.permitted', logic, rc, hasRoles, hasEntitlements);
    return rc;
  };

  return permitted;
}])
// -----------------------


// -----------------------
// deprecated...
// -----------------------
.factory('cui.authorization.routing', ['cui.authorization.authorize', '$timeout','$rootScope','$state',(authorize,$timeout,$rootScope,$state) => {
  const routing = (toState, toParams, fromState, fromParams, userEntitlements,loginRequiredState='loginRequired',nonAuthState='notAuthorized') => {

    let authorized;

    if (toState.access !== undefined) {
      authorized = authorize.authorize(toState.access.loginRequired, toState.access.requiredEntitlements, toState.access.entitlementType, userEntitlements);

      let stateName;

      switch (authorized){
        case 'login required':
          stateName = loginRequiredState;
        case 'not authorized':
          stateName = nonAuthState;
        default :
          break;
        case 'authorized':
          stateName = toState.name;
          break;
      };

      goToState($state,$rootScope,stateName,toState,toParams,fromState,fromParams);
    }
    else {
      goToState($state,$rootScope,toState.name,toState,toParams,fromState,fromParams);
    }
  };

  return routing;
}])
// -----------------------
// deprecated...
// -----------------------
.factory('cui.authorization.authorize', [() => {
  const authorize = (loginRequired, requiredEntitlements, entitlementType='atLeastOne', userEntitlements) => {
    let loweredPermissions = [],
        hasPermission = true,
        result='not authorized';

    if (loginRequired === true && userEntitlements === undefined) {
        result = 'login required';
    }
    else if ((loginRequired === true && userEntitlements !== undefined) && (requiredEntitlements === undefined || requiredEntitlements.length === 0)) {
    // Login is required but no specific permissions are specified.
        result = 'authorized';
    }
    else if (requiredEntitlements) {
        angular.forEach(userEntitlements, (permission) => {
            loweredPermissions.push(permission.toLowerCase());
        });
        for (let i = 0; i < requiredEntitlements.length; i++) {
            const permission = requiredEntitlements[i].toLowerCase();

            if (entitlementType === 'all') {
                hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                // i1f all the permissions are required and hasPermission is false there is no point carrying on
                if (hasPermission === false) break;
            }
            else if (entitlementType === 'atLeastOne') {
                hasPermission = loweredPermissions.indexOf(permission) > -1;
                // if we only need one of the permissions and we have it there is no point carrying on
                if (hasPermission) break;
            }
        }
        result = hasPermission ? 'authorized' : 'not authorized';
    }
    return result;
  };

    return { authorize }
}])
// -----------------------
// deprecated...
// -----------------------
.directive('cuiAccess',['cui.authorization.authorize',(authorize)=>{
    return{
        restrict:'A',
        scope: {
            userEntitlements:'=',
            cuiAccess:'='
        },
        link: (scope,elem,attrs) => {
            const requiredEntitlements = scope.cuiAccess && scope.cuiAccess.requiredEntitlements || [];
            const entitlementType = scope.cuiAccess && scope.cuiAccess.entitlementType || 'atLeastOne';

            const notAuthorizedClasses = attrs.notAuthorizedClasses && attrs.notAuthorizedClasses.split(',').map(className => className.trim());
            const initalDisplay = elem.css('display');

            const giveAuth = () => {
                if(notAuthorizedClasses) {
                    notAuthorizedClasses.forEach(className => elem[0].classList.remove(className));
                }
                else elem.css('display',initalDisplay);
            };

            const removeAuth = () => {
                if(notAuthorizedClasses) {
                    notAuthorizedClasses.forEach(className => elem[0].classList.add(className));
                }
                else elem.css('display','none');
            };


            scope.$watch('userEntitlements',() => {
                const authorized=authorize.authorize(true, requiredEntitlements, entitlementType, scope.userEntitlements);
                if(authorized!=='authorized') removeAuth();
                else giveAuth();
            });
        }
    };
}]);
