import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./style.css";
import nerdamer from "nerdamer";
import gsap from "gsap";
import * as mathjs from 'mathjs'
import CameraControls from 'camera-controls';
import matrix from 'matrix-js';
CameraControls.install({ THREE: THREE });
var $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('nerdamer/Solve');

const canvas = document.querySelector("canvas.webgl");
const parent = document.querySelector(".model");
var parentSize = parent.getBoundingClientRect();

// Sizes
const sizes = {
  width: parentSize.width,
  height: parentSize.height
};

// Scene
const scene = new THREE.Scene();
let modelsInScene = [];
let interakceSModelem = true;

//axis helper + geid helper
const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);
const gridHelper = new THREE.GridHelper(100, 100, 0x0000ff, 0x808080);
gridHelper.position.y = -0.01;
gridHelper.position.x = 0;
scene.add(gridHelper);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.y = 3;
scene.add(camera);

// Lights
const color = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-30, 2, 4);
scene.add(light);
const light2 = new THREE.DirectionalLight({ color: 0xffffff, intensity: 1 });
light2.position.set(30, 1, -5);
scene.add(light2);
const ambLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambLight);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera)

let modelMaterial = new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide })

//--------------------   Auto-update
const clock = new THREE.Clock();
const cameraControls = new CameraControls(camera, renderer.domElement);
(function update() {
  // snip
  const delta = clock.getDelta();
  const hasControlsUpdated = cameraControls.update(delta);
  requestAnimationFrame(update);
  // you can skip this condition to render though
  renderer.render(scene, camera);

})();

// -------------------    Listeners    ----------------------------------------------------
//resize listener
window.addEventListener("resize", event => {
  console.log("resize");
  parentSize = parent.getBoundingClientRect();
  sizes.width = parentSize.width;
  sizes.height = parentSize.height;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.pixelRatio = Math.min(2, window.devicePixelRatio);
});
// On mouse move select
// demo2s.com/javascript/javascript-three-js-when-mouseover-hover-on-object-the-mouse-cursor.html
let pointedObjects = [];
let CursorPointing = { x: 0, y: 0, z: 0, isPointing: false, object: null }
var raycaster = new THREE.Raycaster();
let neinteraguje = true;
document.addEventListener('mousemove', event => {
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
      //console.log(CursorPointing.object.userData.name)
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

  const userImage = e.target.files[0];
  const userImageURL = URL.createObjectURL(userImage);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("");
  let texture = loader.load(userImageURL);

  //CursorPointing.object.material.specularMap = texture
  CursorPointing.object.material.map = texture
  //texture.needsUpdate = true
  CursorPointing.object.material.needsUpdate = true
  console.log(CursorPointing.object)
});
let zobrazenaNerovinost = false;
$('#zobrazNerovinnost').click(function () {
  if (zobrazenaNerovinost == true) {
    zobrazenaNerovinost = false
    $('#zobrazNerovinnost').css("background-color", "#82959b")
    for (let i = 0; i < modelsInScene.length; i++) {
      modelsInScene[i].material.color.set("#d9dadb");
    }
    interakceSModelem = true
  } else {
    zobrazenaNerovinost = true
    interakceSModelem = false
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
  ;

// -----------------------------     Import .obj modelu      ----------------------------------------------------
let chyby = [];
let koeficientVel = 1;
let model; // model k zobazení
let vertices;
let verticesVectors = []
let UVCoordinates = []
let faces;
let faceNormal = []

let obrys = { xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0, nove: 0 };
document.getElementById("inputfile").addEventListener("change", function () {
  if (!isNaN($('#scale').val()) && Number($('#scale').val()) > 0) {
    koeficientVel = $('#scale').val();
  }
  var fr = new FileReader();
  jQuery('.lds-ellipsis').css('opacity', '1');
  fr.onload = function () {
    jQuery('.lds-ellipsis').css('opacity', '0');
    resetScene()
    // Reset of variables
    model = new THREE.Geometry();
    obrys.nove = 0;
    vertices = [];
    UVCoordinates = []
    verticesVectors = [];
    faces = [];
    modelsInScene = [];
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if (scene.children[i].type === "Mesh") {
        scene.remove(scene.children[i]);
      }
    }
    // Print .obj
    document.getElementById("output").innerHTML = String(fr.result).replaceAll("\n", '<br>');
    const lines = String(fr.result).split("\n");
    // Cteni radek po radku obj souboru
    for (let i = 0; i < lines.length; i++) {
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
          if (UVCoordinates.length > 0) {
            model.faceVertexUvs[0].push([
              UVs[0],
              UVs[1],
              UVs[2]
            ]);
          }
        } else {
          if (verts.length == 4) {
            model.faces.push(
              new THREE.Face3(verts[0] - 1, verts[1] - 1, verts[2] - 1),
              new THREE.Face3(verts[0] - 1, verts[2] - 1, verts[3] - 1)
            );
            if (UVCoordinates.length > 0) {
              model.faceVertexUvs[0].push([UVs[0], UVs[1], UVs[2]]);
              model.faceVertexUvs[0].push([UVs[2], UVs[1], UVs[3]]);
            }
          }
          if (verts.length > 4) {
            for (let l = 2; l < verts.length; l++) {
              model.faces.push(
                new THREE.Face3(verts[0] - 1, verts[l - 1] - 1, verts[l] - 1)
              );
              if (UVCoordinates.length > 0) {
                model.faceVertexUvs[0].push([UVs[0], UVs[l - 1], UVs[l]]);
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
        const modelMash = new THREE.Mesh(
          model, new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide }));
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

    gridHelper.position.y = obrys.yMin - 0.01;
    axisHelper.position.y = obrys.yMin;
    // Load info
    jQuery('.info').empty()
    jQuery('.info').append("Vertices: " + vertices.length + "<br>Polygons: " + faces.length + "<br>Sizes:<br>" + ((obrys.xMin * -1) + obrys.xMax).toFixed(2) + " x " + ((obrys.yMin * -1) + obrys.yMax).toFixed(2) + " x " + ((obrys.zMin * -1) + obrys.zMax).toFixed(2));
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
}