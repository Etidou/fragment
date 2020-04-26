import Uniforms from "./Uniforms.js";

let vertexShader = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 transformed = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}`;

const fragmentShader = /* glsl */`
uniform vec3 roomDiffuse;
uniform float roomAOIntensity;

varying vec2 vUv;

#include <common>

void main() {
    vec3 color = roomDiffuse;

    color *= sin(vUv.y * PI) * roomAOIntensity + (1. - roomAOIntensity); // vertical gradient
    color *= sin(vUv.x * PI) * roomAOIntensity + (1. - roomAOIntensity);

    gl_FragColor = vec4(color, 1.0);
}
`;

function Room () {
    let transform = new THREE.Object3D();
    let geometry = new THREE.PlaneBufferGeometry(1, 1);

    let material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            ...Uniforms.common(),
            diffuse: { value: new THREE.Color(0xFFFFFF) },
        }
    });

    let back = new THREE.Mesh(geometry, material);
    back.position.z = -Room.depth * 0.5;
    back.scale.set(Room.width, Room.height, 1);
    back.position.y = Room.height * 0.5;
    transform.add(back);

    let front = new THREE.Mesh(geometry, material);
    front.position.y = Room.height * 0.5;
    front.position.z = Room.depth * 0.5;
    front.scale.set(Room.width, Room.height, 1);
    front.rotation.y = Math.PI;
    transform.add(front);

    let left = new THREE.Mesh(geometry, material);
    left.position.x = -Room.width * 0.5;
    left.position.y = Room.height * 0.5;
    left.rotation.y = Math.PI * 0.5;
    left.scale.set(Room.depth, Room.height, 1);
    transform.add(left);

    let right = new THREE.Mesh(geometry, material);
    right.position.x = Room.width * 0.5;
    right.position.y = Room.height * 0.5;
    right.rotation.y = -Math.PI * 0.5;
    right.scale.set(Room.depth, Room.height, 1);
    transform.add(right);

    // let wallBack = new THREE.Mesh(geometry, material);
    // wallBack.position.z = -Room.depth * 0.5;
    // wallBack.scale.set(Room.width, Room.height, 1);
    // wallBack.position.y = Room.height * 0.5;
    // transform.add(wallBack);

    return {
        transform,
    }
}

Room.width = 15;
Room.depth = 15;
Room.height= 7;

export default Room;