import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const canvas = document.querySelector('canvas.webgl')
const parent = document.querySelector('.model')
var parentSize = parent.getBoundingClientRect()

// Sizes
const sizes = {
    width: parentSize.width,
    height: parentSize.height
}


const cursor = {
    x:0,
    y:0
}

window.addEventListener('mousemove', (event) =>{
    cursor.x = event.clientX/sizes.width - 0.5;
    cursor.y = event.clientY/sizes.height - 0.5;
    //console.log(cursor.y, cursor.x)
})

// Scene
const scene = new THREE.Scene()

//axis helper
/*const axisHelper = new THREE.AxesHelper(2)
scene.add(axisHelper)*/
// Object
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: '#ff0000'
})
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
scene.add(cubeMesh)
cubeMesh.rotation.y = Math.PI*0.25

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
scene.add(camera)

//Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = true
//controls.minPolarAngle = 0.2
//controls.maxPolarAngle = Math.PI/1.2


const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-30, 2, 4);
scene.add(light);
const light2 = new THREE.DirectionalLight({color: 0xFFFFFF, intensity: 1});
light2.position.set(30,1,-5);
scene.add(light2);
const ambLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambLight );

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})

//resize listener
window.addEventListener('resize', (event) =>{
    console.log("resize")
    parentSize = parent.getBoundingClientRect()
    sizes.width = parentSize.width
    sizes.height = parentSize.height
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.pixelRatio = Math.min(2,window.devicePixelRatio)

})

//gsap.to(cubeMesh.position, { duration: 1, delay: 5, x: 2})

var time = Date.now()
const tick = () =>
{
    /*const currentTime = Date.now()
    const deltaTime = (currentTime - time)/100
    time = currentTime*/

    /*camera.position.x = Math.sin(cursor.x*Math.PI*2)*3
    camera.position.z = Math.cos(cursor.x*Math.PI*2)*3
    camera.position.y = cursor.y * 5
    camera.lookAt(cubeMesh.position)*/

    /*cubeMesh.rotation.x += 0.05 * deltaTime
    cubeMesh.rotation.y += 0.05 * deltaTime*/
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()


renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

let model;
let vertices;
let faces;
document.getElementById('inputfile').addEventListener('change', function () {
    var fr = new FileReader();
    fr.onload = function () {
    model = new THREE.Geometry();
    vertices = [];
    faces = [];
        document.getElementById('output').textContent = fr.result;
        const lines = String(fr.result).split("\n");
        for(let i = 0; i < lines.length; i++){
            const pof = lines[i].split(' ')
            
            if(pof[0]=='v'){
                vertices.push({x:pof[1], y:pof[2], z:pof[3]})
                model.vertices.push(new THREE.Vector3(pof[1], pof[2], pof[3]));
            }
            if(pof[0]=='f'){
                const verts = []
                for(let k = 1; k < pof.length; k++){
                    const vert = pof[k].split('/');
                    verts.push(vert[0])
                    
                }
                faces.push(verts)
                if(verts.length == 3){
                model.faces.push(new THREE.Face3(verts[0]-1, verts[1]-1, verts[2]-1));
                }
                if(verts.length == 4){
                model.faces.push(new THREE.Face3(verts[0]-1, verts[1]-1, verts[2]-1), new THREE.Face3(verts[0]-1, verts[2]-1, verts[3]-1));
                }
                
            }
        }
        model.computeFaceNormals();
        const modelMash = new THREE.Mesh(model, new THREE.MeshPhongMaterial({color: '#d9dadb', side: THREE.DoubleSide}));
        for (let i = scene.children.length - 1; i >= 0; i--) {
            if(scene.children[i].type === "Mesh"){
                scene.remove(scene.children[i]);
            }
        }
        scene.add(modelMash);
    }
    fr.addEventListener('error', (event) => {
         document.getElementById('output').textContent = "Can not load file";
    });
    fr.readAsText(this.files[0]);
    })


