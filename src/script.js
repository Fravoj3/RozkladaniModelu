import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./style.css";
import nerdamer from "nerdamer";
require('nerdamer/Solve');


const canvas = document.querySelector("canvas.webgl");
const parent = document.querySelector(".model");
var parentSize = parent.getBoundingClientRect();

// Sizes
const sizes = {
  width: parentSize.width,
  height: parentSize.height
};

const cursor = {
  x: 0,
  y: 0
};

window.addEventListener("mousemove", event => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
  //console.log(cursor.y, cursor.x)
});

// Scene
const scene = new THREE.Scene();

//axis helper
const axisHelper = new THREE.AxesHelper(2);
scene.add(axisHelper);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 5;
scene.add(camera);

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = true;
//controls.minPolarAngle = 0.2
//controls.maxPolarAngle = Math.PI/1.2

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

//gsap.to(cubeMesh.position, { duration: 1, delay: 5, x: 2})

var time = Date.now();
const tick = () => {
  /*const currentTime = Date.now()
    const deltaTime = (currentTime - time)/100
    time = currentTime*/

  /*camera.position.x = Math.sin(cursor.x*Math.PI*2)*3
    camera.position.z = Math.cos(cursor.x*Math.PI*2)*3
    camera.position.y = cursor.y * 5
    camera.lookAt(cubeMesh.position)*/

  /*cubeMesh.rotation.x += 0.05 * deltaTime
    cubeMesh.rotation.y += 0.05 * deltaTime*/
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// Import .obj modelu
let chyby = [];
let model; // model k zobazení
let vertices;
let faces;
let faceNormal = [];
let obrys = { xMin: 0, xMax: 0, yMin: 0, yMax: 0, zMin: 0, zMax: 0, nove: 0 };
document.getElementById("inputfile").addEventListener("change", function() {
  var fr = new FileReader();
  fr.onload = function() {
    model = new THREE.Geometry();
    obrys.nove = 0;
    vertices = [];
    faces = [];
    document.getElementById("output").textContent = fr.result;
      const lines = String(fr.result).split("\n");
      // Cteni radek po radku obj souboru
    for (let i = 0; i < lines.length; i++) {
      const pof = lines[i].split(" ");

      // Pridavani vrcholu  
      if (pof[0] == "v") {
        vertices.push({ x: pof[1], y: pof[2], z: pof[3] });
        model.vertices.push(new THREE.Vector3(pof[1], pof[2], pof[3]));
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
          if (parseInt(obrys.xMin) > parseInt(pof[1])) {
            obrys.xMin = pof[1];
          }
          if (parseInt(obrys.xMax) < parseInt(pof[1])) {
            obrys.xMax = pof[1];
          }
          if (parseInt(obrys.yMin) > parseInt(pof[2])) {
            obrys.yMin = pof[2];
          }
          if (parseInt(obrys.yMax) < parseInt(pof[2])) {
            obrys.yMax = pof[2];
          }
          if (parseInt(obrys.zMin) > parseInt(pof[3])) {
            obrys.zMin = pof[3];
          }
          if (parseInt(obrys.zMax) < parseInt(pof[3])) {
            obrys.zMax = pof[3];
          }
        }
        }
        // Normala polygonu
      if (pof[0] == "vn") {
            faceNormal.push({ x: pof[1], y: pof[2], z: pof[3] });
        }
      // Pridani polygonu
      if (pof[0] == "f") {
        const verts = [];
        for (let k = 1; k < pof.length; k++) {
          const vert = pof[k].split("/");
          verts.push(vert[0]);
        }
        faces.push(verts);
        
        if (verts.length == 3) {
          model.faces.push(
            new THREE.Face3(verts[0] - 1, verts[1] - 1, verts[2] - 1)
          );
        } else {
          if (verts.length == 4) {
            model.faces.push(
              new THREE.Face3(verts[0] - 1, verts[1] - 1, verts[2] - 1),
              new THREE.Face3(verts[0] - 1, verts[2] - 1, verts[3] - 1)
            );
          }
          if (verts.length > 4) {
            for (let l = 2; l < verts.length; l++) {
              model.faces.push(
                new THREE.Face3(verts[0] - 1, verts[l - 1] - 1, verts[l] - 1)
              );
            }
          }
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
            }

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
        }
      }
    }
    model.computeFaceNormals();
    const modelMash = new THREE.Mesh(
      model,
      new THREE.MeshPhongMaterial({ color: "#d9dadb", side: THREE.DoubleSide })
    );
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if (scene.children[i].type === "Mesh") {
        scene.remove(scene.children[i]);
      }
      }
    scene.add(modelMash);

    // P�id�n� jednotkov� krychle
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: "#d9dadb",
      map: THREE.ImageUtils.loadTexture("unitCube.jpg")
    });
    const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.position.set(obrys.xMax, obrys.yMin, parseInt(obrys.zMax) + 2);
    scene.add(cubeMesh);
  };
  fr.addEventListener("error", event => {
    document.getElementById("output").textContent = "Can not load file";
  });
  fr.readAsText(this.files[0]);
});
