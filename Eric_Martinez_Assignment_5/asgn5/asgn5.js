import * as THREE from 'three';
import * as holdEvent from "../lib/hold-event.js";
import CameraControls from '../lib/camera-controls.js';
CameraControls.install( { THREE: THREE } );
import {OBJLoader} from '../lib/OBJLoader.js';
import {OrbitControls} from '../lib/OrbitControls.js';
import { GUI } from '../lib/lil-gui.esm.js';
import * as BufferGeometryUtils from '../lib/BufferGeometryUtils.js';

import {EffectComposer} from '../lib/EffectComposer.js';
//import {ShaderPass} from '../lib/ShaderPass.js';
//import {TexturePass} from '../lib/TexturePass.js';
import {RenderPass} from '../lib/RenderPass.js';
import {OutputPass} from '../lib/OutputPass.js';
import {CubeTexturePass} from '../lib/CubeTexturePass.js';
import {MaskPass,ClearMaskPass} from '../lib/MaskPass.js';
import {ClearPass} from '../lib/ClearPass.js';
// import {CopyShader} from '../lib/CopyShader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas, logarithmicDepthBuffer: true} );
    renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.autoClear = false;

	const fov = 90;
	const aspect = 2; // the canvas default uses aspect 2
	const near = 0.1;
	const far = 1500;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.x = 0;
	camera.position.y = 3;
	camera.position.z = 3;

    // Camera Oribtal Controller
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 3, 0 );
	controls.minDistance = 5;
	controls.maxDistance = 1000;
	controls.enablePan = true;
    controls.update();
    
    // Scenes
	const scene = new THREE.Scene();
    const portal1Scene = new THREE.Scene();
    const portal2Scene = new THREE.Scene();
    const portal3Scene = new THREE.Scene();
    const portal4Scene = new THREE.Scene();
    const portal5Scene = new THREE.Scene();
    var portalScenes = [];
    var portals = [];
    portalScenes.push(portal1Scene);
    portalScenes.push(portal2Scene);
    portalScenes.push(portal3Scene);
    portalScenes.push(portal4Scene);
    portalScenes.push(portal5Scene);

    // Custom Camera Controls ===========================================================
    // Source Code: https://github.com/yomotsu/camera-controls
    const cameraControls = new CameraControls( camera, renderer.domElement );
    cameraControls.setLookAt(0, 3, 5, 0,3,0);
    cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;

    const KEYCODE = {
        W: 87,
        A: 65,
        S: 83,
        D: 68,
        ARROW_LEFT : 37,
        ARROW_UP   : 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN : 40,
    };

    const wKey = new holdEvent.KeyboardKeyHold( KEYCODE.W, 16.666 );
    const aKey = new holdEvent.KeyboardKeyHold( KEYCODE.A, 16.666 );
    const sKey = new holdEvent.KeyboardKeyHold( KEYCODE.S, 16.666 );
    const dKey = new holdEvent.KeyboardKeyHold( KEYCODE.D, 16.666 );
    aKey.addEventListener( 'holding', function( event ) { cameraControls.truck( - 0.01 * event.deltaTime, 0, false ) } );
    dKey.addEventListener( 'holding', function( event ) { cameraControls.truck(   0.01 * event.deltaTime, 0, false ) } );
    wKey.addEventListener( 'holding', function( event ) { cameraControls.forward(   0.01 * event.deltaTime, false ) } );
    sKey.addEventListener( 'holding', function( event ) { cameraControls.forward( - 0.01 * event.deltaTime, false ) } );

    const leftKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_LEFT,  100 );
    const rightKey = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_RIGHT, 100 );
    const upKey    = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_UP,    100 );
    const downKey  = new holdEvent.KeyboardKeyHold( KEYCODE.ARROW_DOWN,  100 );
    leftKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( - 0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true ) } );
    rightKey.addEventListener( 'holding', function( event ) { cameraControls.rotate(   0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime, 0, true ) } );
    upKey.addEventListener   ( 'holding', function( event ) { cameraControls.rotate( 0, - 0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime, true ) } );
    downKey.addEventListener ( 'holding', function( event ) { cameraControls.rotate( 0,   0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime, true ) } );

    // GUI ==============================================================================
    const gui = new GUI();
	const guiParams = {
		isDay: true,
        dayOptions: 0,
        nightOptions: 0,
        function() { updateSkies = true; }
	};

	gui.add( guiParams, 'isDay').name('Day light');
	gui.add( guiParams, 'dayOptions', {Default: 0, Haunted_Towers: 1, Loft_Castle: 2, Dream_Weavers: 3, Town_Square: 4} ).name('Day Sky Texture');
	gui.add( guiParams, 'nightOptions', {Default: 0, Glimmer: 1, Wizard_Peak: 2, Jacques: 3, Doctor_Shemp: 4, Night_Flight: 5, Blow_Hard: 6} ).name('Night Sky Texture');
    gui.add( guiParams, 'function').name('Randomize Portals' );

    // Sky Boxes (CubeMap) ==============================================================

    var skyBoxTextures = [];
    var daySkyBoxTextures = [];
    var nightSkyBoxTextures = [];
    const daySkyBoxTexture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/artisanSky/')
        .load(['artisan-posX.png','artisan-negX.png','artisan-posY.png','artisan-negY.png','artisan-posZ.png','artisan-negZ.png']);
    daySkyBoxTextures.push(daySkyBoxTexture);
    
    const nightSkyBoxTexture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/darkHollowSky/')
        .load(['darkHollow-posX.png','darkHollow-negX.png','darkHollow-posY.png','darkHollow-negY.png','darkHollow-posZ.png','darkHollow-negZ.png']);
    nightSkyBoxTextures.push(nightSkyBoxTexture);
    
    const portal1Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/glimmerSky/')
        .load(['glimmer-negZ.png','glimmer-posZ.png','glimmer-posY.png','glimmer-negY.png','glimmer-posX.png','glimmer-negX.png']);
    skyBoxTextures.push(portal1Texture);
    nightSkyBoxTextures.push(portal1Texture);
    
    const portal2Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/wizardPeakSky/')
        .load(['wizardPeak-posX.png','wizardPeak-negX.png','wizardPeak-posY.png','wizardPeak-negY.png','wizardPeak-posZ.png','wizardPeak-negZ.png']);
    skyBoxTextures.push(portal2Texture);
    nightSkyBoxTextures.push(portal2Texture);

    const portal3Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/jacquesSky/')
        .load(['jacques-posX.png','jacques-negX.png','jacques-posY.png','jacques-negY.png','jacques-posZ.png','jacques-negZ.png']);
    skyBoxTextures.push(portal3Texture);
    nightSkyBoxTextures.push(portal3Texture);
    
    const portal4Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/hauntedTowersSky/')
        .load(['hauntedTowers-posX.png','hauntedTowers-negX.png','hauntedTowers-posY.png','hauntedTowers-negY.png','hauntedTowers-posZ.png','hauntedTowers-negZ.png']);
    skyBoxTextures.push(portal4Texture);
    daySkyBoxTextures.push(portal4Texture);
    
    const portal5Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/loftyCastleSky/')
        .load(['loftyCastle-posX.png','loftyCastle-negX.png','loftyCastle-posY.png','loftyCastle-negY.png','loftyCastle-posZ.png','loftyCastle-negZ.png']);
    skyBoxTextures.push(portal5Texture);
    daySkyBoxTextures.push(portal5Texture);

    const portal6Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/doctorShempSky/')
        .load(['doctorShemp-posX.png','doctorShemp-negX.png','doctorShemp-posY.png','doctorShemp-negY.png','doctorShemp-posZ.png','doctorShemp-negZ.png']);
    skyBoxTextures.push(portal6Texture);
    nightSkyBoxTextures.push(portal6Texture);

    const portal7Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/dreamWeaversSky/')
        .load(['dreamWeavers-posX.png','dreamWeavers-negX.png','dreamWeavers-posY.png','dreamWeavers-negY.png','dreamWeavers-posZ.png','dreamWeavers-negZ.png']);
    skyBoxTextures.push(portal7Texture);
    daySkyBoxTextures.push(portal7Texture);

    const portal8Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/nightFlightSky/')
        .load(['nightFlight-posX.png','nightFlight-negX.png','nightFlight-posY.png','nightFlight-negY.png','nightFlight-posZ.png','nightFlight-negZ.png']);
    skyBoxTextures.push(portal8Texture);
    nightSkyBoxTextures.push(portal8Texture);

    const portal9Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/blowHardSky/')
        .load(['blowHard-posX.png','blowHard-negX.png','blowHard-posY.png','blowHard-negY.png','blowHard-posZ.png','blowHard-negZ.png']);
    skyBoxTextures.push(portal9Texture);
    nightSkyBoxTextures.push(portal9Texture);

    const portal10Texture = new THREE.CubeTextureLoader()
        .setPath('../lib/textures/townSquareSky/')
        .load(['townSquare-posX.png','townSquare-negX.png','townSquare-posY.png','townSquare-negY.png','townSquare-posZ.png','townSquare-negZ.png']);
    skyBoxTextures.push(portal10Texture);
    daySkyBoxTextures.push(portal10Texture);

    // Portal Tech ======================================================================

    // const protal1geom = new THREE.PlaneGeometry(3.5, 5);
    // const portal1Mat = new THREE.MeshPhongMaterial( {side: THREE.DoubleSide} );
    
    // const portal1a = new THREE.Mesh(protal1geom, portal1Mat);
    // portal1Scene.add(portal1a);
    // portal1a.position.y = 3;

    // Source idea: https://jsfiddle.net/tomthebearded/jcvo6z9g/457/ from https://threejs.org/examples/#webgl_postprocessing_masking
    const clearPass = new ClearPass();
    const clearMaskPass = new ClearMaskPass();
    const maskPassPortal1 = new MaskPass(portal1Scene, camera);
    const maskPassPortal2 = new MaskPass(portal2Scene, camera);
    const maskPassPortal3 = new MaskPass(portal3Scene, camera);
    const maskPassPortal4 = new MaskPass(portal4Scene, camera);
    const maskPassPortal5 = new MaskPass(portal5Scene, camera);
    
    var portal1RenderTexture = new CubeTexturePass(camera, skyBoxTextures[0]);
    const portal1Render = new RenderPass(portal1Scene, camera);
    portal1Render.clear = false;
    
    var portal2RenderTexture = new CubeTexturePass(camera, skyBoxTextures[3]);
    const portal2Render = new RenderPass(portal2Scene, camera);
    portal2Render.clear = false;
    
    var portal3RenderTexture = new CubeTexturePass(camera, skyBoxTextures[6]);
    const portal3Render = new RenderPass(portal3Scene, camera);
    portal3Render.clear = false;
    
    var portal4RenderTexture = new CubeTexturePass(camera, skyBoxTextures[4]);
    const portal4Render = new RenderPass(portal4Scene, camera);
    portal4Render.clear = false;
    
    var portal5RenderTexture = new CubeTexturePass(camera, skyBoxTextures[5]);
    const portal5Render = new RenderPass(portal5Scene, camera);
    portal5Render.clear = false;
    
    var mainSkyRender
    if (guiParams.isDay) {
        mainSkyRender = new CubeTexturePass(camera, daySkyBoxTextures[0]);
    }
    else {
        mainSkyRender = new CubeTexturePass(camera, nightSkyBoxTextures[0]);
    }
    
    function setPortalsRandom() {
        portal1RenderTexture = null;
        portal1RenderTexture = new CubeTexturePass(camera, skyBoxTextures[(Math.floor(Math.random()*10))]);
        portal2RenderTexture = null;
        portal2RenderTexture = new CubeTexturePass(camera, skyBoxTextures[(Math.floor(Math.random()*10))]);
        portal3RenderTexture = null;
        portal3RenderTexture = new CubeTexturePass(camera, skyBoxTextures[(Math.floor(Math.random()*10))]);
        portal4RenderTexture = null;
        portal4RenderTexture = new CubeTexturePass(camera, skyBoxTextures[(Math.floor(Math.random()*10))]);
        portal5RenderTexture = null;
        portal5RenderTexture = new CubeTexturePass(camera, skyBoxTextures[(Math.floor(Math.random()*10))]);
    }
    
    
    const mainSceneRender = new RenderPass(scene, camera);
    mainSceneRender.clear = false;
  
    const outputPass = new OutputPass();
    const parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat,
        stencilBuffer: true,
    };
  
    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters);
  
    let composer = new EffectComposer(renderer, renderTarget);

    function composeEntireScene() {
        composer.addPass(clearPass);

        composer.addPass(mainSkyRender);


        composer.addPass(maskPassPortal5);
        composer.addPass(portal5Render);
        composer.addPass(portal5RenderTexture);
        composer.addPass(clearMaskPass);

        composer.addPass(maskPassPortal4);
        composer.addPass(portal4Render);
        composer.addPass(portal4RenderTexture);
        composer.addPass(clearMaskPass);

        composer.addPass(maskPassPortal3);
        composer.addPass(portal3Render);
        composer.addPass(portal3RenderTexture);
        composer.addPass(clearMaskPass);
        
        composer.addPass(maskPassPortal2);
        composer.addPass(portal2Render);
        composer.addPass(portal2RenderTexture);
        composer.addPass(clearMaskPass);

        composer.addPass(maskPassPortal1);
        composer.addPass(portal1Render);
        composer.addPass(portal1RenderTexture);
        composer.addPass(clearMaskPass);
        
        
        composer.addPass(mainSceneRender);
        composer.addPass(outputPass);
    }
    function resetComposer() {
        for (let i = 0; i < composer.passes.length-1; i++) {
            composer.removePass(composer.passes[i]);
        } 
    }

    composeEntireScene(); 

    // Light sources ====================================================================

    const color = 0xc0c0c0;
    const intensity = 10;

    // Directional Light
	const sunlightDirectional = new THREE.DirectionalLight(color, intensity);
	sunlightDirectional.position.set(-50, 50, 35);
    //sunlightDirectional.castShadow = true;
	
    const moonlightDirectional = new THREE.DirectionalLight(color, intensity/2);
	moonlightDirectional.position.set(50, 50, 60);
    //moonlightDirectional.castShadow = true;
	
    scene.add(sunlightDirectional);
    scene.add(moonlightDirectional);

    // Ambient Light
    const lightAmbient = new THREE.AmbientLight(color, 2);
    scene.add(lightAmbient);
    
    // Point Light
    // const lightPoint = new THREE.PointLight(0xFFFFFF, 150);
    // scene.add(lightPoint);

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
    function makeRepeatTexture(repeatSegmentsX, repeatSegmentsY, geometryBox, t, x, y, z, rX, rY, rZ, shineVal, addToScene, uvRot, uvOffX, uvOffY) {
        if (shineVal == null) { shineVal = 30; }
        if (uvRot == null) { uvRot = 0; }
        if (uvOffX == null) { uvOffX = 0; }
        if (uvOffY == null) { uvOffY = 0; }
        if (addToScene == null) {addToScene = true; }

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
        // planeMat.onBeforeCompile = function ( shader ) {
        //     shader.uniforms.mvPosition;
		// 	shader.vertexShader = 'uniform vec4 mvPosition;\n' + shader.vertexShader;
		// 	shader.vertexShader = shader.vertexShader.replace(
        //         '#include <project_vertex>',
        //         [
        //             `vec2 resolution = vec2(1080, 1920);`,
        //             'vec4 pos = projectionMatrix * mvPosition;',

        //             'pos.xyz = pos.xyz / pos.w;',
        //             'pos.xy = floor(resolution * pos.xy) / resolution;',
        //             'pos.xyz *= pos.w;',
        //         ].join( '\n' )
        //     );
		// 	planeMat.userData.shader = shader;
        // }

		const obj = new THREE.Mesh( geometryBox, planeMat );
        // obj.receiveShadow = true; 
        // obj.castShadow = true;
		if (addToScene) {
            scene.add( obj );
        }

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
    const grass1TextureRepeat = grass_repeat.load('../lib/textures/spyro1Grass0.png');
    const grass1TextureRepeat_2 = grass_repeat.load('../lib/textures/spyro1Grass0.png');
    const grass1TextureRepeat_3 = grass_repeat.load('../lib/textures/spyro1Grass0.png');

    const grass2_repeat = new THREE.TextureLoader();
    const grass2TextureRepeat = grass2_repeat.load('../lib/textures/spyro1Grass2.png');
    
    const grass3_repeat = new THREE.TextureLoader();
    const grass3TextureRepeat = grass3_repeat.load('../lib/textures/spyro1Grass3.png');

    const floorTexture = new THREE.TextureLoader();
    const floorTexture1 = floorTexture.load('../lib/textures/spyro1Path0.png');

    // Water
    const water_repeat = new THREE.TextureLoader();
    const water1TextureRepeat_1 = water_repeat.load('../lib/textures/spyro1Water0.png');
    
    const water2_repeat = new THREE.TextureLoader();
    const water2TextureRepeat_1 = water2_repeat.load('../lib/textures/spyro1Water1.png');
    const water2TextureRepeat_2 = water2_repeat.load('../lib/textures/spyro1Water1.png');
    
    // Hedge
    const headge1_repeat = new THREE.TextureLoader();
    const headge1TextureRepeat_1 = headge1_repeat.load('../lib/textures/spyro1Hedge0.png');
    const headge1TextureRepeat_2 = headge1_repeat.load('../lib/textures/spyro1Hedge0.png');
    const headge1TextureRepeat_3 = headge1_repeat.load('../lib/textures/spyro1Hedge0.png');
    const headge1TextureRepeat_4 = headge1_repeat.load('../lib/textures/spyro1Hedge0.png');
    
    const headge2_repeat = new THREE.TextureLoader();
    const headge2TextureRepeat_1 = headge2_repeat.load('../lib/textures/spyro1Hedge1.png');
    const headge2TextureRepeat_2 = headge2_repeat.load('../lib/textures/spyro1Hedge1.png');
    const headge2TextureRepeat_3 = headge2_repeat.load('../lib/textures/spyro1Hedge1.png');
    const headge2TextureRepeat_4 = headge2_repeat.load('../lib/textures/spyro1Hedge1.png');

    const pillar_repeat = new THREE.TextureLoader();
    const pillar1TextureRepeat_1 = pillar_repeat.load('../lib/textures/spyro1Pillar.png')

    // Stone
    const stone1_repeat = new THREE.TextureLoader();
    const stone1TextureRepeat = stone1_repeat.load('../lib/textures/spyro1Stone1.png');
    
    const stone2_repeat = new THREE.TextureLoader();
    const stone2TextureRepeat = stone2_repeat.load('../lib/textures/spyro1stone2.png');
    
    // Cobble
    const cobble0_repeat = new THREE.TextureLoader();
    const cobble0TextureRepeat_1 = cobble0_repeat.load('../lib/textures/spyro1cobble0.png');
    const cobble0TextureRepeat_2 = cobble0_repeat.load('../lib/textures/spyro1cobble0.png');
    const cobble0TextureRepeat_3 = cobble0_repeat.load('../lib/textures/spyro1cobble0.png');
    const cobble0 = new THREE.TextureLoader();
    const cobble0Texture = cobble0.load('../lib/textures/spyro1cobble0.png');

    const cobble1_repeat = new THREE.TextureLoader();
    const cobble1TextureRepeat = cobble1_repeat.load('../lib/textures/spyro1cobble1.png');
    const cobble1TextureRepeat_2 = cobble1_repeat.load('../lib/textures/spyro1cobble1.png');

    const cobble2_repeat = new THREE.TextureLoader();
    const cobble2TextureRepeat_1 = cobble2_repeat.load('../lib/textures/spyro1cobble2.png');
    const cobble2TextureRepeat_2 = cobble2_repeat.load('../lib/textures/spyro1cobble2.png');
    const cobble2TextureRepeat_3 = cobble2_repeat.load('../lib/textures/spyro1cobble2.png');

    const cobble3_repeat = new THREE.TextureLoader();
    const cobble3TextureRepeat_1 = cobble3_repeat.load('../lib/textures/spyro1cobble3.png');
    const cobble3TextureRepeat_2 = cobble3_repeat.load('../lib/textures/spyro1cobble3.png');
    
    const cobble4_repeat = new THREE.TextureLoader();
    const cobble4TextureRepeat = cobble4_repeat.load('../lib/textures/spyro1cobble4.png');
    

    // Platform
    const platform0_repeat = new THREE.TextureLoader();
    const platform1TextureRepeat_1 = platform0_repeat.load('../lib/textures/spyro1platform1.png');

    const platform1_repeat = new THREE.TextureLoader();
    const platform2TextureRepeat_1 = platform1_repeat.load('../lib/textures/spyro1platform2.png');
    const platform2TextureRepeat_2 = platform1_repeat.load('../lib/textures/spyro1platform2.png');

    const platform2_repeat = new THREE.TextureLoader();
    const platform3TextureRepeat_1 = platform2_repeat.load('../lib/textures/spyro1platform3.png');

    const platform3_repeat = new THREE.TextureLoader();
    const platform4TextureRepeat_1 = platform3_repeat.load('../lib/textures/spyro1platform4.png');
    const platform4TextureRepeat_2 = platform3_repeat.load('../lib/textures/spyro1platform4.png');

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
    const tower3TextureRepeat_2 = tower3_repeat.load('../lib/textures/spyro1tower3.png');

    // Roof
    const roof_repeat = new THREE.TextureLoader();
    const roofTextureRepeat = roof_repeat.load('../lib/textures/spyro1roof1.png');
    
    const roof1_repeat = new THREE.TextureLoader();
    const roof1TextureRepeat = roof1_repeat.load('../lib/textures/spyro1roof2.png');
    
    const roof2_repeat = new THREE.TextureLoader();
    const roof2TextureRepeat = roof2_repeat.load('../lib/textures/spyro1roof3.png');

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

    // Helper Geometry Mesh Functions ===================================================

    // Create Floor Plane
    function getPlaneYLevel(x, z) { return Math.cos((1/10)*(x)) + Math.cos((1/10)*(z)); }
    function createFloor() {
        var floorPlane = new THREE.PlaneGeometry(100, 100, 10, 10);
        floorPlane.rotateX(-Math.PI/2);
        const planePosAttrib = floorPlane.getAttribute( 'position' );
        const planeVerts = new THREE.Vector3();

        let j = 0;
        for ( let i = 0; i < planePosAttrib.count; i ++ ) {
            planeVerts.fromBufferAttribute( planePosAttrib, i );
            if (i % 11 == 0) {
                j++;
            }
            if ((j <= 6) && (i % 11 >= 9 && i % 11 <= 10)) {
                planePosAttrib.setXYZ( i, planeVerts.x, planeVerts.y-1, planeVerts.z );
            } else {
                planePosAttrib.setXYZ( i, planeVerts.x, getPlaneYLevel(planeVerts.x, planeVerts.z), planeVerts.z );
            }
        }

        floorPlane.rotateX(Math.PI/2);
        floorPlane.computeVertexNormals();
        makeRepeatTexture(2, 2, floorPlane, floorTexture1, 0,0,20, -90,0,0, 0, true, 0, -0.01, 0);
    }

    // Create Castle
    function createCastle() {
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
    }

    // Create Portal Frame
    var portalLights = [];
    function createPortal(x, y, z, rX, rY, rZ, portalNumber) {
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
        portal1.computeVertexNormals();
        const piece1 = makeRepeatTexture(10, 2, portal1, portal1TextureRepeat, -2.25,0,0, 0,-45,0, 0, false);
        const piece2 = makeRepeatTexture(10, 2, portal1, portal1TextureRepeat, 2.25,0,0, 0,-45,0, 0, false);

        // Left Arch
        rectPrismMatrix.makeShear(0, 0.25, 0.25, -0.25, 0.25, 0);
        portal2a.applyMatrix4(rectPrismMatrix);
        portal2a.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.28, 0.25, -0.25, 0.28, 0);
        portal2b.applyMatrix4(rectPrismMatrix);
        portal2b.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.25, 0.25, -0.25, 0.25, 0);
        portal2c.applyMatrix4(rectPrismMatrix);
        portal2c.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.29, 0.25, -0.25, 0.29, 0);
        portal2d.applyMatrix4(rectPrismMatrix);
        portal2d.computeVertexNormals();
        
        const piece3 = makeRepeatTexture(8, 2, portal2a, portal3TextureRepeat_1, -1.94,2.625,0, 0,-45,0, 0, false);
        const piece4 = makeRepeatTexture(8, 2, portal2b, portal4TextureRepeat, -1.94,2.625,0, 0,-45,0, 0, false);
        const piece5 = makeRepeatTexture(8, 2, portal2c, portal3TextureRepeat_1, -0.98,3.5,0, -35,-30,-55, 0, false);
        const piece6 = makeRepeatTexture(8, 2, portal2c, portal3TextureRepeat_1, -0.98,3.5,0, -35,-30,-55, 0, false);
        const piece7 = makeRepeatTexture(8, 2, portal2d, portal4TextureRepeat, -0.98,3.5,0, -35,-30,-55, 0, false);

        // Right Arch
        rectPrismMatrix.makeShear(0, 0.25, -0.25, 0.25, 0.25, 0);
        portal3a.applyMatrix4(rectPrismMatrix);
        portal3a.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.28, -0.25, 0.25, 0.28, 0);
        portal3b.applyMatrix4(rectPrismMatrix);
        portal3b.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.25, -0.25, 0.25, 0.25, 0);
        portal3c.applyMatrix4(rectPrismMatrix);
        portal3c.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.29, -0.25, 0.25, 0.29, 0);
        portal3d.applyMatrix4(rectPrismMatrix);
        portal3d.computeVertexNormals();

        const piece8 = makeRepeatTexture(8, 2, portal3a, portal3TextureRepeat_1, 1.94,2.625,0, 0,-45,0, 0, false);
        const piece9 = makeRepeatTexture(8, 2, portal3b, portal4TextureRepeat, 1.94,2.625,0, 0,-45,0, 0, false);
        const piece10 = makeRepeatTexture(8, 2, portal3c, portal3TextureRepeat_1, 0.98,3.5,0, 35,-30,55, 0, false);
        const piece11 = makeRepeatTexture(8, 2, portal3d, portal4TextureRepeat, 0.98,3.5,0, 35,-30,55, 0, false);

        // Top Piece
        rectPrismMatrix.makeShear(0, 0.5, 0, 0, 0.5, 0);
        portal4a.applyMatrix4(rectPrismMatrix);
        portal4a.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.52, 0, 0, 0.52, 0);
        portal4b.applyMatrix4(rectPrismMatrix);
        portal4b.computeVertexNormals();
        rectPrismMatrix.makeShear(0, 0.51, 0, 0, 0.51, 0);
        portal4c.applyMatrix4(rectPrismMatrix);
        portal4c.computeVertexNormals();
        const piece12 = makeRepeatTexture(8, 2, portal4a, portal2TextureRepeat_1, 0,3.9,0, 180,-45,0, 0, false);
        const piece13 = makeRepeatTexture(8, 2, portal4b, portal5TextureRepeat, 0,3.9,0, 180,-45,0, 0, false);
        const piece14 = makeRepeatTexture(2, 2, portal4c, portal3TextureRepeat_2, 0,3.9,0, 180,-45,0, 0, false, 45, 0.8, 0);

        const lightPoint = new THREE.PointLight(0xFFFFFF, 50);
        portalLights.push(lightPoint);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);
        group.add(piece6);
        group.add(piece7);
        group.add(piece8);
        group.add(piece9);
        group.add(piece10);
        group.add(piece11);
        group.add(piece12);
        group.add(piece13);
        group.add(piece14);
        group.add(lightPoint);

        // Portal Dimension Plane
        const protal1geom = new THREE.PlaneGeometry(3.5, 5);
        const portal1Mat = new THREE.MeshPhongMaterial( {side: THREE.DoubleSide} );
        
        const portalDimension = new THREE.Mesh(protal1geom, portal1Mat);
        portalScenes[portalNumber].add(portalDimension);
        //portal1Scene.add(portalDimension);
        portalDimension.position.y = 0.8;
        portals.push(portalDimension);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        portalDimension.position.x = x;
        portalDimension.position.y = y+0.8;
        portalDimension.position.z = z;
        portalDimension.rotation.x = rX*(Math.PI/180); 
        portalDimension.rotation.y = rY*(Math.PI/180);
        portalDimension.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Gem (and their grouped pivot)
    var gems = [];
    var gemGroups = [];
    var gemDirections = [];
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
        //scene.add(gem);
        gems.push(gem);
        gemDirections.push(Math.floor(Math.random() * 2));
        
        // Change pivot point offset (allows point rotation)
        var group = new THREE.Group();
        group.position.set(gems[gems.length-1].position.x, gems[gems.length-1].position.y, gems[gems.length-1].position.z);
        group.add(gems[gems.length-1]);
        scene.add(group);
        
        gems[gems.length-1].position.set(gems[gems.length-1].position.x, gems[gems.length-1].position.y+0.2, gems[gems.length-1].position.z);
        
        group.position.set(group.position.x, group.position.y-0.2, group.position.z);
        gemGroups.push(group);
        group.rotation.x = rX*(Math.PI/180);
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        // Move Gem using input xyz
        gems[gems.length-1].position.x, gemGroups[gems.length-1].position.x = (x)+(-1*gemGroups[gems.length-1].position.x), (gems[gems.length-1].position.x);
        gems[gems.length-1].position.y, gemGroups[gems.length-1].position.y = (y)+(-1*gemGroups[gems.length-1].position.y), (gems[gems.length-1].position.y);
        gems[gems.length-1].position.z, gemGroups[gems.length-1].position.z = (z+20)+(-1*gemGroups[gems.length-1].position.z), (gems[gems.length-1].position.z+20);
        
        return gem;
    }
    function placeGemOnPlane(color, X, Z, yOffset) {
        createGem(color, X,getPlaneYLevel(X,Z)-yOffset,Z, 0,Math.floor(Math.random() * 360),45);
    }

    // Create Hill Corner Piece
    function createHillCorner(x, y, z, rX, rY, rZ) {
        var wall1aPlane = new THREE.PlaneGeometry(40, 4, 5, 5);
        var wall1bPlane = new THREE.PlaneGeometry(40, 10, 5, 5);
        wall1aPlane.rotateX(-Math.PI/2);
        wall1bPlane.rotateX(-Math.PI/2);
        const wall1aPosAttrib = wall1aPlane.getAttribute( 'position' );
        const wall1bPosAttrib = wall1bPlane.getAttribute( 'position' );
        const wall1aVerts = new THREE.Vector3();
        const wall1bVerts = new THREE.Vector3();
        
        for ( let i = 0; i < wall1aPosAttrib.count; i ++ ) {
            wall1aVerts.fromBufferAttribute( wall1aPosAttrib, i );
            wall1aPosAttrib.setXYZ( i, wall1aVerts.x, 1/30*wall1aVerts.x*wall1aVerts.x, wall1aVerts.z);
        }

        for (let i = 0; i < wall1bPosAttrib.count; i++) {
            wall1bVerts.fromBufferAttribute( wall1bPosAttrib, i );
            let hillHeight = (1)*Math.cos((2/7)*wall1bVerts.x);
            if ((i >= 0 && i <= 5) || (i >= 30 && i <= 35)) {
                wall1bPosAttrib.setXYZ( i, wall1bVerts.x, wall1bVerts.y + 3.25, wall1bVerts.z - (1/30)*wall1bVerts.x*wall1bVerts.x);
            }
            else {
                wall1bPosAttrib.setXYZ( i, wall1bVerts.x, hillHeight + (1/10)*wall1bVerts.z*wall1bVerts.z, wall1bVerts.z - (1/30)*wall1bVerts.x*wall1bVerts.x );
            }
        }

        wall1aPlane.rotateX(Math.PI/2);
        wall1aPlane.computeVertexNormals();
        wall1bPlane.rotateX(Math.PI/2);
        wall1bPlane.computeVertexNormals();

        const piece1 = makeRepeatTexture(20, 2, wall1aPlane, stone1TextureRepeat, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(25, 2, wall1aPlane, grass2TextureRepeat, 0,4,0, 0,0,0, 0, false);
        const piece3 = makeRepeatTexture(20, 4, wall1bPlane, grass3TextureRepeat, 0,9.25,-5, 90,0,0, 0, false);
        const piece4 = makeRepeatTexture(20, 2, wall1aPlane, stone1TextureRepeat, 0,0,-10, 0,0,0, 0, false);
        const piece5 = makeRepeatTexture(25, 2, wall1aPlane, grass2TextureRepeat, 0,4,-10, 0,0,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Hill Side Piece
    function createHillSide(x, y, z, rX, rY, rZ) {
        var wall1aPlane = new THREE.PlaneGeometry(43, 4, 5, 5);
        var wall1bPlane = new THREE.PlaneGeometry(43, 7.06, 5, 5);
        var wall1cPlane = new THREE.PlaneGeometry(57, 4, 5, 5);
        wall1aPlane.rotateX(-Math.PI/2);
        wall1bPlane.rotateX(-Math.PI/2);
        wall1cPlane.rotateX(-Math.PI/2);
        const wall1aPosAttrib = wall1aPlane.getAttribute( 'position' );
        const wall1bPosAttrib = wall1bPlane.getAttribute( 'position' );
        const wall1cPosAttrib = wall1cPlane.getAttribute( 'position' );
        const wall1aVerts = new THREE.Vector3();
        const wall1bVerts = new THREE.Vector3();
        const wall1cVerts = new THREE.Vector3();
        
        for ( let i = 0; i < wall1aPosAttrib.count; i ++ ) {
            wall1aVerts.fromBufferAttribute( wall1aPosAttrib, i );
            wall1aPosAttrib.setXYZ( i, wall1aVerts.x, wall1aVerts.y, wall1aVerts.z);
        }

        let j = 0;
        let xOffset = 0;
        for (let i = 0; i < wall1bPosAttrib.count; i++) {
            wall1bVerts.fromBufferAttribute( wall1bPosAttrib, i );
            let hillHeight = (1)*Math.cos((2/7.5)*wall1bVerts.x);

            if (i % 6 == 0 && i != 0) {
                j++;
            }
            if (i % 6 < 3) {
                xOffset = j*-1;
            }
            else {
                xOffset = j;
            }
            
            if ((i >= 0 && i <= 5) || (i >= 30 && i <= 35)) {
                wall1bPosAttrib.setXYZ( i, wall1bVerts.x + 1.4*xOffset, wall1bVerts.y + 3.25, wall1bVerts.z);
            }
            else {
                wall1bPosAttrib.setXYZ( i, wall1bVerts.x + 1.4*xOffset, hillHeight + (1/5)*wall1bVerts.z*wall1bVerts.z, wall1bVerts.z);
            }
        }

        for ( let i = 0; i < wall1cPosAttrib.count; i ++ ) {
            wall1cVerts.fromBufferAttribute( wall1cPosAttrib, i );
            wall1cPosAttrib.setXYZ( i, wall1cVerts.x, wall1cVerts.y, wall1cVerts.z);
        }

        wall1aPlane.rotateX(Math.PI/2);
        wall1aPlane.computeVertexNormals();
        wall1bPlane.rotateX(Math.PI/2);
        wall1bPlane.computeVertexNormals();
        wall1cPlane.rotateX(Math.PI/2);
        wall1cPlane.computeVertexNormals();

        const piece1 = makeRepeatTexture(20, 2, wall1aPlane, stone1TextureRepeat, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(25, 2, wall1aPlane, grass2TextureRepeat, 0,4,0, 0,0,0, 0, false);
        const piece3 = makeRepeatTexture(20, 4, wall1bPlane, grass3TextureRepeat, 0,9.25,-3.53, 90,0,0, 0, false);
        const piece4 = makeRepeatTexture(20, 2, wall1cPlane, stone1TextureRepeat, 0,0,-7.06, 0,0,0, 0, false);
        const piece5 = makeRepeatTexture(25, 2, wall1cPlane, grass2TextureRepeat, 0,4,-7.06, 0,0,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Grass Planes
    function createGrassPlane1(x, y, z, rX, rY, rZ, sX, sY, sZ) {
        var grassPlane = new THREE.CylinderGeometry(0, 1, 0.1, 3, 1, false, 0, Math.PI);

        const piece1 = makeRepeatTexture(4, 4, grassPlane, grass1TextureRepeat_2, 0,0,0, 0,0,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);
        group.scale.x = sX;
        group.scale.y = sY;
        group.scale.z = sZ;

        scene.add(group);
    }
    function createGrassPlane2(x, y, z, rX, rY, rZ, sX, sY, sZ) {
        var grassPlane = new THREE.CylinderGeometry(0, 1, 0.1, 2, 1, false, 0, Math.PI);

        const piece1 = makeRepeatTexture(4, 4, grassPlane, grass1TextureRepeat_2, 0,0,0, 0,0,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);
        group.scale.x = sX;
        group.scale.y = sY;
        group.scale.z = sZ;

        scene.add(group);
    }
    function createGrassPlane3(x, y, z, rX, rY, rZ, sX, sY, sZ) {
        var grassPlane = new THREE.PlaneGeometry(10, 10, 4, 4);
        const piece1 = makeRepeatTexture(4, 4, grassPlane, grass1TextureRepeat_2, 0,0,0, 0,0,0, 0, false);
        const group = new THREE.Group();
        group.add(piece1);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);
        group.scale.x = sX;
        group.scale.y = sY;
        group.scale.z = sZ;

        scene.add(group);
    }

    // Create Hedges
    function createHedgeCurve1(x, y, z, rX, rY, rZ) {
        var wall1Plane = new THREE.PlaneGeometry(20, 4, 5, 5);
        var wall1bPlane = new THREE.PlaneGeometry(20, 3, 5, 5);
        wall1Plane.rotateX(-Math.PI/2);
        wall1bPlane.rotateX(-Math.PI/2);
        const wall1PosAttrib = wall1Plane.getAttribute( 'position' );
        const wall1bPosAttrib = wall1bPlane.getAttribute( 'position' );
        const wall1Verts = new THREE.Vector3();
        const wall1bVerts = new THREE.Vector3();
        
        for ( let i = 0; i < wall1PosAttrib.count; i ++ ) {
            wall1Verts.fromBufferAttribute( wall1PosAttrib, i );
            if (i >= 0 && i <= 5) {
                wall1PosAttrib.setXYZ( i, wall1Verts.x, 1/15*wall1Verts.x*wall1Verts.x, wall1Verts.z + (1/2)*Math.cos(10*wall1Verts.x));
            }
            else {
                wall1PosAttrib.setXYZ( i, wall1Verts.x, 1/15*wall1Verts.x*wall1Verts.x, wall1Verts.z);
            }
        }

        for (let i = 0; i < wall1bPosAttrib.count; i++) {
            wall1bVerts.fromBufferAttribute( wall1bPosAttrib, i );
            wall1bPosAttrib.setXYZ( i, wall1bVerts.x, wall1bVerts.y + (1/2)*Math.cos(10*wall1bVerts.x), wall1bVerts.z - (1/15)*wall1bVerts.x*wall1bVerts.x);
        }

        wall1Plane.rotateX(Math.PI/2);
        wall1Plane.computeVertexNormals();
        wall1bPlane.rotateX(Math.PI/2);
        wall1bPlane.computeVertexNormals();

        const piece1 = makeRepeatTexture(10, 2, wall1Plane, headge1TextureRepeat_1, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(25, 2, wall1bPlane, headge2TextureRepeat_1, 0,2,-1.5, 90,0,0, 0, false);
        const piece3 = makeRepeatTexture(10, 2, wall1Plane, headge1TextureRepeat_1, 0,0,-3, 0,0,0, 0, false);

        var wall2Plane = new THREE.PlaneGeometry(4, 4, 1, 1);
        const piece4 = makeRepeatTexture(2, 2, wall2Plane, headge1TextureRepeat_2, -11,-0.425,5.4, 0,60,0, 0, false);
        const piece5 = makeRepeatTexture(2, 2, wall2Plane, headge1TextureRepeat_2, 11,-0.425,5.4, 0,-60,0, 0, false);
        var wall3Plane = new THREE.PlaneGeometry(4, 1.75, 1, 1);
        const piece6 = makeRepeatTexture(2, 2, wall3Plane, headge2TextureRepeat_2, -10.225,1.575,5.8, 90,0,-60, 0, false);
        const piece7 = makeRepeatTexture(2, 2, wall3Plane, headge2TextureRepeat_2, 10.225,1.575,5.8, 90,0,60, 0, false);
        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);
        group.add(piece6);
        group.add(piece7);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }
    function createHedgeCurve2(x, y, z, rX, rY, rZ) {
        var wall1Plane = new THREE.PlaneGeometry(6, 3.5, 2, 2);
        var wall1bPlane = new THREE.PlaneGeometry(6, 2, 2, 2);
        wall1Plane.rotateX(-Math.PI/2);
        wall1bPlane.rotateX(-Math.PI/2);
        const wall1PosAttrib = wall1Plane.getAttribute( 'position' );
        const wall1bPosAttrib = wall1bPlane.getAttribute( 'position' );
        const wall1Verts = new THREE.Vector3();
        const wall1bVerts = new THREE.Vector3();
        
        for ( let i = 0; i < wall1PosAttrib.count; i ++ ) {
            wall1Verts.fromBufferAttribute( wall1PosAttrib, i );
            if (i >= 0 && i <= 5) {
                wall1PosAttrib.setXYZ( i, wall1Verts.x, 1/15*wall1Verts.x*wall1Verts.x, wall1Verts.z + -(1/2)*Math.cos(10*wall1Verts.x));
            }
            else {
                wall1PosAttrib.setXYZ( i, wall1Verts.x, 1/15*wall1Verts.x*wall1Verts.x, wall1Verts.z);
            }
        }

        for (let i = 0; i < wall1bPosAttrib.count; i++) {
            wall1bVerts.fromBufferAttribute( wall1bPosAttrib, i );
            wall1bPosAttrib.setXYZ( i, wall1bVerts.x, wall1bVerts.y - (1/2)*Math.cos(10*wall1bVerts.x), wall1bVerts.z - (1/15)*wall1bVerts.x*wall1bVerts.x);
        }

        wall1Plane.rotateX(Math.PI/2);
        wall1Plane.computeVertexNormals();
        wall1bPlane.rotateX(Math.PI/2);
        wall1bPlane.computeVertexNormals();

        const piece1 = makeRepeatTexture(4, 2, wall1Plane, headge1TextureRepeat_4, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(4, 2, wall1bPlane, headge2TextureRepeat_4, 0,1.75,-1, 90,0,0, 0, false);
        const piece3 = makeRepeatTexture(4, 2, wall1Plane, headge1TextureRepeat_4, 0,0,-2, 0,0,0, 0, false);
        var wall3Plane = new THREE.PlaneGeometry(2, 3.65, 3, 3);
        const piece4 = makeRepeatTexture(2, 2, wall3Plane, headge1TextureRepeat_2, -3,0,-0.4, 0,90,0, 0, false);
        const piece5 = makeRepeatTexture(2, 2, wall3Plane, headge1TextureRepeat_2, 3,0,-0.4, 0,90,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }
    function createHedgeStraight(x, y, z, rX, rY, rZ) {
        var wall1Plane = new THREE.PlaneGeometry(10, 4, 3, 3);
        var wall1bPlane = new THREE.PlaneGeometry(10, 3, 3, 3);
        wall1Plane.rotateX(-Math.PI/2);
        wall1bPlane.rotateX(-Math.PI/2);
        const wall1PosAttrib = wall1Plane.getAttribute( 'position' );
        const wall1bPosAttrib = wall1bPlane.getAttribute( 'position' );
        const wall1Verts = new THREE.Vector3();
        const wall1bVerts = new THREE.Vector3();
        
        for ( let i = 0; i < wall1PosAttrib.count; i ++ ) {
            wall1Verts.fromBufferAttribute( wall1PosAttrib, i );
            if (i >= 0 && i <= 5) {
                wall1PosAttrib.setXYZ( i, wall1Verts.x, wall1Verts.y, wall1Verts.z + (1/2)*Math.sin(5*wall1Verts.x));
            }
            else {
                wall1PosAttrib.setXYZ( i, wall1Verts.x, wall1Verts.y, wall1Verts.z);
            }
        }

        for (let i = 0; i < wall1bPosAttrib.count; i++) {
            wall1bVerts.fromBufferAttribute( wall1bPosAttrib, i );
            wall1bPosAttrib.setXYZ( i, wall1bVerts.x, wall1bVerts.y + (1/2)*Math.sin(5*wall1bVerts.x), wall1bVerts.z);
        }

        wall1Plane.rotateX(Math.PI/2);
        wall1Plane.computeVertexNormals();
        wall1bPlane.rotateX(Math.PI/2);
        wall1bPlane.computeVertexNormals();

        const piece1 = makeRepeatTexture(6, 2, wall1Plane, headge1TextureRepeat_3, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(7.5, 2, wall1bPlane, headge2TextureRepeat_3, 0,2,-1.5, 90,0,0, 0, false);
        const piece3 = makeRepeatTexture(6, 2, wall1Plane, headge1TextureRepeat_3, 0,0,-3, 0,0,0, 0, false);
        var wall3Plane = new THREE.PlaneGeometry(3, 3.89, 3, 3);
        const piece4 = makeRepeatTexture(2, 2, wall3Plane, headge1TextureRepeat_2, -5,0,-1.5, 0,90,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }
    function createHedgePillar(x, y, z, rX, rY, rZ) {
        var pillar1 = new THREE.CylinderGeometry(1.75, 1.5, 4, 5, 2, true, 0, 2*Math.PI);
        var pillar2 = new THREE.CylinderGeometry(0, 1.75, 0.5, 5, 2, true, 0, 2*Math.PI);
        var pillar3 = new THREE.CylinderGeometry(1.75, 0, 0.5, 3, 2, true, 0, 2*Math.PI);
        var pillar4 = new THREE.CylinderGeometry(1.75, 0, 1, 3, 2, true, 0, 2*Math.PI);
        const piece1 = makeRepeatTexture(10,2, pillar1, pillar1TextureRepeat_1, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(10,2, pillar2, tower0TextureRepeat, 0,2.25,0, 0,0,0, 0, false);
        const piece3 = makeRepeatTexture(2,2, pillar3, roof2TextureRepeat, 0,2.75,0, 0,0,0, 0, false);
        const piece4 = makeRepeatTexture(2,2, pillar4, roof2TextureRepeat, 0,3.5,0, 0,0,180, 0, false);
        
        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Gate
    function createTower(x, y, z, rX, rY, rZ) {
        var tower1 = new THREE.CylinderGeometry(2, 2.5, 3, 5, 1, true, 0, 2*Math.PI);
        var tower3 = new THREE.CylinderGeometry(1.8, 2, 2, 5, 1, true, 0, 2*Math.PI);
        var tower4 = new THREE.CylinderGeometry(2, 1.8, 3, 5, 1, true, 0, 2*Math.PI);
        var tower5 = new THREE.CylinderGeometry(0, 2, 4, 5, 1, true, 0, 2*Math.PI);
        const piece1 = makeRepeatTexture(10, 2, tower1, tower1TextureRepeat_1, 0,0,0, 0,0,0, 0);
        const piece2 = makeRepeatTexture(4, 2, tower3, tower3TextureRepeat_2, 0,2.5,0, 0,0,0, 0);
        const piece3 = makeRepeatTexture(10, 2, tower4, tower2TextureRepeat, 0,5,0, 0,0,0, 0);
        const piece4 = makeRepeatTexture(10, 2, tower5, roofTextureRepeat, 0,8.5,0, 0,0,0, 0);
        
        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }
    function createWall(x, y, z, rX, rY, rZ) {
        var wall1aPlane = new THREE.PlaneGeometry(10, 2, 5, 5);
        var wall1bPlane = new THREE.PlaneGeometry(10, 1.5, 5, 5);
        var wall1cPlane = new THREE.PlaneGeometry(10, 2, 5, 5);
        var wall1dPlane = new THREE.PlaneGeometry(10, 3, 5, 5);
        wall1aPlane.rotateX(-Math.PI/2);
        wall1bPlane.rotateX(-Math.PI/2);
        wall1cPlane.rotateX(-Math.PI/2);
        wall1dPlane.rotateX(-Math.PI/2);
        const wall1aPosAttrib = wall1aPlane.getAttribute( 'position' );
        const wall1bPosAttrib = wall1bPlane.getAttribute( 'position' );
        const wall1cPosAttrib = wall1cPlane.getAttribute( 'position' );
        const wall1dPosAttrib = wall1dPlane.getAttribute( 'position' );
        const wall1aVerts = new THREE.Vector3();
        const wall1bVerts = new THREE.Vector3();
        const wall1cVerts = new THREE.Vector3();
        const wall1dVerts = new THREE.Vector3();
        
        for ( let i = 0; i < wall1aPosAttrib.count; i ++ ) {
            wall1aVerts.fromBufferAttribute( wall1aPosAttrib, i );
            wall1aPosAttrib.setXYZ( i, wall1aVerts.x, wall1aVerts.y, wall1aVerts.z);
        }
        
        for ( let i = 0; i < wall1dPosAttrib.count; i ++ ) {
            wall1dVerts.fromBufferAttribute( wall1dPosAttrib, i );
            if ((i >= 0 && i <= 5)) {
                wall1dPosAttrib.setXYZ( i, wall1dVerts.x, wall1dVerts.y, wall1dVerts.z + (1/3)*Math.cos((1/2)*wall1dVerts.x));
            }
            else {
                wall1dPosAttrib.setXYZ( i, wall1dVerts.x, wall1dVerts.y, wall1dVerts.z);
            }
        }

        for ( let i = 0; i < wall1cPosAttrib.count; i ++ ) {
            wall1cVerts.fromBufferAttribute( wall1cPosAttrib, i );
            wall1cPosAttrib.setXYZ( i, wall1cVerts.x, wall1cVerts.y, wall1cVerts.z + (1/3)*Math.cos((1/2)*wall1cVerts.x));

        }
        
        for (let i = 0; i < wall1bPosAttrib.count; i++) {
            wall1bVerts.fromBufferAttribute( wall1bPosAttrib, i );
            wall1bPosAttrib.setXYZ( i, wall1bVerts.x, wall1bVerts.y + (1/3)*Math.cos((1/2)*wall1bVerts.x), wall1bVerts.z);
        }

        wall1aPlane.rotateX(Math.PI/2);
        wall1aPlane.computeVertexNormals();
        wall1bPlane.rotateX(Math.PI/2);
        wall1bPlane.computeVertexNormals();
        wall1cPlane.rotateX(Math.PI/2);
        wall1cPlane.computeVertexNormals();
        wall1dPlane.rotateX(Math.PI/2);
        wall1dPlane.computeVertexNormals();

        const piece1 = makeRepeatTexture(10, 2, wall1aPlane, cobble1TextureRepeat_2, 0,0,0, 0,0,0, 0, false);
        const piece2 = makeRepeatTexture(10, 2, wall1dPlane, cobble0TextureRepeat_3, 0,2.5,0, 0,0,0, 0, false);
        const piece3 = makeRepeatTexture(10, 2, wall1cPlane, cobble2TextureRepeat_3, 0,5,0, 0,0,0, 0, false);
        const piece4 = makeRepeatTexture(10, 2, wall1bPlane, cobble0TextureRepeat_3, 0,6,-0.75, 90,0,0, 0, false);
        const piece5 = makeRepeatTexture(10, 2, wall1aPlane, cobble1TextureRepeat_2, 0,0,-1.5, 0,0,0, 0, false);
        const piece6 = makeRepeatTexture(10, 2, wall1dPlane, cobble0TextureRepeat_3, 0,2.5,-1.5, 0,0,0, 0, false);
        const piece7 = makeRepeatTexture(10, 2, wall1cPlane, cobble2TextureRepeat_3, 0,5,-1.5, 0,0,0, 0, false);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);
        group.add(piece6);
        group.add(piece7);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Platform
    function createTowerPlatform(x, y, z, rX, rY, rZ) {
        var tower1 = new THREE.CylinderGeometry(2, 2.5, 3, 5, 1, true, 0, 2*Math.PI);
        var tower2 = new THREE.CylinderGeometry(1.9, 2, 3, 5, 1, true, 0, 2*Math.PI);
        var tower3 = new THREE.CylinderGeometry(0, 1.9, 1, 5, 1, true, 0, 2*Math.PI);
        const piece1 = makeRepeatTexture(10, 2, tower1, tower1TextureRepeat_1, 0,0,0, 0,0,0, 0);
        const piece2 = makeRepeatTexture(10, 2, tower2, tower2TextureRepeat, 0,2.5,0, 0,0,0, 0);
        const piece3 = makeRepeatTexture(10, 2, tower3, roofTextureRepeat, 0,4.5,0, 0,0,0, 0);
        
        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }
    function createPlatform(x, y, z, rX, rY, rZ) {
        var platform1 = new THREE.CylinderGeometry(4, 5, 1.5, 10, 1, true, 0, 2*Math.PI);
        var platform2 = new THREE.CylinderGeometry(3.65, 4, 0.5, 10, 1, true, 0, 2*Math.PI);
        var platform3 = new THREE.CylinderGeometry(3.4, 3.65, 0.3, 10, 1, true, 0, 2*Math.PI);
        var platform4 = new THREE.CylinderGeometry(3.3, 3.4, 0.1, 10, 1, true, 0, 2*Math.PI);
        var platform5 = new THREE.CylinderGeometry(0, 3.3, 0.1, 10, 1, true, 0, 2*Math.PI);
        const piece1 = makeRepeatTexture(20, 2, platform1, platform1TextureRepeat_1, 0,0,0, 0,0,0, 0);
        const piece2 = makeRepeatTexture(20, 2, platform2, platform2TextureRepeat_1, 0,1,0, 0,0,0, 0);
        const piece3 = makeRepeatTexture(40, 2, platform3, tower0TextureRepeat, 0,1.4,0, 0,0,0, 0);
        const piece4 = makeRepeatTexture(40, 2, platform4, platform3TextureRepeat_1, 0,1.6,0, 0,0,0, 0);
        const piece5 = makeRepeatTexture(20, 2, platform5, platform4TextureRepeat_1, 0,1.7,0, 0,0,0, 0);

        var platform6 = new THREE.PlaneGeometry(10, 2.4, 2, 2);
        var platform7 = new THREE.PlaneGeometry(10, 5, 2, 2);
        const piece6 = makeRepeatTexture(20, 2, platform6, platform1TextureRepeat_1, 0,0.45,-1.5, 0,0,0, 0, false);
        const piece7 = makeRepeatTexture(4, 4, platform7, platform4TextureRepeat_2, 0,1.65,-4, 90,0,0, 0, false);
        
        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);
        group.add(piece6);
        group.add(piece7);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Water Fountain
    var waterFalls = [];
    function createFountainFrame(x, y, z, rX, rY, rZ) {
        var frame1 = new THREE.PlaneGeometry(50, 1, 100, 100);
        var frame2 = new THREE.PlaneGeometry(50, 0.85, 100, 100);
        var frame2a = new THREE.PlaneGeometry(20, 0.85, 100, 100);
        var frame3 = new THREE.PlaneGeometry(50, 1, 100, 100);
        var frame4 = new THREE.PlaneGeometry(50, 1, 100, 100);
        frame1.rotateX(-Math.PI/2);
        frame2.rotateX(-Math.PI/2);
        frame2a.rotateX(-Math.PI/2);
        frame3.rotateX(-Math.PI/2);
        frame4.rotateX(-Math.PI/2);
        const frame1PosAttrib = frame1.getAttribute( 'position' );
        const frame2PosAttrib = frame2.getAttribute( 'position' );
        const frame2aPosAttrib = frame2a.getAttribute( 'position' );
        const frame3PosAttrib = frame3.getAttribute( 'position' );
        const frame4PosAttrib = frame4.getAttribute( 'position' );
        const frame1Verts = new THREE.Vector3();
        const frame2Verts = new THREE.Vector3();
        const frame2aVerts = new THREE.Vector3();
        const frame3Verts = new THREE.Vector3();
        const frame4Verts = new THREE.Vector3();
        
        for ( let i = 0; i < frame1PosAttrib.count; i ++ ) {
            frame1Verts.fromBufferAttribute( frame1PosAttrib, i );
            frame1PosAttrib.setXYZ( i, frame1Verts.x, Math.sqrt(250 - (1/1)*(frame1Verts.x*frame1Verts.x)), frame1Verts.z);
        }

        for (let i = 0; i < frame2PosAttrib.count; i++) {
            frame2Verts.fromBufferAttribute( frame2PosAttrib, i );
            frame2PosAttrib.setXYZ( i, frame2Verts.x, frame2Verts.y, frame2Verts.z + Math.sqrt(237.3 - (1/1)*(frame2Verts.x*frame2Verts.x)));
        }
        for (let i = 0; i < frame2aPosAttrib.count; i++) {
            frame2aVerts.fromBufferAttribute( frame2aPosAttrib, i );
            frame2aPosAttrib.setXYZ( i, frame2aVerts.x, frame2aVerts.y, frame2aVerts.z + Math.sqrt(237.3 - (1/1)*(frame2aVerts.x*frame2aVerts.x)));
        }

        for ( let i = 0; i < frame3PosAttrib.count; i ++ ) {
            frame3Verts.fromBufferAttribute( frame3PosAttrib, i );
            frame3PosAttrib.setXYZ( i, frame3Verts.x, Math.sqrt(225 - (1/1)*(frame3Verts.x*frame3Verts.x)), frame3Verts.z);
        }
        
        for ( let i = 0; i < frame4PosAttrib.count; i ++ ) {
            frame4Verts.fromBufferAttribute( frame4PosAttrib, i );
            frame4PosAttrib.setXYZ( i, frame4Verts.x, Math.sqrt(80 - (1/1)*(frame4Verts.x*frame4Verts.x)), frame4Verts.z);
        }

        frame1.rotateX(Math.PI/2);
        frame1.computeVertexNormals();
        frame2.rotateX(Math.PI/2);
        frame2.computeVertexNormals();
        frame2a.rotateX(Math.PI/2);
        frame2a.computeVertexNormals();
        frame3.rotateX(Math.PI/2);
        frame3.computeVertexNormals();
        frame4.rotateX(Math.PI/2);
        frame4.computeVertexNormals();

        const piece1 = makeRepeatTexture(40, 2, frame1, platform2TextureRepeat_1, 0,0,0, 0,0,0, 0, false);
        const piece2a = makeRepeatTexture(40, 2, frame2, tower0TextureRepeat, 0,0.49,0, -90,0,50, 0, false);
        const piece2b = makeRepeatTexture(40, 2, frame2a, tower0TextureRepeat, 0,0.49,0, -90,0,-50, 0, false);
        const piece2c = makeRepeatTexture(40, 2, frame2, tower0TextureRepeat, 0,0.5,0, -90,0,0, 0, false);
        const piece3 = makeRepeatTexture(40, 2, frame3, platform2TextureRepeat_1, 0,0,0, 0,0,0, 0, false);
        const piece4 = makeRepeatTexture(40, 2, frame4, platform2TextureRepeat_1, 0,0,0, 0,0,0, 0, false);

        var floorPlatform = new THREE.CylinderGeometry(0, 8.943, 0.01, 100, 1, true, 0, Math.PI);
        const piece5 = makeRepeatTexture(8, 2, floorPlatform, grass1TextureRepeat_3, 0,0.5,0, 0,-90,0, 0);
        
        var water1 = new THREE.CylinderGeometry(0, 15, 0.01, 100, 1, true, 0, Math.PI);
        const piece6 = makeRepeatTexture(40, 4, water1, water1TextureRepeat_1, 0,0.2,0, 0,-90,0, 0);

        var water2 = new THREE.PlaneGeometry(18, 2.5, 100, 100);
        water2.rotateX(-Math.PI/2);
        const water2PosAttrib = water2.getAttribute( 'position' );
        const water2Verts = new THREE.Vector3();
        for ( let i = 0; i < water2PosAttrib.count; i ++ ) {
            water2Verts.fromBufferAttribute( water2PosAttrib, i );
            water2PosAttrib.setXYZ( i, water2Verts.x, (1)*Math.sqrt(140 - (water2Verts.x*water2Verts.x)), water2Verts.z);
        }

        water2.rotateX(Math.PI/2);
        water2.computeVertexNormals();

        const piece7 = makeRepeatTexture(2, 20, water2, water2TextureRepeat_1, 10,1.65,-4, 0,0,90, 0, false, 90);
        const piece8 = makeRepeatTexture(2, 20, water2, water2TextureRepeat_2, 8,1.65,-4, 0,0,90, 0, false, 270);
        const piece9 = makeRepeatTexture(2, 20, water2, water2TextureRepeat_1, -8,1.65,-4, 0,0,90, 0, false, 90);
        const piece10 = makeRepeatTexture(2, 20, water2, water2TextureRepeat_2, -10,1.65,-4, 0,0,90, 0, false, 270);
        waterFalls.push(piece7);
        waterFalls.push(piece9);
        waterFalls.push(piece8);
        waterFalls.push(piece10);

        const group = new THREE.Group();
        group.add(piece1);
        group.add(piece2a);
        group.add(piece2b);
        group.add(piece2c);
        group.add(piece3);
        group.add(piece4);
        group.add(piece5);
        group.add(piece6);
        group.add(piece7);
        group.add(piece8);
        group.add(piece9);
        group.add(piece10);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);

        scene.add(group);
    }

    // Create Mountain
    function createMountain(x, y, z, rX, rY, rZ, sX, sY, sZ) {
        var mountain1 = new THREE.CylinderGeometry(0.2, 0, 0.4, 10, 1, true, 0, 2*Math.PI);
        var mountain2 = new THREE.CylinderGeometry(0.4, 0.2, 0.2, 10, 1, true, 0, 2*Math.PI);
        mountain2.translate(0, 0.3, 0);
        var mountain3 = new THREE.CylinderGeometry(0.7, 0.4, 0.2, 10, 1, true, 0, 2*Math.PI);
        mountain3.translate(0, 0.5, 0);

        var finalMesh = BufferGeometryUtils.mergeGeometries([mountain1, mountain2, mountain3]);
        const piece1 = makeRepeatTexture(6, 2, finalMesh, stone2TextureRepeat, 0,0,0, 180,0,0, 0);

        var group = new THREE.Group();
        group.add(piece1);

        group.position.x = x;
        group.position.y = y;
        group.position.z = z;
        group.rotation.x = rX*(Math.PI/180); 
        group.rotation.y = rY*(Math.PI/180);
        group.rotation.z = rZ*(Math.PI/180);
        group.scale.x = sX;
        group.scale.y = sY;
        group.scale.z = sZ;

        scene.add(group);
    }

    // Geometries / Meshes ==============================================================

    // Simple Geometry for cube
    //THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    //const geometryBox = new THREE.BoxGeometry(1, 1, 1);

    // Geometry for Sphere
    // THREE.SphereGeometry(sphRadius, sphWidthSegments, sphHeightSegments, sphPhiStart, sphPhiLength, sphThetaStart, sphThetaLength);
    //const geometrySphere = new THREE.SphereGeometry(1, 6, 8, 0, 2*Math.PI, 0, 2*Math.PI);

    // Geometry for Cone
    // THREE.CylinderGeometry(cylRadiusTop, cylRadiusBottom, cylHeight, cylRadialSegments, cylHeightSegments, cylOpenEnded, cylThetaStart, cylThetaLength);
    //const geometryCylinder = new THREE.CylinderGeometry(0.75, 0.75, 0.75, 8, 1, false, 0, 2*Math.PI);

    // Floor Plane   
    createFloor();

    // Hills //

    // Corner Walls
    createHillCorner(-45,1,-25, 0,45,0);
    createHillCorner(-45,1,65, 0,135,0);
    createHillCorner(45,1,-25, 0,-45,0);
    createHillCorner(45,1,65, 0,-135,0);

    // Side Walls
    createHillSide(-49.725,1,20, 0,90,0);
    createHillSide(0,1,-29.725, 0,0,0);
    createHillSide(49.725,1,20, 0,-90,0);
    createHillSide(0,1,69.725, 0,180,0);

    // Island Bottom
    createMountain(0,-67,20, 180,0,0, 110,110,110);
    createMountain(20,-39,40, 180,0,0, 50,50,50);
    createMountain(-20,-37,-5, 180,0,0, 50,50,50);
    createMountain(-20,-70,20, 180,0,0, 15,60,15);
    createMountain(20,-56,-10, 180,0,0, 25,70,25);

    // Outer Grass
    createGrassPlane1(54.35,0,20, 0,0,0, 21.8,20,47.7);
    createGrassPlane1(-54.35,0,20, 0,180,0, 21.8,20,47.7);

    createGrassPlane2(0,-0.95,-42.25, 0,90,0, 14.75,1,45.4);
    createGrassPlane2(0,-0.95,82.25, 0,270,0, 14.75,1,45.4);
    
    createGrassPlane3(0,-1,77.25, 90,0,0, 9.05,1,1);
    createGrassPlane3(0,-1,-37.25, 90,0,0, 9.05,1,1);

    createGrassPlane3(55.2,-1.01,60.2, 90,0,126, 4.75,1,0.5);
    createGrassPlane3(-55.2,-1.01,60.2, 90,0,54, 4.75,1,0.5);
    createGrassPlane3(-55.2,-1.01,-20.2, 90,0,126, 4.75,1,0.5);
    createGrassPlane3(55.2,-1.01,-20.2, 90,0,54, 4.75,1,0.5);

    // Hedges //
    createHedgeCurve1(30,1,31, 0,0,0);
    createHedgeCurve1(30,0.4,54, 0,180,0);
    createHedgeStraight(45,0.65,39.5, 0,0,0);
    createHedgeStraight(45,0,48.5, 0,0,0);
    createHedgeCurve2(30,0.5,37, 0,0,0);
    createHedgeCurve2(30,-0.1,48, 0,180,0);
    createHedgeCurve2(36,0,42.5, 0,270,0);
    createHedgeCurve2(24,0,42.5, 0,90,0);
    createHedgePillar(19,1,38, 0,45,0);
    createHedgePillar(19,0.6,47, 0,0,0);
    createTower(51,6,42.5, 0,15,0);
    createTowerPlatform(52,7.5,47, 0,17,0);

    // Front Gate //
    createTower(6,2,69, 0,90,0);
    createTower(-6,2,69, 0,90,0);
    createWall(0,1,70.5, 0,0,0);

    // Platform //
    createTowerPlatform(-48,2,25, 0,0,0);
    createTowerPlatform(-48,2,15, 0,45,0);
    createPlatform(-45,1.25,20, 0,90,0);

    // Water Fountain //
    createFountainFrame(55.1,-1,-5, 0,-90,0);

    // Castle //
    createCastle();

    // Portal Frames
    createPortal(0,2.2,0, 0,0,0, 0);
    createPortal(-25,-0.1,50, 0,135,0, 1);
    createPortal(0,2.2,68.9, 0,0,0, 2);
    createPortal(49,1,42.5, 0,90,0, 3);
    createPortal(49.5,1,-5, 0,90,0, 4);
    

    // Gem Objects
    var red = 0xff0000;
    var green = 0x0d960d;
    var blue = 0x020cb0;
    var yellow = 0xc9c000;
    var purple = 0xd827d0;

    var gemMap = [
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[yellow,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,-0.5],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,-0.3],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[yellow,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[purple,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0.1],[0,0],[0,0],[red,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[purple,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0.2],[0,0],[0,0.2],[0,0],[0,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0.1],[0,0],[red,0.1],[0,0],[red,0.1],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[purple,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[purple,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[purple,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[blue,0.2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,-0.05],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[yellow,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[yellow,-0.05],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0.1],[0,0],[0,0],[0,0],[0,0],[green,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,0],[0,0],[0,0],[0,0],[0,0],[red,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0],[0,0],[0,0],[0,0],[green,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[green,0.1],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,-2],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,-1.85],[0,0],[yellow,-1.85],[0,0],[red,-1.85],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[red,-1.65],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]]
    ];

    for (let i = 0; i < gemMap.length; i++) {
        for (let j = 0; j < gemMap[i].length; j++) {
            if (gemMap[i][j][0] != 0) {
                placeGemOnPlane(gemMap[i][j][0], -1*(i-50), j-50, gemMap[i][j][1]);
            }
        }
    }

    // Rendering functions ==============================================================

    // Canvas Resizer
    function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
			renderer.setSize( width, height, false );
			composer.setSize( width, height, false );
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
		//renderer.render(scene, camera);
        composer.render();
		requestAnimationFrame(render);
	}

    // Animate Geometry
    var guiUpdated = true;
    var updateSkies = false;
    var currDayOption = guiParams.dayOptions;
    var newDayOption;
    var currNightOption = guiParams.nightOptions;
    var newNightOption;
    const clock = new THREE.Clock();
    function animate(time) {

        // Camera
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();
        const updated = cameraControls.update( delta );

        // Gems
        for (let i = 0; i < gemGroups.length; i++) {
            if (gemDirections[i] == 0) {
                gemGroups[i].rotation.y += 0.05;
                gems[i].rotation.y -= 0.05;
            }
            else {
                gemGroups[i].rotation.y -= 0.05;
                gems[i].rotation.y += 0.05;
            }
            
        }

        // Waterfall
        for (let i = 0; i < waterFalls.length; i++) {
            if (i < 2) {
                waterFalls[i].material.map.offset.y -= 0.06;
            }
            else {
                waterFalls[i].material.map.offset.y += 0.06;
            }
            
        }

        // Update Render  on GUI change
        if (guiParams.isDay && guiUpdated) {
            if (guiUpdated) {
                // Sky
                mainSkyRender = null;
                mainSkyRender = new CubeTexturePass(camera, daySkyBoxTextures[guiParams.dayOptions]);
                resetComposer();
                composeEntireScene();

                // lights
                sunlightDirectional.visible = true;
                moonlightDirectional.visible = false;
                for (let i = 0; i < portalLights.length; i++) {
                    portalLights[i].visible = false;
                }
            }
            guiUpdated = false;
        }
        else if (!guiParams.isDay && !guiUpdated) {
            if (!guiUpdated) {
                // Sky
                mainSkyRender = null;
                mainSkyRender = new CubeTexturePass(camera, nightSkyBoxTextures[guiParams.nightOptions]);
                resetComposer();
                composeEntireScene();

                // lights
                sunlightDirectional.visible = false;
                moonlightDirectional.visible = true;
                for (let i = 0; i < portalLights.length; i++) {
                    portalLights[i].visible = true;
                }
            }
            guiUpdated = true;
        }

        if (updateSkies) {
            updateSkies = false;
            setPortalsRandom();
            resetComposer();
            composeEntireScene();
        }
        
        currDayOption = guiParams.dayOptions;
        currNightOption = guiParams.nightOptions;
        if (currDayOption != newDayOption && guiParams.isDay) {
            // Sky
            mainSkyRender = null;
            mainSkyRender = new CubeTexturePass(camera, daySkyBoxTextures[guiParams.dayOptions]);
            resetComposer();
            composeEntireScene();

            // lights
            sunlightDirectional.visible = true;
            moonlightDirectional.visible = false;
            for (let i = 0; i < portalLights.length; i++) {
                portalLights[i].visible = false;
            }
        }
        if (currNightOption != newNightOption && !guiParams.isDay) {
            // Sky
            mainSkyRender = null;
            mainSkyRender = new CubeTexturePass(camera, nightSkyBoxTextures[guiParams.nightOptions]);
            resetComposer();
            composeEntireScene();

            // lights
            sunlightDirectional.visible = false;
            moonlightDirectional.visible = true;
            for (let i = 0; i < portalLights.length; i++) {
                portalLights[i].visible = true;
            }
        }
        newDayOption = currDayOption;
        newNightOption = currNightOption;
        
        time *= 0.05;

        //renderer.render(scene, camera);
        renderer.clear();
        composer.render();
		requestAnimationFrame(animate);
    }

    // Call animation functions
    requestAnimationFrame(animate);
    requestAnimationFrame(render);
}

main();