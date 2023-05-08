import "./style.css";
// ThreeJs related imports
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import CameraControls from 'camera-controls';
CameraControls.install({ THREE: THREE });
// Setup JQuerry
var $ = require('jquery');
window.jQuery = $;
window.$ = $;
// PixiJs
import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'

// ---------------------      3D View setup         ---------------------
// Variables
let scene, canvas, parent, parentSize, sizes, axisHelper, gridHelper, camera, mainDirLights, renderer, cameraControls;
function setup3DWindow() {
  canvas = document.querySelector("canvas.webgl");
  parent = document.querySelector(".model");
  parentSize = parent.getBoundingClientRect();
  sizes = {
    width: parentSize.width,
    height: parentSize.height
  };

  scene = new THREE.Scene();
  //axis helper + geid helper
  axisHelper = new THREE.AxesHelper(5);
  gridHelper = new THREE.GridHelper(100, 100, 0x0000ff, 0x808080);
  gridHelper.position.y = -0.01;
  gridHelper.position.x = 0;
  scene.add(axisHelper);
  scene.add(gridHelper);
  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.y = 3;
  scene.add(camera);
  function createLight() {
    let ambientLight = new THREE.AmbientLight(0x111111, 4);
    ambientLight.castShadow = true;
    let lights = [];
    scene.add(ambientLight)
    lights.push(ambientLight)
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);

    directionalLight.position.set(4, 18, 3);
    directionalLight.target.position.set(0, 7, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.far = 32;
    scene.add(directionalLight)
    lights.push(directionalLight)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(-10, -18, 8);
    directionalLight.target.position.set(0, 7, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.top = -20;
    directionalLight.shadow.camera.right = -20;
    directionalLight.shadow.camera.bottom = 20;
    directionalLight.shadow.camera.left = 20;
    directionalLight.shadow.camera.far = 32;
    scene.add(directionalLight)
    lights.push(directionalLight)

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight.position.set(-10, 8, -13);
    directionalLight.target.position.set(0, 7, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.top = -20;
    directionalLight.shadow.camera.right = -20;
    directionalLight.shadow.camera.bottom = 20;
    directionalLight.shadow.camera.left = 20;
    directionalLight.shadow.camera.far = 32;
    scene.add(directionalLight)
    lights.push(directionalLight)

    return lights
  }
  mainDirLights = createLight();
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(sizes.width, sizes.height);
  // Camera Controlls
  cameraControls = new CameraControls(camera, renderer.domElement);

  renderer.render(scene, camera)
}
setup3DWindow()
function lightMainDirLights(state) {
  let values = [4, 0.7, 0.4, 0.2];
  if (!state) {
    values = [9, 0, 0, 0];
  }
  mainDirLights[0].intensity = values[0]
  mainDirLights[1].intensity = values[1]
  mainDirLights[2].intensity = values[2]
  mainDirLights[3].intensity = values[3]
}

// ---------------------      2D View setup         ---------------------
/*let canvas2D, scene2D, parent2D, parentSize2D, sizes2D
function setup2DWindow() {
  canvas2D = document.querySelector("canvas.webgl2D");
  parent2D = document.querySelector(".model2D");
  parentSize2D = parent2D.getBoundingClientRect();
  sizes2D = {
    width: parentSize2D.width,
    height: parentSize2D.height
  };

  let app = new PIXI.Application({ width: sizes2D.width, height: sizes2D.height });
  document.parentSize2D.appendChild(app.view);
  let frame = new PIXI.Graphics();
  frame.beginFill(0x666666);
  frame.lineStyle({ color: 0xffffff, width: 4, alignment: 0 });
  frame.drawRect(0, 0, 208, 208);
  frame.position.set(320 - 104, 180 - 104);
  app.stage.addChild(frame);
}
setup2DWindow()*/
//--------------------------------------     Set 2D Scene    -----------------------------------------
/*const canvas2D = document.querySelector("canvas.webgl2D");
const parent2D = document.querySelector(".model2D");
var parentSize2D = parent2D.getBoundingClientRect();
const sizes2D = {
  width: parentSize2D.width,
  height: parentSize2D.height
};
// Scene
let zoom2D = 100;
const scene2D = new THREE.Scene();
const camera2D = new THREE.OrthographicCamera(sizes2D.width / -zoom2D, sizes2D.width / zoom2D, sizes2D.height / zoom2D, sizes2D.height / -zoom2D, 0.1, 1000);
camera2D.position.y = 10;
scene2D.add(camera2D);
const ambLight = new THREE.AmbientLight(0x404040, 4); // soft white light
scene2D.add(ambLight);
// Renderer
const renderer2D = new THREE.WebGLRenderer({
  canvas: canvas2D,
  antialias: true,
  alpha: true
});
renderer2D.setSize(sizes2D.width, sizes2D.height);
renderer2D.render(scene2D, camera2D)
//  Auto-update
const clock = new THREE.Clock();
const cameraControls = new CameraControls(camera, renderer.domElement);
const cameraControls2D = new CameraControls(camera2D, renderer2D.domElement);
cameraControls2D.mouseButtons.left = CameraControls.ACTION.NONE; // Zablokování rotace v 2D zobrazení*/
const clock = new THREE.Clock();
(function update() {
  // snip
  const delta = clock.getDelta();
  const hasControlsUpdated = cameraControls.update(delta)
  requestAnimationFrame(update)
  // you can skip this condition to render though
  renderer.render(scene, camera)
})();
// --------------------------------------        Variables        -----------------------------------
let interakceSModelem = true; // je povoleno uživateli interagovat s modelem?
let zobrazenaNerovinost = false; // Jsme v režimu vizualizace nrovnosti?
let zobrazTexturu = false // Jsme v režimu zobrazování textury na modelu? 
let pointedObjects = []; // kurzorem právě vybrané polygony

let CursorPointing = { x: 0, y: 0, z: 0, isPointing: false, object: null }
let neinteraguje = true; // pokud uživatel právě neinteraguje s modelem

let modelsInScene = []; // Seznam poygonů ve svéně z importovaného modelu
let texture = null // textura pro model
let textureFile
let textureType
// Import modelu
let chyby = []; // Chyby v modelu
let koeficientVel = 1; // Měřítko modelu
let model; // model k zobazení
let vertices = [];
let verticesVectors = []
let UVCoordinates = []
let faces = [];
let polys = []
let faceNormal = []
let obrys = { xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0, nove: 0 };
let modelMaterial = new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide })
// --------------------------------------        Listeners        -----------------------------------
window.addEventListener("resize", event => {
  resizeThree();
});
function resizeThree() {
  parentSize = parent.getBoundingClientRect();
  sizes.width = parentSize.width;
  sizes.height = parentSize.height;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.pixelRatio = Math.min(2, window.devicePixelRatio);
}
// UI resize
function resizeViewer() {
  const resizer = document.getElementById('dragMe');
  const leftSide = resizer.previousElementSibling;
  const rightSide = resizer.nextElementSibling;

  // The current position of mouse
  let x = 0;
  let y = 0;
  let leftWidth = 0;

  // Handle the mousedown event
  // that's triggered when user drags the resizer
  const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;
    resizeThree()
    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;
    resizer.style.cursor = 'col-resize';
    document.body.style.cursor = 'col-resize';

    leftSide.style.userSelect = 'none';
    leftSide.style.pointerEvents = 'none';

    rightSide.style.userSelect = 'none';
    rightSide.style.pointerEvents = 'none';
    resizeThree()
  };

  const mouseUpHandler = function () {
    resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');
    leftSide.style.removeProperty('user-select');
    leftSide.style.removeProperty('pointer-events');

    rightSide.style.removeProperty('user-select');
    rightSide.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  // Attach the handler
  resizer.addEventListener('mousedown', mouseDownHandler);
}
resizeViewer()
// On mouse move select
// demo2s.com/javascript/javascript-three-js-when-mouseover-hover-on-object-the-mouse-cursor.html
document.addEventListener('mousemove', event => {
  var raycaster = new THREE.Raycaster();
  if (interakceSModelem) {
    // Sedí horizontálně
    neinteraguje = true;
    if (event.clientX > parentSize.left && event.clientX < parentSize.left + parentSize.width) {
      if (event.clientY > parentSize.top && event.clientY < parentSize.top + parentSize.height) {
        // Kurzor je v divu
        var mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - parentSize.left) / parentSize.width) * 2 - 1;
        mouse.y = - ((event.clientY - parentSize.top) / parentSize.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(modelsInScene);
        if (intersects.length > 0) {
          CursorPointing.x = intersects[0].point.x
          CursorPointing.y = intersects[0].point.y
          CursorPointing.z = intersects[0].point.z
          CursorPointing.isPointing = true;
          CursorPointing.object = intersects[0].object;
          neinteraguje = false;
          if (!event.ctrlKey) {// Nechceme zanechávat stopu
            for (let i = 0; i < pointedObjects.length; i++) {
              pointedObjects[i].material.color.set("#d9dadb");
            }
            pointedObjects = [];
          }
          intersects[0].object.material.color.set("#d3791a")
          pointedObjects.push(intersects[0].object);
          //$('html,body').css('cursor', 'pointer'); - způsobovalo problémy s výkonem
        }
      }
    }
    // Interakce v 2D okně
    if (event.clientX > parentSize2D.left && event.clientX < parentSize2D.left + parentSize2D.width) {
      if (event.clientY > parentSize2D.top && event.clientY < parentSize2D.top + parentSize2D.height) {
        //...
      }
    }
    if (neinteraguje) {
      CursorPointing.isPointing = false;
      for (let i = 0; i < pointedObjects.length; i++) {
        pointedObjects[i].material.color.set("#d9dadb");
      }
      pointedObjects = [];
    }
  }
});
renderer.domElement.addEventListener('mousedown', event => {
  if (event.which == 1) { // Levé tlačítko
    if (CursorPointing.isPointing) {
      cameraControls.setOrbitPoint(
        CursorPointing.x,
        CursorPointing.y,
        CursorPointing.z,
        false
      );

      // Spočítání rovinnosti polygonu
      let teziste = { x: 0, y: 0, z: 0, vertCount: 0 }
      console.log(CursorPointing.object)
      const currPoly = faces[CursorPointing.object.userData.name]
      let a = { x: 0, y: 0, z: 0, nastaven: false }
      let u = { x: 0, y: 0, z: 0, nastaven: false }
      let v = { x: 0, y: 0, z: 0, nastaven: false }
      let n = { x: 0, y: 0, z: 0, nastaven: false }
      let vertsToPlannarize = []
      for (const vert of currPoly) {
        let x = Number(vertices[vert - 1].x)
        let y = Number(vertices[vert - 1].y)
        let z = Number(vertices[vert - 1].z)
        vertsToPlannarize.push({ x: x, y: y, z: z })
        teziste.vertCount++
        teziste.x += x
        teziste.y += y
        teziste.z += z
        if (!a.nastaven) {
          a.x = x
          a.y = y
          a.z = z
          a.nastaven = true
          continue
        }
        if (a.nastaven && !u.nastaven) {
          u.x = x - a.x
          u.y = y - a.y
          u.z = z - a.z
          u.nastaven = true
          continue
        }
        if (u.nastaven && !v.nastaven) {
          v.x = x - a.x
          v.y = y - a.y
          v.z = z - a.z
          n.x = (u.y * v.z - u.z * v.y)
          n.y = (u.z * v.x - v.z * u.x)
          n.z = (u.x * v.y - u.y * v.x)
          //console.log(n)
          if (n.x + n.y + n.z != 0) {
            v.nastaven = true
            n.nastaven = true
          }
        }
      }
      if (n.nastaven) {
        /*console.log("Bod a")
        console.log(a)
        console.log("vektor u")
        console.log(u)
        console.log("vektor v")
        console.log(v)
        console.log("normála n")
        console.log(n)
        console.log("Soubor vrcholů")
        console.log(vertsToPlannarize)*/

        // ----- Těžišzě
        teziste.x = teziste.x / teziste.vertCount
        teziste.y = teziste.y / teziste.vertCount
        teziste.z = teziste.z / teziste.vertCount
        // ----- Normála
        let normala
        if (faceNormal.length == faces.length) {// Máme importovanou normálu polygonu
          normala = faceNormal[CursorPointing.object.userData.name] // Použij importovanou normálu
        } else {
          normala = CursorPointing.object.geometry.faces[0].normal // Použij normálu prvního TRI tvořícího tento polygon
        }
        // ----- Vyhledání vzájemně kolmých vektorů
        let rovX
        let rovY
        if (normala.x == 0 && normala.y == 0) { // Budeme prohazovat z souřadnici
          rovX = { x: Number(normala.z) * (-1), y: 0, z: Number(normala.x) }
          rovY = { x: 0, y: Number(normala.z) * (-1), z: Number(normala.y) }
        } else {
          if (normala.y == 0 && normala.z == 0) { // Budeme prohazovat x souřadnici
            rovX = { x: Number(normala.y), y: Number(normala.x) * (-1), z: 0 }
            rovY = { x: Number(normala.z), y: 0, z: Number(normala.x) * (-1) }
          } else { // Budeme prohazovat y souřadnici
            rovX = { x: Number(normala.y) * (-1), y: Number(normala.x), z: 0 }
            rovY = { x: 0, y: Number(normala.z), z: Number(normala.y) * (-1) }
          }
        }
        // Změna vel. vektoru na jednotkový
        const k = Math.sqrt(1 / (Math.pow(rovX.x, 2) + Math.pow(rovX.y, 2) + Math.pow(rovX.z, 2)))
        const l = Math.sqrt(1 / (Math.pow(rovY.x, 2) + Math.pow(rovY.y, 2) + Math.pow(rovY.z, 2)))
        //rovX = { x: rovX.x * k, y: rovX.y * k, z: rovX.z * k, len: Math.sqrt(Math.pow(rovX.x * k, 2) + Math.pow(rovX.y * k, 2) + Math.pow(rovX.z * k, 2)) }
        //rovY = { x: rovY.x * l, y: rovY.y * l, z: rovY.z * l, len: Math.sqrt(Math.pow(rovY.x * l, 2) + Math.pow(rovY.y * l, 2) + Math.pow(rovY.z * l, 2)) }

        const osX = { x: 1, y: 0, z: 0 }
        const osY = { x: 0, y: 1, z: 0 }
        const osZ = { x: 0, y: 0, z: 1 }
        console.log(Math.sqrt(Math.pow(normala.x, 2) + Math.pow(normala.y, 2) + Math.pow(normala.z, 2)))
        console.log(Math.sqrt(Math.pow(rovX.x, 2) + Math.pow(rovX.y, 2) + Math.pow(rovX.z, 2)))
        console.log(Math.sqrt(Math.pow(rovY.x, 2) + Math.pow(rovY.y, 2) + Math.pow(rovY.z, 2)))
        // V = R x U

        let quaternion = new THREE.Quaternion();
        let druheQuaternion = new THREE.Quaternion();
        const VX = new THREE.Vector3(rovX.x, rovX.y, rovX.z).normalize()
        const VY = new THREE.Vector3(normala.x, normala.y, normala.z).normalize()

        const VSX = new THREE.Vector3(1, 0, 0)
        const VSY = new THREE.Vector3(0, 1, 0)
        quaternion.setFromUnitVectors(VY, VSY);
        VX.applyQuaternion(quaternion)
        //        CursorPointing.object.applyQuaternion( quaternion );  
        druheQuaternion.setFromUnitVectors(VX, VSX);
        //        CursorPointing.object.applyQuaternion( druheQuaternion );

        let PlanePoints = [[0, 0]]
        let nepresnost = 0
        const bodA = { x: vertsToPlannarize[0].x, y: vertsToPlannarize[0].y, z: vertsToPlannarize[0].z }
        let predchoziA = { x: vertsToPlannarize[0].x, y: vertsToPlannarize[0].y, z: vertsToPlannarize[0].z }
        let predchoziB = { x: 0, y: 0 }
        const VBodu = new THREE.Vector3()
        for (let l = 1; l < vertsToPlannarize.length; l++) {
          VBodu.set(vertsToPlannarize[l].x - bodA.x, vertsToPlannarize[l].y - bodA.y, vertsToPlannarize[l].z - bodA.z)
          VBodu.applyQuaternion(quaternion)
          VBodu.applyQuaternion(druheQuaternion)
          PlanePoints.push([VBodu.x, VBodu.z])
          nepresnost += Math.abs(Math.sqrt(Math.pow(vertsToPlannarize[l].x - predchoziA.x, 2) + Math.pow(vertsToPlannarize[l].y - predchoziA.y, 2) + Math.pow(vertsToPlannarize[l].z - predchoziA.z, 2)) - Math.sqrt(Math.pow(VBodu.x - predchoziB.x, 2) + Math.pow(VBodu.z - predchoziB.y, 2)))
          predchoziA = { x: vertsToPlannarize[l].x, y: vertsToPlannarize[l].y, z: vertsToPlannarize[l].z }
          predchoziB = { x: VBodu.x, y: VBodu.z }
        }

        // Snaha řešení přes reverzní matice
        /*let MV = matrix([
          [osX.x, osY.x, osZ.x, 0], // Matrix s vektory odpovídající souřadnicovým osám
          [osX.y, osY.y, osZ.y, 0],
          [osX.z, osY.z, osZ.z, 0],
          [1, 1, 1, 1]])

        let MU = matrix([
          [rovX.x, normala.x, rovY.x, 0], // Matrix s vektory z roviny
          [rovX.y, normala.y, rovY.y, 0],
          [rovX.z, normala.z, rovY.z, 0],
          [1, 1, 1, 1]])

          let MUInverse = mathjs.inv([
            [rovX.x, normala.x, rovY.x, 0], // Matrix s vektory z roviny
            [rovX.y, normala.y, rovY.y, 0],
            [rovX.z, normala.z, rovY.z, 0],
            [1, 1, 1, 1]])

          console.log([
            [rovX.x, normala.x, rovY.x, 0], // Matrix s vektory z roviny
            [rovX.y, normala.y, rovY.y, 0],
            [rovX.z, normala.z, rovY.z, 0],
            [1, 1, 1, 1]])
        let MR = matrix(MV.prod(matrix(MU.inv())))
        console.log(MU.prod(matrix(MUInverse)))
        console.log("R:")
        console.log(MV.prod(matrix(MU.inv())))
        console.log("Bod:")
        let pokus = MR.prod(matrix([[1], [0], [0], [1]]))
        console.log(pokus)
        console.log("Bod délka:")
        console.log(Math.sqrt(Math.pow(pokus[0][0], 2) + Math.pow(pokus[1][0], 2) + Math.pow(pokus[2][0], 2)))*/

        // Snaha dostat se k výsledku pomocí lineárních rovnic z matic
        /*let equation = nerdamer.solveEquations([
          osX.x+"*k=cos(b)*cos(c)*"+rovX.x+"+sin(a)*sin(b)*cos(c)*"+rovX.y+"-cos(a)*sin(c)*"+rovX.y+"+cos(a)*sin(b)*cos(c)*"+rovX.z+"+sin(a)*sin(c)*"+rovX.z,
          osX.y+"*k=cos(b)*cos(c)*"+rovX.x+"+sin(a)*sin(b)*sin(c)*"+rovX.y+"+cos(a)*cos(c)*"+rovX.y+"+cos(a)*sin(b)*sin(c)*"+rovX.z+"-sin(a)*cos(c)*"+rovX.z,
          osX.z+"*k=-sin(b)*"+rovX.x+"+sin(a)*cos(b)*"+rovX.y+"+cos(a)*cos(b)*"+rovX.z,
          
          osY.x+"*l=cos(b)*cos(c)*"+rovY.x+"+sin(a)*sin(b)*cos(c)*"+rovY.y+"-cos(a)*sin(c)*"+rovY.y+"+cos(a)*sin(b)*cos(c)*"+rovY.z+"+sin(a)*sin(c)*"+rovY.z,
          osY.y+"*l=cos(b)*cos(c)*"+rovY.x+"+sin(a)*sin(b)*sin(c)*"+rovY.y+"+cos(a)*cos(c)*"+rovY.y+"+cos(a)*sin(b)*sin(c)*"+rovY.z+"-sin(a)*cos(c)*"+rovY.z,
          osY.z+"*l=-sin(b)*"+rovY.x+"+sin(a)*cos(b)*"+rovY.y+"+cos(a)*cos(b)*"+rovY.z,
        
          osZ.x+"*m=cos(b)*cos(c)*"+normala.x+"+sin(a)*sin(b)*cos(c)*"+normala.y+"-cos(a)*sin(c)*"+normala.y+"+cos(a)*sin(b)*cos(c)*"+normala.z+"+sin(a)*sin(c)*"+normala.z,
          osZ.y+"*m=cos(b)*cos(c)*"+normala.x+"+sin(a)*sin(b)*sin(c)*"+normala.y+"+cos(a)*cos(c)*"+normala.y+"+cos(a)*sin(b)*sin(c)*"+normala.z+"-sin(a)*cos(c)*"+normala.z,
          osZ.z+"*m=-sin(b)*"+normala.x+"+sin(a)*cos(b)*"+normala.y+"+cos(a)*cos(b)*"+normala.z

        ])*/

        /*console.log("normala")
        console.log(normala)
        
        console.log(Math.sqrt(Math.pow(rovX.x,2)+Math.pow(rovX.y,2)+Math.pow(rovX.z,2)))
        console.log(Math.sqrt(Math.pow(rovY.x,2)+Math.pow(rovY.y,2)+Math.pow(rovY.z,2)))*/
        // Máme vektory u a v, které udávají rovinu a bod A v rovině
        let bodNaRovine = { x: 0, y: 0, z: 0 }

        // vektor u - x souřadnice y - y souřadnice y
        /*try {

          let k = 1
          let equation = nerdamer.solveEquations(["a*a+b*b+c*c=1", "a=k*" + n.x, "b=k*" + n.y, "c=k*" + n.z])
          k = equation[3][1]
          let localVX = { x: n.x * k, y: n.y * k, z: n.z * k } // Velikost by měla být 1
          console.log(localVX)
          equation = nerdamer.solveEquations([
            u.x + "*x+" + u.y + "*y+" + u.z + "*z=0",
            "x*x+y*y+z*z=1",
            "x=" + u.x + "*s+k*" + v.x, "y=" + u.y + "*s+k*" + v.y, "z=" + u.z + "*s+k*" + v.z
          ])
          console.log(equation)
          let localVY = { x: equation[4][1], y: equation[3][1], z: equation[2][1] }
          console.log(localVX)
          console.log(localVY)
          for (let l = 0; l < vertsToPlannarize.length; l++) {

            equation = nerdamer.solveEquations([
              u.x + "*t+s*" + v.x + "+" + a.x + "=" + vertsToPlannarize[l].x + "+" + n.x + "*k",
              u.y + "*t+s*" + v.y + "+" + a.y + "=" + vertsToPlannarize[l].y + "+" + n.y + "*k",
              u.z + "*t+s*" + v.z + "+" + a.z + "=" + vertsToPlannarize[l].z + "+" + n.z + "*k"]);
            bodNaRovine.x = vertsToPlannarize[l].x + n.x * equation[0][1];
            bodNaRovine.y = vertsToPlannarize[l].y + n.y * equation[0][1];
            bodNaRovine.z = vertsToPlannarize[l].z + n.z * equation[0][1];

            equation = nerdamer.solveEquations([
              localVX.x + "*t+s*" + localVY.x + "+" + a.x + "=" + bodNaRovine.x,
              localVX.y + "*t+s*" + localVY.y + "+" + a.y + "=" + bodNaRovine.y
              //localVX.z + "*t+s*" + localVY.z + "+" + a.z + "=" + vertsToPlannarize[l].z + "+" + n.z + "*k"
            ]);
            PlanePoints.push({ x: equation[1][1], y: equation[0][1] })
          }
        }
        catch (err) {
          console.log("Vektory nejsou rovinne")
        }*/
        console.log(PlanePoints)
        console.log("Nepřesnost polygonu: " + nepresnost)
      } else {
        console.log("U polygonu nelze vytvořit normálový vektor")
      }
    }
  }
});
$('input:checkbox').change(
  function () {
    if ($(this).val() === "showGrid") {
      if ($(this).is(':checked')) {
        gridHelper.visible = true;
      } else {
        gridHelper.visible = false;
      }
    }
    if ($(this).val() === "showAxisHelper") {
      if ($(this).is(':checked')) {
        axisHelper.visible = true;
      } else {
        axisHelper.visible = false;
      }
    }
  });
