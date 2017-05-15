angular.module('app')
.controller('cuiTreeAdvancedCtrl', function($scope) {

	const cuiTreeAdvanced = this
	cuiTreeAdvanced.tree= [
	{id:1,text:'Parent',children:[
		{id:1,text:'children',children:[
		{id:11,text:'children'},
		{id:12,text:'children'}
	],expanded:false},
		{id:2,text:'children',children:[
		{id:11,text:'children',children:[
		{id:11,text:'children'},
		{id:12,text:'children'}
	],expanded:false},
		{id:12,text:'children'}
	],expanded:false},
		{id:2,text:'children'},
		{id:2,text:'children'}
	]}
	]
	cuiTreeAdvanced.leafClickCallback = (object, currentObject, e) => {
		console.log(currentObject)
	}
	cuiTreeAdvanced.toggleExpand = (object) => {
		object.expanded=!object.expanded
		$scope.$digest()
	}
})