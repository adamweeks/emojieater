(function() {
    'use strict';

    angular
        .module('gridded.mobile')
        .controller('GamePieceController', [GamePieceController])
        .directive('gamePieceDisplay', [gamePiece]);

    function GamePieceController() {
        var vm = this;

        vm.activate = function() {

        };

        vm.activate();
    }

    function gamePiece() {
        return {
            restrict:         'E',
            scope:            {
                object: '='
            },
            templateUrl:      'app/game/gamePiece/gamePiece.html',
            controller:       'GamePieceController',
            controllerAs:     'vm',
            bindToController: true,
        };
    }
})();
