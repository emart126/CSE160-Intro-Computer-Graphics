// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;  // uniform変数
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Constans
let POINT = 0;
let TRIANGLE = 1;
let CIRCLE = 2;

// Global Vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function setupGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Setup html actions
function addActionsFromHTMLUI() {
  // Button events
  document.getElementById("squareButton").onclick = function() { g_selectedType = POINT }
  document.getElementById("triangleButton").onclick = function() { g_selectedType = TRIANGLE }
  document.getElementById("circleButton").onclick = function() { g_selectedType = CIRCLE }
  document.getElementById("clearButton").onclick = function() { g_shapesList = []; renderAllShapes(); }
  document.getElementById("drawButton").onclick = function() { g_shapesList = []; renderAllShapes(); drawMyPicture() }
  
  document.getElementById("hideRefButton").onclick = function() { 
    var rImg = document.getElementById("ref");
    if (rImg.style.display == "none" || rImg.style.display != "inline") {
      rImg.style.display = "inline";
      console.log("inline");
    } else {
      rImg.style.display = "none";
      console.log("none");
    }
 }

  // Slider events
  document.getElementById("redSlider").addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById("greenSlider").addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById("blueSlider").addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
  document.getElementById("sizeSlider").addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById("segmentSlider").addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function main() {
  // Setup WebGL and GLSL
  setupWebGL();
  setupGLSL();

  // Setup html actions
  addActionsFromHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = []; // List of points

function click(ev) {
  // Extract coordiantes event and send them to WebGL
  let [x,y] = convertCoordsEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  }
  else if (g_selectedType == CIRCLE) {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw all shapes that need to be in canvas
  renderAllShapes();
}

// Extract coordiantes event and send them to WebGL
function convertCoordsEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

// Draw all shapes that need to be in canvas
function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}
