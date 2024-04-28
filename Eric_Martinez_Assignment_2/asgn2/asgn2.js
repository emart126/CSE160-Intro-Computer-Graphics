// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Constants
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
let g_GlobalCameraAngleX = 0;
let g_GlobalCameraAngleY = 0;
let g_GlobalCameraAngleZ = 0;
let g_zoom = 100;
let g_positionX = 0;
let g_positionY = 0;
let g_positionZ = 0;
let g_currMouseCoords = [0,0];
let g_idleAnimation = false;
let g_runAnimation = false;
let g_runSpeed = 9;
let g_talkAnimation = false;
let g_shrinkAnimation = false; 

// Limb Slider Global Variables

// Head
let g_headX = 0;
let g_headY = 0;
let g_headZ = 0;
let g_mouthX = 0;

// Eyes
let g_leftEyeHeight = 0;
let g_leftUpperEyelid = 0;
let g_leftLowerEyelid = 0;

let g_rightEyeHeight = 0;
let g_rightUpperEyelid = 0;
let g_rightLowerEyelid = 0;

// Body
let g_pelvisX = 0

// Left Arm
let g_upperLeftArmAngleX = 0;
let g_upperLeftArmAngleY = 0;
let g_upperLeftArmAngleZ = 0;
let g_lowerLeftArmAngleZ = 0;

// Left Hand
let g_LeftHandX = 0;
let g_LeftHandY = 0;
let g_LeftHandZ = 0;

let g_leftIndex = 0;
let g_leftMiddle = 0;
let g_leftThumb = 0;

// Right Arm
let g_upperRightArmAngleX = 0;
let g_upperRightArmAngleY = 0;
let g_upperRightArmAngleZ = 0;
let g_lowerRightArmAngleZ = 0;

// Right Hand
let g_RightHandX = 0;
let g_RightHandY = 0;
let g_RightHandZ = 0;

let g_rightIndex = 0;
let g_rightMiddle = 0;
let g_rightThumb = 0;

// Left Leg
let g_upperLeftLegAngleX = 0;
let g_upperLeftLegAngleY = 0;
let g_upperLeftLegAngleZ = 0;
let g_lowerLeftLegAngleY = 0;

// Right Leg
let g_upperRightLegAngleX = 0;
let g_upperRightLegAngleY = 0;
let g_upperRightLegAngleZ = 0;
let g_lowerRightLegAngleY = 0;

// Feet
let g_LeftFootY = 0;
let g_RightFootY = 0;

// let g_FullModelAngle = 0;

// Developer Trnansformations
var dev_headxScale = 100;
var dev_headyScale = 100;
var dev_headzScale = 100;
var dev_headYTranslation = 0;

var dev_leftArmXTranslation = 0;
var dev_leftHandXRotation = 0;
var dev_leftThumbRotation = 0;
var dev_rightArmXTranslation = 0;
var dev_rightHandXRotation = 0;
var dev_rightThumbRotation = 0;

var dev_leftLegYTranslation = 0;
var dev_rightLegYTranslation = 0;

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

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Setup html actions
function addActionsFromHTMLUI() {
  // Settings

  // Camera
  document.getElementById("cameraSliderX").addEventListener('input', function() { g_GlobalCameraAngleX = this.value; renderAllShapes(); });
  document.getElementById("cameraSliderY").addEventListener('input', function() { g_GlobalCameraAngleY = this.value; renderAllShapes(); });
  document.getElementById("cameraSliderZ").addEventListener('input', function() { g_GlobalCameraAngleZ = this.value; renderAllShapes(); });
  document.getElementById("cameraReset").addEventListener('mousedown', function() { resetCamera(); renderAllShapes(); });
  document.getElementById("posReset").addEventListener('mousedown', function() { resetPosition(); renderAllShapes(); });
  document.getElementById("angleReset").addEventListener('mousedown', function() { resetAngles(); renderAllShapes(); });
  document.getElementById("zoomButton").addEventListener('input', function() { g_zoom = this.value; renderAllShapes(); });

  // Position
  document.getElementById("posX").addEventListener('input', function() { g_positionX = this.value; renderAllShapes(); });
  document.getElementById("posY").addEventListener('input', function() { g_positionY = this.value; renderAllShapes(); });
  document.getElementById("posZ").addEventListener('input', function() { g_positionZ = this.value; renderAllShapes(); });

  // Animation Buttons
  document.getElementById("idleOn").onclick = function() { 
    g_idleAnimation = true;
    document.getElementById("runOn").disabled = true;
    document.getElementById("runOff").disabled = true;
    document.getElementById("speakOn").disabled = true;
    document.getElementById("speakOff").disabled = true;
  };
  document.getElementById("idleOff").onclick = function() { 
    g_idleAnimation = false;
    document.getElementById("runOn").disabled = false;
    document.getElementById("runOff").disabled = false;
    document.getElementById("speakOn").disabled = false;
    document.getElementById("speakOff").disabled = false;
  };

  document.getElementById("runOn").onclick = function() { 
    g_runAnimation = true;
    document.getElementById("idleOn").disabled = true;
    document.getElementById("idleOff").disabled = true;
    document.getElementById("speakOn").disabled = true;
    document.getElementById("speakOff").disabled = true;
  };
  document.getElementById("runOff").onclick = function() {
    g_runAnimation = false;
    document.getElementById("idleOn").disabled = false;
    document.getElementById("idleOff").disabled = false;
    document.getElementById("speakOn").disabled = false;
    document.getElementById("speakOff").disabled = false;
  };
  document.getElementById("runSpeed").addEventListener('input', function() { g_runSpeed = this.value; renderAllShapes(); });

  document.getElementById("speakOn").onclick = function() {
    g_talkAnimation = true;
    document.getElementById("idleOn").disabled = true;
    document.getElementById("idleOff").disabled = true;
    document.getElementById("runOn").disabled = true;
    document.getElementById("runOff").disabled = true;
  };
  document.getElementById("speakOff").onclick = function() {
    g_talkAnimation = false;
    document.getElementById("idleOn").disabled = false;
    document.getElementById("idleOff").disabled = false;
    document.getElementById("runOn").disabled = false;
    document.getElementById("runOff").disabled = false;
  };

  // Controls (Limb Sliders)

  // Head
  document.getElementById("headX").addEventListener('input', function() { g_headX = this.value; renderAllShapes(); });
  document.getElementById("headY").addEventListener('input', function() { g_headY = this.value; renderAllShapes(); });
  document.getElementById("headZ").addEventListener('input', function() { g_headZ = this.value; renderAllShapes(); });
  document.getElementById("mouthX").addEventListener('input', function() { g_mouthX = this.value; renderAllShapes(); });

  // Eyes
  document.getElementById("leftEyeHight").addEventListener('input', function() { g_leftEyeHeight = this.value; renderAllShapes(); });
  document.getElementById("leftUpperEyeScale").addEventListener('input', function() { g_leftUpperEyelid = this.value; renderAllShapes(); });
  document.getElementById("leftLowerEyeScale").addEventListener('input', function() { g_leftLowerEyelid = this.value; renderAllShapes(); });

  document.getElementById("rightEyeHight").addEventListener('input', function() { g_rightEyeHeight = this.value; renderAllShapes(); });
  document.getElementById("rightUpperEyeScale").addEventListener('input', function() { g_rightUpperEyelid = this.value; renderAllShapes(); });
  document.getElementById("rightLowerEyeScale").addEventListener('input', function() { g_rightLowerEyelid = this.value; renderAllShapes(); });

  // Body
  document.getElementById("pelvisX").addEventListener('input', function() { g_pelvisX = this.value; renderAllShapes(); });

  // Arms
  document.getElementById("leftBicepX").addEventListener('input', function() { g_upperLeftArmAngleX = this.value; renderAllShapes(); });
  document.getElementById("leftBicepY").addEventListener('input', function() { g_upperLeftArmAngleY = this.value; renderAllShapes(); });
  document.getElementById("leftBicepZ").addEventListener('input', function() { g_upperLeftArmAngleZ = this.value; renderAllShapes(); });
  document.getElementById("leftForearmZ").addEventListener('input', function() { g_lowerLeftArmAngleZ = this.value; renderAllShapes(); });
  
  document.getElementById("rightBicepX").addEventListener('input', function() { g_upperRightArmAngleX = this.value; renderAllShapes(); });
  document.getElementById("rightBicepY").addEventListener('input', function() { g_upperRightArmAngleY = this.value; renderAllShapes(); });
  document.getElementById("rightBicepZ").addEventListener('input', function() { g_upperRightArmAngleZ = this.value; renderAllShapes(); });
  document.getElementById("rightForearmZ").addEventListener('input', function() { g_lowerRightArmAngleZ = this.value; renderAllShapes(); });

  // Hands
  document.getElementById("leftHandX").addEventListener('input', function() { g_LeftHandX = this.value; renderAllShapes(); });
  document.getElementById("leftHandY").addEventListener('input', function() { g_LeftHandY = this.value; renderAllShapes(); });
  document.getElementById("leftHandZ").addEventListener('input', function() { g_LeftHandZ = this.value; renderAllShapes(); });
  document.getElementById("leftIndex").addEventListener('input', function() { g_leftIndex = this.value; renderAllShapes(); });
  document.getElementById("leftMiddle").addEventListener('input', function() { g_leftMiddle = this.value; renderAllShapes(); });
  document.getElementById("leftThumb").addEventListener('input', function() { g_leftThumb = this.value; renderAllShapes(); });

  document.getElementById("rightHandX").addEventListener('input', function() { g_RightHandX = this.value; renderAllShapes(); });
  document.getElementById("rightHandY").addEventListener('input', function() { g_RightHandY = this.value; renderAllShapes(); });
  document.getElementById("rightHandZ").addEventListener('input', function() { g_RightHandZ = this.value; renderAllShapes(); });
  document.getElementById("rightIndex").addEventListener('input', function() { g_rightIndex = this.value; renderAllShapes(); });
  document.getElementById("rightMiddle").addEventListener('input', function() { g_rightMiddle = this.value; renderAllShapes(); });
  document.getElementById("rightThumb").addEventListener('input', function() { g_rightThumb = this.value; renderAllShapes(); });

  // Legs
  document.getElementById("leftThighX").addEventListener('input', function() { g_upperLeftLegAngleX = this.value; renderAllShapes(); });
  document.getElementById("leftThighY").addEventListener('input', function() { g_upperLeftLegAngleY = this.value; renderAllShapes(); });
  document.getElementById("leftThighZ").addEventListener('input', function() { g_upperLeftLegAngleZ = this.value; renderAllShapes(); });
  document.getElementById("leftShinY").addEventListener('input', function() { g_lowerLeftLegAngleY = this.value; renderAllShapes(); });

  document.getElementById("rightThighX").addEventListener('input', function() { g_upperRightLegAngleX = this.value; renderAllShapes(); });
  document.getElementById("rightThighY").addEventListener('input', function() { g_upperRightLegAngleY = this.value; renderAllShapes(); });
  document.getElementById("rightThighZ").addEventListener('input', function() { g_upperRightLegAngleZ = this.value; renderAllShapes(); });
  document.getElementById("rightShinY").addEventListener('input', function() { g_lowerRightLegAngleY = this.value; renderAllShapes(); });

  // Feet
  document.getElementById("leftFootY").addEventListener('input', function() { g_LeftFootY = this.value; renderAllShapes(); });
  document.getElementById("rightFootY").addEventListener('input', function() { g_RightFootY = this.value; renderAllShapes(); });

  // Possible Feature to add: Save/Load Current Pose

}

