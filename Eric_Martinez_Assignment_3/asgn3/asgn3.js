// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec4 a_Color;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Color = a_Color;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = u_FragColor;                 // Use Solid color
    } else if (u_whichTexture == -2) {
      gl_FragColor = v_Color;                     // Use Shaded color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(0,0, v_UV);             // Use UV debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); // Use Floor Texture 
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV); // Use Crate1 Texture
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV); // Use Crate2 Texture
    } else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);        // Error, Redish
    }
  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Color;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

let g_GlobalCameraAngleX = 0;
let g_GlobalCameraAngleY = 0;
let g_GlobalCameraAngleZ = 0;
let g_currMouseCoords = [0,0];

var g_Camera = new Camera();
var g_eye = g_Camera.eye.elements;
var g_at = g_Camera.at.elements;
var g_up = g_Camera.up.elements;
var g_Sensitivity = 5;
var g_cameraSpeed = 1;

// World Map
var g_map1 = [
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,5],
  [5,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,4,4,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,2.1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,5],
  [5,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,4,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,1.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,1.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3.2,0,0,5],
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]
];

// Setup WebGL Environment 
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

// Setup GLSL variables
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

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  
  // Get the storage location of a_Color
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return false;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_GlobalViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (u_ViewMatrix < 0) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler0 || !u_Sampler1 || !u_Sampler2) {
    console.log("Failed to get the storage location of a u_Sampler");
    return false;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Initialize Textures
function initTextures(gl) {
  var image0 = new Image(); // creates the image object
  var image1 = new Image(); // creates the image object
  var image2 = new Image(); // creates the image object
  if (!image0 || !image1 || !image2) {
    console.log("Failed to create the image object");
    return false;
  }
  
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToTEXTURE(image0, gl.TEXTURE0, u_Sampler0, 0); }
  image1.onload = function(){ sendTextureToTEXTURE(image1, gl.TEXTURE1, u_Sampler1, 1); }
  image2.onload = function(){ sendTextureToTEXTURE(image2, gl.TEXTURE2, u_Sampler2, 2); }

  // Tell the browser to load an image
  image0.src = '../lib/textures/floor.jpg';
  image1.src = '../lib/textures/BoltCrate.png';
  image2.src = '../lib/textures/AmmoCrate.png';
}

// Load Texture
function sendTextureToTEXTURE(image, gl_texture, u_sample, sampleNum) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable given texture
  gl.activeTexture(gl_texture);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture to the sampler
  gl.uniform1i(u_sample, sampleNum);

  console.log("Finished loadTexture");
}

// Setup html actions
function addActionsFromHTMLUI() {
  // Settings

  // Camera
  document.getElementById("cameraSensitivyButton").addEventListener('mousedown', function() { g_Sensitivity = 5; document.getElementById("cameraSensitivy").value = 5; });
  document.getElementById("cameraSpeedButton").addEventListener('mousedown', function() { g_cameraSpeed = 1; document.getElementById("cameraSpeed").value = 1; });
  document.getElementById("cameraSensitivy").addEventListener('input', function() { g_Sensitivity = this.value; });
  document.getElementById("cameraSpeed").addEventListener('input', function() { g_cameraSpeed = this.value; });
}

function main() {
  // Setup WebGL and GLSL
  setupWebGL();
  setupGLSL();

  // Setup html actions
  addActionsFromHTMLUI();

  // Initialize textures
  initTextures(gl, 0);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = getCurrentMouseCoord;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  // Key Binds
  document.onkeydown = keydownFunc;

  // Specify the color for clearing <canvas>
  gl.clearColor(30/255, 30/255, 30/255, 1);

  // Render
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

function getCurrentMouseCoord(ev) {
  g_currMouseCoords = [ev.clientX, ev.clientY];
}

function click(ev) {
  // Update direction of xy Coords
  let xyCoords = convertCoordsEventToGL(ev);

  // Turn Camera based on new xy direction of mouse 
  if (xyCoords[0] > g_Sensitivity) {
    for (i = 0; i < g_cameraSpeed/2; i++) {
      g_Camera.turnRight();
    }
  } 
  else if (xyCoords[0] < -1*g_Sensitivity) {
    for (i = 0; i < g_cameraSpeed/2; i++) {
      g_Camera.turnLeft();
    }
  }
  if (xyCoords[1] > g_Sensitivity) {
    for (i = 0; i < g_cameraSpeed/2; i++) {
      g_Camera.turnDown();
    }
  } 
  else if (xyCoords[1] < -1*g_Sensitivity) {
    for (i = 0; i < g_cameraSpeed/2; i++) {
      g_Camera.turnUp();
    }
  }
  //console.log(xyCoords[0]+", "+xyCoords[1]);
}

// Update direction of xy Coords
function convertCoordsEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  let newCoords = [x,y];
  x = (x - g_currMouseCoords[0]) * (1000 / canvas.width);
  y = (y - g_currMouseCoords[1]) * (1000 / canvas.height);
  g_currMouseCoords = newCoords;
  return([x, y]);
}

