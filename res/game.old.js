(function () {
    var b2 = Box2D.Dynamics
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

    //Responsible for setting up the world
    var stage = function () {
        var self = this;
        this.gravity = new b2.b2Vec2(0, 0);
        this.world = new b2.b2World(self.gravity, true)
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

    var block = function (obj /*obj has properties IsCore, x, y, width, height, rot, options*/ ) {
        var self = this;
        this.isCore = obj.isCore
        this.updateLocation = function (obj) {
            //BOX 2D Define o here
            self.visual.deleteFromDrawQueue();
            self.visual = rect(obj);
        }
        this.visual = rect(o);

        //BOX2D SET BOX ANGLE

        execQueue.push(function () {
            self.updateLocation({
                x: box.position.x,
                y: box.position.y,
                rot: box.angle,
                options: box.options || o.options
            })
        })
        this.physics = stage.world;
        this.o = o; //original object that provided info
    }

    var food = function () {
        var b = new block({
            x: randomIntFromInterval(0, stageSize.x),
            y: randomIntFromInterval(0, stageSize.y),
            rot: randomIntFromInterval(0, 200) / 100
        });
        b.isFood = true;
        //b.physics.mass = 0.01;
        //b.physics.frictionAir = 0.0004;
        return b;
    }

    //Food Generator Settings

    var foodAmount = 40

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
            isCore: true,
            options: {
                fill: ["#1ABC9C"],
            }
        });
        world.remove(phys.world, [b.physics])
            //world.remove(phys.world,[b.physics])
        var c = //BOX2D CREATE COMPOSITE
            this.c = c;
        this.b = b;
        b.isSticky = true;
        //BOX 2D DUNNO WHAT THIS IS Matter.Body.setAngle(b.physics, 0)
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
                    //BOX2D APPLY FORCE
                self.location = self.c.position
            }
            execQueue.push(mouseController)
        })()
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

            var s = new stage();

            char = new chara({
                x: 2000,
                y: 3000
            });
            var f = new foodGenerator();
            var cam = new camera();

            //LOGIC LOOP
            setInterval(function () {
                game.logic();
            }, 16.67)

            //DEBUG INFO
            setInterval(function () {
                $("#fps")[0].innerHTML = "FPS: " + FrameCount * 2;
                $("#physFps")[0].innerHTML = "Physics IPS: " + physFrameCount * 2;
                FrameCount = 0;
                physFrameCount = 0;
                LastPhysFps = physFrameCount * 2;
                console.log(char)
            }, 500)
        };
    })


    game.init();
})()
