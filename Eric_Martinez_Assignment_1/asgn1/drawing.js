// Global variables
let triangleCount = 0;

// Create triangle, starting from its position, create two other vertices to make the triangle
function drawCustomTriangle(pos, vertices, col) {
    triangle = new Triangle();
    triangle.position = pos;
    triangle.color = col;
    triangle.size = 40;
    triangle.customRender(vertices[0],vertices[1], vertices[2],vertices[3], vertices[4],vertices[5]);
    triangleCount = triangleCount + 1;
    return;
}

// Draw custom square using two triangle. Start square from bottom left, to top left, to top right
function drawCustomSquare(pos, vertices, col) {
    drawCustomTriangle(pos, vertices, col);
    drawCustomTriangle(pos, [0.0,0.0, vertices[4],vertices[5], vertices[4],0.0], col);
    return;
}

function drawMyPicture() {
    let currColor = [1.0, 1.0, 1.0, 1.0];
    triangleCount = 0;

    // Start Drawing 

    // Background color
    drawCustomSquare([-1.0, -1.0], [0.0,0.0, 0.0,2.0, 2.0,2.0], [0.07, 0.0, 0.27, 1.0])

    // Square structure
    currColor = [0.475, 0.475, 0.475, 1.0];
    drawCustomSquare([-1.0, -1.0], [0.0,0.0, 0.0,0.5, 2.0,0.5], currColor);

    currColor = [0.5, 0.6, 0.6, 1.0];
    drawCustomSquare([-0.625, -0.5], [0.0,0.0, 0.0,0.625, 0.125,0.625], currColor);
    drawCustomSquare([0.5, -0.5], [0.0,0.0, 0.0,0.625, 0.125,0.625], currColor);

    drawCustomSquare([-0.25, -0.5], [0.0,0.0, 0.0,1.0, 0.5,1.0], currColor);
    drawCustomSquare([-0.125, 0.5], [0.0,0.0, 0.0,0.125, 0.25,0.125], currColor);

    // Roofing details
    drawCustomTriangle([-1.0, -0.5], [0.0,0.0, 0.375,0.0, 0.375,0.125], currColor);
    drawCustomTriangle([1.0, -0.5], [0.0,0.0, -0.375,0.0, -0.375,0.125], currColor);

    drawCustomTriangle([-0.75, -0.5], [0.0,0.0, 0.125,0.0, 0.125,0.375], currColor);
    drawCustomTriangle([0.75, -0.5], [0.0,0.0, -0.125,0.0, -0.125,0.375], currColor);

    drawCustomTriangle([-0.5, -0.5], [0.0,0.0, 0.25,0.0, 0.25,0.25], currColor);
    drawCustomTriangle([0.5, -0.5], [0.0,0.0, -0.25,0.0, -0.25,0.25], currColor);

    currColor = [0.475, 0.475, 0.475, 1.0];
    drawCustomTriangle([-0.625, 0.125], [0.0,0.0, 0.125,0.0, 0.0625,0.375], currColor);
    drawCustomTriangle([0.625, 0.125], [0.0,0.0, -0.125,0.0, -0.0625,0.375], currColor);

    drawCustomTriangle([-0.25, 0.5], [0.0,0.0, 0.125,0.0, 0.0635,0.25], currColor);
    drawCustomTriangle([0.25, 0.5], [0.0,0.0, -0.125,0.0, -0.0635,0.25], currColor);

    drawCustomTriangle([-0.125, 0.625], [0.0,0.0, 0.25,0.0, 0.125,0.375], currColor); 

    // Arches
    drawCustomTriangle([-0.5, 0.0], [0.0,0.0, 0.25,0.0, 0.25,0.125], currColor);
    drawCustomTriangle([-0.5, 0.0], [0.0,0.0, 0.25,0.0, 0.0,-0.125], currColor);
    
    drawCustomTriangle([0.5, 0.0], [0.0,0.0, -0.25,0.0, -0.25,0.125], currColor);
    drawCustomTriangle([0.5, 0.0], [0.0,0.0, -0.25,0.0, 0.0,-0.125], currColor);

    // Front details
    currColor = [0.5, 0.5, 0.5, 1.0];
    drawCustomSquare([-0.1875, -1.0], [0.0,0.0, 0.0,0.625, 0.375,0.625], currColor);
    drawCustomTriangle([-0.1875, -0.375], [0.0,0.0, 0.375,0.0, 0.1875,0.125], currColor);

    currColor = [0.4, 0.4, 0.4, 1.0];
    drawCustomSquare([-0.625, -1.0], [0.0,0.0, 0.0,0.25, 0.25,0.25], currColor);
    drawCustomTriangle([-0.625, -0.75], [0.0,0.0, 0.25,0.0, 0.125,0.0635], currColor);

    drawCustomSquare([0.625, -1.0], [0.0,0.0, 0.0,0.25, -0.25,0.25], currColor);
    drawCustomTriangle([0.625, -0.75], [0.0,0.0, -0.25,0.0, -0.125,0.0635], currColor);

    drawCustomSquare([-0.25, -1.0], [0.0,0.0, 0.0,0.375, 0.5,0.375], currColor);
    drawCustomTriangle([-0.25, -0.625], [0.0,0.0, 0.5,0.0, 0.25,0.125], currColor);

    //Door
    currColor = [0.6, 0.16, 0.16, 1.0];
    drawCustomSquare([-0.125, -1.0], [0.0,0.0, 0.0,0.325, 0.25,0.325], currColor);
    drawCustomTriangle([-0.125, -0.675], [0.0,0.0, 0.25,0.0, 0.125,0.0635], currColor);

    // Window
    let window = new Circle();
    window.position = [0.0, 0.25];
    window.color = [0.8, 0.4, 0.75, 1.0];
    window.size = 30;
    window.segments = 9;
    window.customRainbowRender();

    console.log("Triangle Count: "+triangleCount);
    return;
}