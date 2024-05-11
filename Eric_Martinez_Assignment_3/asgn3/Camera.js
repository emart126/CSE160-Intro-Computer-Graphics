class Camera {
    constructor(){
        this.eye = new Vector3([0,1.25,3]);
        this.at = new Vector3([0,1.25,0]);
        this.up = new Vector3([0,1,0]);
    }

    forward() {
        var cpy_eye = new Vector3(this.eye.elements);
        var cpy_at = new Vector3(this.at.elements);
        
        var distance = cpy_at.sub(cpy_eye);
        distance = distance.normalize();
        this.at.add(distance);
        this.eye.add(distance);
    }

    back() {
        var cpy_eye = new Vector3(this.eye.elements);
        var cpy_at = new Vector3(this.at.elements);

        var distance = cpy_eye.sub(cpy_at);
        distance = distance.normalize();
        this.at.add(distance);
        this.eye.add(distance);
    }
    
    left() {
        var cpy_eye = new Vector3(this.eye.elements);
        var cpy_at = new Vector3(this.at.elements);
        var cpy_up = new Vector3(this.up.elements);

        var distance = cpy_at.sub(cpy_eye);
        distance = distance.normalize();
        var left = Vector3.cross(distance, cpy_up);
        left = left.normalize();
        this.at.add(left);
        this.eye.add(left);

    }
    
    right() {
        var cpy_eye = new Vector3(this.eye.elements);
        var cpy_at = new Vector3(this.at.elements);
        var cpy_up = new Vector3(this.up.elements);
        
        var distance = cpy_at.sub(cpy_eye);
        distance = distance.normalize();
        var right = Vector3.cross(distance, cpy_up);
        right = right.normalize();
        right.mul(-1);
        this.at.add(right);
        this.eye.add(right);
    }

    goUp() {
        this.at.set(new Vector3([this.at.elements[0], this.at.elements[1]+0.5, this.at.elements[2]]));
        this.eye.set(new Vector3([this.eye.elements[0], this.eye.elements[1]+0.5, this.eye.elements[2]]));
    }

    goDown() {
        this.at.set(new Vector3([this.at.elements[0], this.at.elements[1]-0.5, this.at.elements[2]]));
        this.eye.set(new Vector3([this.eye.elements[0], this.eye.elements[1]-0.5, this.eye.elements[2]]));
    }

    turnLeft() {
        var cpy_eye = new Vector3(this.eye.elements);
        var cpy_at = new Vector3(this.at.elements);
        
        var atPoint = cpy_at.sub(cpy_eye);
        var radius = atPoint.magnitudeXZ();
        var theta = Math.atan2(atPoint.elements[2], atPoint.elements[0]);
        if (isNaN(theta)) {
            theta = 0;
        }
        theta -= (5 * (Math.PI/180));

        var newX = radius * Math.cos(theta);
        var newZ = radius * Math.sin(theta);
        var newDirection = new Vector3([newX, atPoint.elements[1], newZ]);
        this.at.set(cpy_eye.add(newDirection));
    }

    turnRight() {
        var cpy_eye = new Vector3(this.eye.elements);
        var cpy_at = new Vector3(this.at.elements);
        
        var atPoint = cpy_at.sub(cpy_eye);
        var radius = atPoint.magnitudeXZ();
        var theta = Math.atan2(atPoint.elements[2], atPoint.elements[0]);
        if (isNaN(theta)) {
            theta = 0;
        }
        theta += (5 * (Math.PI/180));

        var newX = radius * Math.cos(theta);
        var newZ = radius * Math.sin(theta);
        var newDirection = new Vector3([newX, atPoint.elements[1], newZ]);
        this.at.set(cpy_eye.add(newDirection));
    }

    turnUp() {
        this.at.elements[1] += 0.5;
    }

    turnDown() {
        this.at.elements[1] -= 0.5;
    }
}