// Keybinds
function keydownFunc(ev) {
  let keyID = ev.keyCode;
  switch (keyID) {
    case 87: // W
      g_Camera.forward();
      break;
    case 65: // A
      g_Camera.right();
      break;
    case 83: // S
      g_Camera.back();
      break;
    case 68: // D
      g_Camera.left();
      break;
    case 32: // Space
      g_Camera.goUp();
      break;
    case 16: // Shift
      g_Camera.goDown();
      break;
    case 81: // Q
      g_Camera.turnLeft();
      break;
    case 69: // E
      g_Camera.turnRight();
      break;
    case 82: // R
      g_Camera.turnUp();
      break;
    case 70: // F
      g_Camera.turnDown();
      break;
    case 27: // ESC
      toggleFullscreen();
      break;
    case 49: // 1 (number key)
      // Get Block Looking At
      var blockLookingAt = [Math.round(g_Camera.at.elements[0])+16, g_Camera.at.elements[1], Math.round(g_Camera.at.elements[2])+16];
      if ((blockLookingAt[0] > 0 && blockLookingAt[0] < 33) && (blockLookingAt[2] > 0 && blockLookingAt[2] < 33)) {
        let worldY = blockLookingAt[0];
        let worldX = blockLookingAt[2];
        if (g_map1[worldY][worldX] < 5) {
          g_map1[worldY][worldX] += 1;
        }
      }
      break;
    case 50: // 2 (bunber key)
      // Get Block Looking At
      var blockLookingAt = [Math.round(g_Camera.at.elements[0])+16, g_Camera.at.elements[1], Math.round(g_Camera.at.elements[2])+16];
      if ((blockLookingAt[0] > 0 && blockLookingAt[0] < 33) && (blockLookingAt[2] > 0 && blockLookingAt[2] < 33)) {
        let worldY = blockLookingAt[0];
        let worldX = blockLookingAt[2];
        if (g_map1[worldY][worldX] > 0) {
          g_map1[worldY][worldX] -= 1;
        }
      }
      break;
  }
}

// Fullscreen toggle (ESC key)
function toggleFullscreen() {
  var gameWindow = document.getElementById("webgl");
  if (gameWindow.requestFullscreen) {
    gameWindow.requestFullscreen();
  } else if (gameWindow.webkitRequestFullscreen) { /* Safari */
    gameWindow.webkitRequestFullscreen();
  } else if (gameWindow.msRequestFullscreen) { /* IE11 */
    gameWindow.msRequestFullscreen();
  }
}

// Creates copy of matrix to give to new limb or extra part,
// i.e. creates a new position anchor onto 'matrix'
function createNewAnchor(matrix) {
  var newAnchor = new Matrix4(matrix);
  return newAnchor;
}

// Draw all shapes that need to be in canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, (canvas.width)/(canvas.height), .1, 650); // (deg wide, aspect ratio, near plane, far plane)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  // Pass the view Matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4()
  globalRotMat.rotate(g_GlobalCameraAngleX,0,1,0);
  globalRotMat.rotate(g_GlobalCameraAngleY,1,0,0);
  globalRotMat.rotate(g_GlobalCameraAngleZ,0,0,1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the skybox
  var skyBox = new Cube([120/255, 120/255, 255/255, 1]);
  skyBox.textureNum = -1;
  skyBox.matrix.translate(-250, -15, -250);
  skyBox.matrix.scale(500, 500, 500);
  skyBox.renderFast();

  // Draw the floor
  var groundPlane = new Cube([120/255, 120/255, 255/255, 1]);
  groundPlane.textureNum = 0;
  groundPlane.matrix.translate(-50, -25/100, -50);
  groundPlane.matrix.scale(100, 0, 100);
  groundPlane.renderFast();

  drawWorld();

  var clank1 = new Clank();
  clank1.g_positionY = 1;
  clank1.renderClank();
  
  var clank2 = new Clank();
  clank2.g_positionY = 1;
  clank2.g_positionZ = -2;
  clank2.g_rotationY = 180;
  clank2.renderClank();

  // Check the time at the end of the function, and show on the web page
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: "+Math.floor(duration)+" FPS: "+Math.floor(10000/duration),"fpsElem");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + "from sendTextToHTML func()");
    return;
  }
  htmlElm.innerHTML = text;
}

// Animation Time Handler ========================================

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/10000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  //console.log(g_seconds);

  // Update animation angles
  updateAnimationAngles()

  // Draw Everything
  renderAllShapes();

  // tell the browser to update again when it has time
  requestAnimationFrame(tick);
}