document.getElementById('userImage').addEventListener('change', function (e) {
  let userImage = e.target.files[0];
  textureType = userImage.type
  let userImageURL = URL.createObjectURL(userImage);
  const reader = new FileReader()
  reader.onloadend = function () {
    textureFile = reader.result
  }
  reader.readAsDataURL(userImage);
  let loader = new THREE.TextureLoader();
  loader.setCrossOrigin("");
  texture = loader.load(userImageURL);
  showTexture()
});
// Vizualizace nerovinnosti modelu
$('#zobrazNerovinnost').click(function () {
  if (zobrazenaNerovinost == true) {
    zobrazenaNerovinost = false
    lightMainDirLights(true)
    $('#zobrazNerovinnost').css("background-color", "#82959b")
    for (let i = 0; i < modelsInScene.length; i++) {
      modelsInScene[i].material.color.set("#d9dadb");
    }
    interakceSModelem = true
  } else {
    zobrazenaNerovinost = true
    interakceSModelem = false
    lightMainDirLights(false)
    hideTexture()
    $('#zobrazNerovinnost').css("background-color", "#087ca7")
    let nejNepresnost = 0;

    for (let i = 0; i < modelsInScene.length; i++) {
      let normala
      const objekt = modelsInScene[i]
      if (faceNormal.length == faces.length) {// Máme importovanou normálu polygonu
        normala = faceNormal[modelsInScene[i].userData.name] // Použij importovanou normálu
      } else {
        normala = objekt.geometry.faces[0].normal // Použij normálu prvního TRI tvořícího tento polygon
      }
      let vertsToPlannarize = []
      const currPoly = faces[objekt.userData.name]
      for (const vert of currPoly) {
        vertsToPlannarize.push({ x: Number(vertices[vert - 1].x), y: Number(vertices[vert - 1].y), z: Number(vertices[vert - 1].z) })
      }
      // ----- Vyhledání vzájemně kolmých vektorů
      let rovX
      if (normala.x == 0 && normala.y == 0) { // Budeme prohazovat z souřadnici
        rovX = { x: Number(normala.z) * (-1), y: 0, z: Number(normala.x) }
      } else {
        if (normala.y == 0 && normala.z == 0) { // Budeme prohazovat x souřadnici
          rovX = { x: Number(normala.y), y: Number(normala.x) * (-1), z: 0 }
        } else { // Budeme prohazovat y souřadnici
          rovX = { x: Number(normala.y) * (-1), y: Number(normala.x), z: 0 }
        }
      }
      let quaternion = new THREE.Quaternion();
      let druheQuaternion = new THREE.Quaternion();
      const VX = new THREE.Vector3(rovX.x, rovX.y, rovX.z).normalize()
      const VY = new THREE.Vector3(normala.x, normala.y, normala.z).normalize()

      const VSX = new THREE.Vector3(1, 0, 0)
      const VSY = new THREE.Vector3(0, 1, 0)
      quaternion.setFromUnitVectors(VY, VSY);
      VX.applyQuaternion(quaternion)
      druheQuaternion.setFromUnitVectors(VX, VSX);

      let nepresnost = 0
      const bodA = { x: vertsToPlannarize[0].x, y: vertsToPlannarize[0].y, z: vertsToPlannarize[0].z }
      let predchoziA = { x: vertsToPlannarize[0].x, y: vertsToPlannarize[0].y, z: vertsToPlannarize[0].z }
      let predchoziB = { x: 0, y: 0 }
      const VBodu = new THREE.Vector3()
      for (let l = 1; l < vertsToPlannarize.length; l++) {
        VBodu.set(vertsToPlannarize[l].x - bodA.x, vertsToPlannarize[l].y - bodA.y, vertsToPlannarize[l].z - bodA.z)
        VBodu.applyQuaternion(quaternion)
        VBodu.applyQuaternion(druheQuaternion)
        nepresnost += Math.abs(Math.sqrt(Math.pow(vertsToPlannarize[l].x - predchoziA.x, 2) + Math.pow(vertsToPlannarize[l].y - predchoziA.y, 2) + Math.pow(vertsToPlannarize[l].z - predchoziA.z, 2)) - Math.sqrt(Math.pow(VBodu.x - predchoziB.x, 2) + Math.pow(VBodu.z - predchoziB.y, 2)))
        predchoziA = { x: vertsToPlannarize[l].x, y: vertsToPlannarize[l].y, z: vertsToPlannarize[l].z }
        predchoziB = { x: VBodu.x, y: VBodu.z }
      }
      if (nepresnost > nejNepresnost) {
        nejNepresnost = nepresnost
      }
      objekt.material.color.set(colorGradient(Math.min(nepresnost * 330, 100) / 100, { red: 78, green: 169, blue: 18 }, { red: 225, green: 139, blue: 7 }, { red: 218, green: 42, blue: 14 }));
    }
    $('#planarityRes').empty()
    $('#planarityRes').text("The largest inaccuracy within a single polygon: " + (nejNepresnost * 10).toFixed(2) + " mm.")
  }

})
$('#zobrazTexturu').click(function () {
  if (zobrazTexturu == true) {
    hideTexture()
  } else {
    showTexture()
  }
})
// Změna měřítka
$('#scale').on("input", function () {
  if (!isNaN($('#scale').val()) && Number($('#scale').val()) > 0) {
    const predchoziK = koeficientVel
    koeficientVel = $('#scale').val();
    for (let i = 0; i < modelsInScene.length; i++) {
      modelsInScene[i].scale.set(koeficientVel, koeficientVel, koeficientVel)
    }
    // -------------   přepočítání velikosti modelu
    obrys.xMax *= (1 / predchoziK) * koeficientVel
    obrys.xMin *= (1 / predchoziK) * koeficientVel
    obrys.yMax *= (1 / predchoziK) * koeficientVel
    obrys.yMin *= (1 / predchoziK) * koeficientVel
    obrys.zMax *= (1 / predchoziK) * koeficientVel
    obrys.zMin *= (1 / predchoziK) * koeficientVel

    for (let i = 0; i < vertices.length; i++) {
      vertices[i].x *= (1 / predchoziK) * koeficientVel
      vertices[i].y *= (1 / predchoziK) * koeficientVel
      vertices[i].z *= (1 / predchoziK) * koeficientVel
    }
    updateModelInfo()
    updateHelpers()
  }
})
$('#save').click(function () {
  exportToJsonFile()
})
$('#load').click(function () {
  loadFromJsonFile()
})
$('#unwrap').click(function () {
  unwrap()
})
// -----------------------------     Import .obj modelu      ----------------------------------------------------
document.getElementById("inputfile").addEventListener("change", function () {
  var fr = new FileReader();
  jQuery('.lds-ellipsis').css('opacity', '1');
  fr.onload = function () {
    jQuery('.lds-ellipsis').css('opacity', '0');
    resetScene()
    // Print .obj
    document.getElementById("output").innerHTML = String(fr.result).replaceAll("\n", '<br>');
    const lines = String(fr.result).split("\n");
    // Cteni radek po radku obj souboru
    for (let i = 0; i < lines.length; i++) {
      // Vypsání procent
      if (i % 1000 == 0) {
        const procento = i / lines.length
        //console.log(procento)
      }

      const pof = lines[i].split(" ");
      // Pridavani vrcholu  
      if (pof[0] == "v") {
        pof[1] = Number(pof[1]) * koeficientVel;
        pof[2] = Number(pof[2]) * koeficientVel;
        pof[3] = Number(pof[3]) * koeficientVel;
        vertices.push({ x: pof[1], y: pof[2], z: pof[3] });
        verticesVectors.push(new THREE.Vector3(pof[1], pof[2], pof[3]));
        // Nastaveni okrajovych bodu
        if (obrys.nove == 0) {
          obrys.xMin = pof[1];
          obrys.xMax = pof[1];
          obrys.yMin = pof[2];
          obrys.yMax = pof[2];
          obrys.zMin = pof[3];
          obrys.zMax = pof[3];
          obrys.nove = 1;
        } else {
          if (Number(obrys.xMin) > Number(pof[1])) {
            obrys.xMin = pof[1];
          }
          if (Number(obrys.xMax) < Number(pof[1])) {
            obrys.xMax = pof[1];
          }
          if (Number(obrys.yMin) > Number(pof[2])) {
            obrys.yMin = pof[2];
          }
          if (Number(obrys.yMax) < Number(pof[2])) {
            obrys.yMax = pof[2];
          }
          if (Number(obrys.zMin) > Number(pof[3])) {
            obrys.zMin = pof[3];
          }
          if (Number(obrys.zMax) < Number(pof[3])) {
            obrys.zMax = pof[3];
          }
        }
      }
      // Normala polygonu
      if (pof[0] == "vn") {
        faceNormal.push({ x: pof[1], y: pof[2], z: pof[3] });
      }

      if (pof[0] == "vt") {
        UVCoordinates.push({ u: pof[1], v: pof[2] })
      }
      // Pridani polygonu
      if (pof[0] == "f") {
        let exportPolys = { faces: [], uvs: [] }
        model.vertices = verticesVectors;
        model.faceVertexUvs[0] = [];
        const UVs = [];
        const verts = [];
        for (let k = 1; k < pof.length; k++) {
          const vert = pof[k].split("/");
          verts.push(vert[0]);
          if (vert.length > 1 && vert[1] !== "" && UVCoordinates.length > 0) {
            UVs.push(new THREE.Vector2(UVCoordinates[vert[1] - 1].u, UVCoordinates[vert[1] - 1].v))
          }
        }
        faces.push(verts);

        if (verts.length == 3) {
          model.faces.push(
            new THREE.Face3(verts[0] - 1, verts[1] - 1, verts[2] - 1)
          );
          exportPolys.faces.push({ a: verts[0] - 1, b: verts[1] - 1, c: verts[2] - 1 })
          if (UVCoordinates.length > 0) {
            model.faceVertexUvs[0].push([
              UVs[0],
              UVs[1],
              UVs[2]
            ]);
            exportPolys.uvs.push({ a: { u: UVs[0].x, v: UVs[0].y }, b: { u: UVs[1].x, v: UVs[1].y }, c: { u: UVs[2].x, v: UVs[2].y } })
          }
        } else {
          if (verts.length == 4) {
            model.faces.push(
              new THREE.Face3(verts[0] - 1, verts[1] - 1, verts[2] - 1),
              new THREE.Face3(verts[0] - 1, verts[2] - 1, verts[3] - 1)
            );
            exportPolys.faces.push({ a: verts[0] - 1, b: verts[1] - 1, c: verts[2] - 1 }, { a: verts[0] - 1, b: verts[2] - 1, c: verts[3] - 1 })
            if (UVCoordinates.length > 0) {
              model.faceVertexUvs[0].push(
                [UVs[0], UVs[1], UVs[2]],
                [UVs[0], UVs[2], UVs[3]]);
              exportPolys.uvs.push({ a: { u: UVs[0].x, v: UVs[0].y }, b: { u: UVs[1].x, v: UVs[1].y }, c: { u: UVs[2].x, v: UVs[2].y } }, { a: { u: UVs[0].x, v: UVs[0].y }, b: { u: UVs[2].x, v: UVs[2].y }, c: { u: UVs[3].x, v: UVs[3].y } })
            }
          }
          if (verts.length > 4) {
            for (let l = 2; l < verts.length; l++) {
              model.faces.push(
                new THREE.Face3(verts[0] - 1, verts[l - 1] - 1, verts[l] - 1)
              );
              exportPolys.faces.push({ a: verts[0] - 1, b: verts[l - 1] - 1, c: verts[l] - 1 })
              if (UVCoordinates.length > 0) {
                model.faceVertexUvs[0].push([UVs[0], UVs[l - 1], UVs[l]]);
                exportPolys.uvs.push({ a: { u: UVs[0].x, v: UVs[0].y }, b: { u: UVs[l - 1].x, v: UVs[l - 1].y }, c: { u: UVs[l].x, v: UVs[l].y } })
              }
            }
          }
        }
        // Přidání polygonů
        model.computeFaceNormals();
        model.uvsNeedUpdate = true;
        if (UVs.length != 0) {
          console.log("Custom UVs")
          //console.log(model)
        }
        polys.push(Object.assign({}, exportPolys))
        const modelMash = new THREE.Mesh(
          model, new THREE.MeshStandardMaterial({ color: "#d9dadb", side: THREE.DoubleSide }));
        modelMash.userData.name = faces.length - 1;
        scene.add(modelMash);
        modelsInScene.push(modelMash);
        model = new THREE.Geometry();
      }
    }
    // Přidání jednotkové krychle

    /*const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: "#d9dadb",
      map: THREE.ImageUtils.loadTexture("unitCube.jpg")
    });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(obrys.xMax, obrys.yMin, parseInt(obrys.zMax) + 2);
    scene.add(cubeMesh);*/

    updateHelpers()
    // Load info
    updateModelInfo()
  };
  fr.addEventListener("error", event => {
    document.getElementById("output").textContent = "Can not load file";
  });
  fr.readAsText(this.files[0]);
});
// ------------------------      Funkce     ------------------
function colorGradient(fadeFraction, rgbColor1, rgbColor2, rgbColor3) {
  // https://gist.github.com/gskema/2f56dc2e087894ffc756c11e6de1b5ed
  var color1 = rgbColor1;
  var color2 = rgbColor2;
  var fade = fadeFraction;

  // Do we have 3 colors for the gradient? Need to adjust the params.
  if (rgbColor3) {
    fade = fade * 2;

    // Find which interval to use and adjust the fade percentage
    if (fade >= 1) {
      fade -= 1;
      color1 = rgbColor2;
      color2 = rgbColor3;
    }
  }

  var diffRed = color2.red - color1.red;
  var diffGreen = color2.green - color1.green;
  var diffBlue = color2.blue - color1.blue;

  var gradient = {
    red: parseInt(Math.floor(color1.red + (diffRed * fade)), 10),
    green: parseInt(Math.floor(color1.green + (diffGreen * fade)), 10),
    blue: parseInt(Math.floor(color1.blue + (diffBlue * fade)), 10),
  };

  return 'rgb(' + gradient.red + ',' + gradient.green + ',' + gradient.blue + ')';
}
function resetScene() {
  zobrazenaNerovinost = false
  $('#zobrazNerovinnost').css("background-color", "#82959b")
  interakceSModelem = true
  model = new THREE.Geometry();
  obrys.nove = 0;
  vertices = [];
  polys = []
  UVCoordinates = []
  verticesVectors = []
  faces = []
  modelsInScene = []
  koeficientVel = 1
  hideTexture()
  for (let i = scene.children.length - 1; i >= 0; i--) {
    if (scene.children[i].type === "Mesh") {
      scene.remove(scene.children[i]);
    }
  }
  reset2DScene()
}
function reset2DScene() {
  objects2D = []
  objectsIn2DScene = []
  for (let i = scene2D.children.length - 1; i >= 0; i--) {
    if (scene2D.children[i].type === "Mesh") {
      scene2D.remove(scene2D.children[i]);
    }
  }
}
function updateModelInfo() {
  jQuery('.info').empty()
  jQuery('.info').append("Vertices: " + vertices.length + "<br>Polygons: " + faces.length + "<br>Sizes:<br>" + ((obrys.xMin * -1) + obrys.xMax).toFixed(2) + " x " + ((obrys.yMin * -1) + obrys.yMax).toFixed(2) + " x " + ((obrys.zMin * -1) + obrys.zMax).toFixed(2));
}
function exportToJsonFile() {
  // https://www.codegrepper.com/code-examples/javascript/export+json+file+javascript
  let customModelData = { verts: vertices, faces: faces, faceNormal: faceNormal, uv: UVCoordinates, obrys: obrys, koeficient: koeficientVel }

  const image = textureFile
  console.log(image)
  let exportData = { polys: polys, customModelData: customModelData, texture: image, textureType: textureType }
  let dataStr = JSON.stringify(exportData);
  let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  let exportFileDefaultName = 'data.json';

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}
function loadFromJsonFile() {
  readTextFile("data.json", function (text) {
    let data = JSON.parse(text);
    faceNormal = data.customModelData.faceNormal.slice()
    obrys = data.customModelData.obrys
    koeficientVel = data.customModelData.koeficient
    let verticesVectors = []

    let blob = new Blob([data.texture], { type: data.textureType });
    let imgURL = URL.createObjectURL(blob)
    let loader = new THREE.TextureLoader();
    loader.setCrossOrigin("");
    texture = loader.load(imgURL);

    console.log(data.textureType)
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', imgURL);
    linkElement.setAttribute('download', data.textureType);
    linkElement.click();

    resetScene()
    $('#scale').val(koeficientVel)

    // Import UVs
    for (let i = 0; i < data.customModelData.uv.length; i++) {
      UVCoordinates.push({ u: data.customModelData.uv[i].u, v: data.customModelData.uv[i].v })
    }// Import verts
    for (let i = 0; i < data.customModelData.verts.length; i++) {
      const vert = data.customModelData.verts[i]
      verticesVectors.push(new THREE.Vector3(vert.x, vert.y, vert.z))
      vertices.push({ x: vert.x, y: vert.y, z: vert.z })
    }
    // Import based on Custom data
    for (let i = 0; i < data.polys.length; i++) {
      const pol = data.polys[i]
      let model = new THREE.Geometry();
      model.vertices = verticesVectors;
      model.faceVertexUvs[0] = [];
      const poly = pol.faces
      const uvs = pol.uvs

      let verts = []
      for (let l = 0; l < poly.length; l++) {
        verts.push(poly[l].a + 1, poly[l].b + 1, poly[l].c + 1)
        model.faces.push(
          new THREE.Face3(poly[l].a, poly[l].b, poly[l].c)
        );
        if (UVCoordinates.length > 0) {
          model.faceVertexUvs[0].push([
            new THREE.Vector2(uvs[l].a.u, uvs[l].a.v),
            new THREE.Vector2(uvs[l].b.u, uvs[l].b.v),
            new THREE.Vector2(uvs[l].c.u, uvs[l].c.v)
          ]);
        }
      }
      faces.push(verts)
      model.computeFaceNormals();
      model.uvsNeedUpdate = true;
      const modelMash = new THREE.Mesh(
        model, new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide }));
      modelMash.userData.name = i;
      modelsInScene.push(modelMash)
      scene.add(modelMash)
    }
    updateHelpers()
    updateModelInfo()
  });
}
function hideTexture() {
  zobrazTexturu = false
  $('#zobrazTexturu').css("background-color", "#82959b")
  for (let i = 0; i < modelsInScene.length; i++) {
    modelsInScene[i].material.color.set("#d9dadb");
    modelsInScene[i].material.map = null
    modelsInScene[i].material.needsUpdate = true
  }
}
function showTexture() {
  zobrazTexturu = true
  $('#zobrazTexturu').css("background-color", "#087ca7")
  if (texture != null) {
    for (let i = 0; i < modelsInScene.length; i++) {
      modelsInScene[i].material.map = texture
      modelsInScene[i].material.needsUpdate = true
    }
  }
}
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

