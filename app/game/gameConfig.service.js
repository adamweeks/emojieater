(function() {
    'use strict';

    angular.module('gridded.gameConfig', ['ionic.utils', 'GamePieceService'])
        .service('GameConfigService', ['GamePieceService', '$localstorage', GameConfigService]);

    function GameConfigService(GamePieceService, $localstorage) {
        var service = this;
        
        var _settings;
        var _settingsKey = 'gridded.settings';
        var _pieceTheme = GamePieceService.themes.dessert;
        
        function _loadDefaultSettings() {
            return {
                piecesCount: 5,                            
                chosenTheme: 'dessert',
                times: {    
                        disappear: 400,
                        reappear: 250
                    }        
            };
        }
        
        function _loadSettingsFromDisk() {
            return $localstorage.getObject(_settingsKey);
        }

        /**
         * Sets the amount of different kinds of game pieces
         * @param count
         */
        service.setPiecesCount = function(count) {
            if (count <= _pieceTheme.pieces.length) {
                _settings.piecesCount = count;
            }
            else {
                _settings.piecesCount = _pieceTheme.pieces.length;
            }
        };

        /**
         * Gets the game pieces based off of piece count setting
         * @returns {Array.<T>}
         */
        service.getPieces = function() {
            return _pieceTheme.pieces.slice(0, _settings.piecesCount);
        };

        service.setTheme = function(themeName) {
            _pieceTheme = GamePieceService.themes[themeName];
        };

        service.getTheme = function() {
            return _pieceTheme;
        };
        
        service.loadSettings = function() {
            if (_settings) {
                return _settings;    
            }
            else {
                _settings = _loadDefaultSettings();
                var loadedSettings = _loadSettingsFromDisk();
                angular.extend(_settings, loadedSettings);
                service.setTheme(_settings.chosenTheme);
                service.setPiecesCount(_settings.piecesCount);
                return _settings;
            }
            
        };
        
        service.saveSettings = function() {
            $localstorage.setObject(_settingsKey, _settings);
        };

        return service;
    }
})();
