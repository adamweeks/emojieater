(function() {
	'use strict';
	angular.module('gridded.settings',['GamePieceService'])
		.controller('GameSettingsController', ['GamePieceService', GameSettingsController])
		.directive('gameSettings', GameSettingsDirective);
		
	function GameSettingsController(GamePieceService) {
		var vm = this;
		vm.themes = GamePieceService.themes;		
	}
	
	function GameSettingsDirective() {
		return {
            restrict:         'E',
            scope:            {                
				settings: '=',
				saveSettings: '&'
            },
            templateUrl:      'app/game/gameSettings.directive.html',
            controller:       'GameSettingsController',
            controllerAs:     'vm',
            bindToController: true,
        };
	}
})();