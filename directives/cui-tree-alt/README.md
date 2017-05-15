# CUI-Tree-Alternative
Version 1.0


### Description
Cui-Tree-alternative is a directive that generates a tree like markup structure with expandable and collapsable functionalities, based on an array of objects with 'children' .

### Usage Example

```html
  <div class="cui-tree-alt" cui-tree-alt="app.tree" cui-tree-alt-leaf-display="object.text"></div>
```

* cui-tree-alt-leaf-display determines what to show in each leaf, and it accepts: properties from each object (use object.propertyName), strings ( wrap them in '' ) and filters ( ex: (object.name | cuiI18n) ). You can also concat display values ( ex : cui-tree-alt-leaf-display="object.text + ' ' + object.text2" )

This directive expects Second and down the level objects with children to have one more boolean property "expanded" set intially to false.
```javascript
    app.tree=[
        {
            text:"I'm a parent node",
            children: [{
                text:"I'm a child with Children",
                children:[{
                text:"I am a second level child"
                }],
                expanded:false
            },
            {
                text:"I'm a child without Children"
            }]
        },
        {
            text:"I'm a sibling of the parent"
        }
    ];
```

### Optional attributes

Note:
* by "nesting level" we're referring to the nesting of a certain "leaf" in a tree. So a top level parent has nesting level 0, a child of that parent has nesting level 1, its child has nesting level 2, and so on.
* a "leaf" is an object in our tree. A "branch" is a conglomerate of a branch and it's children.

* `cui-tree-alt-nest-0-class` (default: 'cui-tree-alt--nesting-0') - class that wraps the whole tree, starting at level 0 nesting.
* `cui-tree-alt-nest-x-class` (default: 'cui-tree-alt--nested') - class that wraps each "branch" that has at least level 1 nesting.
* `cui-tree-alt-leaf-wrapper`(default:'<div class="cui-tree-alt__leaf"></div>') - html wrapper for each leaf in the tree
* `cui-tree-alt-last-leaf-class` (default: 'cui-tree-alt__leaf--last') - class to apply to a leaf it if its the last leaf on that branch
* `cui-tree-alt-branch-wrapper` (default:'<div class="cui-tree-alt__branch"></div>') - html wrapper for each branch
* `cui-tree-alt-last-branch-class` (default: 'cui-tree-alt__branch--last') - class to wrap the parent leaf and it's children if that leaf is the last leaf on that nesting level
* `cui-tree-alt-nest-prefix` (default: 'cui-tree-alt--nesting-) - class prefix to apply to every nesting level after level 0. (would be cui-tree-alt--nesting-1, cui-tree-alt--nesting-2, and so on)
* `cui-tree-alt-leaf-click-callback` - callback function to a click on a leaf. This function is called with 3 params - the object on the leaf that got clicked, the leaf html element that got clicked (so we can manipulate classes) and the JS click event, in that order.


![cui-tree-alt-example](https://github.com/covisint/cui-ng/tree/master/directives//cui-tree-alt/cui-tree-alt.png?raw=true)

## Change Log 5/12/2017

* Now using scope.$eval to parse the display value. No breaking changes.