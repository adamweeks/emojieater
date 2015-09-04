(function(){
    'use strict';

    angular.module('gridded.mobile')
        .service('ScoreService', ScoreService);

    function ScoreService(){
        var service = this;

        /**
         * Calculates Score
         * @param pieces
         * @returns {*}
         */
        service.calculateScore = function(pieces) {
            // Y=X(X-1)
            return pieces * (pieces - 1);
        };

        return service;
    }
})();
