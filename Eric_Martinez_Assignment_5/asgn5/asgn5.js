import * as THREE from 'three';
import {OBJLoader} from '../lib/OBJLoader.js';
import {OrbitControls} from '../lib/OrbitControls.js';
import * as BufferGeometryUtils from '../lib/BufferGeometryUtils.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 90;
	const aspect = 2; // the canvas default uses aspect 2
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.x = 0;
	camera.position.y = 5;
	camera.position.z = 3;

    // Camera Oribtal Controller
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.minDistance = 5;
	controls.maxDistance = 1000;
	controls.enablePan = true;
    controls.update();

	const scene = new THREE.Scene();

    // Light sources ====================================================================

    const color = 0xc0c0c0;
    const intensity = 10;

    // Directional Light
	const lightDirectional = new THREE.DirectionalLight(color, intensity);
	lightDirectional.position.set(-50, 50, 35);
	scene.add(lightDirectional);

    // Ambient Light
    const lightAmbient = new THREE.AmbientLight(color, 2);
    scene.add(lightAmbient);
    
    // Point Light
    const lightPoint = new THREE.PointLight(0xFFFFFF, 150);
    scene.add(lightPoint);
    
    const lightPointR = new THREE.PointLight(0xFF0000, 50);
    scene.add(lightPointR);
    const lightPointG = new THREE.PointLight(0x00FF00, 50);
    scene.add(lightPointG);
    const lightPointB = new THREE.PointLight(0x0000FF, 50);
    scene.add(lightPointB);
    const lightPointY = new THREE.PointLight(0xFFFF00, 50);
    scene.add(lightPointY);
    const lightPointP = new THREE.PointLight(0xFF00FF, 50);
    scene.add(lightPointP);

    // Sky Box (CubeMap) ================================================================

    const skyLoader = new THREE.CubeTextureLoader();
    const texture = skyLoader.load([
        '../lib/textures/artisan-posX.png',
        '../lib/textures/artisan-negX.png',
        '../lib/textures/artisan-posY.png',
        '../lib/textures/artisan-negY.png',
        '../lib/textures/artisan-posZ.png',
        '../lib/textures/artisan-negZ.png',
    ]);
    scene.background = texture;

    // Helper Functions =================================================================

    // Mesh for each shape, custom color
	function makeInstanceColor(geometryBox, color, x, y, z, shineVal, SpecColor, flat) {
        if (shineVal == null) { shineVal = 30; }
        if (SpecColor == null) { SpecColor = 0x111111; }
        if (flat == null) { flat = false}

		const material = new THREE.MeshPhongMaterial( { 
            color: color,
            shininess: shineVal,
            specular: SpecColor,
            flatShading: flat
        } );
		const obj = new THREE.Mesh( geometryBox, material );
		scene.add( obj );
		obj.position.x = x;
        obj.position.y = y;
		obj.position.z = z;
		return obj;
	}

    // Mesh for each shape, custom texture
    function makeInstanceTexture(geometryBox, t, x, y, z, rX, rY, rZ, shineVal) {
        if (shineVal == null) {
            shineVal = 30;
        }

		const material = new THREE.MeshPhongMaterial( { 
            map: t, 
            shininess: shineVal,
        } );
		const cube = new THREE.Mesh( geometryBox, material );
		scene.add(cube);
		cube.position.x = x;
		cube.position.y = y;
		cube.position.z = z;
        cube.rotation.x = rX;
		cube.rotation.y = rY;
		cube.rotation.z = rZ;
		return cube;
	}

    // Mesh for Floor plane, repeated texture
    function makeRepeatTexture(repeatSegmentsX, repeatSegmentsY, geometryBox, t, x, y, z, rX, rY, rZ, shineVal, uvRot, uvOffX, uvOffY) {
        if (shineVal == null) { shineVal = 30; }
        if (uvRot == null) { uvRot = 0; }
        if (uvOffX == null) { uvOffX = 0; }
        if (uvOffY == null) { uvOffY = 0; }

        t.rotation = uvRot*(Math.PI/180);
        t.offset = new THREE.Vector2(uvOffX, uvOffY);
		t.wrapS = THREE.RepeatWrapping;
		t.wrapT = THREE.RepeatWrapping;
		t.magFilter = THREE.NearestFilter;
		t.colorSpace = THREE.SRGBColorSpace;
		t.repeat.set( repeatSegmentsX / 2, repeatSegmentsY / 2 );

		const planeMat = new THREE.MeshPhongMaterial( {
			map: t,
			side: THREE.DoubleSide,
            shininess: shineVal,
		} );
		const obj = new THREE.Mesh( geometryBox, planeMat );
		scene.add( obj );

		obj.position.x = x;
		obj.position.y = y;
		obj.position.z = z;
		obj.rotation.x = rX*(Math.PI/180);
		obj.rotation.y = rY*(Math.PI/180);
		obj.rotation.z = rZ*(Math.PI/180);
		return obj;
    }

    // Load custom textures/objects =====================================================

    // Grass
    const grass_repeat = new THREE.TextureLoader();
    const grassTextureRepeat = grass_repeat.load('../lib/textures/spyro1Grass0.png');
    
    // Stone
    const stone1_repeat = new THREE.TextureLoader();
    const stone1TextureRepeat = stone1_repeat.load('../lib/textures/spyro1Stone1.png');
    
    // Cobble
    const cobble0_repeat = new THREE.TextureLoader();
    const cobble0TextureRepeat_1 = cobble0_repeat.load('../lib/textures/spyro1cobble0.png');
    const cobble0TextureRepeat_2 = cobble0_repeat.load('../lib/textures/spyro1cobble0.png');
    const cobble0 = new THREE.TextureLoader();
    const cobble0Texture = cobble0.load('../lib/textures/spyro1cobble0.png');

    const cobble1_repeat = new THREE.TextureLoader();
    const cobble1TextureRepeat = cobble1_repeat.load('../lib/textures/spyro1cobble1.png');

    const cobble2_repeat = new THREE.TextureLoader();
    const cobble2TextureRepeat_1 = cobble2_repeat.load('../lib/textures/spyro1cobble2.png');
    const cobble2TextureRepeat_2 = cobble2_repeat.load('../lib/textures/spyro1cobble2.png');

    const cobble3_repeat = new THREE.TextureLoader();
    const cobble3TextureRepeat_1 = cobble3_repeat.load('../lib/textures/spyro1cobble3.png');
    const cobble3TextureRepeat_2 = cobble3_repeat.load('../lib/textures/spyro1cobble3.png');
    
    const cobble4_repeat = new THREE.TextureLoader();
    const cobble4TextureRepeat = cobble4_repeat.load('../lib/textures/spyro1cobble4.png');
    

    // Tower
    const tower0_repeat = new THREE.TextureLoader();
    const tower0TextureRepeat = tower0_repeat.load('../lib/textures/spyro1tower0.png');

    const tower1_repeat = new THREE.TextureLoader();
    const tower1TextureRepeat_1 = tower1_repeat.load('../lib/textures/spyro1tower1.png');
    const tower1TextureRepeat_2 = tower1_repeat.load('../lib/textures/spyro1tower1.png');

    const tower2_repeat = new THREE.TextureLoader();
    const tower2TextureRepeat = tower2_repeat.load('../lib/textures/spyro1tower2.png');

    const tower3_repeat = new THREE.TextureLoader();
    const tower3TextureRepeat = tower3_repeat.load('../lib/textures/spyro1tower3.png');

    // Roof
    const roof_repeat = new THREE.TextureLoader();
    const roofTextureRepeat = roof_repeat.load('../lib/textures/spyro1roof1.png');
    
    const roof1_repeat = new THREE.TextureLoader();
    const roof1TextureRepeat = roof1_repeat.load('../lib/textures/spyro1roof2.png');

    // Portal
    const portal1_repeat = new THREE.TextureLoader();
    const portal1TextureRepeat = portal1_repeat.load('../lib/textures/spyro1portal1.png');
    
    const portal2_repeat = new THREE.TextureLoader();
    const portal2TextureRepeat_1 = portal2_repeat.load('../lib/textures/spyro1portal2.png');
    const portal2TextureRepeat_2 = portal2_repeat.load('../lib/textures/spyro1portal2.png');
    
    const portal3_repeat = new THREE.TextureLoader();
    const portal3TextureRepeat_1 = portal3_repeat.load('../lib/textures/spyro1portal3.png');
    const portal3TextureRepeat_2 = portal3_repeat.load('../lib/textures/spyro1portal3.png');
    
    const portal4_repeat = new THREE.TextureLoader();
    const portal4TextureRepeat = portal4_repeat.load('../lib/textures/spyro1portal4.png');
    
    const portal5_repeat = new THREE.TextureLoader();
    const portal5TextureRepeat = portal5_repeat.load('../lib/textures/spyro1portal5.png');

    // Helper Geometry Messhes ==========================================================

    // Create Portal Frame
    function createPortal(x, y, z) {
        const rectPrismMatrix = new THREE.Matrix4();
        
        var portal1 = new THREE.CylinderGeometry(1, 1.25, 3.5, 4, 2, true, 0, 2*Math.PI);
        var portal2a = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal3a = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal2b = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal3b = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal2c = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal3c = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal2d = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal3d = new THREE.CylinderGeometry(1, 1, 1.75, 4, 2, true, 0, 2*Math.PI);
        var portal4a = new THREE.CylinderGeometry(1, 1.5, 1.25, 4, 2, false, 0, 2*Math.PI);
        var portal4b = new THREE.CylinderGeometry(1, 1.5, 1.25, 4, 2, false, 0, 2*Math.PI);
        var portal4c = new THREE.CylinderGeometry(1, 1.5, 1.26, 4, 2, false, 0, 2*Math.PI);

        // Base Frame Arches
        rectPrismMatrix.makeShear(0, 0.25, 0, 0, 0.25, 0);
        portal1.applyMatrix4(rectPrismMatrix);
        makeRepeatTexture(10, 2, portal1, portal1TextureRepeat, -2.25+x,0+y,0+z, 0,-45,0, 0);
        makeRepeatTexture(10, 2, portal1, portal1TextureRepeat, 2.25+x,0+y,0+z, 0,-45,0, 0);

        // Left Arch
        rectPrismMatrix.makeShear(0, 0.25, 0.25, -0.25, 0.25, 0);
        portal2a.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.28, 0.25, -0.25, 0.28, 0);
        portal2b.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.25, 0.25, -0.25, 0.25, 0);
        portal2c.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.29, 0.25, -0.25, 0.29, 0);
        portal2d.applyMatrix4(rectPrismMatrix);
        
        makeRepeatTexture(8, 2, portal2a, portal3TextureRepeat_1, -1.94+x,2.625+y,0+z, 0,-45,0, 0);
        makeRepeatTexture(8, 2, portal2b, portal4TextureRepeat, -1.94+x,2.625+y,0+z, 0,-45,0, 0);
        makeRepeatTexture(8, 2, portal2c, portal3TextureRepeat_1, -0.98+x,3.5+y,0+z, -35,-30,-55, 0);
        makeRepeatTexture(8, 2, portal2c, portal3TextureRepeat_1, -0.98+x,3.5+y,0+z, -35,-30,-55, 0);
        makeRepeatTexture(8, 2, portal2d, portal4TextureRepeat, -0.98+x,3.5+y,0+z, -35,-30,-55, 0);

        // Right Arch
        rectPrismMatrix.makeShear(0, 0.25, -0.25, 0.25, 0.25, 0);
        portal3a.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.28, -0.25, 0.25, 0.28, 0);
        portal3b.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.25, -0.25, 0.25, 0.25, 0);
        portal3c.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.29, -0.25, 0.25, 0.29, 0);
        portal3d.applyMatrix4(rectPrismMatrix);

        makeRepeatTexture(8, 2, portal3a, portal3TextureRepeat_1, 1.94+x,2.625+y,0+z, 0,-45,0, 0);
        makeRepeatTexture(8, 2, portal3b, portal4TextureRepeat, 1.94+x,2.625+y,0+z, 0,-45,0, 0);
        makeRepeatTexture(8, 2, portal3c, portal3TextureRepeat_1, 0.98+x,3.5+y,0+z, 35,-30,55, 0);
        makeRepeatTexture(8, 2, portal3d, portal4TextureRepeat, 0.98+x,3.5+y,0+z, 35,-30,55, 0);

        // Top Piece
        rectPrismMatrix.makeShear(0, 0.5, 0, 0, 0.5, 0);
        portal4a.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.52, 0, 0, 0.52, 0);
        portal4b.applyMatrix4(rectPrismMatrix);
        rectPrismMatrix.makeShear(0, 0.51, 0, 0, 0.51, 0);
        portal4c.applyMatrix4(rectPrismMatrix);
        makeRepeatTexture(8, 2, portal4a, portal2TextureRepeat_1, 0+x,3.9+y,0+z, 180,-45,0, 0);
        makeRepeatTexture(8, 2, portal4b, portal5TextureRepeat, 0+x,3.9+y,0+z, 180,-45,0, 0);
        makeRepeatTexture(2, 2, portal4c, portal3TextureRepeat_2, 0+x,3.9+y,0+z, 180,-45,0, 0, 45, 0.8, 0);
    }

    // Create Gem (and their grouped pivot)
    var gems = [];
    var gemGroups = [];
    function createGem(color, x, y, z, rX, rY, rZ) {
        // Create Custom Mesh
        var lower_gem = new THREE.CylinderGeometry(0.4, 0, 0.4, 6, 1, true, 0, 2*Math.PI);
        var mid_gem = new THREE.CylinderGeometry(0.5, 0.4, 0.2, 6, 1, true, 0, 2*Math.PI);
        mid_gem.translate(0, 0.3, 0);
        var top_gem = new THREE.CylinderGeometry(0, 0.5, 0.15, 6, 1, true, 0, 2*Math.PI);
        top_gem.translate(0, 0.475, 0);

        const gemPhongMaterial = new THREE.MeshPhongMaterial( { 
            color: color,
            shininess: 100,
            specular: 0xffffff,
            flatShading: true
        } );

        var finalMesh = BufferGeometryUtils.mergeGeometries([lower_gem, mid_gem, top_gem]);
        const gem = new THREE.Mesh(finalMesh, gemPhongMaterial);
        scene.add(gem);
        gems.push(gem);
        
        // Change pivot point offset (allows point rotation)
        var group = new THREE.Group();
        group.position.set(gems[gems.length-1].position.x, gems[gems.length-1].position.y, gems[gems.length-1].position.z);
        group.add(gems[gems.length-1]);
        scene.add(group);
        
        gems[gems.length-1].position.set(gems[gems.length-1].position.x, gems[gems.length-1].position.y+0.2, gems[gems.length-1].position.z);
        
        group.position.set(group.position.x, group.position.y-0.2, group.position.z);
        console.log(group.position.x, group.position.y, group.position.z, "\n", gems[gems.length-1].position.x, gems[gems.length-1].position.y, gems[gems.length-1].position.z);
        gemGroups.push(group);
        group.rotation.z = 45*(Math.PI/180);

        // Move Gem using input xyz
        gems[gems.length-1].position.x, gemGroups[gems.length-1].position.x = (x)+(-1*gemGroups[gems.length-1].position.x), (gems[gems.length-1].position.x);
        gems[gems.length-1].position.y, gemGroups[gems.length-1].position.y = (y)+(-1*gemGroups[gems.length-1].position.y), (gems[gems.length-1].position.y);
        gems[gems.length-1].position.z, gemGroups[gems.length-1].position.z = (z)+(-1*gemGroups[gems.length-1].position.z), (gems[gems.length-1].position.z);
        return gem;
    }

    // Geometries / Meshes ==============================================================

    // Simple Geometry for each cube instance
    //THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const geometryBox = new THREE.BoxGeometry(1, 1, 1);

    // Geometry for Sphere
    // THREE.SphereGeometry(sphRadius, sphWidthSegments, sphHeightSegments, sphPhiStart, sphPhiLength, sphThetaStart, sphThetaLength);
    const geometrySphere = new THREE.SphereGeometry(1, 6, 8, 0, 2*Math.PI, 0, 2*Math.PI);

    // Geometry for Cone
    // THREE.CylinderGeometry(cylRadiusTop, cylRadiusBottom, cylHeight, cylRadialSegments, cylHeightSegments, cylOpenEnded, cylThetaStart, cylThetaLength);
    const geometryCylinder = new THREE.CylinderGeometry(0.75, 0.75, 0.75, 8, 1, false, 0, 2*Math.PI);

    // Floor Plane   
    var floorPlane = new THREE.PlaneGeometry(100, 100, 100, 100);
    floorPlane.rotateX(-Math.PI/2);
    const planePosAttrib = floorPlane.getAttribute( 'position' );
    const planeVerts = new THREE.Vector3();
    for ( let i = 0; i < planePosAttrib.count; i ++ ) {
        planeVerts.fromBufferAttribute( planePosAttrib, i ); // read planeVerts
        // do something with planeVerts
        planePosAttrib.setXYZ( i, planeVerts.x, (5/5)*Math.cos((1/10)*planeVerts.x) + (5/5)*Math.cos((1/10)*planeVerts.z), planeVerts.z ); // write coordinates back
        if (i < 2250) {
            planePosAttrib.setXYZ( i, planeVerts.x, (5/5)*Math.cos((1/10)*planeVerts.x) + (5/5)*Math.cos((1/10)*planeVerts.z) + 5, planeVerts.z );
        }
        if (i >= 2250 && i < 3000) {
            planePosAttrib.setXYZ( i, planeVerts.x, (5/5)*Math.cos((1/10)*planeVerts.x) + (5/5)*Math.cos((1/10)*planeVerts.z) + 2.5, planeVerts.z );
        }
    }
    floorPlane.rotateX(Math.PI/2);
    makeRepeatTexture(30, 30, floorPlane, grassTextureRepeat, 0,-1.5,0, -90,0,0, 0);


    // Castle //

    // Base Building
    var castle_layer = new THREE.BoxGeometry(20, 3, 20);
    makeRepeatTexture(15, 2, castle_layer, cobble1TextureRepeat, 0,0,-30, 0,0,0, 0);
    makeRepeatTexture(15, 2, castle_layer, cobble0TextureRepeat_1, 0,3,-30, 0,0,0, 0);
    makeRepeatTexture(15, 2, castle_layer, cobble3TextureRepeat_1, 0,6,-30, 0,0,0, 0);
    makeRepeatTexture(15, 2, castle_layer, cobble2TextureRepeat_1, 0,9,-30, 0,0,0, 0);
    var castle_roof1 = new THREE.BoxGeometry(20, 0.01, 20);
    makeRepeatTexture(10, 10, castle_roof1, cobble0Texture, 0,10.5,-30, 0,0,0, 0);

    // Towers
    var castle_tower1 = new THREE.CylinderGeometry(2.5, 3.5, 3, 5, 1, true, 0, 2*Math.PI);
    var castle_tower2 = new THREE.CylinderGeometry(1.8, 2.5, 8, 5, 1, true, 0, 2*Math.PI);
    var castle_tower3 = new THREE.CylinderGeometry(1.8, 1.8, 3, 5, 1, true, 0, 2*Math.PI);
    var castle_tower4 = new THREE.CylinderGeometry(2, 1.8, 3, 5, 1, true, 0, 2*Math.PI);
    var castle_tower5 = new THREE.CylinderGeometry(0, 2, 3, 5, 1, true, 0, 2*Math.PI);

    makeRepeatTexture(10, 2, castle_tower1, tower1TextureRepeat_1, -11.5,0,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower2, tower0TextureRepeat, -11.5,5.5,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower3, tower3TextureRepeat, -11.5,11,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower4, tower2TextureRepeat, -11.5,14,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower5, roofTextureRepeat, -11.5,17,-20, 0,0,0, 0);

    makeRepeatTexture(10, 2, castle_tower1, tower1TextureRepeat_1, 11.5,0,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower2, tower0TextureRepeat, 11.5,5.5,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower3, tower3TextureRepeat, 11.5,11,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower4, tower2TextureRepeat, 11.5,14,-20, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower5, roofTextureRepeat, 11.5,17,-20, 0,0,0, 0);

    makeRepeatTexture(10, 2, castle_tower1, tower1TextureRepeat_1, -11.5,0,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower2, tower0TextureRepeat, -11.5,5.5,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower3, tower3TextureRepeat, -11.5,11,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower4, tower2TextureRepeat, -11.5,14,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower5, roofTextureRepeat, -11.5,17,-40, 0,0,0, 0);

    makeRepeatTexture(10, 2, castle_tower1, tower1TextureRepeat_1, 11.5,0,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower2, tower0TextureRepeat, 11.5,5.5,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower3, tower3TextureRepeat, 11.5,11,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower4, tower2TextureRepeat, 11.5,14,-40, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_tower5, roofTextureRepeat, 11.5,17,-40, 0,0,0, 0);

    // Upper Tower
    var castle_up_tower1 = new THREE.CylinderGeometry(6, 8, 2, 10, 2, true, 0, 2*Math.PI);
    var castle_up_tower2 = new THREE.CylinderGeometry(5.5, 6, 3, 10, 2, true, 0, 2*Math.PI);
    var castle_up_tower3 = new THREE.CylinderGeometry(5.5, 5.5, 4, 10, 2, true, 0, 2*Math.PI);
    var castle_up_tower4 = new THREE.CylinderGeometry(5.5, 5.5, 3, 10, 2, true, 0, 2*Math.PI);
    var castle_up_tower5 = new THREE.CylinderGeometry(3, 5.5, 2, 10, 2, true, 0, 2*Math.PI);
    var castle_up_tower6 = new THREE.CylinderGeometry(0, 3, 4, 10, 2, true, 0, 2*Math.PI);
    
    const CylShearMatrix = new THREE.Matrix4();
    var castle_up_tower7a = new THREE.CylinderGeometry(0, 1.5, 3, 5, 2, true, 0, 2*Math.PI);
    var castle_up_tower8a = new THREE.CylinderGeometry(0, 1.5, 3, 5, 2, true, 0, 2*Math.PI);
    CylShearMatrix.makeShear(0, 0, 0.33, 0, 0, 0);
    castle_up_tower7a.applyMatrix4(CylShearMatrix);
    castle_up_tower8a.applyMatrix4(CylShearMatrix);

    var castle_up_tower7b = new THREE.CylinderGeometry(1, 1.5, 2.5, 5, 2, true, 0, 2*Math.PI);
    var castle_up_tower8b = new THREE.CylinderGeometry(1.25, 1.5, 2.5, 5, 2, true, 0, 2*Math.PI);
    var castle_up_tower7c = new THREE.CylinderGeometry(1.5, 1, 2.5, 5, 2, true, 0, 2*Math.PI);
    var castle_up_tower8c = new THREE.CylinderGeometry(1.5, 1.25, 2.5, 5, 2, true, 0, 2*Math.PI);
    var castle_up_tower7d = new THREE.CylinderGeometry(0, 1.5, 3, 5, 2, true, 0, 2*Math.PI);
    var castle_up_tower8d = new THREE.CylinderGeometry(0, 1.5, 1.5, 5, 2, true, 0, 2*Math.PI);
    
    makeRepeatTexture(20, 2, castle_up_tower1, cobble4TextureRepeat, 0,11.5,-30, 0,0,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower2, cobble0TextureRepeat_2, 0,14,-30, 0,0,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower3, cobble3TextureRepeat_2, 0,17.5,-30, 0,0,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower4, cobble2TextureRepeat_2, 0,21,-30, 0,0,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower5, roofTextureRepeat, 0,23.5,-30, 0,0,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower6, roof1TextureRepeat, 0,26.5,-30, 0,0,0, 0);

    // Right upper Tower
    makeRepeatTexture(20, 2, castle_up_tower7a, tower0TextureRepeat, 6,16,-30, 0,0,180, 0);
    makeRepeatTexture(5, 2, castle_up_tower7b, tower1TextureRepeat_2, 6.5,18.75,-30, 0,0,0, 0);
    makeRepeatTexture(10, 2, castle_up_tower7c, tower2TextureRepeat, 6.5,21,-30, 0,0,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower7d, roof1TextureRepeat, 6.5,23.75,-30, 0,0,0, 0);

    // Left upper Tower
    makeRepeatTexture(20, 2, castle_up_tower8a, tower0TextureRepeat, -6,16,-30, 180,0,0, 0);
    makeRepeatTexture(5, 2, castle_up_tower8b, tower1TextureRepeat_2, -6.5,18.75,-30, 0,180,0, 0);
    makeRepeatTexture(10, 2, castle_up_tower8c, tower2TextureRepeat, -6.5,21,-30, 0,180,0, 0);
    makeRepeatTexture(20, 2, castle_up_tower8d, roof1TextureRepeat, -6.5,23,-30, 0,180,0, 0);
    
    // Portal Frame
    createPortal(0, 2.2, 0);

    // Gem Objects
    var red = 0xf1362a;
    var green = 0x0d960d;
    var blue = 0x020cb0;
    var yellow = 0xc9c000;
    var purple = 0xd827d0;

    createGem(red,    -10, -0.25, -5);
    createGem(green,  -5,   0.1,  -5);
    createGem(blue,    0,   0.15, -5);
    createGem(yellow,  5,   0.1,  -5);
    createGem(purple,  10, -0.25, -5);
    lightPointR.position.set(-10, -0.25, -5);
    lightPointG.position.set(-5,   0.1,  -5);
    lightPointB.position.set(0,   0.15, -5);
    lightPointY.position.set(5,   0.1,  -5);
    lightPointP.position.set(10, -0.25, -5);

    // Rendering functions ==============================================================

    // Canvas Resizer
    function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize( width, height, false );
		}
		return needResize;
	}

    // Rendering Display size (width/heigth)
	function render() {
        // Check if Resize needed
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

    // Animate Geometry
    function animate(time) {
        
        // Gems
        for (let i = 0; i < gemGroups.length; i++) {
            gemGroups[i].rotation.y += 0.05;
            gems[i].rotation.y -= 0.05;
        }
        time *= 0.05;

        renderer.render(scene, camera);
		requestAnimationFrame(animate);
    }

    // Call animation functions
    requestAnimationFrame(animate);
    requestAnimationFrame(render);
}

main();