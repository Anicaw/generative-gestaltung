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
    // colorMode(HSB, 360, 100, 100, 255)
    alignSlider = createSlider(0, 5, 1, 0.1)
    cohesionSlider = createSlider(0, 5, 1, 0.1)
    separationSlider = createSlider(0, 5, 1, 0.1)
    for(let i = 0; i < 20; i++){
        flock.push(new Boid())
    }
    predators.push(new Predator(createVector(width/2, height/2)))
}

// damit neue Fische ins Canvas kommen.
// Starten an zufälligen Positionen leicht außerhalb des Canvas, damit sie "hineinschwimmen"
function spawnNewBoids(amount){
    for(let i = 0; i < amount; i++){
        let b = new Boid()

        let side = floor(random(4));

        switch (side){
            case 0: b.position = createVector(random(width), -10)
            break
            case 1: b.position = createVector(random(width), height + 10)
            break
            case 2: b.position = createVector(-10, random(height))
            break
            case 3: b.position = createVector(width + 10, random(height))
            break
        }
        flock.push(b)
    }
}

function draw(){
    background(51)

    for (let boid of flock){
        boid.edges()
        boid.flock(flock)
        boid.update()
        boid.show()
    }
    
    if(flock.length <= 7){
        spawnNewBoids(10)
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