// Class for a single Circle on the canvas
class Cube{
    constructor() {
      this.type = 'cube';
      //this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();

      this.buffer = null;
    }
  
    render() {
      // var xy = this.position;
      var rgba = this.color;
      // var size = this.size;

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
      drawTriangle3D( [0,1,0, 1,1,1, 1,1,0] , this.buffer);
      drawTriangle3D( [0,1,0, 1,1,1, 0,1,1] , this.buffer);

      // Bright Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
      // Front of Cube
      drawTriangle3D( [0,0,0, 1,1,0, 1,0,0] , this.buffer);
      drawTriangle3D( [0,0,0, 1,1,0, 0,1,0] , this.buffer);
      
      // Mid Bright Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
      // Left of Cube
      drawTriangle3D( [0,0,0, 0,1,1, 0,0,1] , this.buffer);
      drawTriangle3D( [0,0,0, 0,1,1, 0,1,0] , this.buffer);
      
      // Mid Dark Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
      // Right of Cube
      drawTriangle3D( [1,0,0, 1,1,1, 1,0,1] , this.buffer);
      drawTriangle3D( [1,0,0, 1,1,1, 1,1,0] , this.buffer);

      // Dark Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
      // Back of Cube
      drawTriangle3D( [0,0,1, 1,1,1, 1,0,1] , this.buffer);
      drawTriangle3D( [0,0,1, 1,1,1, 0,1,1] , this.buffer);

      // Darkest Face ==========================================
      gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
      // Bottom of Cube
      drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] , this.buffer);
      drawTriangle3D( [0,0,0, 1,0,1, 0,0,1] , this.buffer);

    }
}