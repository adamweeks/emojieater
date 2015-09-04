(function() {
    'use strict';
    angular.module('emojiService', [])
        .service('EmojiService', EmojiService);

    function EmojiService() {
        var service = this;
        
        // http://apps.timwhitlock.info/emoji/tables/unicode
        service.emojis = {
            smile: '😁',
            hearts: '😍',
            madFace: '😡',
            crying: '😭',
            tongue: '😝',
            cookie: '🍪',
            donut: '🍩',
            iceCream: '🍦',
            cake: '🍰',
            lollipop: '🍭'
        };

        return service;
    };
})();
