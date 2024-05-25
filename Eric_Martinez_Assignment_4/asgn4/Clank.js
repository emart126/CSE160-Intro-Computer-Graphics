// Globals
let g_idleAnimation = false;
let g_runAnimation = false;
let g_runSpeed = 9;
let g_talkAnimation = true;
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

// Creates copy of matrix to give to new limb or extra part,
// i.e. creates a new position anchor onto 'matrix'
function createNewAnchor(matrix) {
    var newAnchor = new Matrix4(matrix);
    return newAnchor;
}

class Clank {
    constructor() {
        this.g_positionX = 0;
        this.g_positionY = 0;
        this.g_positionZ = 0;

        this.g_rotationX = 0;
        this.g_rotationY = 0;
        this.g_rotationZ = 0;
        
        this.textureNum = -2;
        this.animation = 0;
    }

    renderClank() {
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
        var body1 = new Cube(mainBodyColor); 
        var body2 = new Cube(mainBodyColor);
        var body3 = new Cube(limbColor);
        var body4 = new Cube(secondayBodyColor);
        var body5 = new Cube(secondayBodyColor);
        var body6 = new Cylinder(secondayBodyColor, 3);
        var body7 = new Cylinder(secondayBodyColor, 3);
        var body8 = new Cylinder(secondayBodyColor, 3);
        var body9 = new Cylinder(hingeColor, 6);
        var body10 = new Cylinder(limbColor, 8);
        var body11 = new Cylinder(limbColor, 8);
        var neck = new Cylinder(limbColor, 8);
        //body1.color;
        body1.textureNum = this.textureNum;
        body2.textureNum = this.textureNum;
        body3.textureNum = this.textureNum;
        body4.textureNum = this.textureNum;
        body5.textureNum = this.textureNum;
        body6.textureNum = this.textureNum;
        body7.textureNum = this.textureNum;
        body8.textureNum = this.textureNum;
        body9.textureNum = this.textureNum;
        body10.textureNum = this.textureNum;
        body11.textureNum = this.textureNum;


        body1.matrix.translate(this.g_positionX, this.g_positionY, this.g_positionZ); // Position relative to origin

        // Rotation relative to origin
        body1.matrix.rotate(this.g_rotationX, 1, 0, 0);
        body1.matrix.rotate(this.g_rotationY, 0, 1, 0);
        body1.matrix.rotate(this.g_rotationZ, 0, 0, 1);

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
        body1.normalMatrix.setInverseOf(body1.matrix).transpose();
        body1.renderFast();

        //body2.color;
        body2.matrix = MainBody1b_POS;
        body2.matrix.translate(-25/100, -50/100, 5/100);
        body2.matrix.scale(50/100, 60/100, 35/100);
        body2.normalMatrix.setInverseOf(body2.matrix).transpose();
        body2.renderFast();

        // Pelvis
        //body3.color;
        body3.matrix = MainBody1a_POS;
        body3.matrix.translate(-25/100, -55/100, -20/100);
        var body3Pelvis1_POS = createNewAnchor(body3.matrix); // Given to Left Leg
        var body3Pelvis2_POS = createNewAnchor(body3.matrix); // Given to Right Leg

        body3.matrix.scale(50/100, 5/100, 35/100);
        body3.normalMatrix.setInverseOf(body3.matrix).transpose();
        body3.renderFast();

        //body4.color;
        body4.matrix = MainBody1d_POS;
        body4.matrix.translate(-26/100, -30/100, 7.5/100);
        body4.matrix.scale(52/100, 30/100, 30/100);
        body4.normalMatrix.setInverseOf(body4.matrix).transpose();
        body4.renderFast();

        //body5.color;
        body5.matrix = MainBody1f_POS;
        body5.matrix.translate(-12.5/100, -40/100, -1/100);
        var frontPlate1_POS = createNewAnchor(body5.matrix); // Give to front piece detail
        var frontPlate2_POS = createNewAnchor(body5.matrix); // Give to front piece detail
        var frontPlate3_POS = createNewAnchor(body5.matrix); // Give to front piece detail

        body5.matrix.scale(25/100, 30/100, 5/100);
        body5.normalMatrix.setInverseOf(body5.matrix).transpose();
        body5.renderFast();

        //body6.segments = 3;
        //body6.color;
        body6.matrix = frontPlate1_POS;
        body6.matrix.rotate(90, 0, 1, 0);
        body6.matrix.rotate(90, 0, 0, 1);
        body6.matrix.scale(3, 3, 25/100);
        body6.renderFast();

        //body7.segments = 3;
        //body7.color;
        body7.matrix = frontPlate2_POS;
        body7.matrix.translate(0/100, 11/100, 0/100);
        body7.matrix.rotate(90, 0, 1, 0);
        body7.matrix.rotate(90, 0, 0, 1);
        body7.matrix.scale(3, 3, 25/100);
        body7.renderFast();

        //body8.segments = 3;
        //body8.color;
        body8.matrix = frontPlate3_POS;
        body8.matrix.translate(0/100, 22/100, 0/100);
        body8.matrix.rotate(90, 0, 1, 0);
        body8.matrix.rotate(90, 0, 0, 1);
        body8.matrix.scale(3, 3, 25/100);
        body8.renderFast();

        //body9.segments = 6;
        //body9.color;
        body9.matrix = MainBody1g_POS;
        body9.matrix.translate(0/100, -15/100, 40/100);
        body9.matrix.rotate(90, 0, 0, 1);
        body9.matrix.scale(4, 4, 10/100);
        body9.renderFast();

        //body10.segments = 8;
        //body10.color;
        body10.matrix = MainBody1h_POS;
        body10.matrix.translate(19/100, -10/100, 23.5/100);
        body10.matrix.rotate(90, 0, 1, 0);
        body10.matrix.rotate(-45, 1, 0, 0);
        body10.matrix.scale(1.5, 1.5, 20/100);
        body10.renderFast();

        //body11.segments = 8;
        //body11.color;
        body11.matrix = MainBody1i_POS;
        body11.matrix.translate(-33/100, 4/100, 23.5/100);
        body11.matrix.rotate(90, 0, 1, 0);
        body11.matrix.rotate(45, 1, 0, 0);
        body11.matrix.scale(1.5, 1.5, 20/100);
        body11.renderFast();

        // Neck
        //neck.color;
        //neck.segments = 8;
        neck.matrix = MainBody1c_POS;
        neck.matrix.rotate(90, 1, 0, 0);
        neck.matrix.translate(0/100, 25/100, -25/100);
        var neck1_POS = createNewAnchor(neck.matrix); // Give to Head1

        neck.matrix.scale(2.5, 2.5, 0.2);
        neck.renderFast();

        // HEAD ==============================================
        var head1 = new Cube(mainBodyColor);
        head1.textureNum = this.textureNum;
        //head1.color;
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
        head1.normalMatrix.setInverseOf(head1.matrix).transpose();
        head1.renderFast();

        // Mouth
        var headMouth = new Cube(mainBodyColor);
        headMouth.textureNum = this.textureNum;
        headMouth.matrix = head1a_POS;
        headMouth.matrix.translate(-5/100, 0/100, 40/100);
        headMouth.matrix.rotate(g_mouthX, 1, 0, 0);
        var headMouth1_POS = createNewAnchor(headMouth.matrix); // Give to hinge details for the mouth
        var headMouth2_POS = createNewAnchor(headMouth.matrix); // Give to hinge details for the mouth

        headMouth.matrix.scale(70/100, 20/100, 45/100);
        headMouth.matrix.translate(0/100, -100/100, -100/100);
        headMouth.normalMatrix.setInverseOf(headMouth.matrix).transpose();
        headMouth.renderFast();

        var headMouthHinge1 = new Cylinder([mainBodyColor[0]-30/225, mainBodyColor[1]-30/225, mainBodyColor[2]-30/225, 1], 6);
        headMouthHinge1.textureNum = this.textureNum;
        headMouthHinge1.segments = 6;
        headMouthHinge1.matrix = headMouth1_POS;
        headMouthHinge1.matrix.translate(-1/100, 0/100, 0/100);
        headMouthHinge1.matrix.rotate(90, 0, 1, 0);
        headMouthHinge1.matrix.scale(4, 4, 6/100);
        headMouthHinge1.renderFast();

        var headMouthHinge2 = new Cylinder([mainBodyColor[0]-30/225, mainBodyColor[1]-30/225, mainBodyColor[2]-30/225, 1], 6);
        headMouthHinge2.textureNum = this.textureNum;
        //headMouthHinge2.segments = 6;
        headMouthHinge2.matrix = headMouth2_POS;
        headMouthHinge2.matrix.translate(65/100, 0/100, 0/100);
        headMouthHinge2.matrix.rotate(90, 0, 1, 0);
        headMouthHinge2.matrix.scale(4, 4, 6/100);
        headMouthHinge2.renderFast();

        // Antenna
        var headAntenna = new Cylinder(hingeColor, 8);
        headAntenna.textureNum = this.textureNum;
        headAntenna.matrix = head1b_POS;
        headAntenna.matrix.translate(30/100, 50/100, 30/100);
        headAntenna.matrix.rotate(-90, 1, 0, 0);
        headAntenna.matrix.scale(1, 1, 0.25);
        headAntenna.renderFast();

        var head2 = new Cube(mainBodyColor);
        head2.textureNum = this.textureNum;
        head2.matrix = head1c_POS;
        head2.matrix.translate(0/100, -20/100, 40/100);
        head2.matrix.scale(60/100, 20/100, 20/100);
        head2.normalMatrix.setInverseOf(head2.matrix).transpose();
        head2.renderFast();

        var head3 = new Cube(mainBodyColor);
        head3.textureNum = this.textureNum;
        head3.matrix = head1d_POS;
        head3.matrix.translate(2.5/100, 45/100, 2.5/100);
        head3.matrix.scale(55/100, 5/100, 55/100);
        head3.normalMatrix.setInverseOf(head3.matrix).transpose();
        head3.renderFast();

        var head4 = new Cube(hingeColor);
        head4.textureNum = this.textureNum;
        head4.matrix = head1e_POS;
        head4.matrix.translate(20/100, 46/100, 10/100);
        head4.matrix.scale(20/100, 5/100, 40/100);
        head4.normalMatrix.setInverseOf(head4.matrix).transpose();
        head4.renderFast();

        // Red Light
        var head5 = new Cube([1, 0, 0, 1]);
        head5.textureNum = this.textureNum;
        head5.matrix = head1f_POS;
        head5.matrix.translate(26/100, 70/100, 26/100);
        head5.matrix.scale(8/100, 8/100, 8/100);
        head5.normalMatrix.setInverseOf(head5.matrix).transpose();
        head5.renderFast();

        var head6 = new Cube([0, 0, 0, 1]);
        head6.textureNum = this.textureNum;
        head6.matrix = head1g_POS;
        head6.matrix.translate(2.5/100, -0.02/100, 2.5/100);
        head6.matrix.scale(55/100, 5/100, 55/100);
        head6.normalMatrix.setInverseOf(head6.matrix).transpose();
        head6.renderFast();

        var head7 = new Cube([0, 0, 0, 1]);
        head7.textureNum = this.textureNum;
        head7.matrix = head1h_POS;
        head7.matrix.translate(0/100, 0.02/100, 40/100);
        head7.matrix.rotate(g_mouthX, 1, 0, 0);
        head7.matrix.scale(60/100, 20/100, 35/100);
        head7.matrix.translate(0/100, -100/100, -100/100);
        head7.normalMatrix.setInverseOf(head7.matrix).transpose();
        head7.renderFast();

        // LEFT EYE ==========================================
        var leftEye1 = new Cube(eyeOutlineColor);
        leftEye1.textureNum = this.textureNum;
        leftEye1.matrix = head1i_POS;
        leftEye1.matrix.translate(35/100, 10/100, -1/100);
        var l_eye1_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
        var l_eye2a_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
        var l_eye2b_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
        var l_eye2c_POS = createNewAnchor(leftEye1.matrix); // Give to other eye parts
        var l_eye3_POS = createNewAnchor(leftEye1.matrix); // Give to Upper Eyelid
        var l_eye4_POS = createNewAnchor(leftEye1.matrix); // Give to Lower Eyelid

        leftEye1.matrix.scale(25/100, (15/100+g_leftEyeHeight/100), 1/100);
        leftEye1.normalMatrix.setInverseOf(leftEye1.matrix).transpose();
        leftEye1.renderFast();

        var leftEye2 = new Cube(eyeOutlineColor);
        leftEye2.textureNum = this.textureNum;
        leftEye2.matrix = l_eye1_POS;
        leftEye2.matrix.translate(5/100, -5/100, 0/100);
        leftEye2.matrix.scale(15/100, (25/100+g_leftEyeHeight/100), 1/100);
        leftEye2.normalMatrix.setInverseOf(leftEye2.matrix).transpose();
        leftEye2.renderFast();

        var leftEye3 = new Cube(eyeColor1);
        leftEye3.textureNum = this.textureNum;
        leftEye3.matrix = l_eye2a_POS;
        leftEye3.matrix.translate(5/100, 0/100, -0.02/100);
        leftEye3.matrix.scale(15/100, (15/100+g_leftEyeHeight/100), 15/100);
        leftEye3.normalMatrix.setInverseOf(leftEye3.matrix).transpose();
        leftEye3.renderFast();

        var leftEye4 = new Cube(eyeColor2);
        leftEye4.textureNum = this.textureNum;
        leftEye4.matrix = l_eye2b_POS;
        leftEye4.matrix.translate(5/100, 5/100, -0.05/100);
        leftEye4.matrix.scale(10/100, (10/100+g_leftEyeHeight/100), 15/100);
        leftEye4.normalMatrix.setInverseOf(leftEye4.matrix).transpose();
        leftEye4.renderFast();

        var leftEye5 = new Cube(eyeColor2);
        leftEye5.textureNum = this.textureNum;
        leftEye5.matrix = l_eye2c_POS;
        leftEye5.matrix.translate(15/100, 0/100, -0.05/100);
        leftEye5.matrix.scale(5/100, 5/100, 15/100);
        leftEye5.normalMatrix.setInverseOf(leftEye5.matrix).transpose();
        leftEye5.renderFast();

        var leftUpperEyeLid = new Cube(eyeLidColor);
        leftUpperEyeLid.textureNum = this.textureNum;
        leftUpperEyeLid.matrix = l_eye3_POS;
        leftUpperEyeLid.matrix.translate(5/100, 15/100+g_leftEyeHeight/100, -1/100);
        leftUpperEyeLid.matrix.scale(15/100, -g_leftUpperEyelid/100, 1/100);
        leftUpperEyeLid.normalMatrix.setInverseOf(leftUpperEyeLid.matrix).transpose();
        leftUpperEyeLid.renderFast();

        var leftLowerEyeLid = new Cube(eyeLidColor);
        leftLowerEyeLid.textureNum = this.textureNum;
        leftLowerEyeLid.matrix = l_eye4_POS;
        leftLowerEyeLid.matrix.translate(5/100, 0/100, -1/100);
        leftLowerEyeLid.matrix.scale(15/100, g_leftLowerEyelid/100, 1/100);
        leftLowerEyeLid.normalMatrix.setInverseOf(leftLowerEyeLid.matrix).transpose();
        leftLowerEyeLid.renderFast();

        // RIGHT EYE =========================================
        var rightEye1 = new Cube(eyeOutlineColor);
        rightEye1.textureNum = this.textureNum;
        rightEye1.matrix = head1j_POS;
        rightEye1.matrix.translate(0/100, 10/100, -1/100);
        var r_eye1_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
        var r_eye2a_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
        var r_eye2b_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
        var r_eye2c_POS = createNewAnchor(rightEye1.matrix); // Give to other eye parts
        var r_eye3_POS = createNewAnchor(rightEye1.matrix); // Give to Upper Eyelid
        var r_eye4_POS = createNewAnchor(rightEye1.matrix); // Give to Lower Eyelid

        rightEye1.matrix.scale(25/100, (15/100+g_rightEyeHeight/100), 1/100);
        rightEye1.normalMatrix.setInverseOf(rightEye1.matrix).transpose();
        rightEye1.renderFast();

        var rightEye2 = new Cube(eyeOutlineColor);
        rightEye2.textureNum = this.textureNum;
        rightEye2.matrix = r_eye1_POS;
        rightEye2.matrix.translate(5/100, -5/100, 0/100);
        rightEye2.matrix.scale(15/100, (25/100+g_rightEyeHeight/100), 1/100);
        rightEye2.normalMatrix.setInverseOf(rightEye2.matrix).transpose();
        rightEye2.renderFast();

        var rightEye3 = new Cube(eyeColor1);
        rightEye3.textureNum = this.textureNum;
        rightEye3.matrix = r_eye2a_POS;
        rightEye3.matrix.translate(5/100, 0/100, -0.02/100);
        rightEye3.matrix.scale(15/100, (15/100+g_rightEyeHeight/100), 15/100);
        rightEye3.normalMatrix.setInverseOf(rightEye3.matrix).transpose();
        rightEye3.renderFast();

        var rightEye4 = new Cube(eyeColor2);
        rightEye4.textureNum = this.textureNum;
        rightEye4.matrix = r_eye2b_POS;
        rightEye4.matrix.translate(5/100, 5/100, -0.05/100);
        rightEye4.matrix.scale(10/100, (10/100+g_rightEyeHeight/100), 15/100);
        rightEye4.normalMatrix.setInverseOf(rightEye4.matrix).transpose();
        rightEye4.renderFast();

        var rightEye5 = new Cube(eyeColor2);
        rightEye5.textureNum = this.textureNum;
        rightEye5.matrix = r_eye2c_POS;
        rightEye5.matrix.translate(15/100, 0/100, -0.05/100);
        rightEye5.matrix.scale(5/100, 5/100, 15/100);
        rightEye5.normalMatrix.setInverseOf(rightEye5.matrix).transpose();
        rightEye5.renderFast();

        var rightUpperEyeLid = new Cube(eyeLidColor);
        rightUpperEyeLid.textureNum = this.textureNum;
        rightUpperEyeLid.matrix = r_eye3_POS;
        rightUpperEyeLid.matrix.translate(5/100, 15/100+g_rightEyeHeight/100, -1/100);
        rightUpperEyeLid.matrix.scale(15/100, -g_rightUpperEyelid/100, 1/100);
        rightUpperEyeLid.normalMatrix.setInverseOf(rightUpperEyeLid.matrix).transpose();
        rightUpperEyeLid.renderFast();

        var rightLowerEyeLid = new Cube(eyeLidColor);
        rightLowerEyeLid.textureNum = this.textureNum;
        rightLowerEyeLid.matrix = r_eye4_POS;
        rightLowerEyeLid.matrix.translate(5/100, 0/100, -1/100);
        rightLowerEyeLid.matrix.scale(15/100, g_rightLowerEyelid/100, 1/100);
        rightLowerEyeLid.normalMatrix.setInverseOf(rightLowerEyeLid.matrix).transpose();
        rightLowerEyeLid.renderFast();

        // LEFT ARM ==========================================

        // Left Upper Arm
        var leftUpperArm = new Cylinder(limbColor, 8);
        leftUpperArm.textureNum = this.textureNum;
        leftUpperArm.matrix = MainBody2_POS;
        //leftUpperArm.segments = 8;
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
        leftUpperArm.renderFast();

        // Cosmetic to Upper arm
        var leftArmHinge = new Cylinder(mainBodyColor, 8);
        leftArmHinge.textureNum = this.textureNum;
        //leftArmHinge.segments = 8;
        leftArmHinge.matrix = l_UpperArm2_POS;
        leftArmHinge.matrix.translate(0/100, 10/100, -2/100);
        leftArmHinge.matrix.rotate(90, 1, 0, 0);
        leftArmHinge.matrix.scale(5, 5, 0.175);
        leftArmHinge.renderFast();

        // Left Lower Arm
        var leftLowerArm = new Cylinder(limbColor, 8);
        leftLowerArm.textureNum = this.textureNum;
        leftLowerArm.matrix = l_UpperArm1_POS;
        leftLowerArm.matrix.translate(0/100, 0/100, 45/100);
        leftLowerArm.matrix.rotate(g_lowerLeftArmAngleZ, 0, 1, 0);
        var l_lowerArm1_POS = createNewAnchor(leftLowerArm.matrix); // Given to Left hand
        var l_lowerArm2_POS = createNewAnchor(leftLowerArm.matrix); // Given to Cosmetic lower Hinge part

        leftLowerArm.matrix.scale(2.5, 2.5, 35/100);
        leftLowerArm.renderFast();

        // Cosmetic to Lower Arm
        var leftArmMiddleHinge = new Cylinder(mainBodyColor, 8);
        leftArmMiddleHinge.textureNum = this.textureNum;
        //leftArmMiddleHinge.segments = 8;
        leftArmMiddleHinge.matrix = l_lowerArm2_POS;
        leftArmMiddleHinge.matrix.translate(0, 6.25/100, 0);
        leftArmMiddleHinge.matrix.rotate(90, 1, 0, 0);
        leftArmMiddleHinge.matrix.scale(4, 4, 0.125);
        leftArmMiddleHinge.renderFast()

        // LEFT HAND =========================================
        var leftPalm = new Cube(mainBodyColor);
        leftPalm.textureNum = this.textureNum;
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
        leftPalm.normalMatrix.setInverseOf(leftPalm.matrix).transpose();
        leftPalm.renderFast();

        // Finger1
        var leftHandF1 = new Cube(limbColor);
        leftHandF1.textureNum = this.textureNum;
        leftHandF1.matrix = l_palm1_POS;
        leftHandF1.matrix.translate(-19/100, 1/100, 45/100);
        leftHandF1.matrix.rotate(g_leftIndex, 1, 0, 0);
        leftHandF1.matrix.translate(0/100, -10/100, 0/100);
        leftHandF1.matrix.scale(20/100, 18/100, 30/100);
        leftHandF1.normalMatrix.setInverseOf(leftHandF1.matrix).transpose();
        leftHandF1.renderFast();

        // Finger2
        var leftHandF2 = new Cube(limbColor);
        leftHandF2.textureNum = this.textureNum;
        leftHandF2.matrix = l_palm2_POS;
        leftHandF2.matrix.translate(3/100, 1/100, 45/100);
        leftHandF2.matrix.rotate(g_leftMiddle, 1, 0, 0);
        leftHandF2.matrix.translate(0/100, -10/100, 0/100);
        leftHandF2.matrix.scale(20/100, 18/100, 30/100);
        leftHandF2.normalMatrix.setInverseOf(leftHandF2.matrix).transpose();
        leftHandF2.renderFast();

        // Thumb
        var leftHandThumb = new Cube(limbColor);
        leftHandThumb.textureNum = this.textureNum;
        leftHandThumb.matrix = l_palm3_POS;
        leftHandThumb.matrix.translate(23/100, -4/100, 1/100);
        leftHandThumb.matrix.rotate(g_leftThumb, 0, 0, 1);
        leftHandThumb.matrix.rotate(dev_leftThumbRotation, 0, 0, 1);
        leftHandThumb.matrix.translate(0/100, -5/100, 0/100);
        leftHandThumb.matrix.scale(30/100, 18/100, 20/100);
        leftHandThumb.normalMatrix.setInverseOf(leftHandThumb.matrix).transpose();
        leftHandThumb.renderFast();

        // RIGHT ARM =========================================

        // right Upper Arm
        var rightUpperArm = new Cylinder(limbColor, 8);
        rightUpperArm.textureNum = this.textureNum;
        rightUpperArm.matrix = MainBody3_POS;
        //rightUpperArm.segments = 8;
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

        rightUpperArm.renderFast();

        // Cosmetic to Upper arm
        var rightArmHinge = new Cylinder(mainBodyColor, 8);
        rightArmHinge.textureNum = this.textureNum;
        //rightArmHinge.segments = 8;
        rightArmHinge.matrix = r_UpperArm2_POS;
        rightArmHinge.matrix.translate(0/100, 10/100, -2/100);
        rightArmHinge.matrix.rotate(90, 1, 0, 0);
        rightArmHinge.matrix.scale(5, 5, 0.175);

        rightArmHinge.renderFast();

        // right Lower Arm
        var rightLowerArm = new Cylinder(limbColor, 8);
        rightLowerArm.textureNum = this.textureNum;
        rightLowerArm.matrix = r_UpperArm1_POS;
        rightLowerArm.matrix.translate(0/100, 0/100, 45/100);
        rightLowerArm.matrix.rotate(g_lowerRightArmAngleZ, 0, 1, 0);
        var r_lowerArm1_POS = createNewAnchor(rightLowerArm.matrix); // Given to Right Hand
        var r_lowerArm2_POS = createNewAnchor(rightLowerArm.matrix); // Given to Cosmetic lower Hinge part

        rightLowerArm.matrix.scale(2.5, 2.5, 35/100);

        rightLowerArm.renderFast();

        // Cosmetic to Lower Arm
        var rightArmMiddleHinge = new Cylinder(mainBodyColor, 8);
        rightArmMiddleHinge.textureNum = this.textureNum;
        //rightArmMiddleHinge.segments = 8;
        rightArmMiddleHinge.matrix = r_lowerArm2_POS;
        rightArmMiddleHinge.matrix.translate(0, 6.25/100, 0);
        rightArmMiddleHinge.matrix.rotate(90, 1, 0, 0);
        rightArmMiddleHinge.matrix.scale(4, 4, 0.125);
        rightArmMiddleHinge.renderFast()

        // RIGHT HAND ========================================
        var rightPalm = new Cube(mainBodyColor);
        rightPalm.textureNum = this.textureNum;
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
        rightPalm.normalMatrix.setInverseOf(rightPalm.matrix).transpose();
        rightPalm.renderFast();

        // Finger1
        var rightHandF1 = new Cube(limbColor);
        rightHandF1.textureNum = this.textureNum;
        rightHandF1.matrix = r_palm1_POS;
        rightHandF1.matrix.translate(-19/100, 1/100, 45/100);
        rightHandF1.matrix.rotate(g_rightIndex, 1, 0, 0);
        rightHandF1.matrix.translate(0/100, -10/100, 0/100);
        rightHandF1.matrix.scale(20/100, 18/100, 30/100);
        rightHandF1.normalMatrix.setInverseOf(rightHandF1.matrix).transpose();
        rightHandF1.renderFast();

        // Finger2
        var rightHandF2 = new Cube(limbColor);
        rightHandF2.textureNum = this.textureNum;
        rightHandF2.matrix = r_palm2_POS;
        rightHandF2.matrix.translate(3/100, 1/100, 45/100);
        rightHandF2.matrix.rotate(g_rightMiddle, 1, 0, 0);
        rightHandF2.matrix.translate(0/100, -10/100, 0/100);
        rightHandF2.matrix.scale(20/100, 18/100, 30/100);
        rightHandF2.normalMatrix.setInverseOf(rightHandF2.matrix).transpose();
        rightHandF2.renderFast();

        // Thumb
        var rightHandThumb = new Cube(limbColor);
        rightHandThumb.textureNum = this.textureNum;
        rightHandThumb.matrix = r_palm3_POS;
        rightHandThumb.matrix.translate(23/100, -4/100, 1/100);
        rightHandThumb.matrix.rotate(g_rightThumb, 0, 0, 1);
        rightHandThumb.matrix.rotate(dev_rightThumbRotation, 0, 0, 1);
        rightHandThumb.matrix.translate(0/100, -5/100, 0/100);
        rightHandThumb.matrix.scale(30/100, 18/100, 20/100);
        rightHandThumb.normalMatrix.setInverseOf(rightHandThumb.matrix).transpose();
        rightHandThumb.renderFast();

        // LEFT LEG ==========================================

        // Left Upper Leg
        var leftUpperLeg = new Cylinder(limbColor, 8);
        leftUpperLeg.textureNum = this.textureNum;
        leftUpperLeg.matrix = body3Pelvis1_POS;
        //leftUpperLeg.segments = 8;
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

        leftUpperLeg.renderFast();

        // Left Lower Leg
        var leftLowerLeg = new Cylinder(limbColor, 8);
        leftLowerLeg.textureNum = this.textureNum;
        leftLowerLeg.matrix = l_UpperLeg1_POS;
        leftLowerLeg.matrix.translate(0/100, 0/100, 45/100);
        leftLowerLeg.matrix.rotate(g_lowerLeftLegAngleY, 0, 1, 0);
        var l_lowerLeg1_POS = createNewAnchor(leftLowerLeg.matrix); // Given to Left Foot
        var l_lowerLeg2_POS = createNewAnchor(leftLowerLeg.matrix); // Given to Cosmetic lower Hinge part

        leftLowerLeg.matrix.scale(2.5, 2.5, 35/100);

        leftLowerLeg.renderFast();

        // Cosmetic to Lower Leg
        var leftMiddleHinge = new Cylinder(mainBodyColor, 8);
        leftMiddleHinge.textureNum = this.textureNum;
        //leftMiddleHinge.segments = 8;
        leftMiddleHinge.matrix = l_lowerLeg2_POS;
        leftMiddleHinge.matrix.translate(0, 6.25/100, 0);
        leftMiddleHinge.matrix.rotate(90, 1, 0, 0);
        leftMiddleHinge.matrix.scale(5, 5, 0.125);
        leftMiddleHinge.renderFast()

        // LEFT FOOT =========================================
        var leftFoot = new Cube(mainBodyColor);
        leftFoot.textureNum = this.textureNum;
        leftFoot.matrix = l_lowerLeg1_POS;
        leftFoot.matrix.translate(0/100, -15/100, 30/100);
        leftFoot.matrix.rotate(g_LeftFootY , 0, 1, 0);
        var l_Foot1_POS = createNewAnchor(leftFoot.matrix); // Given to cosmetic foot part

        leftFoot.matrix.translate(-40/100, 0/100, 0/100);
        leftFoot.matrix.scale(50/100, 30/100, 20/100);
        leftFoot.normalMatrix.setInverseOf(leftFoot.matrix).transpose();
        leftFoot.renderFast();

        var leftFootDetail = new Cube(hingeColor);
        leftFootDetail.textureNum = this.textureNum;
        leftFootDetail.matrix = l_Foot1_POS;
        leftFootDetail.matrix.translate(-25/100, 5/100, -1/100);
        leftFootDetail.matrix.scale(32/100, 20/100, 10/100);
        leftFootDetail.normalMatrix.setInverseOf(leftFootDetail.matrix).transpose();
        leftFootDetail.renderFast();

        // RIGHT LEG =========================================

        // Right Upper Leg
        var rightUpperLeg = new Cylinder(limbColor, 8);
        rightUpperLeg.textureNum = this.textureNum;
        rightUpperLeg.matrix = body3Pelvis2_POS;
        //rightUpperLeg.segments = 8;
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

        rightUpperLeg.renderFast();

        // right Lower Leg
        var rightLowerLeg = new Cylinder(limbColor, 8);
        rightLowerLeg.textureNum = this.textureNum;
        rightLowerLeg.matrix = r_UpperLeg1_POS;
        rightLowerLeg.matrix.translate(0/100, 0/100, 45/100);
        rightLowerLeg.matrix.rotate(g_lowerRightLegAngleY, 0, 1, 0);
        var r_lowerLeg1_POS = createNewAnchor(rightLowerLeg.matrix); // Given to Right Foot
        var r_lowerLeg2_POS = createNewAnchor(rightLowerLeg.matrix); // Given to Cosmetic lower Hinge part

        rightLowerLeg.matrix.scale(2.5, 2.5, 35/100);

        rightLowerLeg.renderFast();

        // Cosmetic to Lower Leg
        var rightlegMiddleHinge = new Cylinder(mainBodyColor, 8);
        rightlegMiddleHinge.textureNum = this.textureNum;
        //rightlegMiddleHinge.segments = 8;
        rightlegMiddleHinge.matrix = r_lowerLeg2_POS;
        rightlegMiddleHinge.matrix.translate(0, 6.25/100, 0);
        rightlegMiddleHinge.matrix.rotate(90, 1, 0, 0);
        rightlegMiddleHinge.matrix.scale(5, 5, 0.125);
        rightlegMiddleHinge.renderFast()

        // RIGHT FOOT ========================================
        var rightFoot = new Cube(mainBodyColor);
        rightFoot.textureNum = this.textureNum;
        rightFoot.matrix = r_lowerLeg1_POS;
        rightFoot.matrix.translate(0/100, -15/100, 30/100);
        rightFoot.matrix.rotate(g_RightFootY , 0, 1, 0);
        var r_Foot1_POS = createNewAnchor(rightFoot.matrix); // Given to cosmetic foot part

        rightFoot.matrix.translate(-40/100, 0/100, 0/100);
        rightFoot.matrix.scale(50/100, 30/100, 20/100);
        rightFoot.normalMatrix.setInverseOf(rightFoot.matrix).transpose();
        rightFoot.renderFast();

        var rightFootDetail = new Cube(hingeColor);
        rightFootDetail.textureNum = this.textureNum;
        rightFootDetail.matrix = r_Foot1_POS;
        rightFootDetail.matrix.translate(-25/100, 5/100, -1/100);
        rightFootDetail.matrix.scale(32/100, 20/100, 10/100);
        rightFootDetail.normalMatrix.setInverseOf(rightFoot.matrix).transpose();
        rightFootDetail.renderFast();
    }
}

