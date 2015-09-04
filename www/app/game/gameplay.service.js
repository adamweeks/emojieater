(function() {
	'use strict';
	angular
		.module('gridded.gameplayService', [])
		.service('GameplayService', GameplayService);
		
	function GameplayService() {
		var service = this;
		
		function Game() {
			this.movesRemaining = 1;
			this.minimumCombination = 1;
			this.level = 1;
			this.levelUpAction = function(){};
		}
		
		Game.prototype.playTurn = function(pieceCount) {
			if (pieceCount >= this.minimumCombination) {				
				if(this.movesRemaining) {
					this.movesRemaining--;
				}
				else {
					// Level Up
					this.minimumCombination++;
					this.level++;
					this.movesRemaining = this.level + 1;	
					this.levelUpAction();								
				}
				return true;
			}
			else {
				return false;
			}
		};
		
		Game.prototype.setLevelUpAction = function(levelUpAction) {
			this.levelUpAction = levelUpAction;
			return this;
		};
		
		service.newGame = function() {
			return new Game();
		};
	}
})();