const defaultsAlt = {
    cuiTreeAltNest0Class : 'cui-tree-alt--nesting-0',
    cuiTreeAltNestXClass : 'cui-tree-alt--nested',
    cuiTreeAltLeafWrapper: '<div class="cui-tree-alt__leaf"></div>',
    cuiTreeAltLastLeafClass : 'cui-tree-alt__leaf--last',
    cuiTreeAltBranchWrapper: '<div class="cui-tree-alt__branch"></div>',
    cuiTreeAltLastBranchClass : 'cui-tree-alt__branch--last',
    cuiTreeAltNestPrefix : 'cui-tree-alt--nesting-'
};

const cuiTreeAltHelpers = {
    getDisplayValue:(scope, opts, object) => {
        const { cuiTreeAltLeafDisplay } = opts;
        let propertiesToDisplay = cuiTreeAltLeafDisplay.split('+');

        return scope.$eval(cuiTreeAltLeafDisplay, { object });
    },
    getClassListForNestingLevel: (opts,nesting) => {
        const { cuiTreeAltNestPrefix, cuiTreeAltNest0Class, cuiTreeAltNestXClass } = opts;
        let classList = [];
        switch (nesting){
            case 0:
                classList.push( cuiTreeAltNest0Class || defaultsAlt.cuiTreeAltNest0Class );
                break;
            default:
                classList.push((cuiTreeAltNestPrefix || defaultsAlt.cuiTreeAltNestPrefix) + nesting);
                classList.push( cuiTreeAltNestXClass || defaultsAlt.cuiTreeAltNestXClass );
        };
        return classList;
    },
    getElements : (scope, opts, objects, leafClickCallback, toggleExpandCallback,nesting=0, parent) => {
        const { getElements, getDisplayValue, getClassListForNestingLevel } = cuiTreeAltHelpers;
        const { cuiTreeAltBranchWrapper, cuiTreeAltLeafWrapper, cuiTreeAltLastLeafClass, cuiTreeAltLastBranchClass } = opts;
        let $node = $(`<div></div>`);
        getClassListForNestingLevel(opts,nesting).forEach(className => $node[0].classList.add(className));
        objects.forEach((object,i) => {
            const $leafInner = $(`<span></span>`);
            const $leafExpandIcon=$(`<div><svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="cui-tree-icon" viewBox="0 0 216 146">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="node_modules/@covisint/cui-icons/dist/font-awesome/font-awesome-out.svg#plus27"></use>
                </svg></div`)
            const $leafCollapseIcon=$(`<div><svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="cui-tree-icon" viewBox="0 0 216 146">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="node_modules/@covisint/cui-icons/dist/font-awesome/font-awesome-out.svg#minus19"></use>
                </svg></div>`)
            const $leafInnerText = $(`<span>${ getDisplayValue(scope, opts, object) }</span>`);
            // const $leafInnerExpandIcon = $(`<span>t</span>`) ;
            if (!parent) {
                if (!object.children) {
                    $leafInner.append($leafExpandIcon);
                    $leafExpandIcon[0].classList.add('cui-tree-hide-icon')
                }else{
                    if (object.expanded) {
                        $leafInner.append($leafCollapseIcon);
                    }else{
                        $leafInner.append($leafExpandIcon);
                    }
                }
                if(leafClickCallback) $leafInnerText[0].addEventListener("click",function(e){ leafClickCallback(object,this,e) },true);
                if(toggleExpandCallback) $leafInner[0].children[0].addEventListener("click",function(e){ toggleExpandCallback(object,this,e) },true);
            }
            $leafInner.append($leafInnerText);
            const $leafWrapper = $(cuiTreeAltLeafWrapper || defaultsAlt.cuiTreeAltLeafWrapper);
            $leafWrapper.append($leafInner);
            if(i === objects.length-1) $leafWrapper[0].classList.add(cuiTreeAltLastLeafClass || defaultsAlt.cuiTreeAltLastLeafClass); // add class to last leaf of each indent level.
            if(object.children&&(parent||object.expanded===true)) { // if it has children creat a new branch for the leaf and it's children
                const $branchWrapper = $(cuiTreeAltBranchWrapper || defaultsAlt.cuiTreeAltBranchWrapper).append($leafWrapper);
                if(i === objects.length-1) $branchWrapper[0].classList.add(cuiTreeAltLastBranchClass || defaultsAlt.cuiTreeAltLastBranchClass);
                $branchWrapper.append(getElements(scope, opts, object.children, leafClickCallback, toggleExpandCallback, nesting + 1)); // recursively gets the child nodes
                $node.append($branchWrapper);
            }
            else {
                $node.append($leafWrapper);
            }
        });
        return $node;
    }
};

const cuiTreeAlt = {
    pre: (scope,elem,attrs) => {
        let $tree;
        const leafClickCallback = scope.$eval(attrs.cuiTreeAltLeafClickCallback);
        const toggleExpandCallback = scope.$eval(attrs.cuiTreeAltToggleExpandCallback);
        const renderTree = (tree) => {
            if($tree) {
                $tree.detach();
                $tree.children().unbind();
            }
            $tree = cuiTreeAltHelpers.getElements(scope, attrs, tree, leafClickCallback,toggleExpandCallback,0,true);
            elem.append($tree);
        };

        scope.$watch(()=>scope.$eval(attrs.cuiTreeAlt),(newTree)=>{
            if(newTree) renderTree(newTree);
        },true);

        scope.$on('$destroy',()=>{
            $tree.children().unbind();
        });
    }
};

angular.module('cui-ng')
.directive('cuiTreeAlt',[()=>{
    return {
        restrict:'A',
        scope: true,
        compile: ()=>{
            return cuiTreeAlt;
        }
    }
}]);