function Tree(x, y, z) {
    this.x = x
    this.y = y
    this.z = z


    this.drawObj = function() {
        image(pineTree, this.x, this.y)
    }
}