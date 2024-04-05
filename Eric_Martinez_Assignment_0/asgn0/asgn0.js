
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('squareCanvas');
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';            // Set canvas color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

// Draw a vector given a vector and a color
function drawVector(v, color) {
  var canvas = document.getElementById('squareCanvas');
  var ctx = canvas.getContext('2d');
  let canvasCenterX = canvas.width/2
  let canvasCenterY = canvas.height/2

  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(canvasCenterX, canvasCenterY)
  ctx.lineTo(canvasCenterX + 20*v.elements[0], canvasCenterY - 20*v.elements[1]);
  ctx.stroke();
}

// Draw a vector lines the user inputs
function handleDrawEvent() {
  var canvas = document.getElementById('squareCanvas');
  var ctx = canvas.getContext('2d');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;
  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");
}

// Draw resultant vector of user input operation
function handleDrawOperationEvent() {
  // Draw the two vectors
  var canvas = document.getElementById('squareCanvas');
  var ctx = canvas.getContext('2d');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;
  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  // Handle operation
  let vR1 = new Vector3();
  let vR2 = new Vector3();
  let op = document.getElementById('op-select').value;
  let scalar = document.getElementById('scalar').value;

  switch (op) {
    case "add":
      vR1 = v1.add(v2);
      break;
    case "subtract":
      vR1 = v1.sub(v2);
      break;
    case "multiply":
      vR1 = v1.mul(scalar)
      vR2 = v2.mul(scalar)
      break;
    case "divide":
      vR1 = v1.div(scalar)
      vR2 = v2.div(scalar)
      break;
    case "magnitude":
      let m1 = v1.magnitude();
      let m2 = v1.magnitude();
      console.log("Magnitude v1: "+m1);
      console.log("Magnitude v2: "+m2);
      break;
    case "normalize":
      vR1 = v1.normalize();
      vR2 = v2.normalize();
      break;
    case "angleBetween":
      let angle = angleBetween(v1, v2);
      console.log("Angle: "+angle);
      break;
    case "area":
      let area = areaTriangle(v1, v2);
      console.log("Area: "+area);
      break;
  }

  drawVector(vR1, "green");
  drawVector(vR2, "green");
}

// Find angle between the two vectors
function angleBetween(v1, v2) {
  let dotProduct = Vector3.dot(v1, v2);
  let magProduct = v1.magnitude()*v2.magnitude();
  // Fixes rounding bug. some angles are seen as NaN without this round
  // let magProduct = Math.round(v1.magnitude()*v2.magnitude());

  // Definition: dot = magnitudeProduct * cos(angle)
  let angleRad = Math.acos((dotProduct)/magProduct);

  // Convert from rad to deg
  let angleDeg = (angleRad * 180.0) / Math.PI;
  return angleDeg;
}

// Find the area of the triangle between the two vectors
function areaTriangle(v1, v2) {
  let crossProdV = Vector3.cross(v1, v2);
  let areaParallelogram = crossProdV.magnitude();
  return areaParallelogram/2;
}