function updateHelpers() {
  gridHelper.position.y = obrys.yMin - 0.01;
  axisHelper.position.y = obrys.yMin;
}
let objects2D = []
let objectsIn2DScene = []
function unwrap() {
  reset2DScene()
  // Rozbalování povrchu
  let unplaced = []
  // Získání otočených objektů polygonů v poýadované rovině
  for (let i = 0; i < modelsInScene.length; i++) {
    // Získání původních polygonů (i n-gony)
    const currPoly = faces[modelsInScene[i].userData.name]
    let a = { x: 0, y: 0, z: 0, nastaven: false, index: 0 }
    let u = { x: 0, y: 0, z: 0, nastaven: false }
    let v = { x: 0, y: 0, z: 0, nastaven: false }
    let n = { x: 0, y: 0, z: 0, nastaven: false }
    let vertsToPlannarize = []
    for (let vert of currPoly) {
      let x = Number(vertices[vert - 1].x)
      let y = Number(vertices[vert - 1].y)
      let z = Number(vertices[vert - 1].z)
      vertsToPlannarize.push({ x: x, y: y, z: z })
      if (!a.nastaven) {
        a.x = x
        a.y = y
        a.z = z
        a.index = vert - 1
        a.nastaven = true
        continue
      }
      if (a.nastaven && !u.nastaven) {
        u.x = x - a.x
        u.y = y - a.y
        u.z = z - a.z
        u.nastaven = true
        continue
      }
      if (u.nastaven && !v.nastaven) {
        v.x = x - a.x
        v.y = y - a.y
        v.z = z - a.z
        n.x = (u.y * v.z - u.z * v.y)
        n.y = (u.z * v.x - v.z * u.x)
        n.z = (u.x * v.y - u.y * v.x)
        if (n.x + n.y + n.z != 0) {
          v.nastaven = true
          n.nastaven = true
        }
      }
    }
    if (n.nastaven) {
      let normala
      if (faceNormal.length == faces.length) {// Máme importovanou normálu polygonu
        normala = faceNormal[modelsInScene[i].userData.name] // Použij importovanou normálu
      } else {
        normala = modelsInScene[i].geometry.faces[0].normal // Použij normálu prvního TRI tvořícího tento polygon
      }
      // ----- Vyhledání vzájemně kolmých vektorů
      let rovX
      let rovY
      if (normala.x == 0 && normala.y == 0) { // Budeme prohazovat z souřadnici
        rovX = { x: Number(normala.z) * (-1), y: 0, z: Number(normala.x) }
        rovY = { x: 0, y: Number(normala.z) * (-1), z: Number(normala.y) }
      } else {
        if (normala.y == 0 && normala.z == 0) { // Budeme prohazovat x souřadnici
          rovX = { x: Number(normala.y), y: Number(normala.x) * (-1), z: 0 }
          rovY = { x: Number(normala.z), y: 0, z: Number(normala.x) * (-1) }
        } else { // Budeme prohazovat y souřadnici
          rovX = { x: Number(normala.y) * (-1), y: Number(normala.x), z: 0 }
          rovY = { x: 0, y: Number(normala.z), z: Number(normala.y) * (-1) }
        }
      }
      let quaternion = new THREE.Quaternion();
      let druheQuaternion = new THREE.Quaternion();
      const VX = new THREE.Vector3(rovX.x, rovX.y, rovX.z).normalize()
      const VY = new THREE.Vector3(normala.x, normala.y, normala.z).normalize()

      const VSX = new THREE.Vector3(1, 0, 0)
      const VSY = new THREE.Vector3(0, 1, 0)
      quaternion.setFromUnitVectors(VY, VSY);
      VX.applyQuaternion(quaternion)
      druheQuaternion.setFromUnitVectors(VX, VSX);

      // Place poly to 2D
      let poly2D = modelsInScene[i].clone()
      poly2D.applyQuaternion(quaternion)
      poly2D.applyQuaternion(druheQuaternion)
      poly2D.updateMatrixWorld()
      let APos = poly2D.geometry.vertices[a.index].clone()
      poly2D.localToWorld(APos)
      poly2D.position.add(APos.multiplyScalar(-1))
      objects2D.push(poly2D)
      unplaced.push(poly2D)
    }
  }
  let hrany = []
  let frontaStredu = []
  if (objects2D.length > 0) {
    let pivot = [unplaced[0].userData.name]
    scene2D.add(objects2D[0])
    objectsIn2DScene.push(objects2D[0])
    unplaced.splice(0, 1)

    /*
        Projdi všechny neumísěné polygony a u kaýdého z nich zkontroluj, 
        jestli nesdílí hranu s polygonem, který považujeme za středový.
    
        Faces => [id of face][list of verts]
        */
    let zOffset = 0;
    while (unplaced != 0) {
      if (pivot.length == 0) {
        console.log("nový střed ketrý je mimo")
        // Nacházíme nový střed, který je potřeba přemístit
        pivot.push(unplaced[0].userData.name)
        unplaced[0].position.add(new THREE.Vector3(0, 0, zOffset))
        zOffset += 5;
        objectsIn2DScene.push(unplaced[0])
        scene2D.add(unplaced[0])
        unplaced.shift()
      }

      for (let i = 0; i < unplaced.length; i++) {
        let Vert1 = -1
        let Vert2 = -1
        let VIdP = 0
        let VIdU = 0
        let VIdP2 = 0
        let VIdU2 = 0
        for (let j = 0; j < faces[pivot[0]].length; j++) {
          for (let k = 0; k < faces[unplaced[i].userData.name].length; k++) {
            if (faces[pivot[0]][j] == faces[unplaced[i].userData.name][k]) {
              if (Vert1 == -1) {
                Vert1 = faces[pivot[0]][j]
                VIdP = j;
                VIdU = k;
              } else {
                Vert2 = faces[pivot[0]][j]
                VIdP = j;
                VIdU = k;
                break
              }
            }
          }
          if (Vert2 != -1) {
            pivot.push(unplaced[i].userData.name)
            alignObject2D(unplaced[i], pivot[0], Vert1, Vert2)
            unplaced.splice(i, 1)
            i = i - 1
            break
          }
        }
      }
      pivot.shift()
    }



    /*
    // Přidáme první polygon, který bude sloužit jako střed
    scene2D.add(objects2D[0])
    objectsIn2DScene.push(objects2D[0])
    unplaced.shift()
    frontaStredu.push(objects2D[0].userData.name)
    // Opakuj dokud zbývají neumístěné polygony

    let VID1 = -1
    let VID2 = -1

    for (let l = 0; l < unplaced.length; l++) {

      let idObj2 = -1
      for (let k = 0; k < faces[frontaStredu[0]].length; k++) {
        const IdVrcholu = faces[frontaStredu[0]][k]
        for (let m = 0; m < faces[unplaced[l].userData.name].length; m++) {
          if (IdVrcholu == faces[unplaced[l].userData.name][m]) {
            if (VID1 == -1) {
              VID1 = IdVrcholu
              break
            }
            if (VID2 == -1) {
              VID2 = IdVrcholu
              idObj2 = unplaced[l].userData.name
              frontaStredu.push(unplaced[l].userData.name)
              unplaced.splice(l, 1)
              break
            }
          }
        }
        if (VID2 != -1) {
          // Jsou sousedé
          hrany.push({ idObj1: frontaStredu[0], idObj2: idObj2, vertId1: VID1, vertId2: VID2 })
          break
        }
      }
      frontaStredu.shift()
      if (frontaStredu.length == 0 && unplaced.length > 0) {
        console.log("Model obsahuje více nespojených modelů")
        frontaStredu.push(unplaced[0].userData.name)
      }
    }*/
  }
}
function alignObject2D(obj, pivotName, Vert1, Vert2) {
  let pivot;
  for (let i = 0; i < objectsIn2DScene.length; i++) {
    if (objectsIn2DScene[i].userData.name == pivotName) {
      pivot = objectsIn2DScene[i]
      break
    }
  }
  obj.updateMatrixWorld();
  pivot.updateMatrixWorld();
  let pa = pivot.geometry.vertices[Vert1 - 1].clone()
  let oa = obj.geometry.vertices[Vert1 - 1].clone()
  let pb = pivot.geometry.vertices[Vert2 - 1].clone()
  let ob = obj.geometry.vertices[Vert2 - 1].clone()
  pivot.localToWorld(pa)
  obj.localToWorld(oa)
  pivot.localToWorld(pb)
  obj.localToWorld(ob)

  /*console.log(pa)
  console.log(oa)
  console.log(pb)
  console.log(ob)
  console.log("-------------")*/
  let u = new THREE.Vector3(pb.x - pa.x, 0, pb.z - pa.z)
  let v = new THREE.Vector3(ob.x - oa.x, 0, ob.z - oa.z)
  u = u.normalize()
  v = v.normalize()
  let quat = new THREE.Quaternion().setFromUnitVectors(v, u)
  const worldNormal = new THREE.Vector3(0, 1, 0)
  obj.applyQuaternion(quat)
  obj.updateMatrixWorld();
  oa = obj.geometry.vertices[Vert1 - 1].clone()
  obj.localToWorld(oa)

  // Move to connect with pivot after rotation
  let mv = new THREE.Vector3(oa.x - pa.x, 0, oa.z - pa.z);
  obj.position.add(mv.multiplyScalar(-1))
  scene2D.add(obj)
  objectsIn2DScene.push(obj)
}