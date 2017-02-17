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
            //console.log(obj);
        }
        this.stats = new(function () {
            var s = this;
            this.update = function () {
                $("#fps")[0].innerHTML = "FPS: " + root.currentGame.stage.renderer.frameCount;
                root.currentGame.stage.renderer.frameCount = 0;
                $("#physFps")[0].innerHTML = "Physics IPS: " + root.currentGame.stage.physics.frameCount;
                root.currentGame.stage.physics.frameCount = 0;
            }
            setInterval(s.update, 1000)
        })()
    })();
    this.utility = new(function () {
        this.randomIntFromInterval = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        this.mouse = new(function () {
            var s = this;
            this.x = innerWidth / 2;
            this.y = innerHeight / 2;
            $(document).mousemove(function (e) {
                s.x = e.pageX;
                s.y = e.pageY;
            })
        })()
        this.toRadians = function (degree) {
            return degree * (Math.PI / 180)
        }
        this.toDegrees = function (radian) {
            return radian * (180 / Math.PI)
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
         * @param {object}  obj           Options
         * @param {int}     obj.blockSize (Optional) Define the size of the block
         * @param {Vector2} obj.position    position of new object
         * @returns {block}   A block gameObject
         */
        this.block = function (obj) {
            var self = this;
            this.clock;
            this.frameRate = (obj && obj.frameRate) ? obj.frameRate : 60;
            root.gameObject.genericObject.call(this, obj);
            this.blockSize = (obj && obj.blockSize) ? obj.blockSize : 50;
            this.color = (obj && obj.color) ? obj.color : undefined
            var def = {
                width: this.blockSize / 2,
                height: this.blockSize / 2,
                world: root.currentGame.stage.physics.world,
                color: this.color,
                position: obj.position
            }
            for (var i = 0, components = ['physics', 'renderer']; i < components.length; i++) {
                this[components[i]] = new root[components[i]].create.rectangle(def)
                this[components[i]].gameObject = this;
            }
            Object.defineProperty(this, "position", {
                get: function () {
                    return {
                        x: self.physics.body.GetPosition().x * 9,
                        y: self.physics.body.GetPosition().y * 9
                    };
                },
                set: function (vector) {
                    self.physics.body.SetPosition({
                        x: vector.x / 9,
                        y: vector.y / 9
                    });
                }
            });

            Object.defineProperty(this, "rotation", {
                get: function () {
                    return self.physics.body.GetAngle(); //In degrees
                },
                set: function (degrees) {
                    self.physics.body.SetAngle(degrees);
                }
            });

            function nextFrame() {
                self.renderer.update({
                    x: self.position.x,
                    y: self.position.y,
                    rotation: root.utility.toRadians(self.rotation)
                });
                requestAnimationFrame(nextFrame)
            }
            requestAnimationFrame(nextFrame)
                //this.physics.body.ApplyTorque(200)
        };
        this.food = function (obj) {
            obj = obj || {}
            obj.position = obj.position ? obj.position : {
                x: root.utility.randomIntFromInterval(0, root.currentGame.stage.size.x),
                y: root.utility.randomIntFromInterval(0, root.currentGame.stage.size.y),
            }
            root.gameObject.block.call(this, obj);
            this.isFood = true;

            //b.physics.mass = 0.01;
            //b.physics.frictionAir = 0.0004;
        }
    })();
    this.character = function (obj) {
        var self = this;
        this.gameObject = new root.gameObject.block({
            color: '0x1ABC9C',
            position: ((obj && obj.position) ? obj.position : root.currentGame.stage.size)
        });
        this.controller = new(function () {
            var s = this;
            //Mouse controller
            this.update = function () {
                var mousePos = {
                        x: root.utility.mouse.x,
                        y: root.utility.mouse.y
                    }
                    //var dist = p.dist(mousePos.x, mousePos.y, -cameraLocation.x + innerWidth / 2, -cameraLocation.y + innerHeight / 2);
                    //Apply Force
                self.gameObject.physics.body.ApplyImpulse({
                        x: ((mousePos.x - (innerWidth / 2)) * 0.5),
                        y: ((mousePos.y - (innerHeight / 2)) * 0.5)
                    }, {
                        x: 20,
                        y: 20
                    })
                    //console.log(self.gameObject.physics.body.rotation)
            };

            function nextFrame() {
                s.update();
                requestAnimationFrame(nextFrame)
            }
            requestAnimationFrame(nextFrame)
        })()
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
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        var delta = function () {
            return (Date.now() - self.lastFrameTime) / (1000 / self.frameRate)
        }
        var clock;
        var gravity = (obj && obj.gravity) ? obj.gravity : new root.physics.b2.m.b2Vec2(0, 0);
        this.world = new root.physics.b2.d.b2World(gravity, true);
        this.debugDaw = this.world.SetDebugDraw(new Box2D.Dynamics.b2DebugDraw())
            /**
             * Starts the physics simulation
             */
        this.start = function () {
            if (isRunning == false) {
                clock = setInterval(function () {
                    self.step()
                }, 1000 / self.frameRate)
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
            if (isRunning) {
                self.world.Step((1000 / self.frameRate) * delta());
                self.lastFrameTime = Date.now();
                self.frameCount++;
            }
        };

        /*function nextFrame() {
            self.step();
            requestAnimationFrame(nextFrame)
        }
        requestAnimationFrame(nextFrame)*/
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
    root.physics.create = new(function (obj) {
        var self = this;
        this.scale = (obj && obj.scale) ? obj.scale : 9;
        /**
         * Create a generic physicsObject
         * @param {object}    obj           Options
         * @param {b2world}   obj.world     The world context to create the new object
         * @param {b2Vec2} obj.position position of new object
         * @return {physicsObject} A new physics object
         */
        this.physicsObject = function (obj) {
            this.bd = new root.physics.b2.d.b2BodyDef();
            this.bd.type = root.physics.b2.d.b2Body.b2_dynamicBody;
            this.shape = new root.physics.b2.s.b2PolygonShape();
            this.bd.position.Set(obj.position.x / self.scale, obj.position.y / self.scale)
        };
        /**
         * Create a rectangle
         * @extends physicsObject
         * @param {object} obj Options
         * @param {b2world} obj.world The world context to create the new object
         * @param {number} obj.width Set the width of the rectangle
         * @param {number} obj.height Set the height of the rectangle
         * @param {b2Vec2} obj.position position of new object
         * @return {rectangle}
         */
        this.rectangle = function (obj) {
            self.physicsObject.call(this, obj);

            var fixtureDef = new root.physics.b2.d.b2FixtureDef();
            this.shape.SetAsBox(obj.width, obj.height);
            fixtureDef.shape = this.shape;
            fixtureDef.density = 10;
            this.bd.linearDamping = 0.02;
            this.bd.angularDamping = 0.02
            this.body = obj.world.CreateBody(this.bd);
            this.body.CreateFixture(obj.fixtureDef || fixtureDef);
            root.debug.log("Created New Rectangle");
            root.debug.log(this.body);

        }
    })();
    this.renderers = {
            pixi: function (obj) {
                var self = this;
                this.pixiRenderer = new root.renderer.pi.WebGLRenderer(innerWidth, innerHeight, {
                    antialias: true
                });
                this.pixiStage = new root.renderer.pi.Container();
                $("#c")[0].appendChild(this.pixiRenderer.view);
                this.pixiRenderer.render(this.pixiStage)
                this.frameCount = 0;
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
                        obj.width = 20;
                        obj.height = 20;
                        this.fill = obj.color || '0xAAAAAA';
                        this.graphic.pivot.set(obj.width / 2, obj.height / 2);
                        this.graphic.beginFill(this.fill, 1);
                        this.graphic.drawRect(root.renderer.worldToScreenspace(obj).x, root.renderer.worldToScreenspace(obj).y, obj.width, obj.height);
                        this.graphic.endFill();
                        self.pixiStage.addChild(this.graphic);
                        this.update = function (obj) {
                            s.graphic.x = root.renderer.worldToScreenspace(obj).x || s.graphic.x;
                            s.graphic.y = root.renderer.worldToScreenspace(obj).y || s.graphic.y;
                            s.graphic.rotation = obj.rotation || s.graphic.rotation;
                            //setInterval(function () {
                            //root.debug.log("Drew Rectangle at " + s.graphic.x)
                            //}, 1000)
                        }
                    }
                })()

                function nextFrame() {
                    self.pixiRenderer.render(self.pixiStage)
                    self.frameCount++;
                    requestAnimationFrame(nextFrame)
                }
                requestAnimationFrame(nextFrame)
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
    this.logic = function (obj) {
        this.foodAmount = (obj && obj.foodAmount) ? obj.foodAmount : 400;
        for (var i = 0; i < this.foodAmount; i++) {
            var f = new root.gameObject.food();
        }
    };
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
        this.add = function (gameObject) {};
    };
    this.game = function () {
        root.currentGame = this;
        this.stage = new root.stage();
        this.camera = new root.camera();
        this.character = new root.character();
        this.camera.follow({
            target: this.character
        });
        this.logic = new root.logic();

    };
    this.init = (function () {
        new root.game();
    })()
})()
