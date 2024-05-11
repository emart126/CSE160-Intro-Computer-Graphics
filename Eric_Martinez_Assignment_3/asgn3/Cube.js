// Class for a single Circle on the canvas
class Cube{
    constructor(defualtColor) {
      this.type = 'cube';
      this.position = [0.0, 0.0, 0.0];
      this.color = defualtColor;
      this.matrix = new Matrix4();
      this.textureNum = -2;
      
      // x,y,z u,v, r,g,b
      this.cubeVertices = new Float32Array([
        // Top of Cube
        0,1,0, 1,0, this.color[0], this.color[1], this.color[2],
        1,1,1, 0,1, this.color[0], this.color[1], this.color[2],
        1,1,0, 0,0, this.color[0], this.color[1], this.color[2],

        0,1,0, 1,0, this.color[0], this.color[1], this.color[2],
        1,1,1, 0,1, this.color[0], this.color[1], this.color[2],
        0,1,1, 1,1, this.color[0], this.color[1], this.color[2],

        // Front of Cube
        0,0,0, 1,0, this.color[0]*0.95, this.color[1]*0.95, this.color[2]*0.95,
        1,1,0, 0,1, this.color[0]*0.95, this.color[1]*0.95, this.color[2]*0.95,
        1,0,0, 0,0, this.color[0]*0.95, this.color[1]*0.95, this.color[2]*0.95,

        0,0,0, 1,0, this.color[0]*0.95, this.color[1]*0.95, this.color[2]*0.95,
        1,1,0, 0,1, this.color[0]*0.95, this.color[1]*0.95, this.color[2]*0.95,
        0,1,0, 1,1, this.color[0]*0.95, this.color[1]*0.95, this.color[2]*0.95,

        // Left of Cube
        0,0,1, 1,0, this.color[0]*0.90, this.color[1]*0.90, this.color[2]*0.90,
        0,1,0, 0,1, this.color[0]*0.90, this.color[1]*0.90, this.color[2]*0.90,
        0,0,0, 0,0, this.color[0]*0.90, this.color[1]*0.90, this.color[2]*0.90,

        0,0,1, 1,0, this.color[0]*0.90, this.color[1]*0.90, this.color[2]*0.90,
        0,1,0, 0,1, this.color[0]*0.90, this.color[1]*0.90, this.color[2]*0.90,
        0,1,1, 1,1, this.color[0]*0.90, this.color[1]*0.90, this.color[2]*0.90,

        // Right of Cube
        1,0,0, 1,0, this.color[0]*0.85, this.color[1]*0.85, this.color[2]*0.85,
        1,1,1, 0,1, this.color[0]*0.85, this.color[1]*0.85, this.color[2]*0.85,
        1,0,1, 0,0, this.color[0]*0.85, this.color[1]*0.85, this.color[2]*0.85,

        1,0,0, 1,0, this.color[0]*0.85, this.color[1]*0.85, this.color[2]*0.85,
        1,1,1, 0,1, this.color[0]*0.85, this.color[1]*0.85, this.color[2]*0.85,
        1,1,0, 1,1, this.color[0]*0.85, this.color[1]*0.85, this.color[2]*0.85,

        // Back of Cube
        1,0,1, 1,0, this.color[0]*0.80, this.color[1]*0.80, this.color[2]*0.80,
        0,1,1, 0,1, this.color[0]*0.80, this.color[1]*0.80, this.color[2]*0.80,
        0,0,1, 0,0, this.color[0]*0.80, this.color[1]*0.80, this.color[2]*0.80,

        1,0,1, 1,0, this.color[0]*0.80, this.color[1]*0.80, this.color[2]*0.80,
        0,1,1, 0,1, this.color[0]*0.80, this.color[1]*0.80, this.color[2]*0.80,
        1,1,1, 1,1, this.color[0]*0.80, this.color[1]*0.80, this.color[2]*0.80,

        // Bottom of Cube
        0,0,0, 1,0, this.color[0]*0.75, this.color[1]*0.75, this.color[2]*0.75,
        1,0,1, 0,1, this.color[0]*0.75, this.color[1]*0.75, this.color[2]*0.75,
        1,0,0, 0,0, this.color[0]*0.75, this.color[1]*0.75, this.color[2]*0.75,

        0,0,0, 1,0, this.color[0]*0.75, this.color[1]*0.75, this.color[2]*0.75,
        1,0,1, 0,1, this.color[0]*0.75, this.color[1]*0.75, this.color[2]*0.75,
        0,0,1, 1,1, this.color[0]*0.75, this.color[1]*0.75, this.color[2]*0.75
      ]);
    }
  
