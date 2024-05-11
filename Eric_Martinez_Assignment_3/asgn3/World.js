var g_mapWidth = 32;

cubeHeight = [0, -25, 75, 175, 275, 375];

// Draw the world
function drawWorld() {
    var body = new Cube([255/255, 255/255, 255/255, 1]);
    for (x = 0; x < g_mapWidth; x++) {
        for (y = 0; y < g_mapWidth; y++) {
            if (g_map1[x][y] != 0) {
                for (k = 1; k <= g_map1[x][y]; k++) {
                    if (g_map1[x][y] % 1 != 0) {
                        body.textureNum = 2;
                    } else {
                        body.textureNum = 1;
                    }
                    body.matrix.translate(x-16, cubeHeight[k]/100, y-16);
                    body.renderFast();
                }
            }
        }
    }

}