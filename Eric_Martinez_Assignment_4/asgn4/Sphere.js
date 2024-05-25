// Class for a single Circle on the canvas
class Sphere {
    constructor() {
      this.type = 'Sphere';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1, 1, 1];
      this.matrix = new Matrix4();
      this.textureNum = -2;
      
      // x,y,z u,v, r,g,b, normalX,normalY,normalZ
      //this.sphereVertices = new Float32Array([]);
    }

    renderFast() {

        // Pass which number to use to u_FragColor variable
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to a u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI / 10;
        var dd = Math.PI / 10;

        // Create Sphere
        for (var t = 0; t < Math.PI; t += d) {
            for (var r = 0; r < (2*Math.PI); r += d) {
                var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
                var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
                var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
                var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

                var uv1 = [t/Math.PI, r/(2*Math.PI)];
                var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

                var v = [];
                var color1 = [1, 0.5, 0];
                var color2 = [0, 0, 1];
                v = v.concat(p1); v = v.concat(uv1); v = v.concat(color1); v = v.concat(p1);
                v = v.concat(p2); v = v.concat(uv2); v = v.concat(color1); v = v.concat(p2);
                v = v.concat(p4); v = v.concat(uv4); v = v.concat(color1); v = v.concat(p4);
                newDrawTriangle3DUVNormal(new Float32Array(v));

                var v = [];
                var color = [1, 1, 1];
                v = v.concat(p1); v = v.concat(uv1); v = v.concat(color2); v = v.concat(p1);
                v = v.concat(p4); v = v.concat(uv4); v = v.concat(color2); v = v.concat(p4);
                v = v.concat(p3); v = v.concat(uv3); v = v.concat(color2); v = v.concat(p3);
                newDrawTriangle3DUVNormal(new Float32Array(v));
            }
        }



        // reset stats after render
        // this.position = [0.0, 0.0, 0.0];
        // this.color = [1.0, 1.0, 1.0, 1.0];
        // this.matrix = new Matrix4();
        // this.textureNum = -2;
    }
}