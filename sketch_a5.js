const flock = []

const predators = []
// Variable/ Konstante für das wiedererschienen des Raubfisches
let predatorRespawnTimer = 0
const respawnDelay = 120

particleBursts = []

// für Animation der Fische
const totalFrames = 7 
let fishSprite
let predatorSprite

let waterSound

function preload(){
    fishSprite = loadImage("./images/fish-blue2.png")
    predatorSprite = loadImage("./images/fish-pink2.png")
    bgStones = loadImage("./images/stones.jpg")
    waterSound = loadSound("./sounds/water-splashing.mp3")
    eating = loadSound("./sounds/eating.mp3")
    burstPredator = loadSound("./sounds/burst.mp3")
}

function setup(){
    createCanvas(windowWidth, windowHeight)
    bg = createGraphics(width, height)
    drawBgImageOnce(bg)

    // x Fische werden am Anfang erstellt
    for(let i = 0; i < 50; i++){
        flock.push(new Boid())
    }
    // Raubfisch wird in Bildschirmmitte erstellt 
    // auskommentierter Code, falls mehr als 1 Raubfisch erstellt werden soll
    for(let j = 0; j < 1; j++){
        // predators.push(new Predator(createVector(random(width), random(height))))
        predators.push(new Predator(createVector(width/2, height/2)))
    }
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

// damit Bilder nicht verzerrt dargestellt werden
// START Code von ChatGPT
function drawBgImageOnce(g) {
    let imgAspect = bgStones.width / bgStones.height;
    let canvasAspect = width / height;
    let drawWidth, drawHeight;

    if (canvasAspect > imgAspect) {
        drawWidth = width;
        drawHeight = width / imgAspect;
    } else {
        drawHeight = height;
        drawWidth = height * imgAspect;
    }

    let x = 0;
    let y = height - drawHeight;

    g.push();
    g.tint(90, 50);
    g.image(bgStones, x, y, drawWidth, drawHeight);
    g.noTint();
    g.pop();
}
// ENDE Code von ChatGPT

function draw(){
    image(bg, 0, 0)

    for (let boid of flock){
        boid.edges(0.8)
        boid.flock(flock)
        boid.update()
        boid.show()
    }
    
    if(flock.length <= 20){
        spawnNewBoids(20)
    }

    for (let i = predators.length - 1; i >= 0; i--) {
        let p = predators[i]
        p.edges(0.8)
        p.flock(flock)
        p.update()
        p.eat(flock)
        p.show()
    
        // Timer starten; Raubfisch entfernen
        if (p.hasBurst) {
            predatorRespawnTimer = respawnDelay
            predators.splice(i, 1)
        }
    }
    
    // Spawn, wenn Timer abgelaufen ist
    // Damit Raubfisch erst nach ein paar Sekunden kommt, wenn er geplatzt ist (an zufälliger Pos)
    if (predatorRespawnTimer > 0) {
        predatorRespawnTimer--;
        if (predatorRespawnTimer === 0) {
            predators.push(new Predator(createVector(random(width), random(height))));
        }
    }
    
    for(let burst of particleBursts){
        burst.update()
        burst.show()
    }

    // Löscht Partikel
    for(let i = particleBursts.length - 1; i >= 0; i--){
        if(particleBursts[i].isDone()){
            particleBursts.splice(i, 1)
        }
    }
}