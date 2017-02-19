new(function () {
    var root = this;
    //"use strict";
    this.currentGame;
    //20 pixels = 1 meter;
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
            if (typeof obj == "string") {
                var p = document.createElement('p');
                p.innerHTML = obj;
                $('#log').append(p);
                if ($('#log').children().length >= root.debug.log.maxLength) {
                    ($('#log').children()[0]).remove()
                }
            }
        }
        this.log.maxLength = 10;
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
        this.genericObject = function (obj) {
            var self = this;
            this.clock;
            this.frameRate = (obj && obj.frameRate) ? obj.frameRate : 60;
            //Returns or sets position, given pixel-based measurements
            Object.defineProperty(this, "position", {
                get: function () {
                    return {
                        x: self.physics.body.position.x,
                        y: self.physics.body.position.y
                    };
                },
                set: function (vector) {
                    self.physics.body.position = {
                        x: vector.x,
                        y: vector.y
                    };
                }
            });

            Object.defineProperty(this, "rotation", {
                get: function () {
                    return (self.physics.body.angle == self.physics.body.parent.angle) ? self.physics.body.angle : (self.physics.body.angle + self.physics.body.parent.angle); //In degrees
                },
                set: function (degrees) {
                    self.physics.body.angle = degrees;
                }
            });

            function nextFrame() {
                if (self.renderer) {
                    self.renderer.update({
                        x: self.position.x,
                        y: self.position.y,
                        rotation: self.rotation
                    });
                    requestAnimationFrame(nextFrame)
                }
            }
            requestAnimationFrame(nextFrame)
                //this.physics.body.ApplyTorque(200)
        };
        /**
         * Creates a new block element
         * @param {object}  obj           Options
         * @param {int}     obj.blockSize (Optional) Define the size of the block
         * @param {Vector2} obj.position    position of new object
         * @returns {block}   A block gameObject
         */
        this.block = function (obj) {
            var self = this;

            root.gameObject.genericObject.call(this, obj);
            this.blockSize = (obj && obj.blockSize) ? obj.blockSize : 20;
            this.color = (obj && obj.color) ? obj.color : undefined
            var def = {
                width: this.blockSize,
                height: this.blockSize,
                world: root.currentGame.stage.physics.world,
                color: this.color,
                position: obj.position,
                rotation: obj.rotation
            }
            for (var i = 0, components = ['physics', 'renderer']; i < components.length; i++) {
                this[components[i]] = new root[components[i]].create.rectangle(def)
                this[components[i]].gameObject = this;
            }

        };
        this.compositeBlock = function (obj) {
            var self = this;
            root.gameObject.genericObject.call(this, obj);
            this.color = (obj && obj.color) ? obj.color : undefined
            var def = {
                width: this.blockSize,
                height: this.blockSize,
                world: root.currentGame.stage.physics.world,
                position: obj.position,
                rotation: obj.rotation
            }
            for (var i = 0, components = ['physics']; i < components.length; i++) {
                this[components[i]] = new root[components[i]].create.composite(def)
                this[components[i]].gameObject = this;
            }
            this.children = [];
            this.children.add = function (obj) {
                Matter.World.remove(root.currentGame.stage.physics.world, obj.physics.body)

                Matter.Body.addPart(self.physics.body, obj.physics.body, false);
                self.children.push(obj);
            }
            this.children.remove = function () {
                root.debug.log("The method you are trying to access is currently a stub!")
            }
            this.children.add(new root.gameObject.block(obj))
        }
        this.food = function (obj) {
            obj = obj || {}
            obj.position = obj.position ? obj.position : {
                x: root.utility.randomIntFromInterval(0, root.currentGame.stage.size.x),
                y: root.utility.randomIntFromInterval(0, root.currentGame.stage.size.y),
            }
            obj.rotation = root.utility.randomIntFromInterval(0, 360) / 180;
            root.gameObject.block.call(this, obj);
            this.isFood = true;

            //b.physics.mass = 0.01;
            //b.physics.frictionAir = 0.0004;
        }
    })();
    this.character = function (obj) {
        var self = this;
        this.gameObject = new root.gameObject.compositeBlock({
            color: '0x1ABC9C',
            position: ((obj && obj.position) ? obj.position : root.currentGame.stage.center)
        });
        this.controller = new(function () {
            var s = this;
            //Mouse controller
            this.update = function () {
                var mousePos = {
                    x: root.utility.mouse.x,
                    y: root.utility.mouse.y
                }
                var offsetX = (root.utility.mouse.x - innerWidth / 2) * -1;
                var offsetY = (root.utility.mouse.y - innerHeight / 2) * -1;
                Matter.Body.applyForce(self.gameObject.physics.body, {
                    x: self.gameObject.position.x + offsetX,
                    y: self.gameObject.position.y + offsetY
                }, {
                    x: -offsetX * 0.0000002,
                    y: -offsetY * 0.0000002
                });
            };
            root.currentGame.stage.physics.tasks.push(s.update);
        })()
        this.collisionHandler = function (e) {
            root.debug.log("Collision with body " + e.bodyA.id + " and body " + e.bodyB.id);
            root.debug.log(e)
            setTimeout(function () {
                self.gameObject.children.add(e.bodyB.physicsObject.gameObject)
            }, 1000)

        }
        self.gameObject.physics.body.parts[1].onCollide(self.collisionHandler)
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
        this.frameCount = 0;
        Matter.Plugin.register(MatterCollisionEvents)
        Matter.use('matter-collision-events')
        Matter.Body.addPart = function (parent, obj) {
            var parts = parent.parts;
            Matter.World.remove(root.currentGame.stage.physics.world, obj)
            parts = parts.slice();
            parts.shift();
            parts.push(obj)
            Matter.Body.setParts(parent, parts, false)
        }
        this.engine = Matter.Engine.create();
        this.world = self.engine.world;
        this.world.gravity = {
            x: 0,
            y: 0
        }
        this.update = function () {
            Matter.Engine.update(self.engine)
                //Matter.Sleeping.update(self.world.bodies, 1)
            for (var i = 0; i < self.tasks.list.length; i++) {
                self.tasks.list[i]();
            }
            self.frameCount++;
            requestAnimationFrame(self.update);
        }
        this.tasks = new(function () {
            var self = this;
            this.list = [];
            this.push = function (obj) {
                self.list.push(obj);
                return self.list.indexOf(obj);
            }
        })()
        requestAnimationFrame(self.update);

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
    root.physics.create = new(function (obj) {
        var self = this;
        this.scale = (obj && obj.scale) ? obj.scale : 1;
        /**
         * Create a generic physicsObject
         * @param {object}    obj           Options
         * @param {b2world}   obj.world     The world context to create the new object
         * @param {b2Vec2} obj.position position of new object
         * @return {physicsObject} A new physics object
         */
        this.physicsObject = function (obj) {}

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
            var s = this;
            this.dimensions = {
                width: obj.width,
                height: obj.height
            }
            this.body = Matter.Bodies.rectangle(obj.position.x / self.scale, obj.position.y / self.scale, obj.width, obj.height)
            this.body.physicsObject = s;
            Matter.Vertices.clockwiseSort(this.body.vertices);
            obj.rotation = obj.rotation || 0;
            Matter.Body.rotate(s.body, obj.rotation)
            Matter.World.add(root.currentGame.stage.physics.world, s.body);
        }
        this.composite = function (obj) {
            self.physicsObject.call(this, obj);
            var s = this;
            this.body = Matter.Body.create(obj);
            this.body.physicsObject = s;
            Matter.World.add(root.currentGame.stage.physics.world, s.body)
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
        this.foodAmount = (obj && obj.foodAmount) ? obj.foodAmount : 600;
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
