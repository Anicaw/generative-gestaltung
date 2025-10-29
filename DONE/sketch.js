// lade Bild von Geist
let ghost
function preload() {
ghost = loadImage('/images/free_ghost.png');
}

function setup() {
  createCanvas(400, 400)
  
  // damit Pixel auf Monitor und Canvas gleich groß sind
  pixelDensity(1)
  noLoop()

  // Array für Pixelwerte für alle Images
  let imageArr = []

  // Anzahl, wie viele Durchläufe erfolgen, um Schichten von Batikmuster zu erzeugen, die später übereinander gelegt werden 
  let layers = 3;
  for (let l = 0; l < layers; l++) {
    // um Image zu erzeugen mit gewisser Größe
    let img = createImage(width, height)
    img.loadPixels();
    let xoff = 0;    

    // iteriert über alle x-Werte
    for (let x = 0; x < width; x++) {
      // für jedes xoff, startet yoff mit 0
      let yoff = 0;

      // iteriert über alle y-Werte
      for (let y = 0; y < height; y++) {
        //Farben festlegen mit map und noise
        let r = map(noise(xoff, yoff), 0, 1, 50, 255);
        let g = map(noise(xoff + 2, yoff + 2), 0, 1, 50, 255);
        let b = map(noise(xoff + 3, yoff + 3), 0, 1, 50, 255);
        
        // Pixelposition
        let index = (x + y * width) * 4;

        let alpha = 120 * random(0.6, 1);

        // Rot, Grün, Blau, Alpha für jeden Pixel
        img.pixels[index] = r;
        img.pixels[index + 1] = g;
        img.pixels[index + 2] = b;
        img.pixels[index + 3] = alpha;
        // Increment yoff.
        yoff += 0.01;
      }
      // Increment xoff.
      xoff += 0.01;
    }
    img.updatePixels()
    // Pixel von der ersten Schicht in Array pushen
    imageArr.push(img)
  }

  // Images übereinander legen
  blendMode(OVERLAY)


  // Anzahl der Schichten iterieren (da so viele Images existieren)
  // Hinweis: setzen von y beweist, dass 3 Schichten existieren und diese unterschiedlich aussehen --> image([wert], [wert], y)
  let y = 0;
  for(i = 0; i < layers; i++){
    image(imageArr[i], 0, 0)
    y += 120
  }

  // Batikmuster übereindander legen
  blendMode(MULTIPLY)
  // blendMode(REPLACE)

  // Rechteck über alle (Batikmuster-)Schichten legen
  let imgColor = ["Blue", "DarkOrange", "Green"]
  let colorIndex = Math.floor(random(0, imgColor.length));
  let colorObj = color(imgColor[colorIndex])
  colorObj.setAlpha(random(10,100))
  fill(colorObj)
  rect(0, 0, 400, 400) 
  
  // Geist ist ganz oben
  blendMode(BLEND)
  image(ghost, 0,0, 400, 400)
}
