/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
(function(){
	'use strict';
	angular.module('gridded.gameStart',['gridded.settings'])
		.controller('GameStartController', GameStartController)
		.directive('gameStart', GameStartDirective);
	
	function GameStartController() {
		var vm = this;
		
		vm.doSaveSettings = function() {
			vm.showSettings = false;
			vm.saveSettings();
		};
	}
	
	function GameStartDirective() {
		return {
            restrict:         'E',
            scope:            {
                startGame:    '&',
				settings: '=',
				saveSettings: '&'
            },
            templateUrl:      'app/game/gameStart.directive.html',
            controller:       'GameStartController',
            controllerAs:     'vm',
            bindToController: true,
        };
	}
 })();