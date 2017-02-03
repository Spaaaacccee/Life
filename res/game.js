(function () {
    "use strict";
    var currentGame;
    /**
     * Contains methods for use in debugging.
     */
    var debug = new(function () {
        /**
         * Outputs a message to the console
         * @param {string|object} obj Object to display in the console.
         */
        this.log = function (obj) {
            console.log(obj);
        }
    })();
    /**
     * Contains methods for creating and manipulating gameObjects.
     */
    var gameObject = new(function () {
        /**
         * Creates a new generic element
         * @param {object} obj Options
         * @returns {genericObject} An empty gameObject
         */
        this.genericObject = function (obj) {};
        /**
         * Creates a new block element
         * @param {object} obj Options
         * @param {int} obj.blockSize (Optional) Define the size of the block
         * @returns {block} A block gameObject
         */
        this.block = function (obj) {
            gameObject.genericObject.call(this, obj);
            this.blockSize = obj.blockSize || 40
            var def = {
                width: blockSize / 2,
                height: blockSize / 2
            }
            this.physics = new currentGame.physics.create.rectangle(def);
            this.renderer = new currentGame.renderer.create.rectangle(def);
            this.physics.gameObject = this;
        };
    })();
    var character = function () {};
    /**
     * Create a new physics instance
     * @type {physics}
     * @param {object} obj Options
     * @param {b2Vec2} obj.gravity Sets the gravity of the world
     * @return {physics} A new physics instance
     */
    var physics = function (obj) {
        var b2 = {
            d: Box2D.Dynamics,
            c: Box2D.Collision,
            m: Box2D.Common.Math,
            s: Box2D.Collision.Shapes,
        };
        var gravity = (obj && obj.gravity) ? obj.gravity : new b2.m.b2Vec2(0, 0);
        var world = new b2.d.b2World(gravity, true)
        var dFd = new b2.d.b2FixtureDef();
        /**
         * Create a new physics object.
         */
        this.create = new(function () {
            var self = this;
            /**
             * Create a generic physicsObject
             * @param {object} obj Options
             * @return {physicsObject} A new physics object
             */
            this.physicsObject = function (obj) {
                this.bd = new b2.d.b2BodyDef();
                this.boby = world.CreateBody(bd);
                this.shape = new b2.s.b2PolygonShape();
            };
            /**
             * Create a rectangle
             * @extends physicsObject
             * @param {object} obj Options
             * @param {number} obj.width Set the width of the rectangle
             * @param {number} obj.height Set the height of the rectangle
             * @return {rectangle}
             */
            this.rectangle = function (obj) {
                self.physicsObject.call(this, obj);
                this.shape.SetAsBox(obj.width, obj.height);
                this.body.createFixture(obj.fixtureDef || dFd);
                debug.log("Created New Rectangle");
                debug.log(this.body)
            }
        })()
    };
    /**
     * Create a new renderer instance
     * @param {string} obj.renderer (Optional) Sets the renderer used
     * @return {renderer} A new renderer instance
     */
    var renderer = function (obj) {
        var self = this;
        var renderers = {
            pixi: function (obj) {
                var pixiRenderer = new PIXI.WebGLRenderer(innerWidth, innerHeight);
                var pixiStage = new PIXI.Container();
                $("#c")[0].appendChild(pixiRenderer.view);
                pixiRenderer.render(pixiStage)
                this.create = new(function () {
                    var self = this;
                    /**
                     * Create a generic renderObject
                     * @param {object} obj Options
                     * @return {physicsObject} A new render object
                     */
                    this.renderObject = function (obj) {

                    };
                    /**
                     * Create a rectangle
                     * @extends renderObject
                     * @param {object} obj Options
                     * @param {number} obj.width Set the width of the rectangle
                     * @param {number} obj.height Set the height of the rectangle
                     * @return {rectangleMesh}
                     */
                    this.rectangleMesh = function (obj) {
                        self.renderObject.call(this, obj);
                    }
                })()
            }
        }
        obj = obj || {};
        obj.renderer = (obj && obj.renderer) ? obj.renderer : "pixi";
        renderers[obj.renderer].call(this, obj);

    };
    var logic = function () {};
    var camera = function () {};
    /**
     * Create a new stage instance
     * @type {stage}
     * @param {object} obj Options
     * @param {b2Vec2} obj.size Sets the size of the world
     * @return {stage} A new stage instance
     */
    var stage = function (obj) {
        this.size = (obj && obj.size) ? obj.size : {
            x: 4000,
            y: 6000
        };
        this.physics = new physics();
        this.renderer = new renderer();
        this.camera = new camera();
        this.add = function () {};
    };
    var game = function () {
        currentGame = game;
        this.stage = new stage();
    };
    var init = (function () {
        new game();
    })()
})()
