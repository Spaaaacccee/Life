(function () {
    var currentGame;
    var gameObject = new (function () {
        this.block = function(){};
    })();
    var character = function () {

    };
    var physics = function () {

    };
    var renderer = function () {

    };
    var stage = function () {

    };
    var camera = function () {

    };

    var game = function () {
        currentGame = game;
        this.physics = new physics();
        this.renderer = new renderer();
        this.stage = new stage();
        this.camera = new camera();
    };
    var init;
})()
