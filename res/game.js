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
            } else if (typeof obj == "object" && obj.hasOwnProperty("text")) {
                var p = document.createElement('p');
                p.innerHTML = obj.text;
                if (obj.hasOwnProperty("flag")) p.classList.add(obj.flag);
                $('#log').append(p);
                if ($('#log').children().length >= root.debug.log.maxLength) {
                    ($('#log').children()[0]).remove()
                }
            }
        }
        this.log.maxLength = 20;
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
        this.debugLayer = new(function () {
            var el = document.createElement('div');
            el.id = 'debugLayer';
            document.body.appendChild(el);
            this.element = el;
        })()
        this.text = new(function () {
            var setLocation = function (DOMElement, vector) {
                DOMElement.style.top = vector.y + "px";
                DOMElement.style.left = vector.x + "px";
            };
            this.display = function (obj) {
                obj.font = obj.font || "20px sans-serif";
                //STUB
            }
            this.attach = function (obj) {
                //obj.text
                //obj.func
                //obj.offset
                obj.offset = obj.offset ? obj.offset : {
                    x: 0,
                    y: 0
                }
                var text = document.createElement('div');
                if (typeof obj.text == 'string') {
                    text.innerHTML = obj.text;
                } else if (typeof obj.text == 'function') {
                    text.innterHTML = obj.text();
                }
                root.debug.debugLayer.element.appendChild(text);
                setInterval(function () {
                    if (typeof obj.text == 'function') {
                        text.innterHTML = obj.text();
                    }
                    setLocation(text, root.utility.addVertices(obj.func(), obj.offset));
                }, (1000 / 60))
                setLocation(text, root.utility.addVertices(obj.func(), obj.offset));
            }
        })()
        this.physics = new(function () {
            var shownBlockVertices = [];
            this.showBlockVertices = function ( /*matterBodyObject*/ block) {
                if (shownBlockVertices.indexOf(block) == -1) {
                    root.debug.text.attach({
                        text: "0",
                        func: function () {
                            return root.renderer.worldToScreenspace(block.vertices[0]);
                        }
                    })
                    root.debug.text.attach({
                        text: "1",
                        func: function () {
                            return root.renderer.worldToScreenspace(block.vertices[1]);
                        }
                    })
                    root.debug.text.attach({
                        text: "2",
                        func: function () {
                            return root.renderer.worldToScreenspace(block.vertices[2]);
                        }
                    })
                    root.debug.text.attach({
                        text: "3",
                        func: function () {
                            return root.renderer.worldToScreenspace(block.vertices[3]);
                        }
                    })
                    shownBlockVertices.push(block);
                    root.debug.log({
                        text: 'Displaying vertices for block ' + block.id + '.',
                    })
                } else {
                    root.debug.log({
                        text: 'Vertices of block ' + block.id + ' already shown.',
                        flag: 'warning'
                    })
                }
            }
        })()
    })();
    this.utility = new(function () {
        this.addVertices = function (a, b) {
            return {
                x: a.x + b.x,
                y: a.y + b.y
            }
        }
        this.distance = function (a, b) {
            var c = a.x - b.x
            var d = a.y - b.y
            return Math.sqrt(c * c + d * d);
        }
        this.midpoint = function (a, b) {
            return {
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2
            }
        }
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
        this.emptyCompound = function (obj) {

            var self = this;

            root.gameObject.genericObject.call(this, obj);

            for (var i = 0, components = ['physics']; i < components.length; i++) {
                this[components[i]] = new root[components[i]].create.compound(obj)
                this[components[i]].gameObject = this;
            }

            this.addPart = function (obj) {
                var parts = self.physics.body.parts;
                Matter.World.remove((obj.parent.parts.length < 2) ? root.currentGame.stage.physics.world : obj.parent, obj)
                parts = parts.slice();
                parts.shift();
                parts.push(obj)
                Matter.Body.setParts(parent, parts, false)
            }

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
        this.constraint = function (obj) {
            //obj.A.body (use block not physics Object)
            //obj.A.vertex
            //obj.B.body (use block not physics Object)
            //obj.B.vertex
            //obj.stiffness
            root.gameObject.genericObject.call(this, obj);
            for (var i = 0, components = ['physics']; i < components.length; i++) {
                this[components[i]] = new root[components[i]].create.constraint(obj)
                this[components[i]].gameObject = this;
            }
        }
    })();
    this.character = function (obj) {
        var self = this;
        this.consumedBlocks = [];
        this.collection = new(function () {
            this.map;
            this.blockWidth =
                this.addBlock = function (obj) {
                    //x coord
                    //y coord
                }
            this.exists = function () {
                //tests whether a block exists at coordinate
            }
            this.removeBlock = function () {}
            this.explode = function () {}
        })()
        this.occupiedBlocks = function () {};
        this.gameObject = new root.gameObject.block({
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
            if (false) {
                root.debug.log({
                    text: "Collision with body " + e.bodyA.id + " and body " + e.bodyB.id,
                    flag: 'info'
                })

                function findClosestEdges(bodyA, bodyB) {
                    var eDIs = [];
                    var edgeDistanceInfo = function () {
                        this.A = {};
                        this.B = {};
                        this.A.body;
                        this.B.body;
                        this.A.edge = {};
                        this.B.edge = {};
                        this.A.edge.index;
                        this.B.edge.index;
                        this.distance;
                    }
                    for (var a = 0; a < 4; a++) {
                        for (var b = 0; b < 4; b++) {
                            var eDI = new edgeDistanceInfo();
                            eDI.A.body = bodyA;
                            eDI.B.body = bodyB;
                            eDI.A.edge.midpoint = root.utility.midpoint(bodyA.vertices[a], bodyA.vertices[(a + 1) % 4]);
                            eDI.B.edge.midpoint = root.utility.midpoint(bodyB.vertices[b], bodyB.vertices[(b + 1) % 4]);
                            eDI.distance = root.utility.distance(eDI.A.edge.midpoint, eDI.B.edge.midpoint);
                            eDI.A.edge.index = a;
                            eDI.B.edge.index = b;
                            eDIs.push(eDI);
                        }
                    }
                    eDIs.sort(function (elA, elB) {
                        return elA.distance - elB.distance;
                    })
                    root.debug.log('closestEdges: A: ' + eDIs[0].A.edge.index + '  B: ' + eDIs[0].B.edge.index)
                    root.debug.log(eDIs)
                    root.gameObject.constraint({
                        A: {
                            body: eDIs[0].A.body.physicsObject.gameObject,
                            vertex: (eDIs[0].A.edge.index + 1) % 4
                        },
                        B: {
                            body: eDIs[0].B.body.physicsObject.gameObject,
                            vertex: (eDIs[0].B.edge.index) % 4
                        },
                    })
                    root.gameObject.constraint({
                        A: {
                            body: eDIs[0].A.body.physicsObject.gameObject,
                            vertex: (eDIs[0].A.edge.index) % 4
                        },
                        B: {
                            body: eDIs[0].B.body.physicsObject.gameObject,
                            vertex: (eDIs[0].B.edge.index + 1) % 4
                        },
                    })

                }
                findClosestEdges(e.bodyA, e.bodyB);
            }
        }
        self.gameObject.physics.body.onCollide(self.collisionHandler)
        self.consumedBlocks.push(self.gameObject)
        root.debug.physics.showBlockVertices(self.gameObject.physics.body);
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
            //root.debug.physics.showBlockVertices(s.body);
        }
        this.composite = function (obj) {
            self.physicsObject.call(this, obj);
            var s = this;
            this.body = Matter.Body.create(obj);
            this.body.physicsObject = s;
            Matter.World.add(root.currentGame.stage.physics.world, s.body)
        }
        this.constraint = function (obj) {
            self.physicsObject.call(this, obj);
            var s = this;
            this.body = Matter.Constraint.create({
                stiffness: obj.stiffness || 0.5,
                length: 0.01,
                pointA: {
                    x: obj.A.body.physics.body.vertices[obj.A.vertex].x - obj.A.body.position.x,
                    y: obj.A.body.physics.body.vertices[obj.A.vertex].y - obj.A.body.position.y
                },
                pointB: {
                    x: obj.B.body.physics.body.vertices[obj.B.vertex].x - obj.B.body.position.x,
                    y: obj.B.body.physics.body.vertices[obj.B.vertex].y - obj.B.body.position.y
                },
                bodyA: obj.A.body.physics.body,
                bodyB: obj.B.body.physics.body
            })
            this.body.physicsObject = s;
            Matter.World.add(root.currentGame.stage.physics.world, s.body)
                /* root.debug.text.attach({
                     text: 'A',
                     func: function () {
                         return root.renderer.worldToScreenspace(obj.A.body.physics.body.vertices[obj.A.vertex])
                     }
                 })
                 root.debug.text.attach({
                     text: 'B',
                     func: function () {
                         return root.renderer.worldToScreenspace(obj.B.body.physics.body.vertices[obj.B.vertex])
                     }
                 })*/
            root.debug.log('created constraint between' + obj.A.vertex + "-" + obj.B.vertex)
        }
        this.compound = function (obj) {
            self.physicsObject.call(this, obj);
            var s = this;
            this.body = Matter.create();
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
    root.renderer.getContext = function () {
        return ("#c")[0].childNodes[1];
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
                    return s.target.position;
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
            target: this.character.gameObject.physics.body
        });
        this.logic = new root.logic();
    };
    this.init = (function () {
        new root.game();
    })()
})()
