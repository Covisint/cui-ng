angular.module('cui-ng')
.directive('tether',[function(){
  return {
    restrict:'A',
    scope:{
      constrains: '='
    },
    link : function(scope,elem,attrs){
      new Tether({
        element: elem,
        target: attrs.target,
        attachment: attrs.attachment || 'top center',
        targetAttachment: attrs.targetAttachment || 'bottom center',
        offset: attrs.offset || '0 0',
        targetOffset: attrs.targetOffset || '0 0',
        targetModifier: attrs.targetModifier || undefined,
        constrains: scope.constrains || undefined
      });
    }
  };
}]);