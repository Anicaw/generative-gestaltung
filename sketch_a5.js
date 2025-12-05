const flock = []

const predators = []

particleBursts = []

const totalFrames = 7 

let fishSprite

function preload(){
    fishSprite = loadImage("./images/fishBlue.png")
}

function setup(){
    createCanvas(640, 360)
    alignSlider = createSlider(0, 5, 1, 0.1)
    cohesionSlider = createSlider(0, 5, 1, 0.1)
    separationSlider = createSlider(0, 5, 1, 0.1)
    for(let i = 0; i < 20; i++){
        flock.push(new Boid())
    }
    predators.push(new Predator(createVector(width/2, height/2)))
}

function draw(){
    background(51)

    for (let boid of flock){
        boid.edges()
        boid.flock(flock)
        boid.update()
        boid.show()
    }

    for (let p of predators){
        p.edges()
        p.flock(flock)
        p.update()
        p.eat(flock)
        p.show()
    }

    for(let burst of particleBursts){
        burst.update()
        burst.show()
    }

    for(let i = particleBursts.length - 1; i >= 0; i--){
        if(particleBursts[i].isDone()){
            particleBursts.splice(i, 1)
        }
    }
}