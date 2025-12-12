const flock = []

const predators = []
let predatorRespawnTimer = 0
let respawnDelay = 120

particleBursts = []

const totalFrames = 7 

let fishSprite

function preload(){
    fishSprite = loadImage("./images/fishBlue.png")
    bgStones = loadImage("./images/stones.jpg")
}

function setup(){
    createCanvas(640, 360)

    bg = createGraphics(width, height);
    bg.colorMode(RGB);
    drawBgImageOnce(bg)

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

function drawWaves(){
    noFill()
    stroke(255, 255, 255, 5);
    for(let y = 0; y < height; y += 12){
        let offset = sin(frameCount * 0.015 + y * 0.2) * 9
        let noiseOffset = noise(frameCount * 0.01, y * 0.05) * 8
        let waveY = y + offset + noiseOffset
        line(0, waveY, width, waveY)
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
        boid.edges(0.8, 1)
        boid.flock(flock)
        boid.update()
        boid.show()
    }
    
    if(flock.length <= 7){
        spawnNewBoids(10)
    }

    // for (let p of predators){
    //     p.flock(flock)
    //     p.update()
    //     p.eat(flock)
    //     p.show()
    // }
    for (let i = predators.length - 1; i >= 0; i--) {
        let p = predators[i];
        p.flock(flock)
        p.update();
        p.eat(flock);
        p.show();
    
        // Prüfen, ob er „explodiert“ ist
        if (p.size >= p.maxSize) {
            predatorRespawnTimer = respawnDelay; // Timer starten
            predators.splice(i, 1);               // Raubfisch entfernen
        }
    }
    
    // Spawn, wenn Timer abgelaufen ist
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

    for(let i = particleBursts.length - 1; i >= 0; i--){
        if(particleBursts[i].isDone()){
            particleBursts.splice(i, 1)
        }
    }

    // drawWaves()
}