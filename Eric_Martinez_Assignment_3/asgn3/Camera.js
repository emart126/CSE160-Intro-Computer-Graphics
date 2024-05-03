class Camera {
    constructor(){
        this.eye = new Vector3(0,0,3);
        this.at = new Vector3(0,0,-100);
        this.up = new Vector3(0,1,0);
    }

    forward() {}
    back() {}
    left() {}
    right() {}
}