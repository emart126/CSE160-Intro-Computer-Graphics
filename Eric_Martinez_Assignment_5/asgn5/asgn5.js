import * as THREE from 'three';
import {OBJLoader} from '../lib/OBJLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 100;
	const aspect = 2; // the canvas default uses aspect 2
	const near = 0.1;
	const far = 5;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 3;

	const scene = new THREE.Scene();

    // Light source
	const color = 0xFFFFFF;
	const intensity = 3;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-2, 2, 4);
	scene.add(light);

    // Geometries =======================================================================

    // Simple Geometry for each cube instance
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
    const geometryBox = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // Geometry for Sphere
    const sphRadius = 1;
    const sphWidthSegments = 6;
    const sphHeightSegments = 8;
    const sphPhiStart = 0;
    const sphPhiLength = 2*Math.PI;
    const sphThetaStart = 0;
    const sphThetaLength = 2*Math.PI;
    const geometrySphere = new THREE.SphereGeometry(sphRadius, sphWidthSegments, sphHeightSegments, sphPhiStart, sphPhiLength, sphThetaStart, sphThetaLength);

    // Geometry for Cone
    const cylRadiusTop = 0.75;
    const cylRadiusBottom = 0.75;
    const cylHeight = 0.75;
    const cylRadialSegments = 8;
    const cylHeightSegments = 1;
    const cylOpenEnded = false;
    const cylThetaStart = 0;
    const cylThetaLength = 2*Math.PI;
    const geometryCylinder = new THREE.CylinderGeometry(cylRadiusTop, cylRadiusBottom, cylHeight, cylRadialSegments, cylHeightSegments, cylOpenEnded, cylThetaStart, cylThetaLength);

    // Helper Functions =================================================================

    // Mesh for each shape, custom color
	function makeInstanceColor(geometryBox, color, x, y, z) {
		const material = new THREE.MeshPhongMaterial( { color } );
		const cube = new THREE.Mesh( geometryBox, material );
		scene.add( cube );
		cube.position.x = x;
        cube.position.y = y;
		cube.position.z = z;
		return cube;
	}

    // Mesh for each shape, custom texture
    function makeInstanceTexture(geometryBox, t, x, y, z) {
		const material = new THREE.MeshPhongMaterial( { map: t } );
		const cube = new THREE.Mesh( geometryBox, material );
		scene.add(cube);
		cube.position.x = x;
		cube.position.y = y;
		cube.position.z = z;
		return cube;
	}

    // Load custom textures/objects =====================================================

    // Load Custom textures 
    const loader = new THREE.TextureLoader();
    const stoneTexture = loader.load('../lib/textures/stone.png');
    stoneTexture.colorSpace = THREE.SRGBColorSpace;

    // Load custom object and add to scene
    let customModel;
    const objLoader = new OBJLoader();
    objLoader.load('../lib/models/ccKnightPurple.obj', (root) => {
        root.position.y = -3;
        root.scale.set(0.25,0.25,0.25);
        scene.add(root);
        customModel = root;
    });

    // Create Meshes ====================================================================

    // Create All Gemometries, contain in list and add them to the scene
	const gemoetries = [
		makeInstanceColor(geometrySphere, 0x8844ff, 2, 1, 0),
		makeInstanceColor(geometryCylinder, 0x44aa00, -2, 1, 0),
		makeInstanceTexture(geometryBox, stoneTexture, 2, 0, 0),
	];

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
    let bouncingShape = gemoetries[2];
    let yDirection = Math.random()*3;
    let xDirection = Math.random()*3;
    function animate(time) {
        
        // bouncingShape gets bounced around 
        if (bouncingShape.position.x >= 6) {
            xDirection = -Math.random()*3;
        }
        else if (bouncingShape.position.x <= -6){
            xDirection = Math.random()*3;
        }
        if (bouncingShape.position.y >= 3) {
            yDirection = -Math.random()*3;
        }
        else if (bouncingShape.position.y <= -3){
            yDirection = Math.random()*3;
        }
        bouncingShape.position.x += 0.05 * xDirection;
        bouncingShape.position.y += 0.05 * yDirection;

        // Spin all shapes in geometries
        time *= 0.005; // convert time to seconds
		gemoetries.forEach( (cube, ndx) => {
			const speed = 1 + ndx * .1;
			const rot = time * speed;
			cube.rotation.x = rot;
			cube.rotation.y = rot;
		} );

        // Spine Custom Model
        if (customModel) {
            customModel.rotation.y += 0.01;
        }
        
        renderer.render(scene, camera);
		requestAnimationFrame(animate);
    }

    // Call animation functions
    requestAnimationFrame(animate);
    requestAnimationFrame(render);
}

main();
