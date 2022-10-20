import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./style.css";
import nerdamer from "nerdamer";
import gsap from "gsap";
import CameraControls from 'camera-controls/camera-controls.js';
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

//axis helper + geid helper
const axisHelper = new THREE.AxesHelper(2);
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

let modelMaterial = new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide })

//Controls
const clock = new THREE.Clock();
const cameraControls = new CameraControls(camera, renderer.domElement);
(function anim() {
  // snip
  const delta = clock.getDelta();
  const hasControlsUpdated = cameraControls.update(delta);
  requestAnimationFrame(anim);
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

        teziste.x = teziste.x / teziste.vertCount
        teziste.y = teziste.y / teziste.vertCount
        teziste.z = teziste.z / teziste.vertCount
        let puvodniNormala = CursorPointing.object.geometry.faces[0].normal


        //console.log(teziste)
        // Máme vektory u a v, které udávají rovinu a bod A v rovině
        let bodNaRovine = {x:0, y:0, z:0}
        for(let l = 0; l < vertsToPlannarize.length; l++){
          try {
            const equation = nerdamer.solveEquations([
            u.x+"*t+s*"+v.x+"+"+a.x+"="+vertsToPlannarize[l].x+"+"+n.x+"*k",
            u.y+"*t+s*"+v.y+"+"+a.y+"="+vertsToPlannarize[l].y+"+"+n.y+"*k",
            u.z+"*t+s*"+v.z+"+"+a.z+"="+vertsToPlannarize[l].z+"+"+n.z+"*k"]);
            bodNaRovine.x = vertsToPlannarize[l].x + n.x*equation[0][1];
            bodNaRovine.y = vertsToPlannarize[l].y + n.y*equation[0][1];
            bodNaRovine.z = vertsToPlannarize[l].z + n.z*equation[0][1];
            // vektor u - x souřadnice y - y souřadnice y
            equation = nerdamer.solveEquations(["("+u.x+"^2)*k+("+u.y+"^2)*k+("+u.z+"^2)*k=1"])
            let localX = {x:u.x*equation[0][1], y:u.xy*equation[0][1], z:u.z*equation[0][1]} // Velikost by měla být 1
            equation = nerdamer.solveEquations([
              u.x+"*x+"+u.y+"*y+"+u.z+"*z=0",
              "x^2+y^2+z^2=1", 
              "x="+u.x+"*s+k*"+v.x, "y="+u.y+"*s+k*"+v.y, "z="+u.z+"*s+k*"+v.z
          ])
            let localY = {x:equation[4][1], y:equation[3][1], z:equation[2][1]}
            
            console.log(equation)
          }
          catch (err) {
            console.log("Vektory nejsou rovinne")
          }

        }
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
//gsap.to(cubeMesh.position, { duration: 1, delay: 5, x: 2})
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

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
          console.log(model)
        }
        const modelMash = new THREE.Mesh(
          model, new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide }));
        modelMash.userData.name = faces.length - 1;
        scene.add(modelMash);
        modelsInScene.push(modelMash);
        model = new THREE.Geometry();

        /*
        // Planarity test
        const pocatek = { x: vertices[verts[0] - 1].x, y: vertices[verts[0] - 1].y, z: vertices[verts[0] - 1].z };
        let prvniVektor = { x: 0, y: 0, z: 0, p: 0 }
        let druhyVektor = { x: 0, y: 0, z: 0, p: 0 }
        let merenyVektor = { x: 0, y: 0, z: 0 }
        let neudelane = false;

        for (let l = 0; l < verts.length; l++) {
          // Test shodných vrcholů s počátkem
          if (Number(vertices[verts[l] - 1].x) == Number(pocatek.x) && Number(vertices[verts[l] - 1].y) == Number(pocatek.y) && Number(vertices[verts[l] - 1].z) == Number(pocatek.z)) {
            chyby.push("Shodné vrcholy: " + verts[l] + " a " + verts[0]);
            continue;
          }
          // Prvni vektor souradnicove soustavy
          if (prvniVektor.p == 0) {
            prvniVektor.x = Number(vertices[verts[l] - 1].x) - Number(pocatek.x);
            prvniVektor.y = Number(vertices[verts[l] - 1].y) - Number(pocatek.y);
            prvniVektor.z = Number(vertices[verts[l] - 1].z) - Number(pocatek.z);
            prvniVektor.p = 1;
            continue;
          }
          // Druhy vektor souradnicove soustavy
          if (druhyVektor.p == 0) {
            druhyVektor.x = Number(vertices[verts[l] - 1].x) - Number(pocatek.x);
            druhyVektor.y = Number(vertices[verts[l] - 1].y) - Number(pocatek.y);
            druhyVektor.z = Number(vertices[verts[l] - 1].z) - Number(pocatek.z);

            // Test, zdali jsou vektory linearne zavisle
            try {
              const rov = nerdamer.solveEquations(['94.96 = k*10.8 + l*2', '164 = k*20', '24.2 = k + 5*l']);
            }
            catch (err) {
              console.log("Vektory nejsou rovinne")
              druhyVektor.p = 1;
              continue;
            }
            neudelane = true;
            continue;
          }
          // Test dalsich vektoru
          if (prvniVektor.p == 1 && druhyVektor.p == 1) {
            merenyVektor.x = Number(vertices[verts[l] - 1].x) - Number(pocatek.x);
            merenyVektor.y = Number(vertices[verts[l] - 1].y) - Number(pocatek.y);
            merenyVektor.z = Number(vertices[verts[l] - 1].z) - Number(pocatek.z);
            // Reseni proti deleni nulou
            let a = 0;
            let b = 0;
            if (prvniVektor.x != 0) {
              //a = merenyVektor.x -  
            }
          }
          if (l = verts.length - 1 && neudelane) {
            if (druhyVektor.p == 0) {
              chyby.push("Model obsahuje polygon s nulovým obsahem");
            } else {
              neudelane = false;
              l = 0;
            }
          }
        }*/

        /*let u = {
          x:
            vertices[verts[1] - 1].x -
            vertices[verts[0] - 1].x,
          y:
            vertices[verts[1] - 1].y -
            vertices[verts[0] - 1].y,
          z:
            vertices[verts[1] - 1].z -
            vertices[verts[0] - 1].z
          };
          console.log("Puvodni U na zacatku")
          console.log(u)
          let v = { x: 0, y: 0, z: 0, u: 0 };
          let w = { x: 0, y: 0, z: 0};
          for (let l = 1; l < verts.length; l++) {
              w.x = Number(vertices[verts[l] - 1].x) - Number(parseInt(vertices[verts[0] - 1].x));
              w.y = Number(vertices[verts[l] - 1].y) - Number(parseInt(vertices[verts[0] - 1].y));
              w.z = Number(vertices[verts[l] - 1].z) - Number(parseInt(vertices[verts[0] - 1].z));
            if (v.u == 0) {
                const k = w.x / u.x;
                console.log("k: "+ k)
                console.log(w.x / u.x)
                console.log(w.x)
                console.log(u.x)
                if (Math.abs(w.y - k * u.y) < 0.001 && Math.abs(w.z - k * u.z) < 0.001) {
                    // Vektory jsou linearne zavisle
                    console.log("jsou zavisle")
                } else {
                    // pokud nejsou, vytvor druhy vektor, se kterym by malo byt mozne vytvorit linearni kombinace
                    v.x = Number(vertices[verts[l] - 1].x) - Number(vertices[verts[0] - 1].x);
                    v.y = Number(vertices[verts[l] - 1].y) - Number(vertices[verts[0] - 1].y);
                    v.z = Number(vertices[verts[l] - 1].z) - Number(vertices[verts[0] - 1].z);
                    v.u = 1;
                    console.log("Vytvarim V")
                    console.log(v)
                    console.log("Puvodni U")
                    console.log(u)
                }
            }
            else {
                // Lze porovnávat pomocí lineární kombinace vektorů u a v
                const m = (w.y * u.x - w.x * u.y) / (v.y * u.x - v.x * u.y);
                const k = (w.z - m * v.z) / u.z;
                // Test rovinnosti polygonu
                console.log(u)
                console.log(v)
                console.log(w)
                if (Math.abs(w.x - (k * u.x + m * v.x)) > 0.001 && Math.abs(w.y - (k * u.y + m * v.y)) > 0.001 && Math.abs(w.z - (k * u.z + m * v.z)) > 0.001) {
                    console.log("Polygon je nerovinný")
                }
            }
        }*/
        //}
      }
    }
    // P�id�n� jednotkov� krychle

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
