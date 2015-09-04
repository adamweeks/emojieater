(function() {
    'use strict';

    angular
        .module('gridded.mobile')
        .controller('GameController', ['$q', '$timeout', 'GameConfigService', 'GamePieceService', 'ScoreService', 'GameplayService', GameController])
        .directive('gridGame', [gridGame]);

    function GameController($q, $timeout, GameConfigService, GamePieceService, ScoreService, GameplayService) {
        var vm = this;

        vm.emptyPieceType = 'empty';
        vm.gameScore = {
            points: 0,
            combo: 0
        };
        vm.gameStarted = false;
        vm.piecesCount = 5;     
        
        vm.animations = {
            show: false,
            text: '',
            timeout: null            
        };
        
        vm.activate = function() {
            vm.setupGrid(vm.rows, vm.columns);
            vm.settings = GameConfigService.loadSettings();
        };

        vm.startGame = function() {
            vm.game = GameplayService.newGame().setLevelUpAction(vm.levelUpAction);
            GameConfigService.setTheme(vm.settings.chosenTheme);
            GameConfigService.setPiecesCount(vm.piecesCount);
            vm.gamePieceValues = GameConfigService.getPieces();

            vm.gameScore.points = 0;
            vm.gameScore.combo = 0;

            // Check to make sure our initial board is playable
            var canPlay = false;
            do {
                vm.createGamePieces();
                canPlay = vm.playsAvailable();
            } while (!canPlay);

            vm.gameStarted = true;
            showAnimation('TAP TO EAT!', 3500);
        };
        
        vm.saveSettings = function() {
            GameConfigService.saveSettings();
        };

        /**
         * Called after a game over and the scoreboard is shown
         */
        vm.restartGame = function() {
            vm.startGame();
            vm.gameOver = false;
            // vm.gameScore.points = 0;
            // vm.gameScore.combo = 0;
            // vm.gameStarted = true;
            // vm.gameOver = false;
        };

        /**
         * Sets up the playing grid based on rows and columns passed
         * @param rows
         * @param columns
         */
        vm.setupGrid = function(rows, columns) {
            // Positions contain grid information about each position
            vm.positions = [];

            // Grid is our multi dimension array
            vm.grid = [];
            for (var row = 0; row < rows; row++) {
                vm.grid[row] = [];
                for (var column = 0; column < columns; column++) {
                    vm.grid[row].push(vm.createGridObject(vm.positions.length, row, column));

                    // Create reverse lookup for positions
                    vm.positions.push({
                        row: row,
                        column: column
                    });
                }
            }
        };

        vm.gamePieceForPosition = function(position) {
            return vm.gamePieces[position];
        };

        /**
         * Assigns a game piece for every position on the board
         */
        vm.createGamePieces = function() {
            vm.gamePieces = [];
            vm.positions.forEach(function() {
                vm.gamePieces.push(vm.newGamePiece());
            });
        };

        /**
         * Creates a new game piece for playing
         * @returns {{type: *}}
         */
        vm.newGamePiece = function() {
            var pieceInt = getRandomInt(0, vm.gamePieceValues.length);
            var pieceValue = vm.gamePieceValues[pieceInt];
            return GamePieceService.newGamePiece()
                .setType(GamePieceService.types.regular)
                .setValue(pieceValue);
        };

        vm.newEmptyPiece = function() {
            return GamePieceService.newGamePiece()
                .setType(GamePieceService.types.empty);
        };

        /**
         * Creates the cell object for each position
         * @param position
         * @param row
         * @param column
         * @returns {{position: *, row: *, column: *, clickAction: Function}}
         */
        vm.createGridObject = function(position, row, column) {
            return {
                position:    position,
                row:         row,
                column:      column,
                clickAction: function($event) {
                    $event.preventDefault();
                    vm.positionClicked(position);
                }
            };
        };

        /**
         * Called when a cell is clicked at `position`
         * @param position
         */
        vm.positionClicked = function(position) {
            var matchedPositions = vm.findMatchingPositions(position);
            if (vm.game.playTurn(matchedPositions.length)) {
                vm.gameScore.points += ScoreService.calculateScore(matchedPositions.length);
                vm.gameScore.combo = Math.max(vm.gameScore.combo, matchedPositions.length);
                vm.removePiecesAtPositions(matchedPositions).then(function() {
                    $timeout(function() {
                        vm.replaceEmptyPieces();
                        vm.checkForGameOver()
                    }, vm.settings.times.reappear);
                });
            }
        };

        /**
         * Loops through the pieces and replaces empty ones with new ones
         */
        vm.replaceEmptyPieces = function() {
            vm.gamePieces.map(function(gamePiece, index) {
                if (gamePiece.type === vm.emptyPieceType) {
                    vm.gamePieces[index] = vm.newGamePiece();
                }
            });
        };

        /**
         * Checks all positions to see if at least one has matches
         * @returns {boolean}
         */
        vm.playsAvailable = function() {
            return vm.positions.some(function(position, index) {
                var matchedPositions = vm.findMatchingPositions(index);
                return matchedPositions.length > vm.game.minimumCombination;
            });
        };

        /**
         * Checks for plays and sets the game over if none
         */
        vm.checkForGameOver = function() {
            var playsAvailable = vm.playsAvailable();
            if (!playsAvailable) {
                vm.gameOver = true;
            }
        };

        /**
         * Removes the pieces at the given positions
         * @param positions
         */
        vm.removePiecesAtPositions = function(positions) {
            var deferred = $q.defer();
            var gamePiece;
            // Set each game piece as removing state for animations
            positions.map(function(position) {
                gamePiece = vm.gamePieces[position];
                gamePiece.removing = true;
            });

            var doRemove = function() {
                for (var column = 0; column < vm.columns; column++) {
                    vm.removePiecesFromColumn(column);
                }
                deferred.resolve();
            };

            // Let the removing animate before actually doing the remove
            $timeout(doRemove, vm.settings.times.disappear);
            return deferred.promise;
        };

        /**
         * Removes all pieces marked as being removed and drops
         * @param column
         */
        vm.removePiecesFromColumn = function(column) {
            // Count pieces to remove from each column
            var gamePiece;
            var position;
            var row;
            var columnPositionsToRemove = 0;
            for (row = 0; row < vm.rows; row++) {
                position = vm.getPositionFromGrid(row, column);
                if(vm.gamePieces[position].removing) {
                    columnPositionsToRemove++;
                }
            }

            if (columnPositionsToRemove) {
                var shouldContinue;
                for (var removeLoop = 0; removeLoop < columnPositionsToRemove; removeLoop++) {
                    shouldContinue = true;
                    row = 0;
                    while (shouldContinue) {
                        if (row < vm.rows) {
                            position = vm.getPositionFromGrid(row, column);
                            gamePiece = vm.gamePieces[position];
                            if (gamePiece.removing) {

                                // Move all the pieces above this down one row
                                var moveFromPosition;
                                var moveToPosition;
                                for (var moveRow = row + 1; moveRow < vm.rows; moveRow++) {
                                    moveFromPosition = vm.getPositionFromGrid(moveRow, column);
                                    moveToPosition   = vm.getPositionFromGrid(moveRow - 1, column);

                                    vm.gamePieces[moveToPosition] = vm.gamePieces[moveFromPosition];
                                }

                                // Add a new empty piece at the top
                                vm.addEmptyPieceToTopOfColumn(column);

                                // We don't increment the row here because we just moved a new piece into the current one
                            }
                            else {
                                // Continue to the next row
                                row++;
                                shouldContinue = true;
                            }
                        }
                        else {
                            // We've reached the top of the column, stop processing
                            shouldContinue = false;
                        }
                    }
                }
            }
        };

        /**
         * Adds a new game piece to the top of specified column
         * @param column
         * @param piece
         */
        vm.addPieceToTopOfColumn = function(column, piece) {
            var topPositionForColumn = vm.getPositionFromGrid(vm.rows - 1, column);
            vm.gamePieces[topPositionForColumn] = piece;
        };

        /**
         *
         * @param column
         */
        vm.addEmptyPieceToTopOfColumn = function(column) {
            vm.addPieceToTopOfColumn(column,vm.newEmptyPiece());
        };



        /**
         * Finds matching positions based off of the starting position
         * @param startingPosition
         * @returns {*[]}
         */
        vm.findMatchingPositions = function(startingPosition) {
            // Get Game Piece at Position
            var gamePiece = vm.gamePieces[startingPosition];
            var gamePieceValue  = gamePiece.value;

            var matchedPositions = [startingPosition];
            var positionsToCheck = [startingPosition];
            var checkedPositions = [startingPosition];

            var position;
            var adjacentPositions;

            while (positionsToCheck.length) {
                position = positionsToCheck.pop();
                // Check to see if game pieces at adjacent positions match
                adjacentPositions = vm.getAdjacentPositions(position);
                adjacentPositions.forEach(function(adjacentPosition) {
                    // Check to see if we've already checked this position
                    if (checkedPositions.indexOf(adjacentPosition) === -1) {
                        var gamePieceAtPosition = vm.gamePieces[adjacentPosition];
                        if (gamePieceAtPosition.value === gamePieceValue) {
                            matchedPositions.push(adjacentPosition);

                            // Add to the list of positions to check
                            positionsToCheck.push(adjacentPosition);
                        }
                        // Add to the list of checked positions
                        checkedPositions.push(adjacentPosition);
                    }
                });
            }

            return matchedPositions;
        };


        /**
         * Get a position from a row and column
         * @param row
         * @param column
         * @returns {*|string}
         */
        vm.getPositionFromGrid = function(row, column) {
            var positionObject = vm.grid[row][column];
            return positionObject.position;
        };

        /**
         * Get the positions that are adjacent to the clicked position
         * @param index
         * @returns {Array}
         */
        vm.getAdjacentPositions = function(index) {
            var position = vm.positions[index];
            var row = position.row;
            var column = position.column;

            // Adjacent Positions are +/- 1 on each row and column
            var positions = [];

            // Left
            if (column) {
                var leftColumn = column - 1;
                var leftPosition = vm.getPositionFromGrid(row, leftColumn);
                positions.push(leftPosition);
            }

            // Right
            var rightColumn = column + 1;
            if (rightColumn < vm.columns) {
                var rightPosition = vm.getPositionFromGrid(row, rightColumn);
                positions.push(rightPosition);
            }

            // Up
            var upRow = row + 1;
            if (upRow < vm.rows) {
                var upPosition = vm.getPositionFromGrid(upRow, column);
                positions.push(upPosition);
            }

            // Down
            if (row) {
                var downRow = row - 1;
                var downPosition = vm.getPositionFromGrid(downRow, column);
                positions.push(downPosition);
            }

            return positions;
        };

        vm.levelUpAction = function() {
            showAnimation('LEVEL UP!', 1000);
        };


        vm.activate();

        function showAnimation(text, delay) {
            vm.animations.text = text;
            vm.animations.show = true;
            vm.animations.timeout = 
            $timeout(function() {
                vm.animations.show = false;
            }, delay);
        }
        
        vm.hideAnimation = function hideAnimation() {
            $timeout.cancel(vm.animations.timeout);
            vm.animations.show = false;
        }
        

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
    }

    function gridGame() {
        return {
            restrict:         'E',
            scope:            {
                rows:    '@',
                columns: '@'
            },
            templateUrl:      'app/game/game.directive.html',
            controller:       'GameController',
            controllerAs:     'vm',
            bindToController: true,
        };
    }
})();