function main() {
  // Setup WebGL and GLSL
  setupWebGL();
  setupGLSL();

  // Setup html actions
  addActionsFromHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = getCurrentMouseCoord;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(55/255, 106/255, 150/255, 1)

  // Render
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

function getCurrentMouseCoord(ev) {
  // Detect Shift+Click
  let shift = ev.shiftKey;
  if (shift && !g_shrinkAnimation) {
    g_shrinkAnimation = true;
    document.getElementById("idleOn").disabled = true;
    document.getElementById("idleOff").disabled = true;
    document.getElementById("runOn").disabled = true;
    document.getElementById("runOff").disabled = true;
    document.getElementById("speakOn").disabled = true;
    document.getElementById("speakOff").disabled = true;
  } else if (shift && g_shrinkAnimation) {
    g_shrinkAnimation = false;
    if (g_idleAnimation) {
      document.getElementById("idleOn").disabled = false;
      document.getElementById("idleOff").disabled = false;
    }
    else if (g_runAnimation) {
      document.getElementById("runOn").disabled = false;
      document.getElementById("runOff").disabled = false;
    }
    else if (g_talkAnimation) {
      document.getElementById("speakOn").disabled = false;
      document.getElementById("speakOff").disabled = false;
    }
    else {
      document.getElementById("idleOn").disabled = false;
      document.getElementById("idleOff").disabled = false;
      document.getElementById("runOn").disabled = false;
      document.getElementById("runOff").disabled = false;
      document.getElementById("speakOn").disabled = false;
      document.getElementById("speakOff").disabled = false;
    }
  }
  
  g_currMouseCoords = [ev.clientX, ev.clientY];
}

function click(ev) {
  // Extract coordiantes event and send them to WebGL
  let xyCoords = convertCoordsEventToGL(ev);

  // Change camera angle
  g_GlobalCameraAngleX = g_GlobalCameraAngleX-xyCoords[0]*360
  g_GlobalCameraAngleY = g_GlobalCameraAngleY-xyCoords[1]*360
  document.getElementById("cameraSliderX").value = g_GlobalCameraAngleX;
  document.getElementById("cameraSliderY").value = g_GlobalCameraAngleY;

  // Draw all shapes that need to be in canvas
  renderAllShapes();
}

// Extract coordiantes event and send them to WebGL
function convertCoordsEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  let newCoords = [x,y];
  x = (x - g_currMouseCoords[0]) / canvas.width;
  y = (y - g_currMouseCoords[1]) / canvas.height;
  g_currMouseCoords = newCoords;
  return([x, y]);
}

// Reset Camera Angle to default
function resetCamera() {
  g_GlobalCameraAngleX = 0;
  g_GlobalCameraAngleY = 0;
  g_GlobalCameraAngleZ = 0;
  document.getElementById("cameraSliderX").value = 0;
  document.getElementById("cameraSliderY").value = 0;
  document.getElementById("cameraSliderZ").value = 0;
}

// Reset Position relative to origin
function resetPosition() {
  g_positionX = 0;
  g_positionY = 0;
  g_positionZ = 0;
  document.getElementById("posX").value = 0;
  document.getElementById("posY").value = 0;
  document.getElementById("posZ").value = 0;
}

// Reset all angles to defaults (0)
function resetAngles() {
  // Head
  g_headX = 0;
  g_headY = 0;
  g_headZ = 0;
  g_mouthX = 0;
  document.getElementById("headX").value = 0;
  document.getElementById("headY").value = 0;
  document.getElementById("headZ").value = 0;
  document.getElementById("mouthX").value = 0;

  // Eyes
  g_leftEyeHeight = 0;
  g_leftUpperEyelid = 0;
  g_leftLowerEyelid = 0;
  g_rightEyeHeight = 0;
  g_rightUpperEyelid = 0;
  g_rightLowerEyelid = 0;
  document.getElementById("leftEyeHight").value = 0;
  document.getElementById("leftUpperEyeScale").value = 0;
  document.getElementById("leftLowerEyeScale").value = 0;
  document.getElementById("rightEyeHight").value = 0;
  document.getElementById("rightUpperEyeScale").value = 0;
  document.getElementById("rightLowerEyeScale").value = 0;

  // Body
  g_pelvisX = 0;
  document.getElementById("pelvisX").value = 0;

  // Left Arm
  g_upperLeftArmAngleX = 0;
  g_upperLeftArmAngleY = 0;
  g_upperLeftArmAngleZ = 0;
  g_lowerLeftArmAngleZ = 0;

  document.getElementById("leftBicepX").value = 0;
  document.getElementById("leftBicepY").value = 0;
  document.getElementById("leftBicepZ").value = 0;
  document.getElementById("leftForearmZ").value = 0;

  // Left Hand
  g_LeftHandX = 0;
  g_LeftHandY = 0;
  g_LeftHandZ = 0;

  g_leftIndex = 0;
  g_leftMiddle = 0;
  g_leftThumb = 0;
  document.getElementById("leftHandX").value = 0;
  document.getElementById("leftHandY").value = 0;
  document.getElementById("leftHandZ").value = 0;
  document.getElementById("leftIndex").value = 0;
  document.getElementById("leftMiddle").value = 0;
  document.getElementById("leftThumb").value = 0;

  // Right Arm
  g_upperRightArmAngleX = 0;
  g_upperRightArmAngleY = 0;
  g_upperRightArmAngleZ = 0;
  g_lowerRightArmAngleZ = 0;
  document.getElementById("rightBicepX").value = 0;
  document.getElementById("rightBicepY").value = 0;
  document.getElementById("rightBicepZ").value = 0;
  document.getElementById("rightForearmZ").value = 0;

  // Right Hand
  g_RightHandX = 0;
  g_RightHandY = 0;
  g_RightHandZ = 0;

  g_rightIndex = 0;
  g_rightMiddle = 0;
  g_rightThumb = 0;
  document.getElementById("rightHandX").value = 0;
  document.getElementById("rightHandY").value = 0;
  document.getElementById("rightHandZ").value = 0;
  document.getElementById("rightIndex").value = 0;
  document.getElementById("rightMiddle").value = 0;
  document.getElementById("rightThumb").value = 0;

  // Left Leg
  g_upperLeftLegAngleX = 0;
  g_upperLeftLegAngleY = 0;
  g_upperLeftLegAngleZ = 0;
  g_lowerLeftLegAngleY = 0;
  document.getElementById("leftThighX").value = 0;
  document.getElementById("leftThighY").value = 0;
  document.getElementById("leftThighZ").value = 0;
  document.getElementById("leftShinY").value = 0;

  // Right Leg
  g_upperRightLegAngleX = 0;
  g_upperRightLegAngleY = 0;
  g_upperRightLegAngleZ = 0;
  g_lowerRightLegAngleY = 0;
  document.getElementById("rightThighX").value = 0;
  document.getElementById("rightThighY").value = 0;
  document.getElementById("rightThighZ").value = 0;
  document.getElementById("rightShinY").value = 0;

  // Feet
  g_LeftFootY = 0;
  g_RightFootY = 0;
  document.getElementById("leftFootY").value = 0;
  document.getElementById("rightFootY").value = 0;
}

