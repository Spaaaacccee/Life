(function () {
    (function () {
        Matter.use('matter-attractors',
            'matter-gravity')
    })()
    var engine = Matter.Engine,
        render = Matter.Render,
        world = Matter.World,
        bodies = Matter.Bodies;
    var phys;
    var physFrameCount = 0;
    var FrameCount = 0;
    var lastPhysFps = 60;

    var c = $("#c")[0] || $("#c"); //canvas
    var ctx;
    var p;
    var drawQueue = [];
    var execQueue = [];
    var cameraLocation = {
        x: 2000,
        y: 3000
    };
    var char;
    var stageSize = {
        x: 4000,
        y: 6000
    };
    var jointId

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    var timer = function () {}


    var drawQueueObject = function (type, args) {
        this.type = type;
        this.args = args;
        this.options = {};
        drawQueue.push(this);
    }

    var stage = function () {
        this.visual = rect({
            x: stageSize.x / 2,
            y: stageSize.y / 2,
            width: stageSize.x,
            height: stageSize.y,
            options: {
                fill: [20]
            }
        });
    }


    var rect = function (obj) {
        var d = new drawQueueObject("rect", [obj.x, obj.y, obj.width, obj.height]);
        d.options = obj.options || {
            fill: [Math.max(20, 255 - (p.dist(obj.x, obj.y, char.location.x, char.location.y) * 0.3))],
            noStroke: [true],
        };
        d.obj = obj;
        d.deleteFromDrawQueue = function () {
            var index = drawQueue.indexOf(d);
            if (index > -1) {
                drawQueue.splice(index, 1);
            }
        }
        return d;
    }

    //Block settings
    var blockSize = 20

    var block = function (obj) {
        var self = this;
        var o = obj;
        o.width = blockSize;
        o.height = blockSize;
        o.x = obj.x
        o.y = obj.y;
        o.rot = obj.rot || 0;
        this.updateLocation = function (obj) {
            o.x = obj.x || o.x
            o.y = obj.y || o.y
            o.rot = obj.rot || o.rot
            o.options = obj.options || o.options
            self.visual.deleteFromDrawQueue();
            self.visual = rect(o);
        }
        this.visual = rect(o);

        var box = bodies.rectangle(o.x, o.y, o.width, o.height);
        Matter.Vertices.clockwiseSort(box.vertices);
        Matter.Body.setAngle(box, o.rot)
        box.frictionAir = 0.1
        box.friction = 0
        box.parentBlock = self;
        world.add(phys.world, [box]);
        execQueue.push(function () {
            self.updateLocation({
                x: box.position.x,
                y: box.position.y,
                rot: box.angle,
                options: box.options || o.options
            })
        })
        this.physics = box;
        this.o = o; //original object that provided info
    }

    var food = function () {
        var b = new block({
            x: randomIntFromInterval(0, stageSize.x),
            y: randomIntFromInterval(0, stageSize.y),
            rot: randomIntFromInterval(0, 200) / 100
        });
        b.isFood = true;
        b.physics.mass = 0.01;
        b.physics.frictionAir = 0.0004;
        return b;
    }

    //Food Generator Settings

    var foodAmount = 600

    var foodGenerator = function () {
        for (var i = 0; i < foodAmount; i++) {
            var f = new food();
        }
    }

    var chunck = function (obj) {
        this.core = new block({
            x: obj.x,
            y: obj.y,
            options: {
                fill: ["#1ABC9C"],
            }
        });
        this.composite = Matter.Composite.create();
        Matter.Composite.add(this.composite, this.core.physics);
        //WIP
    }

    var chara = function (obj) {
        var self = this;
        this.location = {
            x: cameraLocation.x,
            y: cameraLocation.y
        }
        var b = new block({
            x: obj.x,
            y: obj.y,
            options: {
                fill: ["#1ABC9C"],
            }
        });
        this.b = b;
        b.isSticky = true;
        Matter.Body.setAngle(b.physics, 0)
        this.controller = new(function () {
            var mouseController = function () {
                //Mouse controller
                var mousePos = {
                    x: p.mouseX,
                    y: p.mouseY
                }

                //var dist = p.dist(mousePos.x, mousePos.y, -cameraLocation.x + innerWidth / 2, -cameraLocation.y + innerHeight / 2);
                var offsetX = (mousePos.x - self.location.x + cameraLocation.x - innerWidth / 2) * -1
                var offsetY = (mousePos.y - self.location.y + cameraLocation.y - innerHeight / 2) * -1
                Matter.Body.applyForce(self.b.physics, {
                    x: self.location.x + offsetX,
                    y: self.location.y + offsetY
                }, {
                    x: -offsetX * 0.000005,
                    y: -offsetY * 0.000005
                });
                self.location = self.b.physics.position
            }
            execQueue.push(mouseController)
        })()
        Matter.Events.on(phys, 'collisionStart', function (e) {
            function raycast(bodies, start, r, dist) {
                var normRay = Matter.Vector.normalise(r);
                var ray = normRay;
                var point = Matter.Vector.add(ray, start);
                for (var i = 0; i < dist; i++) {
                    ray = Matter.Vector.mult(normRay, i);
                    ray = Matter.Vector.add(start, ray);
                    var bod = Matter.Query.point(bodies, ray)[0];
                    if (bod) {
                        return {
                            point: ray,
                            body: bod
                        };
                    }
                }
                return;
            }
            var pairs = e.pairs;
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if ((pair.bodyA.parentBlock.isSticky || pair.bodyB.parentBlock.isSticky)/* && !(pair.bodyA.parentBlock.isSticky && pair.bodyB.parentBlock.isSticky)*/) {
                    Matter.Vertices.clockwiseSort(pair.bodyA.vertices);
                    Matter.Vertices.clockwiseSort(pair.bodyB.vertices);
                    var midPointsA = [];
                    var midPointsB = [];
                    var smallestDist = Infinity;
                    var midAIndex;
                    var midBIndex;
                    for (var i = 0; i < pair.bodyA.vertices.length; i++) {
                        var A = pair.bodyA.vertices;
                        var B = pair.bodyB.vertices;
                        midPointsA.push(Matter.Vertices.mean([A[i % A.length], A[(i + 1) % A.length]]))
                        midPointsB.push(Matter.Vertices.mean([B[i % B.length], B[(i + 1) % B.length]]))
                    }
                    for (var i = 0; i < midPointsA.length; i++) {
                        for (var j = 0; j < midPointsB.length; j++) {
                            var d = p.dist(midPointsA[i].x, midPointsA[i].y, midPointsB[j].x, midPointsB[j].y)
                            if (d < smallestDist) {
                                smallestDist = d;
                                midAIndex = i;
                                midBIndex = j;

                            }
                        }
                    }
                    console.log(smallestDist)

                    function indexToPosition(index, rotation) {
                        var a;
                        switch (index) {
                            case 0:
                                a = {
                                    x: -10,
                                    y: -10
                                }
                                break;
                            case 1:
                                a = {
                                    x: 10,
                                    y: -10
                                }
                                break;
                            case 2:
                                a = {
                                    x: 10,
                                    y: 10
                                }
                                break;
                            case 3:
                                a = {
                                    x: -10,
                                    y: 10
                                }
                                break;
                        }
                        Matter.Vertices.rotate([a], rotation, {
                            x: 0,
                            y: 0
                        })
                        return a
                    }


                    var constraintA = Matter.Constraint.create({
                        stiffness: 1,
                        length: 0.001,
                        pointA: {
                            x: pair.bodyA.vertices[midAIndex].x - pair.bodyA.position.x,
                            y: pair.bodyA.vertices[midAIndex].y - pair.bodyA.position.y,
                        },
                        bodyA: pair.bodyA,
                        pointB: {
                            x: pair.bodyB.vertices[(midBIndex+1)%4].x - pair.bodyB.position.x,
                            y: pair.bodyB.vertices[(midBIndex+1)%4].y - pair.bodyB.position.y,
                        },
                        bodyB: pair.bodyB
                    })
                    var constraintB = Matter.Constraint.create({
                        stiffness: 1,
                        length: 0.001,
                        pointA: {
                            x: pair.bodyA.vertices[(midAIndex+1)%4].x - pair.bodyA.position.x,
                            y: pair.bodyA.vertices[(midAIndex+1)%4].y - pair.bodyA.position.y,
                        },
                        bodyA: pair.bodyA,
                        pointB: {
                            x: pair.bodyB.vertices[midBIndex].x - pair.bodyB.position.x,
                            y: pair.bodyB.vertices[midBIndex].y - pair.bodyB.position.y,
                        },
                        bodyB: pair.bodyB
                    })
                    world.add(phys.world, [constraintA, constraintB])

                    /*                    var hit = raycast(phys.world.bodies,core.position,bl.position,p.dist(core.position.x,core.position.y,bl.position.x,bl.position.y))
                                        console.log(hit);
                                        var constraint = Matter.Constraint.create({
                                            stiffness: 1,
                                            length: blockSize,
                                            pointA: {
                                                x: 0,
                                                y: 0
                                            },
                                            bodyA: pair.bodyA,
                                            pointB: {
                                                x: 0,
                                                y: 0
                                            },
                                            bodyB: pair.bodyB
                                        })
                                        world.add(phys.world, [constraint])*/
                    for (var name in {
                            bodyA: pair.bodyA,
                            bodyB: pair.bodyB
                        }) {
                        pair[name].parentBlock.isSticky = true;
                        pair[name].parentBlock.updateLocation({
                            options: {
                                fill: ["#1ABC9C"]
                            }
                        });
                    }

                }
            }
        })
    }

    var camera = function () {
        this.controller = new(function () {
            var movementController = function () {
                cameraLocation.x = (Math.min(stageSize.x - innerWidth / 2, Math.max(innerWidth / 2, char.location.x)))
                cameraLocation.y = (Math.min(stageSize.y - innerHeight / 2, Math.max(innerHeight / 2, char.location.y)))
            }
            execQueue.push(movementController);
        })()
    }

    var game = new(function () {
        this.init = function () {
            var sketchProcedure = function (p) {
                p.setup = function () {
                    game.setup()
                };
                p.draw = function () {
                    game.draw()
                };
            };
            p = new p5(sketchProcedure, c);

        };
        this.draw = function () {

            for (var i = 0; i < drawQueue.length; i++) {
                p.push()
                    //Apply Settings
                for (var name in drawQueue[i].options) {
                    p[name].apply(p, (drawQueue[i].options[name]))
                }
                //x,y,w,h
                drawQueue[i].args[0]
                var tX = drawQueue[i].obj.x - cameraLocation.x + innerWidth / 2;
                var tY = drawQueue[i].obj.y - cameraLocation.y + innerHeight / 2;
                //rect 1 = screen
                var overlap = !(innerWidth < tX - drawQueue[i].obj.width / 2 ||
                    0 > tX + drawQueue[i].obj.width / 2 ||
                    innerHeight < tY - drawQueue[i].obj.height / 2 ||
                    0 > tY + drawQueue[i].obj.height / 2)
                if (overlap) {
                    p.translate(tX, tY)
                    p.rotate(drawQueue[i].obj.rot)
                    p[drawQueue[i].type](0, 0, drawQueue[i].obj.width, drawQueue[i].obj.height)
                    //p.rect(0, -10, 5, 5)
                    p.pop()
                }

            }
            FrameCount++

        };
        this.logic = function () {
            engine.update(phys, undefined, 60 / lastPhysFps);
            Matter.Sleeping.update(phys.world.bodies)
            for (var i = 0; i < execQueue.length; i++) {
                execQueue[i]();
            }
            physFrameCount++;
        };
        this.setup = function () {
            p.createCanvas(window.innerWidth, window.innerHeight);
            p.background(42);
            p.frameRate(120);
            p.rectMode(p.CENTER);
            ctx = c.children[0];

            phys = engine.create();
            phys.world.gravity.scale = 0;

            var s = new stage();

            char = new chara({
                x: 2000,
                y: 3000
            });
            var f = new foodGenerator();
            var cam = new camera();
            setInterval(function () {
                game.logic();
            }, 16.67)


            setInterval(function () {
                $("#fps")[0].innerHTML = "FPS: " + FrameCount * 2;
                $("#physFps")[0].innerHTML = "Physics IPS: " + physFrameCount * 2;
                FrameCount = 0;
                physFrameCount = 0;
                LastPhysFps = physFrameCount * 2;
            }, 500)
        };
    })


    game.init();
})()
