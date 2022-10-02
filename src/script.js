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
controls.enablePan = false
controls.minPolarAngle = 0.2
controls.maxPolarAngle = Math.PI/1.2

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