// Set Arm and leg angles to 0 to lock them
function lockArmLegAngles() {
  // Left Arm
  g_upperLeftArmAngleX = 0;
  g_upperLeftArmAngleY = 0;
  g_upperLeftArmAngleZ = 0;
  g_lowerLeftArmAngleZ = 0;

  document.getElementById("leftBicepX").value = 0;
  document.getElementById("leftBicepY").value = 0;
  document.getElementById("leftBicepZ").value = 0;
  document.getElementById("leftForearmZ").value = 0;

  // Left Hand
  g_LeftHandX = 0;
  g_LeftHandY = 0;
  g_LeftHandZ = 0;

  g_leftIndex = 0;
  g_leftMiddle = 0;
  g_leftThumb = 0;
  document.getElementById("leftHandX").value = 0;
  document.getElementById("leftHandY").value = 0;
  document.getElementById("leftHandZ").value = 0;
  document.getElementById("leftIndex").value = 0;
  document.getElementById("leftMiddle").value = 0;
  document.getElementById("leftThumb").value = 0;

  // Right Arm
  g_upperRightArmAngleX = 0;
  g_upperRightArmAngleY = 0;
  g_upperRightArmAngleZ = 0;
  g_lowerRightArmAngleZ = 0;
  document.getElementById("rightBicepX").value = 0;
  document.getElementById("rightBicepY").value = 0;
  document.getElementById("rightBicepZ").value = 0;
  document.getElementById("rightForearmZ").value = 0;

  // Right Hand
  g_RightHandX = 0;
  g_RightHandY = 0;
  g_RightHandZ = 0;

  g_rightIndex = 0;
  g_rightMiddle = 0;
  g_rightThumb = 0;
  document.getElementById("rightHandX").value = 0;
  document.getElementById("rightHandY").value = 0;
  document.getElementById("rightHandZ").value = 0;
  document.getElementById("rightIndex").value = 0;
  document.getElementById("rightMiddle").value = 0;
  document.getElementById("rightThumb").value = 0;

  // Left Leg
  g_upperLeftLegAngleX = 0;
  g_upperLeftLegAngleY = 0;
  g_upperLeftLegAngleZ = 0;
  g_lowerLeftLegAngleY = 0;
  document.getElementById("leftThighX").value = 0;
  document.getElementById("leftThighY").value = 0;
  document.getElementById("leftThighZ").value = 0;
  document.getElementById("leftShinY").value = 0;

  // Right Leg
  g_upperRightLegAngleX = 0;
  g_upperRightLegAngleY = 0;
  g_upperRightLegAngleZ = 0;
  g_lowerRightLegAngleY = 0;
  document.getElementById("rightThighX").value = 0;
  document.getElementById("rightThighY").value = 0;
  document.getElementById("rightThighZ").value = 0;
  document.getElementById("rightShinY").value = 0;

  // Feet
  g_LeftFootY = 0;
  g_RightFootY = 0;
  document.getElementById("leftFootY").value = 0;
  document.getElementById("rightFootY").value = 0;
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

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4()
  globalRotMat.rotate(g_GlobalCameraAngleX,0,1,0);
  globalRotMat.rotate(g_GlobalCameraAngleY,1,0,0);
  globalRotMat.rotate(g_GlobalCameraAngleZ,0,0,1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Color Palette
  var mainBodyColor = [230/255, 232/255, 221/255, 1];
  var secondayBodyColor = [65/255, 65/255, 65/255, 1];
  var limbColor = [45/255, 45/255, 45/255, 1];
  var hingeColor = [130/255, 130/255, 130/255, 1];
  var eyeOutlineColor = [64/255, 64/255, 64/255, 1];
  var eyeLidColor = [100/255, 100/255, 100/255, 1];
  var eyeColor1 = [90/255, 224/255, 90/255, 1];
  var eyeColor2 = [140/255, 242/255, 140/255, 1];

  // BODY ==============================================
  var body1 = new Cube();
  var body2 = new Cube();
  var body3 = new Cube();
  var body4 = new Cube();
  var body5 = new Cube();
  var body6 = new Cylinder();
  var body7 = new Cylinder();
  var body8 = new Cylinder();
  var body9 = new Cylinder();
  var body10 = new Cylinder();
  var body11 = new Cylinder();
  var neck = new Cylinder();
  body1.color = mainBodyColor;

  var scale = g_zoom/100;

  body1.matrix.translate(g_positionX/100, g_positionY/100, g_positionZ/100); // Position relative to origin
  body1.matrix.scale(scale, scale, scale); // Zoom

  var MainBody1a_POS = createNewAnchor(body1.matrix); // Given to Pelvis
  
  body1.matrix.rotate(-g_pelvisX, 0, 1, 0);
  body1.matrix.translate(0/100, 0/100, -25/100);
  var MainBody1b_POS = createNewAnchor(body1.matrix); // Given to Extra Body cube (upper block)
  var MainBody1c_POS = createNewAnchor(body1.matrix); // Given to Neck attatched to body
  var MainBody1d_POS = createNewAnchor(body1.matrix); // Given to other extra detail parts
  var MainBody1f_POS = createNewAnchor(body1.matrix); // Given to other extra detail parts
  var MainBody1g_POS = createNewAnchor(body1.matrix); // Given to other extra detail parts
  var MainBody1h_POS = createNewAnchor(body1.matrix); // Given to other extra detail parts
  var MainBody1i_POS = createNewAnchor(body1.matrix); // Given to other extra detail parts
  var MainBody2_POS = createNewAnchor(body1.matrix); // Given to Left Arm
  var MainBody3_POS = createNewAnchor(body1.matrix); // Given to Right Arm

  body1.matrix.translate(-25/100, -50/100, 0);
  body1.matrix.scale(50/100, 50/100, 45/100);
  body1.render();

  body2.color = mainBodyColor;
  body2.matrix = MainBody1b_POS;
  body2.matrix.translate(-25/100, -50/100, 5/100);
  body2.matrix.scale(50/100, 60/100, 35/100);
  body2.render();

  // Pelvis
  body3.color = limbColor;
  body3.matrix = MainBody1a_POS;
  body3.matrix.translate(-25/100, -55/100, -20/100);
  var body3Pelvis1_POS = createNewAnchor(body3.matrix); // Given to Left Leg
  var body3Pelvis2_POS = createNewAnchor(body3.matrix); // Given to Right Leg

  body3.matrix.scale(50/100, 5/100, 35/100);
  body3.render();

  body4.color = secondayBodyColor;
  body4.matrix = MainBody1d_POS;
  body4.matrix.translate(-26/100, -30/100, 7.5/100);
  body4.matrix.scale(52/100, 30/100, 30/100);
  body4.render();

  body5.color = secondayBodyColor;
  body5.matrix = MainBody1f_POS;
  body5.matrix.translate(-12.5/100, -40/100, -1/100);
  var frontPlate1_POS = createNewAnchor(body5.matrix); // Give to front piece detail
  var frontPlate2_POS = createNewAnchor(body5.matrix); // Give to front piece detail
  var frontPlate3_POS = createNewAnchor(body5.matrix); // Give to front piece detail

  body5.matrix.scale(25/100, 30/100, 5/100);
  body5.render();

  body6.segments = 3;
  body6.color = secondayBodyColor;
  body6.matrix = frontPlate1_POS;
  body6.matrix.rotate(90, 0, 1, 0);
  body6.matrix.rotate(90, 0, 0, 1);
  body6.matrix.scale(3, 3, 25/100);
  body6.render();

  body7.segments = 3;
  body7.color = secondayBodyColor;
  body7.matrix = frontPlate2_POS;
  body7.matrix.translate(0/100, 11/100, 0/100);
  body7.matrix.rotate(90, 0, 1, 0);
  body7.matrix.rotate(90, 0, 0, 1);
  body7.matrix.scale(3, 3, 25/100);
  body7.render();

  body8.segments = 3;
  body8.color = secondayBodyColor;
  body8.matrix = frontPlate3_POS;
  body8.matrix.translate(0/100, 22/100, 0/100);
  body8.matrix.rotate(90, 0, 1, 0);
  body8.matrix.rotate(90, 0, 0, 1);
  body8.matrix.scale(3, 3, 25/100);
  body8.render();

  body9.segments = 6;
  body9.color = hingeColor;
  body9.matrix = MainBody1g_POS;
  body9.matrix.translate(0/100, -15/100, 40/100);
  body9.matrix.rotate(90, 0, 0, 1);
  body9.matrix.scale(4, 4, 10/100);
  body9.render();

  body10.segments = 8;
  body10.color = limbColor;
  body10.matrix = MainBody1h_POS;
  body10.matrix.translate(19/100, -10/100, 23.5/100);
  body10.matrix.rotate(90, 0, 1, 0);
  body10.matrix.rotate(-45, 1, 0, 0);
  body10.matrix.scale(1.5, 1.5, 20/100);
  body10.render();

  body11.segments = 8;
  body11.color = limbColor;
  body11.matrix = MainBody1i_POS;
  body11.matrix.translate(-33/100, 4/100, 23.5/100);
  body11.matrix.rotate(90, 0, 1, 0);
  body11.matrix.rotate(45, 1, 0, 0);
  body11.matrix.scale(1.5, 1.5, 20/100);
  body11.render();

  // Neck
  neck.color = limbColor;
  neck.segments = 8;
  neck.matrix = MainBody1c_POS;
  neck.matrix.rotate(90, 1, 0, 0);
  neck.matrix.translate(0/100, 25/100, -25/100);
  var neck1_POS = createNewAnchor(neck.matrix); // Give to Head1

  neck.matrix.scale(2.5, 2.5, 0.2);
  neck.render();

  // HEAD ==============================================
  var head1 = new Cube();
  head1.color = mainBodyColor;
  head1.matrix = neck1_POS;
  head1.matrix.rotate(g_headX, 1, 0, 0);
  head1.matrix.rotate(-g_headY, 0, 1, 0);
  head1.matrix.rotate(g_headZ, 0, 0, 1);
  head1.matrix.rotate(-90, 1, 0, 0);
  head1.matrix.translate(-30/100, 15/100, -35/100);
  head1.matrix.translate(0/100, dev_headYTranslation/100, 0/100);
  head1.matrix.scale(dev_headxScale/100, dev_headyScale/100, dev_headzScale/100); // Developer scale for animation 
  var head1a_POS = createNewAnchor(head1.matrix); // Give to mouth piece
  var head1b_POS = createNewAnchor(head1.matrix); // Give to mouth piece
  var head1c_POS = createNewAnchor(head1.matrix); // Give to extra head part 2
  var head1d_POS = createNewAnchor(head1.matrix); // Give to extra head part 3
  var head1e_POS = createNewAnchor(head1.matrix); // Give to extra head part 4
  var head1f_POS = createNewAnchor(head1.matrix); // Give to extra head part 5
  var head1g_POS = createNewAnchor(head1.matrix); // Give to extra head part 6
  var head1h_POS = createNewAnchor(head1.matrix); // Give to extra head part 7

  var head1i_POS = createNewAnchor(head1.matrix); // Give to left Eye pt
  var head1j_POS = createNewAnchor(head1.matrix); // Give to Right Eye pt

  head1.matrix.scale(60/100, 45/100, 60/100);
  head1.render();

  // Mouth
  var headMouth = new Cube();
  headMouth.color = mainBodyColor;
  headMouth.matrix = head1a_POS;
  headMouth.matrix.translate(-5/100, 0/100, 40/100);
  headMouth.matrix.rotate(g_mouthX, 1, 0, 0);
  var headMouth1_POS = createNewAnchor(headMouth.matrix); // Give to hinge details for the mouth
  var headMouth2_POS = createNewAnchor(headMouth.matrix); // Give to hinge details for the mouth

  headMouth.matrix.scale(70/100, 20/100, 45/100);
  headMouth.matrix.translate(0/100, -100/100, -100/100);
  headMouth.render();

  var headMouthHinge1 = new Cylinder();
  headMouthHinge1.color = [mainBodyColor[0]-30/225, mainBodyColor[1]-30/225, mainBodyColor[2]-30/225, 1];
  headMouthHinge1.segments = 6;
  headMouthHinge1.matrix = headMouth1_POS;
  headMouthHinge1.matrix.translate(-1/100, 0/100, 0/100);
  headMouthHinge1.matrix.rotate(90, 0, 1, 0);
  headMouthHinge1.matrix.scale(4, 4, 6/100);
  headMouthHinge1.render();

  var headMouthHinge2 = new Cylinder();
  headMouthHinge2.color = [mainBodyColor[0]-30/225, mainBodyColor[1]-30/225, mainBodyColor[2]-30/225, 1];
  headMouthHinge2.segments = 6;
  headMouthHinge2.matrix = headMouth2_POS;
  headMouthHinge2.matrix.translate(65/100, 0/100, 0/100);
  headMouthHinge2.matrix.rotate(90, 0, 1, 0);
  headMouthHinge2.matrix.scale(4, 4, 6/100);
  headMouthHinge2.render();

  // Antenna
  var headAntenna = new Cylinder();
  headAntenna.color = hingeColor;
  headAntenna.matrix = head1b_POS;
  headAntenna.matrix.translate(30/100, 50/100, 30/100);
  headAntenna.matrix.rotate(-90, 1, 0, 0);
  headAntenna.matrix.scale(1, 1, 0.25);
  headAntenna.render();

  var head2 = new Cube();
  head2.color = mainBodyColor;
  head2.matrix = head1c_POS;
  head2.matrix.translate(0/100, -20/100, 40/100);
  head2.matrix.scale(60/100, 20/100, 20/100);
  head2.render();

  var head3 = new Cube();
  head3.color = mainBodyColor;
  head3.matrix = head1d_POS;
  head3.matrix.translate(2.5/100, 45/100, 2.5/100);
  head3.matrix.scale(55/100, 5/100, 55/100);
  head3.render();

  var head4 = new Cube();
  head4.color = hingeColor;
  head4.matrix = head1e_POS;
  head4.matrix.translate(20/100, 46/100, 10/100);
  head4.matrix.scale(20/100, 5/100, 40/100);
  head4.render();

  // Red Light
  var head5 = new Cube();
  head5.color = [1, 0, 0, 1];
  head5.matrix = head1f_POS;
  head5.matrix.translate(26/100, 70/100, 26/100);
  head5.matrix.scale(8/100, 8/100, 8/100);
  head5.render();

  var head6 = new Cube();
  head6.color = [0, 0, 0, 1];
  head6.matrix = head1g_POS;
  head6.matrix.translate(2.5/100, -0.02/100, 2.5/100);
  head6.matrix.scale(55/100, 5/100, 55/100);
  head6.render();

  var head7 = new Cube();
  head7.color = [0, 0, 0, 1];
  head7.matrix = head1h_POS;
  head7.matrix.translate(0/100, 0.02/100, 40/100);
  head7.matrix.rotate(g_mouthX, 1, 0, 0);
  head7.matrix.scale(60/100, 20/100, 35/100);
  head7.matrix.translate(0/100, -100/100, -100/100);
  head7.render();

  // LEFT EYE ==========================================
  var leftEye1 = new Cube();
  leftEye1.color = eyeOutlineColor;
  leftEye1.matrix = head1i_POS;
  leftEye1.matrix.translate(35/100, 10/100, -1/100);
  var l_eye1_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
  var l_eye2a_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
  var l_eye2b_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
  var l_eye2c_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
  var l_eye3_POS = createNewAnchor(leftEye1.matrix); // Give to Upper Eyelid
  var l_eye4_POS = createNewAnchor(leftEye1.matrix); // Give to Lower Eyelid

  leftEye1.matrix.scale(25/100, (15/100+g_leftEyeHeight/100), 1/100);
  leftEye1.render();

  var leftEye2 = new Cube();
  leftEye2.color = eyeOutlineColor;
  leftEye2.matrix = l_eye1_POS;
  leftEye2.matrix.translate(5/100, -5/100, 0/100);
  leftEye2.matrix.scale(15/100, (25/100+g_leftEyeHeight/100), 1/100);
  leftEye2.render();

  var leftEye3 = new Cube();
  leftEye3.color = eyeColor1;
  leftEye3.matrix = l_eye2a_POS;
  leftEye3.matrix.translate(5/100, 0/100, -0.02/100);
  leftEye3.matrix.scale(15/100, (15/100+g_leftEyeHeight/100), 15/100);
  leftEye3.render();

  var leftEye4 = new Cube();
  leftEye4.color = eyeColor2;
  leftEye4.matrix = l_eye2b_POS;
  leftEye4.matrix.translate(5/100, 5/100, -0.05/100);
  leftEye4.matrix.scale(10/100, (10/100+g_leftEyeHeight/100), 15/100);
  leftEye4.render();

  var leftEye5 = new Cube();
  leftEye5.color = eyeColor2;
  leftEye5.matrix = l_eye2c_POS;
  leftEye5.matrix.translate(15/100, 0/100, -0.05/100);
  leftEye5.matrix.scale(5/100, 5/100, 15/100);
  leftEye5.render();

  var leftUpperEyeLid = new Cube();
  leftUpperEyeLid.color = eyeLidColor;
  leftUpperEyeLid.matrix = l_eye3_POS;
  leftUpperEyeLid.matrix.translate(5/100, 15/100+g_leftEyeHeight/100, -1/100);
  leftUpperEyeLid.matrix.scale(15/100, -g_leftUpperEyelid/100, 1/100);
  leftUpperEyeLid.render();

  var leftLowerEyeLid = new Cube();
  leftLowerEyeLid.color = eyeLidColor;
  leftLowerEyeLid.matrix = l_eye4_POS;
  leftLowerEyeLid.matrix.translate(5/100, 0/100, -1/100);
  leftLowerEyeLid.matrix.scale(15/100, g_leftLowerEyelid/100, 1/100);
  leftLowerEyeLid.render();

  // RIGHT EYE =========================================
  var rightEye1 = new Cube();
  rightEye1.color = eyeOutlineColor;
  rightEye1.matrix = head1j_POS;
  rightEye1.matrix.translate(0/100, 10/100, -1/100);
  var r_eye1_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
  var r_eye2a_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
  var r_eye2b_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
  var r_eye2c_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
  var r_eye3_POS = createNewAnchor(rightEye1.matrix); // Give to Upper Eyelid
  var r_eye4_POS = createNewAnchor(rightEye1.matrix); // Give to Lower Eyelid

  rightEye1.matrix.scale(25/100, (15/100+g_rightEyeHeight/100), 1/100);
  rightEye1.render();

  var rightEye2 = new Cube();
  rightEye2.color = eyeOutlineColor;
  rightEye2.matrix = r_eye1_POS;
  rightEye2.matrix.translate(5/100, -5/100, 0/100);
  rightEye2.matrix.scale(15/100, (25/100+g_rightEyeHeight/100), 1/100);
  rightEye2.render();

  var rightEye3 = new Cube();
  rightEye3.color = eyeColor1;
  rightEye3.matrix = r_eye2a_POS;
  rightEye3.matrix.translate(5/100, 0/100, -0.02/100);
  rightEye3.matrix.scale(15/100, (15/100+g_rightEyeHeight/100), 15/100);
  rightEye3.render();

  var rightEye4 = new Cube();
  rightEye4.color = eyeColor2;
  rightEye4.matrix = r_eye2b_POS;
  rightEye4.matrix.translate(5/100, 5/100, -0.05/100);
  rightEye4.matrix.scale(10/100, (10/100+g_rightEyeHeight/100), 15/100);
  rightEye4.render();

  var rightEye5 = new Cube();
  rightEye5.color = eyeColor2;
  rightEye5.matrix = r_eye2c_POS;
  rightEye5.matrix.translate(15/100, 0/100, -0.05/100);
  rightEye5.matrix.scale(5/100, 5/100, 15/100);
  rightEye5.render();

  var rightUpperEyeLid = new Cube();
  rightUpperEyeLid.color = eyeLidColor;
  rightUpperEyeLid.matrix = r_eye3_POS;
  rightUpperEyeLid.matrix.translate(5/100, 15/100+g_rightEyeHeight/100, -1/100);
  rightUpperEyeLid.matrix.scale(15/100, -g_rightUpperEyelid/100, 1/100);
  rightUpperEyeLid.render();

  var rightLowerEyeLid = new Cube();
  rightLowerEyeLid.color = eyeLidColor;
  rightLowerEyeLid.matrix = r_eye4_POS;
  rightLowerEyeLid.matrix.translate(5/100, 0/100, -1/100);
  rightLowerEyeLid.matrix.scale(15/100, g_rightLowerEyelid/100, 1/100);
  rightLowerEyeLid.render();

  // LEFT ARM ==========================================

  // Left Upper Arm
  var leftUpperArm = new Cylinder();
  leftUpperArm.color = limbColor;
  leftUpperArm.matrix = MainBody2_POS;
  leftUpperArm.segments = 8;
  leftUpperArm.matrix.scale(0.8, 0.8, 0.8);
  leftUpperArm.matrix.translate(35/100, 10/100, 30/100);
  leftUpperArm.matrix.translate(dev_leftArmXTranslation/100, 0/100, 0/100);
  leftUpperArm.matrix.rotate(90, 0, 1, 0);
  leftUpperArm.matrix.rotate(g_upperLeftArmAngleX, 1, 0, 0);
  leftUpperArm.matrix.rotate(g_upperLeftArmAngleY, 0, 1, 0);
  leftUpperArm.matrix.rotate(g_upperLeftArmAngleZ, 0, 0, 1);
  var l_UpperArm1_POS = createNewAnchor(leftUpperArm.matrix); // Given to Lower Arm
  
  leftUpperArm.matrix.translate(0/100, 0/100, 10/100);
  var l_UpperArm2_POS = createNewAnchor(leftUpperArm.matrix); // Given to Cosmetic upper Hinge part
  
  leftUpperArm.matrix.scale(2.5, 2.5, 35/100);
  leftUpperArm.render();

  // Cosmetic to Upper arm
  var leftArmHinge = new Cylinder();
  leftArmHinge.color = mainBodyColor;
  leftArmHinge.segments = 8;
  leftArmHinge.matrix = l_UpperArm2_POS;
  leftArmHinge.matrix.translate(0/100, 10/100, -2/100);
  leftArmHinge.matrix.rotate(90, 1, 0, 0);
  leftArmHinge.matrix.scale(5, 5, 0.175);
  leftArmHinge.render();
  
  // Left Lower Arm
  var leftLowerArm = new Cylinder();
  leftLowerArm.color = limbColor;
  leftLowerArm.matrix = l_UpperArm1_POS;
  leftLowerArm.matrix.translate(0/100, 0/100, 45/100);
  leftLowerArm.matrix.rotate(g_lowerLeftArmAngleZ, 0, 1, 0);
  var l_lowerArm1_POS = createNewAnchor(leftLowerArm.matrix); // Given to Left hand
  var l_lowerArm2_POS = createNewAnchor(leftLowerArm.matrix); // Given to Cosmetic lower Hinge part

  leftLowerArm.matrix.scale(2.5, 2.5, 35/100);
  leftLowerArm.render();

  // Cosmetic to Lower Arm
  var leftArmMiddleHinge = new Cylinder();
  leftArmMiddleHinge.color = mainBodyColor;
  leftArmMiddleHinge.segments = 8;
  leftArmMiddleHinge.matrix = l_lowerArm2_POS;
  leftArmMiddleHinge.matrix.translate(0, 6.25/100, 0);
  leftArmMiddleHinge.matrix.rotate(90, 1, 0, 0);
  leftArmMiddleHinge.matrix.scale(4, 4, 0.125);
  leftArmMiddleHinge.render()

  // LEFT HAND =========================================
  var leftPalm = new Cube();
  leftPalm.color = mainBodyColor;
  leftPalm.matrix = l_lowerArm1_POS;
  leftPalm.matrix.translate(-2.5/100, 0/100, 30/100);
  leftPalm.matrix.rotate(g_LeftHandX , 1, 0, 0);
  leftPalm.matrix.rotate(dev_leftHandXRotation , 1, 0, 0);
  leftPalm.matrix.rotate(g_LeftHandY , 0, 1, 0);
  leftPalm.matrix.rotate(g_LeftHandZ , 0, 0, 1);
  var l_palm1_POS = createNewAnchor(leftPalm.matrix); // Given to Finger
  var l_palm2_POS = createNewAnchor(leftPalm.matrix); // Given to Finger
  var l_palm3_POS = createNewAnchor(leftPalm.matrix); // Given to Thumb

  leftPalm.matrix.translate(-20/100, -10/100, 0/100);
  leftPalm.matrix.scale(45/100, 20/100, 45/100);
  leftPalm.render();

  // Finger1
  var leftHandF1 = new Cube();
  leftHandF1.color = limbColor;
  leftHandF1.matrix = l_palm1_POS;
  leftHandF1.matrix.translate(-19/100, 1/100, 45/100);
  leftHandF1.matrix.rotate(g_leftIndex, 1, 0, 0);
  leftHandF1.matrix.translate(0/100, -10/100, 0/100);
  leftHandF1.matrix.scale(20/100, 18/100, 30/100);
  leftHandF1.render();

  // Finger2
  var leftHandF2 = new Cube();
  leftHandF2.color = limbColor;
  leftHandF2.matrix = l_palm2_POS;
  leftHandF2.matrix.translate(3/100, 1/100, 45/100);
  leftHandF2.matrix.rotate(g_leftMiddle, 1, 0, 0);
  leftHandF2.matrix.translate(0/100, -10/100, 0/100);
  leftHandF2.matrix.scale(20/100, 18/100, 30/100);
  leftHandF2.render();

  // Thumb
  var leftHandThumb = new Cube();
  leftHandThumb.color = limbColor;
  leftHandThumb.matrix = l_palm3_POS;
  leftHandThumb.matrix.translate(23/100, -4/100, 1/100);
  leftHandThumb.matrix.rotate(g_leftThumb, 0, 0, 1);
  leftHandThumb.matrix.rotate(dev_leftThumbRotation, 0, 0, 1);
  leftHandThumb.matrix.translate(0/100, -5/100, 0/100);
  leftHandThumb.matrix.scale(30/100, 18/100, 20/100);
  leftHandThumb.render();

  // RIGHT ARM =========================================

  // right Upper Arm
  var rightUpperArm = new Cylinder();
  rightUpperArm.color = limbColor;
  rightUpperArm.matrix = MainBody3_POS;
  rightUpperArm.segments = 8;
  rightUpperArm.matrix.scale(-0.8, 0.8, 0.8);
  rightUpperArm.matrix.translate(35/100, 10/100, 30/100);
  rightUpperArm.matrix.translate(dev_rightArmXTranslation/100, 0/100, 0/100);
  rightUpperArm.matrix.rotate(90, 0, 1, 0);
  rightUpperArm.matrix.rotate(g_upperRightArmAngleX, 1, 0, 0);
  rightUpperArm.matrix.rotate(g_upperRightArmAngleY, 0, 1, 0);
  rightUpperArm.matrix.rotate(g_upperRightArmAngleZ, 0, 0, 1);
  var r_UpperArm1_POS = createNewAnchor(rightUpperArm.matrix); // Given to Lower Arm
  
  rightUpperArm.matrix.translate(0/100, 0/100, 10/100);
  var r_UpperArm2_POS = createNewAnchor(rightUpperArm.matrix); // Given to Cosmetic upper Hinge part
  
  rightUpperArm.matrix.scale(2.5, 2.5, 35/100);

  rightUpperArm.render();

  // Cosmetic to Upper arm
  var rightArmHinge = new Cylinder();
  rightArmHinge.color = mainBodyColor;
  rightArmHinge.segments = 8;
  rightArmHinge.matrix = r_UpperArm2_POS;
  rightArmHinge.matrix.translate(0/100, 10/100, -2/100);
  rightArmHinge.matrix.rotate(90, 1, 0, 0);
  rightArmHinge.matrix.scale(5, 5, 0.175);

  rightArmHinge.render();
  
  // right Lower Arm
  var rightLowerArm = new Cylinder();
  rightLowerArm.color = limbColor;
  rightLowerArm.matrix = r_UpperArm1_POS;
  rightLowerArm.matrix.translate(0/100, 0/100, 45/100);
  rightLowerArm.matrix.rotate(g_lowerRightArmAngleZ, 0, 1, 0);
  var r_lowerArm1_POS = createNewAnchor(rightLowerArm.matrix); // Given to Right Hand
  var r_lowerArm2_POS = createNewAnchor(rightLowerArm.matrix); // Given to Cosmetic lower Hinge part

  rightLowerArm.matrix.scale(2.5, 2.5, 35/100);

  rightLowerArm.render();

  // Cosmetic to Lower Arm
  var rightArmMiddleHinge = new Cylinder();
  rightArmMiddleHinge.color = mainBodyColor;
  rightArmMiddleHinge.segments = 8;
  rightArmMiddleHinge.matrix = r_lowerArm2_POS;
  rightArmMiddleHinge.matrix.translate(0, 6.25/100, 0);
  rightArmMiddleHinge.matrix.rotate(90, 1, 0, 0);
  rightArmMiddleHinge.matrix.scale(4, 4, 0.125);
  rightArmMiddleHinge.render()

  // RIGHT HAND ========================================
  var rightPalm = new Cube();
  rightPalm.color = mainBodyColor;
  rightPalm.matrix = r_lowerArm1_POS;
  rightPalm.matrix.translate(-2.5/100, 0/100, 30/100);
  rightPalm.matrix.rotate(g_RightHandX , 1, 0, 0);
  rightPalm.matrix.rotate(dev_rightHandXRotation , 1, 0, 0);
  rightPalm.matrix.rotate(g_RightHandY , 0, 1, 0);
  rightPalm.matrix.rotate(g_RightHandZ , 0, 0, 1);
  var r_palm1_POS = createNewAnchor(rightPalm.matrix); // Given to Finger
  var r_palm2_POS = createNewAnchor(rightPalm.matrix); // Given to Finger
  var r_palm3_POS = createNewAnchor(rightPalm.matrix); // Given to Thumb

  rightPalm.matrix.translate(-20/100, -10/100, 0/100);
  rightPalm.matrix.scale(45/100, 20/100, 45/100);
  rightPalm.render();

  // Finger1
  var rightHandF1 = new Cube();
  rightHandF1.color = limbColor;
  rightHandF1.matrix = r_palm1_POS;
  rightHandF1.matrix.translate(-19/100, 1/100, 45/100);
  rightHandF1.matrix.rotate(g_rightIndex, 1, 0, 0);
  rightHandF1.matrix.translate(0/100, -10/100, 0/100);
  rightHandF1.matrix.scale(20/100, 18/100, 30/100);
  rightHandF1.render();

  // Finger2
  var rightHandF2 = new Cube();
  rightHandF2.color = limbColor;
  rightHandF2.matrix = r_palm2_POS;
  rightHandF2.matrix.translate(3/100, 1/100, 45/100);
  rightHandF2.matrix.rotate(g_rightMiddle, 1, 0, 0);
  rightHandF2.matrix.translate(0/100, -10/100, 0/100);
  rightHandF2.matrix.scale(20/100, 18/100, 30/100);
  rightHandF2.render();

  // Thumb
  var rightHandThumb = new Cube();
  rightHandThumb.color = limbColor;
  rightHandThumb.matrix = r_palm3_POS;
  rightHandThumb.matrix.translate(23/100, -4/100, 1/100);
  rightHandThumb.matrix.rotate(g_rightThumb, 0, 0, 1);
  rightHandThumb.matrix.rotate(dev_rightThumbRotation, 0, 0, 1);
  rightHandThumb.matrix.translate(0/100, -5/100, 0/100);
  rightHandThumb.matrix.scale(30/100, 18/100, 20/100);
  rightHandThumb.render();

  // LEFT LEG ==========================================

  // Left Upper Leg
  var leftUpperLeg = new Cylinder();
  leftUpperLeg.color = limbColor;
  leftUpperLeg.matrix = body3Pelvis1_POS;
  leftUpperLeg.segments = 8;
  leftUpperLeg.matrix.scale(0.9, 0.9, 0.9);
  leftUpperLeg.matrix.translate(45/100, 15/100, 22.5/100);
  leftUpperLeg.matrix.translate(0/100, dev_leftLegYTranslation/100, 0/100);
  leftUpperLeg.matrix.rotate(-90, 0, 1, 0);
  leftUpperLeg.matrix.rotate(90, 1, 0, 0);
  leftUpperLeg.matrix.rotate(g_upperLeftLegAngleX, 1, 0, 0);
  leftUpperLeg.matrix.rotate(g_upperLeftLegAngleY, 0, 1, 0);
  leftUpperLeg.matrix.rotate(g_upperLeftLegAngleZ, 0, 0, 1);
  var l_UpperLeg1_POS = createNewAnchor(leftUpperLeg.matrix); // Given to Lower Leg
  
  leftUpperLeg.matrix.translate(0/100, 0/100, 10/100);
  leftUpperLeg.matrix.scale(2.5, 2.5, 35/100);

  leftUpperLeg.render();
  
  // Left Lower Leg
  var leftLowerLeg = new Cylinder();
  leftLowerLeg.color = limbColor;
  leftLowerLeg.matrix = l_UpperLeg1_POS;
  leftLowerLeg.matrix.translate(0/100, 0/100, 45/100);
  leftLowerLeg.matrix.rotate(g_lowerLeftLegAngleY, 0, 1, 0);
  var l_lowerLeg1_POS = createNewAnchor(leftLowerLeg.matrix); // Given to Left Foot
  var l_lowerLeg2_POS = createNewAnchor(leftLowerLeg.matrix); // Given to Cosmetic lower Hinge part

  leftLowerLeg.matrix.scale(2.5, 2.5, 35/100);

  leftLowerLeg.render();

  // Cosmetic to Lower Leg
  var leftMiddleHinge = new Cylinder();
  leftMiddleHinge.color = mainBodyColor;
  leftMiddleHinge.segments = 8;
  leftMiddleHinge.matrix = l_lowerLeg2_POS;
  leftMiddleHinge.matrix.translate(0, 6.25/100, 0);
  leftMiddleHinge.matrix.rotate(90, 1, 0, 0);
  leftMiddleHinge.matrix.scale(5, 5, 0.125);
  leftMiddleHinge.render()
  
  // LEFT FOOT =========================================
  var leftFoot = new Cube();
  leftFoot.color = mainBodyColor;
  leftFoot.matrix = l_lowerLeg1_POS;
  leftFoot.matrix.translate(0/100, -15/100, 30/100);
  leftFoot.matrix.rotate(g_LeftFootY , 0, 1, 0);
  var l_Foot1_POS = createNewAnchor(leftFoot.matrix); // Given to cosmetic foot part

  leftFoot.matrix.translate(-40/100, 0/100, 0/100);
  leftFoot.matrix.scale(50/100, 30/100, 20/100);
  leftFoot.render();

  var leftFootDetail = new Cube();
  leftFootDetail.color = hingeColor;
  leftFootDetail.matrix = l_Foot1_POS;
  leftFootDetail.matrix.translate(-25/100, 5/100, -1/100);
  leftFootDetail.matrix.scale(32/100, 20/100, 10/100);
  leftFootDetail.render();

  // RIGHT LEG =========================================

  // Right Upper Leg
  var rightUpperLeg = new Cylinder();
  rightUpperLeg.color = limbColor;
  rightUpperLeg.matrix = body3Pelvis2_POS;
  rightUpperLeg.segments = 8;
  rightUpperLeg.matrix.scale(-0.9, 0.9, 0.9);
  rightUpperLeg.matrix.translate(-10/100, 15/100, 22.5/100);
  rightUpperLeg.matrix.translate(0/100, dev_rightLegYTranslation/100, 0/100);
  rightUpperLeg.matrix.rotate(-90, 0, 1, 0);
  rightUpperLeg.matrix.rotate(90, 1, 0, 0);
  rightUpperLeg.matrix.rotate(g_upperRightLegAngleX, 1, 0, 0);
  rightUpperLeg.matrix.rotate(g_upperRightLegAngleY, 0, 1, 0);
  rightUpperLeg.matrix.rotate(g_upperRightLegAngleZ, 0, 0, 1);
  var r_UpperLeg1_POS = createNewAnchor(rightUpperLeg.matrix); // Given to Lower Leg
  
  rightUpperLeg.matrix.translate(0/100, 0/100, 10/100);
  rightUpperLeg.matrix.scale(2.5, 2.5, 35/100);

  rightUpperLeg.render();
  
  // right Lower Leg
  var rightLowerLeg = new Cylinder();
  rightLowerLeg.color = limbColor;
  rightLowerLeg.matrix = r_UpperLeg1_POS;
  rightLowerLeg.matrix.translate(0/100, 0/100, 45/100);
  rightLowerLeg.matrix.rotate(g_lowerRightLegAngleY, 0, 1, 0);
  var r_lowerLeg1_POS = createNewAnchor(rightLowerLeg.matrix); // Given to Right Foot
  var r_lowerLeg2_POS = createNewAnchor(rightLowerLeg.matrix); // Given to Cosmetic lower Hinge part

  rightLowerLeg.matrix.scale(2.5, 2.5, 35/100);

  rightLowerLeg.render();

  // Cosmetic to Lower Leg
  var rightlegMiddleHinge = new Cylinder();
  rightlegMiddleHinge.color = mainBodyColor;
  rightlegMiddleHinge.segments = 8;
  rightlegMiddleHinge.matrix = r_lowerLeg2_POS;
  rightlegMiddleHinge.matrix.translate(0, 6.25/100, 0);
  rightlegMiddleHinge.matrix.rotate(90, 1, 0, 0);
  rightlegMiddleHinge.matrix.scale(5, 5, 0.125);
  rightlegMiddleHinge.render()

  // RIGHT FOOT ========================================
  var rightFoot = new Cube();
  rightFoot.color = mainBodyColor;
  rightFoot.matrix = r_lowerLeg1_POS;
  rightFoot.matrix.translate(0/100, -15/100, 30/100);
  rightFoot.matrix.rotate(g_RightFootY , 0, 1, 0);
  var r_Foot1_POS = createNewAnchor(rightFoot.matrix); // Given to cosmetic foot part

  rightFoot.matrix.translate(-40/100, 0/100, 0/100);
  rightFoot.matrix.scale(50/100, 30/100, 20/100);
  rightFoot.render();

  var rightFootDetail = new Cube();
  rightFootDetail.color = hingeColor;
  rightFootDetail.matrix = r_Foot1_POS;
  rightFootDetail.matrix.translate(-25/100, 5/100, -1/100);
  rightFootDetail.matrix.scale(32/100, 20/100, 10/100);
  rightFootDetail.render();

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

  // Update Animation angles
  updateAnimationAngles();

  // Draw Everything
  renderAllShapes();

  // tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Timing Variables
var blinkTimer = -1;
var blinkTime = true;
var blinkSpeed = 5;
var blinkFunction = -4*Math.cos(blinkSpeed*blinkTimer)+4;

var turnTimer = -333;
var turnPelvisTimer = -333;
var turnArmsTimer = -333;
var turnTime = true;
var mult = 1;
var changeLeftEye = true;

var defaultSpeed = 9;
var runSpeed = g_runSpeed;

var randMouthSpeed = 18+Math.floor(Math.random()*22);
var randMouthAngle = 4+Math.floor(Math.random()*8);
var armTimer = -333;
var armSpeed = 1.5;
var armTime = true;
var randEyeChange = 0;
var randArmChange = 0;
var isBlink = 0;
var headTimer = -333;
var headTime = true;
var randHeadChange = 0;
var headSpeed = 1;
var headNods = 0;


var shrinkTimer = -1;
var shrinkSpeed = 3;

var mouthTime = true;

function updateAnimationAngles() {
  // Idle Animation
  if (g_idleAnimation && !g_shrinkAnimation) {

    // Up/down sway
    g_positionY = 2*Math.cos(g_seconds)-2;
    document.getElementById("posY").value = g_positionY;

    // Head
    g_headX = (1.5*Math.cos(2*g_seconds));
    document.getElementById("headX").value = g_headX;

    g_pelvisX = (1.01*Math.cos(2*g_seconds));
    document.getElementById("pelvisX").value = g_pelvisX;

    // Left arm
    g_upperLeftArmAngleX = 2*Math.sin(2*g_seconds)+70;
    document.getElementById("leftBicepX").value = g_upperLeftArmAngleX;
    g_upperLeftArmAngleY = 2*Math.sin(2*g_seconds)-10;
    document.getElementById("leftBicepY").value = g_upperLeftArmAngleY;

    g_lowerLeftArmAngleZ = 2*Math.sin(2*g_seconds)+40;
    document.getElementById("leftForearmZ").value = g_lowerLeftArmAngleZ;

    g_leftIndex = 6*Math.cos(2*g_seconds)+40;
    document.getElementById("leftIndex").value = g_leftIndex
    g_leftMiddle = 6*Math.cos(2*g_seconds)+30;
    document.getElementById("leftMiddle").value = g_leftIndex
    g_leftThumb = 6*Math.cos(2*g_seconds)-40;
    document.getElementById("leftThumb").value = g_leftThumb

    // Right arm
    g_upperRightArmAngleX = Math.sin(2*g_seconds)+70;
    document.getElementById("rightBicepX").value = g_upperRightArmAngleX;
    g_upperRightArmAngleY = 4*Math.sin(2*g_seconds)-10;
    document.getElementById("rightBicepY").value = g_upperRightArmAngleY;

    g_lowerRightArmAngleZ = -2*Math.sin(2*g_seconds)+40;
    document.getElementById("rightForearmZ").value = g_lowerRightArmAngleZ;

    g_rightIndex = 6*Math.sin(2*g_seconds)+40;
    document.getElementById("rightIndex").value = g_rightIndex
    g_rightMiddle = 6*Math.sin(2*g_seconds)+30;
    document.getElementById("rightMiddle").value = g_rightIndex
    g_rightThumb = 6*Math.cos(2*g_seconds)-40;
    document.getElementById("rightThumb").value = g_rightThumb

    // Legs
    g_upperLeftLegAngleY = 10*Math.cos(g_seconds)-10;
    document.getElementById("leftThighY").value = g_upperLeftLegAngleY;
    g_lowerLeftLegAngleY = -20*Math.cos(g_seconds)+20;
    document.getElementById("leftShinY").value = g_lowerLeftLegAngleY;
    g_LeftFootY = 10*Math.cos(g_seconds)-10;
    document.getElementById("leftFootY").value = g_LeftFootY;
    g_upperRightLegAngleY = 10*Math.cos(g_seconds)-10;
    document.getElementById("rightThighY").value = g_upperRightLegAngleY;
    g_lowerRightLegAngleY = -20*Math.cos(g_seconds)+20;
    document.getElementById("rightShinY").value = g_lowerRightLegAngleY;
    g_RightFootY = 10*Math.cos(g_seconds)-10;
    document.getElementById("rightFootY").value = g_RightFootY;

    // Blinking
    blinkFunction = -4*Math.cos(blinkSpeed*blinkTimer)+4
    if (blinkTimer == -1 && Math.floor(g_seconds) % 5 != 0) {
      blinkTime = true;
    }
    if (Math.floor(g_seconds) % 5 == 0 && blinkTime) {
      blinkTimer = 0;
      blinkFunction = -4*Math.cos(blinkSpeed*blinkTimer)+4
      blinkTime = false;
    }
    if (blinkTimer > -1 && !blinkTime) {
      g_leftUpperEyelid = blinkFunction;
      document.getElementById("leftUpperEyeScale").value = g_leftUpperEyelid;
      g_rightUpperEyelid = blinkFunction;
      document.getElementById("rightUpperEyeScale").value = g_rightUpperEyelid;

      g_leftLowerEyelid = blinkFunction;
      document.getElementById("leftLowerEyeScale").value = g_leftLowerEyelid;
      g_rightLowerEyelid = blinkFunction;
      document.getElementById("rightLowerEyeScale").value = g_rightLowerEyelid;

      blinkTimer += 0.05;
      if (blinkTimer > (2*Math.PI)/blinkSpeed) {
        blinkTimer = -1;
      }
    }

    // Turning
    if (turnTimer == -333 && Math.floor(g_seconds) % 17 != 0) {
      turnTime = true;
    }
    if (Math.floor(g_seconds) % 17 == 0 && turnTime) {
      turnTimer = 0;
      turnPelvisTimer = 0;
      turnArmsTimer = 0;
      let rand1 = Math.floor(Math.random()*2);
      let rand2 = Math.floor(Math.random()*2);
      if (rand1 == 0) { mult = -1; } else { mult = 1; }
      if (rand2 == 0) { changeLeftEye = false; } else { changeLeftEye = true; }
      turnTime = false;
    }
    if (turnTimer != -333 && !turnTime) {
      g_pelvisX += mult*(22.5*Math.cos(2*turnPelvisTimer)-22.5);
      document.getElementById("pelvisX").value = g_pelvisX;
      
      g_headZ = mult*(45*Math.sin(turnTimer));
      document.getElementById("headZ").value = g_headZ;

      g_upperLeftArmAngleY += mult*(15*Math.cos(2*turnArmsTimer)-15);
      document.getElementById("leftBicepY").value = g_upperLeftArmAngleY;
      g_upperRightArmAngleY += mult*(-15*Math.cos(2*turnArmsTimer)+15);
      document.getElementById("rightBicepY").value = g_upperRightArmAngleY;

      if (changeLeftEye) {
        g_leftEyeHeight = -2.5*Math.cos(turnTimer)+2.5;
        document.getElementById("leftEyeHight").value = g_leftEyeHeight;
      }
      else {
        g_rightEyeHeight = -2.5*Math.cos(turnTimer)+2.5;
        document.getElementById("rightEyeHight").value = g_rightEyeHeight;
      }

      turnTimer += 0.05;
      if ((turnTimer > Math.PI/2 && turnTimer < Math.PI) || (turnTimer > (3*Math.PI)/2)) { /* Stop pelvis turning timer */} else { turnPelvisTimer += 0.05; }
      if (turnTimer > Math.PI) {/*Stop arm turning*/} else {turnArmsTimer += 0.05;}
      if (turnTimer > (2*Math.PI)) {
        turnTimer = -333;
        turnPelvisTimer = -333;
        turnArmsTimer = -333;
      }
    }
  }

  // Run Animtaion
  if (g_runAnimation && !g_shrinkAnimation) {
    runSpeed = g_runSpeed;

    // Bounce Position
    g_positionY = -5*Math.cos(2*runSpeed*(g_seconds))+5;
    document.getElementById("posY").value = g_positionY;

    // Head
    g_headZ = 8*Math.cos(runSpeed*g_seconds);
    document.getElementById("headZ").value = g_headZ;

    dev_headyScale = -4*Math.cos(2*runSpeed*g_seconds)+100;
    dev_headxScale = 4*Math.cos(2*runSpeed*g_seconds)+100;
    dev_headzScale = 4*Math.cos(2*runSpeed*g_seconds)+100;

    // Pelvis
    g_pelvisX = -10*Math.cos(runSpeed*g_seconds);
    document.getElementById("pelvisX").value = g_pelvisX;

    // Fists
    g_leftIndex = 120;
    document.getElementById("leftIndex").value = g_leftIndex;
    g_leftMiddle = 120;
    document.getElementById("leftMiddle").value = g_leftMiddle;
    g_leftThumb = -135;
    document.getElementById("leftThumb").value = g_leftThumb;

    g_rightIndex = 120;
    document.getElementById("rightIndex").value = g_rightIndex;
    g_rightMiddle = 120;
    document.getElementById("rightMiddle").value = g_rightMiddle;
    g_rightThumb = -135;
    document.getElementById("rightThumb").value = g_rightThumb;

    // Arms
    g_upperLeftArmAngleX = -15*Math.sin(runSpeed*g_seconds)+70;
    document.getElementById("leftBicepX").value = g_upperLeftArmAngleX
    g_upperLeftArmAngleY = -90*Math.sin(runSpeed*g_seconds);
    document.getElementById("leftBicepY").value = g_upperLeftArmAngleY
    g_lowerLeftArmAngleZ = -10*Math.sin(runSpeed*g_seconds)+50;
    document.getElementById("leftForearmZ").value = g_lowerLeftArmAngleZ;

    g_upperRightArmAngleX = 15*Math.sin(runSpeed*g_seconds)+70;
    document.getElementById("rightBicepX").value = g_upperRightArmAngleX
    g_upperRightArmAngleY = 90*Math.sin(runSpeed*g_seconds);
    document.getElementById("rightBicepY").value = g_upperRightArmAngleY
    g_lowerRightArmAngleZ = 10*Math.sin(runSpeed*g_seconds)+50;
    document.getElementById("rightForearmZ").value = g_lowerRightArmAngleZ;

    // Legs
    g_upperLeftLegAngleY = -60*Math.sin(runSpeed*g_seconds);
    document.getElementById("leftThighY").value = g_upperLeftLegAngleY;
    g_lowerLeftLegAngleY = 50*Math.sin(runSpeed*g_seconds)+50;
    document.getElementById("leftShinY").value = g_lowerLeftLegAngleY;
    g_LeftFootY = -55*Math.sin(runSpeed*g_seconds);
    document.getElementById("leftFootY").value = g_LeftFootY;

    g_upperRightLegAngleY = 60*Math.sin(runSpeed*g_seconds);
    document.getElementById("rightThighY").value = g_upperRightLegAngleY;
    g_lowerRightLegAngleY = -50*Math.sin(runSpeed*g_seconds)+50;
    document.getElementById("rightShinY").value = g_lowerRightLegAngleY;
    g_RightFootY = 55*Math.sin(runSpeed*g_seconds);
    document.getElementById("rightFootY").value = g_RightFootY;
  }
  else {
    g_runSpeed = defaultSpeed;
    document.getElementById("runSpeed").value = g_runSpeed;
  }

  // Babble Animation (Using Idle)
  if (g_talkAnimation && !g_shrinkAnimation) {
    // Up/down sway
    g_positionY = 2*Math.cos(g_seconds)-2;
    document.getElementById("posY").value = g_positionY;

    // Head
    g_headX = (1.5*Math.cos(2*g_seconds));
    document.getElementById("headX").value = g_headX;

    g_pelvisX = (1.01*Math.cos(2*g_seconds));
    document.getElementById("pelvisX").value = g_pelvisX;

    // Mouth
    g_mouthX = -randMouthAngle*Math.cos(randMouthSpeed*g_seconds)-randMouthAngle;
    document.getElementById("mouthX").value = g_mouthX;

    // Left arm
    g_upperLeftArmAngleX = 2*Math.sin(2*g_seconds)+70;
    document.getElementById("leftBicepX").value = g_upperLeftArmAngleX;
    g_upperLeftArmAngleY = 2*Math.sin(2*g_seconds)-10;
    document.getElementById("leftBicepY").value = g_upperLeftArmAngleY;

    g_lowerLeftArmAngleZ = 2*Math.sin(2*g_seconds)+40;
    document.getElementById("leftForearmZ").value = g_lowerLeftArmAngleZ;

    g_leftIndex = 6*Math.cos(2*g_seconds)+40;
    document.getElementById("leftIndex").value = g_leftIndex
    g_leftMiddle = 6*Math.cos(2*g_seconds)+30;
    document.getElementById("leftMiddle").value = g_leftIndex
    g_leftThumb = 6*Math.cos(2*g_seconds)-40;
    document.getElementById("leftThumb").value = g_leftThumb

    // Right arm
    g_upperRightArmAngleX = Math.sin(2*g_seconds)+70;
    document.getElementById("rightBicepX").value = g_upperRightArmAngleX;
    g_upperRightArmAngleY = 4*Math.sin(2*g_seconds)-10;
    document.getElementById("rightBicepY").value = g_upperRightArmAngleY;

    g_lowerRightArmAngleZ = -2*Math.sin(2*g_seconds)+40;
    document.getElementById("rightForearmZ").value = g_lowerRightArmAngleZ;

    g_rightIndex = 6*Math.sin(2*g_seconds)+40;
    document.getElementById("rightIndex").value = g_rightIndex
    g_rightMiddle = 6*Math.sin(2*g_seconds)+30;
    document.getElementById("rightMiddle").value = g_rightIndex
    g_rightThumb = 6*Math.cos(2*g_seconds)-40;
    document.getElementById("rightThumb").value = g_rightThumb

    // Legs
    g_upperLeftLegAngleY = 10*Math.cos(g_seconds)-10;
    document.getElementById("leftThighY").value = g_upperLeftLegAngleY;
    g_lowerLeftLegAngleY = -20*Math.cos(g_seconds)+20;
    document.getElementById("leftShinY").value = g_lowerLeftLegAngleY;
    g_LeftFootY = 10*Math.cos(g_seconds)-10;
    document.getElementById("leftFootY").value = g_LeftFootY;
    g_upperRightLegAngleY = 10*Math.cos(g_seconds)-10;
    document.getElementById("rightThighY").value = g_upperRightLegAngleY;
    g_lowerRightLegAngleY = -20*Math.cos(g_seconds)+20;
    document.getElementById("rightShinY").value = g_lowerRightLegAngleY;
    g_RightFootY = 10*Math.cos(g_seconds)-10;
    document.getElementById("rightFootY").value = g_RightFootY;

    // Eye Change
    if (blinkTimer == -1 && Math.floor(g_seconds) % 5 != 0) {
      blinkTime = true;
    }
    if (Math.floor(g_seconds) % 5 == 0 && blinkTime) {
      blinkTimer = 0;
      isBlink = Math.floor(Math.random()*4);
      blinkTime = false;
    }
    if (blinkTimer > -1 && !blinkTime) {
      if (isBlink != 3) {
        blinkSpeed = 5;
        g_leftUpperEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
        document.getElementById("leftUpperEyeScale").value = g_leftUpperEyelid;
        g_rightUpperEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
        document.getElementById("rightUpperEyeScale").value = g_rightUpperEyelid;

        g_leftLowerEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
        document.getElementById("leftLowerEyeScale").value = g_leftLowerEyelid;
        g_rightLowerEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
        document.getElementById("rightLowerEyeScale").value = g_rightLowerEyelid;
      }
      else {
        blinkSpeed = 1;
        g_leftLowerEyelid = -2*Math.cos(blinkSpeed*blinkTimer)+2;
        document.getElementById("leftLowerEyeScale").value = g_leftLowerEyelid;
        g_rightLowerEyelid = -2*Math.cos(blinkSpeed*blinkTimer)+2;
        document.getElementById("rightLowerEyeScale").value = g_rightLowerEyelid;
      }

      blinkTimer += 0.05;
      if (blinkTimer > (2*Math.PI)/blinkSpeed) {
        blinkTimer = -1;
      }
    }

    // Head Tilt
    if (headTimer == -1 && Math.floor(g_seconds) % 7 != 0) {
      headTime = true;
    }
    if (Math.floor(g_seconds) % 7 == 0 && headTime) {
      headTimer = 0;
      randHeadChange = Math.floor(Math.random()*3);
      headNods = 1+Math.floor(Math.random()*5);
      headTime = false;
    }
    if (headTimer > -1 && !headTime) {
      if (randHeadChange == 0) {
        headSpeed = 1;
        g_headX += 15*Math.sin(headNods*headSpeed*headTimer);
        document.getElementById("headX").value = g_headX;
      }
      else if (randHeadChange == 1) {
        headSpeed = 1;
        g_headY = -10*Math.cos(headSpeed*headTimer)+10;
        document.getElementById("headY").value = g_headY;
      }
      else {
        headSpeed = 1;
        g_headY = 10*Math.cos(headSpeed*headTimer)-10;
        document.getElementById("headY").value = g_headY;
      }
      

      headTimer += 0.05;
      if (headTimer > (2*Math.PI)/headSpeed) {
        headTimer = -1;
      }
    }

    // Arm Timing
    if (armTimer == -333 && Math.floor(g_seconds) % 10 != 0) {
      armTime = true;
    }
    if (Math.floor(g_seconds) % 10 == 0 && armTime) {
      armTimer = 0;
      armTime = false;
      armSpeed = 1.5;
      randEyeChange = Math.floor(Math.random()*3);
      randArmChange = Math.floor(Math.random()*4);
    }
    if (armTimer != -333 && !armTime) {
      if (randArmChange == 0) {
        g_upperLeftArmAngleX += 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("leftBicepX").value = g_upperLeftArmAngleX;
        g_upperLeftArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("leftBicepY").value = g_upperLeftArmAngleY;
        g_upperLeftArmAngleZ = -45*Math.cos(armSpeed*armTimer)+45;
        document.getElementById("leftBicepZ").value = g_upperLeftArmAngleZ;
        
        g_lowerLeftArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("leftForearmZ").value = g_lowerLeftArmAngleZ;
        
        g_LeftHandY = -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("leftHandY").value = g_LeftHandY;
        g_leftIndex += -50*Math.cos(armSpeed*armTimer)+50;
        document.getElementById("leftIndex").value = g_leftIndex;
        g_leftMiddle += 10*Math.cos(armSpeed*armTimer)-10;
        document.getElementById("leftMiddle").value = g_leftMiddle;
        g_leftThumb += 60*Math.cos(armSpeed*armTimer)-60;
        document.getElementById("leftThumb").value = g_leftThumb;
      }
      else if (randArmChange == 1) {
        g_upperRightArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightBicepY").value = g_upperRightArmAngleY;
        
        g_lowerRightArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightForearmZ").value = g_lowerRightArmAngleZ;
        
        g_RightHandX = -40*Math.cos(armSpeed*armTimer)+40;
        document.getElementById("rightHandX").value = g_RightHandX;
        g_rightIndex += 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("rightIndex").value = g_rightIndex;
        g_rightMiddle += 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("rightMiddle").value = g_rightMiddle;
        g_rightThumb += -15*Math.cos(armSpeed*armTimer)+15;
        document.getElementById("rightThumb").value = g_rightThumb;
      } 
      else if (randArmChange == 2) {
        g_upperRightArmAngleX += 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("rightBicepX").value = g_upperRightArmAngleX;
        g_upperRightArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightBicepY").value = g_upperRightArmAngleY;
        g_upperRightArmAngleZ = -45*Math.cos(armSpeed*armTimer)+45;
        document.getElementById("rightBicepZ").value = g_upperRightArmAngleZ;
        
        g_lowerRightArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightForearmZ").value = g_lowerRightArmAngleZ;
        
        g_RightHandY = -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightHandY").value = g_RightHandY;
        g_rightIndex += -50*Math.cos(armSpeed*armTimer)+50;
        document.getElementById("rightIndex").value = g_rightIndex;
        g_rightMiddle += 10*Math.cos(armSpeed*armTimer)-10;
        document.getElementById("rightMiddle").value = g_rightMiddle;
        g_rightThumb += 60*Math.cos(armSpeed*armTimer)-60;
        document.getElementById("rightThumb").value = g_rightThumb;
      } 
      else {
        g_upperRightArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightBicepY").value = g_upperRightArmAngleY;
        g_upperRightArmAngleZ = -25*Math.cos(armSpeed*armTimer)+25;
        document.getElementById("rightBicepZ").value = g_upperRightArmAngleZ;
        
        g_lowerRightArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
        document.getElementById("rightForearmZ").value = g_lowerRightArmAngleZ;
        
        g_RightHandY = 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("rightHandY").value = g_RightHandY;
        g_RightHandZ = -35*Math.cos(armSpeed*armTimer)+35;
        document.getElementById("rightHandZ").value = g_RightHandZ;

        g_rightIndex += 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("rightIndex").value = g_rightIndex;
        g_rightMiddle += 20*Math.cos(armSpeed*armTimer)-20;
        document.getElementById("rightMiddle").value = g_rightMiddle;
        g_rightThumb += -15*Math.cos(armSpeed*armTimer)+15;
        document.getElementById("rightThumb").value = g_rightThumb;
      }

      // Eye Change by arm timing
      if (randEyeChange == 0) {
        armSpeed = 1;
        g_leftEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
        document.getElementById("leftEyeHight").value = g_leftEyeHeight;
      }
      else if (randEyeChange == 1) {
        armSpeed = 1;
        g_rightEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
        document.getElementById("rightEyeHight").value = g_rightEyeHeight;
      }
      else {
        armSpeed = 1;
        g_leftEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
        document.getElementById("leftEyeHight").value = g_leftEyeHeight;
        g_rightEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
        document.getElementById("rightEyeHight").value = g_rightEyeHeight;
      }

      armTimer += 0.05;
      if (armTimer > (2*Math.PI)/armSpeed) {
        armTimer = -333;
      }
    }

    // Change Speed of mouth
    if (Math.floor(g_seconds) % 2 != 0) {
      mouthTime = true;
    }
    if (Math.floor(g_seconds) % 2 == 0 && mouthTime) {
      mouthTime = false;
      randMouthSpeed = 25+Math.floor(Math.random()*4);
      randMouthAngle = 4+Math.floor(Math.random()*8);
    }

  }

  // Creative Animation (Shift+Click)
  if (g_shrinkAnimation) {
    lockArmLegAngles();
    if (shrinkTimer < 11) {

      // Shrink
      dev_headYTranslation -= shrinkSpeed;
      
      dev_leftArmXTranslation -= 20;
      dev_leftHandXRotation += 22;
      dev_leftThumbRotation -= 45;

      dev_rightArmXTranslation -= 20;
      dev_rightHandXRotation += 22;
      dev_rightThumbRotation -= 45;

      dev_leftLegYTranslation += 15;
      dev_rightLegYTranslation += 15;
      
      shrinkTimer += shrinkSpeed;
      // console.log("shrink: "+shrinkTimer+"\n"+dev_headYTranslation);
      if (shrinkTimer > 10) {
        shrinkTimer = 11;
      }
    }

    // Blinking
    blinkFunction = -4*Math.cos(blinkSpeed*blinkTimer)+4
    if (blinkTimer == -1 && Math.floor(g_seconds) % 5 != 0) {
      blinkTime = true;
    }
    if (Math.floor(g_seconds) % 5 == 0 && blinkTime) {
      blinkTimer = 0;
      blinkFunction = -4*Math.cos(blinkSpeed*blinkTimer)+4
      blinkTime = false;
    }
    if (blinkTimer > -1 && !blinkTime) {
      g_leftUpperEyelid = blinkFunction;
      document.getElementById("leftUpperEyeScale").value = g_leftUpperEyelid;
      g_rightUpperEyelid = blinkFunction;
      document.getElementById("rightUpperEyeScale").value = g_rightUpperEyelid;

      g_leftLowerEyelid = blinkFunction;
      document.getElementById("leftLowerEyeScale").value = g_leftLowerEyelid;
      g_rightLowerEyelid = blinkFunction;
      document.getElementById("rightLowerEyeScale").value = g_rightLowerEyelid;

      blinkTimer += 0.05;
      if (blinkTimer > (2*Math.PI)/blinkSpeed) {
        blinkTimer = -1;
      }
    }

    // Head Movement
    if (turnTimer == -333 && Math.floor(g_seconds) % 17 != 0) {
      turnTime = true;
    }
    if (Math.floor(g_seconds) % 17 == 0 && turnTime) {
      turnTimer = 0;
      turnTime = false;
    }
    if (turnTimer != -333 && !turnTime) {
      if (turnTimer < 0.5) { 
        dev_headYTranslation += 0.7; 
      } 
      else if (turnTimer > 0.5 && turnTimer < (2*Math.PI)+0.5) {
        g_headZ = -35*Math.sin(turnTimer-0.5);
        document.getElementById("headZ").value = g_headZ;
      }
      else { 
        dev_headYTranslation -= 0.7;
      }

      turnTimer += 0.05;
      if (turnTimer > (2*Math.PI)+1) {
        turnTimer = -333;
      }
    }
  }
  else if (!g_shrinkAnimation) {
    if (shrinkTimer > -1) {
      // UnShrink
      dev_headYTranslation += shrinkSpeed;
      
      dev_leftArmXTranslation += 20;
      dev_leftHandXRotation -= 22;
      dev_leftThumbRotation += 45;
      
      dev_rightArmXTranslation += 20;
      dev_rightHandXRotation -= 22;
      dev_rightThumbRotation += 45;

      dev_leftLegYTranslation -= 15;
      dev_rightLegYTranslation -= 15;
      
      shrinkTimer -= shrinkSpeed;
      // console.log("un shrink: "+shrinkTimer+"\n"+dev_headYTranslation);
      if (shrinkTimer < 0) {
        shrinkTimer = -1;
        blinkTimer = -1;
        turnTimer = -333;
        g_headZ = 0;
        document.getElementById("headZ").value = g_headZ;
        dev_headYTranslation = 0;
      }
    }
  }
}
