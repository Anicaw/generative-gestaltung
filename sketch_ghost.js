var inc = 0.1;
var scl = 10
var cols, rows
var zoff = 0

var fr

var ghost = []

var flowfield = []

let ghostImg;

function preload() {
    ghostImg = loadImage('./images/balloon.png')
}

function setup() {
    createCanvas(200, 200)
    cols = floor(width /scl)
    rows = floor(height/scl)
    fr = createP('')

    flowfield = new Array(cols * rows)

    for(var i = 0; i < 5; i++){
        ghost[i] = new Ghost()
    }
}

function draw() {
    background(30)
    var yoff = 0
    for (var y = 0; y < rows; y++) {
        var xoff = 0
        for (var x = 0; x < cols; x++) {
            var index = (x + y * cols)
            var angle = noise(xoff, yoff, zoff) * TWO_PI *4
            var v = p5.Vector.fromAngle(angle)
            flowfield[index] = v
            v.setMag(0.01)
            xoff += inc
            stroke(0, 50)
            strokeWeight(1)
        }
        yoff += inc
        zoff += 0.001
    }

    for(var i = 0; i < ghost.length; i++){
        ghost[i].follow(flowfield)
        ghost[i].update()
        ghost[i].show()
        ghost[i].edges()

    }
}