    render() {
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;

      // Pass which number to use to u_FragColor variable
      gl.uniform1i(u_whichTexture, this.textureNum);
      
      // Pass the color of a point to u_FragColor variable
      // Brightest Face
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to a u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      
      // Create a buffer object
      if (this.buffer === null) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
          console.log('Failed to create the buffer object');
          return -1;
        }
      }

      // Draw Full Cube 

      // Brightest Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Top of Cube
      drawTriangle3DUV( [0,1,0, 1,1,1, 1,1,0] , [1,0, 0,1, 0,0], this.buffer);
      drawTriangle3DUV( [0,1,0, 1,1,1, 0,1,1] , [1,0, 0,1, 1,1],  this.buffer);

      // Bright Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
      // Front of Cube
      drawTriangle3DUV( [0,0,0, 1,1,0, 1,0,0] , [1,0, 0,1, 0,0], this.buffer);
      drawTriangle3DUV( [0,0,0, 1,1,0, 0,1,0] , [1,0, 0,1, 1,1], this.buffer);
      
      // Mid Bright Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      // Left of Cube
      drawTriangle3DUV( [0,0,1, 0,1,0, 0,0,0] , [1,0, 0,1, 0,0], this.buffer);
      drawTriangle3DUV( [0,0,1, 0,1,0, 0,1,1] , [1,0, 0,1, 1,1], this.buffer);
      
      // Mid Dark Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
      // Right of Cube
      drawTriangle3DUV( [1,0,0, 1,1,1, 1,0,1] , [1,0, 0,1, 0,0],  this.buffer);
      drawTriangle3DUV( [1,0,0, 1,1,1, 1,1,0] , [1,0, 0,1, 1,1], this.buffer);

      // Dark Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
      // Back of Cube
      drawTriangle3DUV( [1,0,1, 0,1,1, 0,0,1] , [1,0, 0,1, 0,0], this.buffer);
      drawTriangle3DUV( [1,0,1, 0,1,1, 1,1,1] , [1,0, 0,1, 1,1], this.buffer);

      // Darkest Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
      // Bottom of Cube
      drawTriangle3DUV( [0,0,0, 1,0,1, 1,0,0] , [1,0, 0,1, 0,0], this.buffer);
      drawTriangle3DUV( [0,0,0, 1,0,1, 0,0,1] , [1,0, 0,1, 1,1], this.buffer);

    }

    renderFast() {

      // Pass which number to use to u_FragColor variable
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the matrix to a u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // Draw Full Cube 
      // var allVertices = [];

      // Brightest Face ==========================================
      //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Top of Cube
      // allVertices = allVertices.concat([0,1,0, 1,0, 
      //                                   1,1,1, 0,1,
      //                                   1,1,0, 0,0]);
      // allVertices = allVertices.concat([0,1,0, 1,0,
      //                                   1,1,1, 0,1,
      //                                   0,1,1, 1,1]);

      // Bright Face ==========================================
      //gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
      // Front of Cube
      // allVertices = allVertices.concat([0,0,0, 1,0, 
      //                                   1,1,0, 0,1,
      //                                   1,0,0, 0,0]);
      // allVertices = allVertices.concat([0,0,0, 1,0,
      //                                   1,1,0, 0,1,
      //                                   0,1,0, 1,1]);
      
      // Mid Bright Face ==========================================
      //gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      // Left of Cube
      // allVertices = allVertices.concat([0,0,1, 1,0,
      //                                   0,1,0, 0,1,
      //                                   0,0,0, 0,0]);
      // allVertices = allVertices.concat([0,0,1, 1,0,
      //                                   0,1,0, 0,1,
      //                                   0,1,1, 1,1]);
      
      // Mid Dark Face ==========================================
      //gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
      // Right of Cube
      // allVertices = allVertices.concat([1,0,0, 1,0,
      //                                   1,1,1, 0,1,
      //                                   1,0,1, 0,0]);
      // allVertices = allVertices.concat([1,0,0, 1,0,
      //                                   1,1,1, 0,1,
      //                                   1,1,0, 1,1]);

      // Dark Face ==========================================
      //gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
      // Back of Cube
      // allVertices = allVertices.concat([1,0,1, 1,0,
      //                                   0,1,1, 0,1,
      //                                   0,0,1, 0,0]);
      // allVertices = allVertices.concat([1,0,1, 1,0,
      //                                   0,1,1, 0,1,
      //                                   1,1,1, 1,1]);

      // Darkest Face ==========================================
      //gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
      // Bottom of Cube
      // allVertices = allVertices.concat([0,0,0, 1,0,
      //                                   1,0,1, 0,1,
      //                                   1,0,0, 0,0]);
      // allVertices = allVertices.concat([0,0,0, 1,0,
      //                                   1,0,1, 0,1,
      //                                   0,0,1, 1,1]);

      // console.log(allVertices);
      newDrawTriangle3DUV(this.cubeVertices);
      
      // reset stats after render
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.textureNum = -2;
    }
}