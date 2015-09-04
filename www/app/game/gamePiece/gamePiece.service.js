(function() {
    'use strict';

    angular
        .module('GamePieceService',['emojiService'])
        .service('GamePieceService', ['EmojiService', GamePieceService]);

    function GamePieceService(EmojiService) {
        var service = this;

        service.types = {
            regular: 'regular',
            empty: 'empty'
        };

        service.themes = {
            letters: {
                name: 'letters',
                pieces: ['A', 'B', 'C', 'D', 'E']
            },
            numbers: {
                name: 'numbers',
                pieces: ['1','2','3','4','5']
            },
            emoji: {
                name: 'emoji',
                pieces: [
                    EmojiService.emojis.smile,
                    EmojiService.emojis.hearts,
                    EmojiService.emojis.crying,
                    EmojiService.emojis.madFace,
                    EmojiService.emojis.tongue
                ]
            },
            dessert: {
                name: 'dessert',
                pieces: [
                    EmojiService.emojis.cookie,
                    EmojiService.emojis.iceCream,
                    EmojiService.emojis.donut,
                    EmojiService.emojis.lollipop
                ]
            }
        };

        service.newGamePiece = newGamePiece;

        /**
         * Creates a new game piece
         * @returns {GamePiece}
         */
        function newGamePiece() {
            return new GamePiece();
        }

        var GamePiece = function() {
            this.type = null;
            this.value = null;
            this.isEmpty = false;
            this.removing = false;
            this.theme = null;
        };

        GamePiece.prototype.setType = function(type) {
            this.type = type;
            this.isEmpty = this.type === service.types.empty;
            return this;
        };

        GamePiece.prototype.setValue = function(value) {
            this.value = value;
            return this;
        };

        GamePiece.prototype.setTheme = function(theme) {
            this.theme = theme;
            return this;
        };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        return service;
    }
})();