function updateAnimationAngles() {
    // Idle Animation
    if (g_idleAnimation && !g_shrinkAnimation) {
      
          // Up/down sway
          g_positionY = 2*Math.cos(g_seconds)-2;
      
          // Head
          g_headX = (1.5*Math.cos(2*g_seconds));
      
          g_pelvisX = (1.01*Math.cos(2*g_seconds));
      
          // Left arm
          g_upperLeftArmAngleX = 2*Math.sin(2*g_seconds)+70;
          g_upperLeftArmAngleY = 2*Math.sin(2*g_seconds)-10;
      
          g_lowerLeftArmAngleZ = 2*Math.sin(2*g_seconds)+40;
      
          g_leftIndex = 6*Math.cos(2*g_seconds)+40;
          g_leftMiddle = 6*Math.cos(2*g_seconds)+30;
          g_leftThumb = 6*Math.cos(2*g_seconds)-40;
      
          // Right arm
          g_upperRightArmAngleX = Math.sin(2*g_seconds)+70;
          g_upperRightArmAngleY = 4*Math.sin(2*g_seconds)-10;
      
          g_lowerRightArmAngleZ = -2*Math.sin(2*g_seconds)+40;
      
          g_rightIndex = 6*Math.sin(2*g_seconds)+40;
          g_rightMiddle = 6*Math.sin(2*g_seconds)+30;
          g_rightThumb = 6*Math.cos(2*g_seconds)-40;
      
          // Legs
          g_upperLeftLegAngleY = 10*Math.cos(g_seconds)-10;
          g_lowerLeftLegAngleY = -20*Math.cos(g_seconds)+20;
          g_LeftFootY = 10*Math.cos(g_seconds)-10;
          g_upperRightLegAngleY = 10*Math.cos(g_seconds)-10;
          g_lowerRightLegAngleY = -20*Math.cos(g_seconds)+20;
          g_RightFootY = 10*Math.cos(g_seconds)-10;
      
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
            g_rightUpperEyelid = blinkFunction;
      
            g_leftLowerEyelid = blinkFunction;
            g_rightLowerEyelid = blinkFunction;
      
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
            
            g_headZ = mult*(45*Math.sin(turnTimer));
      
            g_upperLeftArmAngleY += mult*(15*Math.cos(2*turnArmsTimer)-15);
            g_upperRightArmAngleY += mult*(-15*Math.cos(2*turnArmsTimer)+15);
      
            if (changeLeftEye) {
              g_leftEyeHeight = -2.5*Math.cos(turnTimer)+2.5;
            }
            else {
              g_rightEyeHeight = -2.5*Math.cos(turnTimer)+2.5;
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
      
          // Head
          g_headZ = 8*Math.cos(runSpeed*g_seconds);
      
          dev_headyScale = -4*Math.cos(2*runSpeed*g_seconds)+100;
          dev_headxScale = 4*Math.cos(2*runSpeed*g_seconds)+100;
          dev_headzScale = 4*Math.cos(2*runSpeed*g_seconds)+100;
      
          // Pelvis
          g_pelvisX = -10*Math.cos(runSpeed*g_seconds);
      
          // Fists
          g_leftIndex = 120;
          g_leftMiddle = 120;
          g_leftThumb = -135;
      
          g_rightIndex = 120;
          g_rightMiddle = 120;
          g_rightThumb = -135;
      
          // Arms
          g_upperLeftArmAngleX = -15*Math.sin(runSpeed*g_seconds)+70;
          g_upperLeftArmAngleY = -90*Math.sin(runSpeed*g_seconds);
          g_lowerLeftArmAngleZ = -10*Math.sin(runSpeed*g_seconds)+50;
      
          g_upperRightArmAngleX = 15*Math.sin(runSpeed*g_seconds)+70;
          g_upperRightArmAngleY = 90*Math.sin(runSpeed*g_seconds);
          g_lowerRightArmAngleZ = 10*Math.sin(runSpeed*g_seconds)+50;
      
          // Legs
          g_upperLeftLegAngleY = -60*Math.sin(runSpeed*g_seconds);
          g_lowerLeftLegAngleY = 50*Math.sin(runSpeed*g_seconds)+50;
          g_LeftFootY = -55*Math.sin(runSpeed*g_seconds);
      
          g_upperRightLegAngleY = 60*Math.sin(runSpeed*g_seconds);
          g_lowerRightLegAngleY = -50*Math.sin(runSpeed*g_seconds)+50;
          g_RightFootY = 55*Math.sin(runSpeed*g_seconds);
    }
    else {
          g_runSpeed = defaultSpeed;
    }
  
    // Babble Animation (Using Idle)
    if (g_talkAnimation && !g_shrinkAnimation) {
          // Up/down sway
          g_positionY = 2*Math.cos(g_seconds)-2;
      
          // Head
          g_headX = (1.5*Math.cos(2*g_seconds));
      
          g_pelvisX = (1.01*Math.cos(2*g_seconds));
      
          // Mouth
          g_mouthX = -randMouthAngle*Math.cos(randMouthSpeed*g_seconds)-randMouthAngle;
      
          // Left arm
          g_upperLeftArmAngleX = 2*Math.sin(2*g_seconds)+70;
          g_upperLeftArmAngleY = 2*Math.sin(2*g_seconds)-10;
      
          g_lowerLeftArmAngleZ = 2*Math.sin(2*g_seconds)+40;
      
          g_leftIndex = 6*Math.cos(2*g_seconds)+40;
          g_leftMiddle = 6*Math.cos(2*g_seconds)+30;
          g_leftThumb = 6*Math.cos(2*g_seconds)-40;
      
          // Right arm
          g_upperRightArmAngleX = Math.sin(2*g_seconds)+70;
          g_upperRightArmAngleY = 4*Math.sin(2*g_seconds)-10;
      
          g_lowerRightArmAngleZ = -2*Math.sin(2*g_seconds)+40;
      
          g_rightIndex = 6*Math.sin(2*g_seconds)+40;
          g_rightMiddle = 6*Math.sin(2*g_seconds)+30;
          g_rightThumb = 6*Math.cos(2*g_seconds)-40;
      
          // Legs
          g_upperLeftLegAngleY = 10*Math.cos(g_seconds)-10;
          g_lowerLeftLegAngleY = -20*Math.cos(g_seconds)+20;
          g_LeftFootY = 10*Math.cos(g_seconds)-10;
          g_upperRightLegAngleY = 10*Math.cos(g_seconds)-10;
          g_lowerRightLegAngleY = -20*Math.cos(g_seconds)+20;
          g_RightFootY = 10*Math.cos(g_seconds)-10;
      
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
              g_rightUpperEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
      
              g_leftLowerEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
              g_rightLowerEyelid = -4*Math.cos(blinkSpeed*blinkTimer)+4;
            }
            else {
              blinkSpeed = 1;
              g_leftLowerEyelid = -2*Math.cos(blinkSpeed*blinkTimer)+2;
              g_rightLowerEyelid = -2*Math.cos(blinkSpeed*blinkTimer)+2;
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
            }
            else if (randHeadChange == 1) {
              headSpeed = 1;
              g_headY = -10*Math.cos(headSpeed*headTimer)+10;
            }
            else {
              headSpeed = 1;
              g_headY = 10*Math.cos(headSpeed*headTimer)-10;
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
              g_upperLeftArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
              g_upperLeftArmAngleZ = -45*Math.cos(armSpeed*armTimer)+45;
              
              g_lowerLeftArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
              
              g_LeftHandY = -20*Math.cos(armSpeed*armTimer)+20;
              g_leftIndex += -50*Math.cos(armSpeed*armTimer)+50;
              g_leftMiddle += 10*Math.cos(armSpeed*armTimer)-10;
              g_leftThumb += 60*Math.cos(armSpeed*armTimer)-60;
            }
            else if (randArmChange == 1) {
              g_upperRightArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
              
              g_lowerRightArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
              
              g_RightHandX = -40*Math.cos(armSpeed*armTimer)+40;
              g_rightIndex += 20*Math.cos(armSpeed*armTimer)-20;
              g_rightMiddle += 20*Math.cos(armSpeed*armTimer)-20;
              g_rightThumb += -15*Math.cos(armSpeed*armTimer)+15;
            } 
            else if (randArmChange == 2) {
              g_upperRightArmAngleX += 20*Math.cos(armSpeed*armTimer)-20;
              g_upperRightArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
              g_upperRightArmAngleZ = -45*Math.cos(armSpeed*armTimer)+45;
              
              g_lowerRightArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
              
              g_RightHandY = -20*Math.cos(armSpeed*armTimer)+20;
              g_rightIndex += -50*Math.cos(armSpeed*armTimer)+50;
              g_rightMiddle += 10*Math.cos(armSpeed*armTimer)-10;
              g_rightThumb += 60*Math.cos(armSpeed*armTimer)-60;
            } 
            else {
              g_upperRightArmAngleY += -20*Math.cos(armSpeed*armTimer)+20;
              g_upperRightArmAngleZ = -25*Math.cos(armSpeed*armTimer)+25;
              
              g_lowerRightArmAngleZ += -20*Math.cos(armSpeed*armTimer)+20;
              
              g_RightHandY = 20*Math.cos(armSpeed*armTimer)-20;
              g_RightHandZ = -35*Math.cos(armSpeed*armTimer)+35;
      
              g_rightIndex += 20*Math.cos(armSpeed*armTimer)-20;
              g_rightMiddle += 20*Math.cos(armSpeed*armTimer)-20;
              g_rightThumb += -15*Math.cos(armSpeed*armTimer)+15;
            }
      
            // Eye Change by arm timing
            if (randEyeChange == 0) {
              armSpeed = 1;
              g_leftEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
            }
            else if (randEyeChange == 1) {
              armSpeed = 1;
              g_rightEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
            }
            else {
              armSpeed = 1;
              g_leftEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
              g_rightEyeHeight = -2.5*Math.cos(armSpeed*armTimer)+2.5;
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
            g_rightUpperEyelid = blinkFunction;
      
            g_leftLowerEyelid = blinkFunction;
            g_rightLowerEyelid = blinkFunction;
      
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
              dev_headYTranslation = 0;
            }
          }
    }
  }
