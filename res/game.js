new(function () {
    var root = this;
    //"use strict";
    this.currentGame;
    /**
     * Contains methods for use in debugging.
     */
    this.debug = new(function () {
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
    this.gameObject = new(function () {
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
            var self = this;
            this.clock;
            this.frameRate = (obj && obj.frameRate) ? obj.frameRate : 60;
            root.gameObject.genericObject.call(this, obj);
            this.blockSize = (obj && obj.blockSize) ? obj.blockSize : 40
            var def = {
                width: this.blockSize / 2,
                height: this.blockSize / 2,
                world: root.currentGame.stage.physics.world,
                color: '0x1ABC9C'
            }
            for (var i = 0, components = ['physics', 'renderer']; i < components.length; i++) {
                this[components[i]] = new root[components[i]].create.rectangle(def)

                this[components[i]].gameObject = this;
            }
            Object.defineProperty(this, "position", {
                get: function () {
                    return self.physics.body.GetPosition();
                },
                set: function (vector) {
                    self.physics.body.SetPosition(vector);
                }
            });
            setInterval(function () {
                self.renderer.update(self.position);
            }, 1 / self.frameRate)

        };
    })();
    this.character = function (obj) {
        var self = this;
        this.gameObject = new root.gameObject.block();
        this.gameObject.position = (obj && obj.position) ? obj.position : root.currentGame.stage.size;
        this.gameObject.physics.body.ApplyForce({
            x: 100,
            y: 100
        }, {
            x: 6010,
            y: 4010
        })
    };
    /**
     * Create a new physics instance
     * @type {physics}
     * @param {object}  obj         Options
     * @param {b2Vec2}  obj.gravity (Optional) Sets the gravity of the world
     * @param {int}     frameRate   (Optional) Sets a custom frameRate, default 60
     * @return {physics} A new physics instance
     */
    this.physics = function (obj) {
        var self = this;
        var isRunning = false;
        this.frameRate = (obj && obj.frameRate) ? obj.frameRate : 60;
        var clock;
        var gravity = (obj && obj.gravity) ? obj.gravity : new root.physics.b2.m.b2Vec2(0, 0);
        this.world = new root.physics.b2.d.b2World(gravity, true)

        /**
         * Starts the physics simulation
         */
        this.start = function () {
            if (isRunning == false) {
                clock = setInterval(function () {
                    self.step()
                }, self.frameRate)
                isRunning = true;
                root.debug.log("Physics simulation started.")
            }
        };
        this.stop = function () {
            if (isRunning == true) {
                clearInterval(clock);
                isRunning = false;
                root.debug.log("Physics simulation stopped.")
            }
        };
        this.step = function () {
            self.world.Step(1 / self.frameRate);
        };
        this.start();
    };
    /**
     * Create a new physics object.
     */
    root.physics.b2 = {
        d: Box2D.Dynamics,
        c: Box2D.Collision,
        m: Box2D.Common.Math,
        s: Box2D.Collision.Shapes,
    };
    root.physics.dFd = new root.physics.b2.d.b2FixtureDef();
    root.physics.create = new(function () {
        var self = this;

        /**
         * Create a generic physicsObject
         * @param {object}    obj           Options
         * @param {b2world}   obj.world     The world context to create the new object
         * @return {physicsObject} A new physics object
         */
        this.physicsObject = function (obj) {
            this.bd = new root.physics.b2.d.b2BodyDef();
            this.bd.type = root.physics.b2.d.b2Body.b2_dynamicBody;
            this.shape = new root.physics.b2.s.b2PolygonShape();

        };
        /**
         * Create a rectangle
         * @extends physicsObject
         * @param {object} obj Options
         * @param {b2world} obj.world The world context to create the new object
         * @param {number} obj.width Set the width of the rectangle
         * @param {number} obj.height Set the height of the rectangle
         * @return {rectangle}
         */
        this.rectangle = function (obj) {
            self.physicsObject.call(this, obj);
            var fixtureDef = new root.physics.b2.d.b2FixtureDef();
            this.shape.SetAsBox(obj.width, obj.height);
            fixtureDef.shape = this.shape;
            this.body = obj.world.CreateBody(this.bd);
            this.body.CreateFixture(obj.fixtureDef || fixtureDef);
            root.debug.log("Created New Rectangle");
            root.debug.log(this.body);
        }

    })()
    this.renderers = {
            pixi: function (obj) {
                var self = this;
                this.pixiRenderer = new root.renderer.pi.WebGLRenderer(innerWidth, innerHeight, {
                    antialias: true
                });
                this.pixiStage = new root.renderer.pi.Container();
                $("#c")[0].appendChild(this.pixiRenderer.view);
                this.pixiRenderer.render(this.pixiStage)
                root.renderer.create = new(function () {

                    /**
                     * Create a generic renderObject
                     * @param {object} obj Options
                     * @return {renderObject} A new render object
                     */
                    this.renderObject = function (obj) {
                        this.graphic = new root.renderer.pi.Graphics();
                    };
                    /**
                     * Create a rectangle
                     * @extends renderObject
                     * @param {object} obj Options
                     * @param {number} obj.width Set the width of the rectangle
                     * @param {number} obj.height Set the height of the rectangle
                     * @return {rectangleMesh}
                     */
                    this.rectangle = function (obj) {
                        var s = this;
                        root.renderer.create.renderObject.call(this, obj);
                        this.fill = obj.color || '0xAAAAAA';
                        this.graphic.pivot.set(
                            obj.width / 2,
                            obj.height / 2
                        );
                        this.graphic.beginFill(this.fill, 1);
                        this.graphic.drawRect(root.renderer.worldToScreenspace(obj).x, root.renderer.worldToScreenspace(obj).y, obj.width, obj.height);
                        this.graphic.endFill();
                        self.pixiStage.addChild(this.graphic);
                        this.update = function (obj) {
                            s.graphic.x = root.renderer.worldToScreenspace(obj).x || s.graphic.x;
                            s.graphic.y = root.renderer.worldToScreenspace(obj).y || s.graphic.y;
                            //setInterval(function () {
                            //root.debug.log("Drew Rectangle at " + s.graphic.x)
                            //}, 1000)
                        }
                    }
                })()
                setInterval(function () {
                    self.pixiRenderer.render(self.pixiStage)
                }, 1 / self.frameRate)
            }
        }
        /**
         * Create a new renderer instance
         * @param {string} obj.renderer (Optional) Sets the renderer used
         * @return {renderer} A new renderer instance
         */
    this.renderer = function (obj) {
        var self = this;

        obj = obj || {};
        obj.renderer = (obj && obj.renderer) ? obj.renderer : "pixi";
        root.renderers[obj.renderer].call(this, obj);

    };
    root.renderer.pi = PIXI;
    root.renderer.worldToScreenspace = function (obj) {
        var screenSpaceX = obj.x - root.currentGame.camera.location.x + innerWidth / 2;
        var screenSpaceY = obj.y - root.currentGame.camera.location.y + innerHeight / 2;
        return {
            x: screenSpaceX,
            y: screenSpaceY
        }
    }
    this.logic = function () {};
    this.camera = function (obj) {
        var self = this;
        this.target = null;
        this.location = root.currentGame.stage.center;
        /**
         * Make the camera follow the selected target.
         * @param {object}     obj        Options
         * @param {gameObject} obj.target Target to follow
         */
        this.follow = function (obj) {
            var s = this;
            this.target = obj ? (obj.target || undefined) : false;
            Object.defineProperty(this, "location", {
                get: function () {
                    return s.target.gameObject.position;
                }
            })
        };
        (this.target) ? (function () {
            self.follow(this.target)
        })() : false
    };
    /**
     * Create a new stage instance
     * @type {stage}
     * @param {object} obj Options
     * @param {b2Vec2} obj.size Sets the size of the world
     * @return {stage} A new stage instance
     */
    this.stage = function (obj) {
        this.size = (obj && obj.size) ? obj.size : {
            x: 6000,
            y: 4000
        };
        this.center = {
            x: this.size.x / 2,
            y: this.size.y / 2
        }
        this.renderer = new root.renderer();
        this.physics = new root.physics();
        this.add = function (gameObject) {

        };
    };
    this.game = function () {
        root.currentGame = this;
        this.stage = new root.stage();
        this.camera = new root.camera();
        this.character = new root.character();
        this.camera.follow({
            target: this.character
        });
        //this.clock
    };
    this.init = (function () {
        new root.game();
    })()
})()
