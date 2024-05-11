// Class for a single Triangle on the canvas
class Triangle{
    constructor() {
      this.type = 'triangle';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
  
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the size of a point to u_Size variable
      gl.uniform1f(u_Size, size);
      // Draw
      var d = this.size/200.0 // Delta
      drawTriangle( [xy[0]-(d/2),xy[1]-(d/2), xy[0]+d-(d/2),xy[1]-(d/2), xy[0],xy[1]+d-(d/2)] );
    }

    customRender(x1,y1, x2,y2, x3,y3) {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;
  
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the size of a point to u_Size variable
      gl.uniform1f(u_Size, size);
      // Draw based on position and given 3 vertices
      drawTriangle( [xy[0]+x1,xy[1]+y1, xy[0]+x2,xy[1]+y2, xy[0]+x3,xy[1]+y3] );
    }
  }

function drawTriangle(vertices) {
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices, vertexBuffer) {
  var n = 3; // The number of vertices

  // Create a buffer object
  // var vertexBuffer = gl.createBuffer();
  // if (!vertexBuffer) {
  //   console.log('Failed to create the buffer object');
  //   return -1;
  // }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv, vertexBuffer) {
  var n = 3; // The number of vertices

  // === Create a buffer object for positions ===
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // === Create a buffer object for UV ===
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer uv object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);

  // === Draw Triangle ===
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vBuffer = null;
function newDrawTriangle3DUV(allVertices) {
  // Initialize buffer if needed
  if (g_vBuffer == null) {
    initializeTriangle3DUV(allVertices.BYTES_PER_ELEMENT);
  }

  var n = allVertices.length / 8; // The number of vertices
  
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, allVertices, gl.DYNAMIC_DRAW);

  // === Draw Triangle ===
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initializeTriangle3DUV(FSIZE) {
  // === Create a buffer object for each vertex ===

  // Create a vertex buffer object
  g_vBuffer = gl.createBuffer();
  if (g_vBuffer === null) {
    g_vBuffer = gl.createBuffer();
    if (!g_vBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vBuffer);

  // === Position attribute ===
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*8, 0);
  gl.enableVertexAttribArray(a_Position);

  // === UV attribute ===
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE*8, FSIZE*3);
  gl.enableVertexAttribArray(a_UV);

  // === Color attribute ===
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*8, FSIZE*5);
  gl.enableVertexAttribArray(a_Color);
}