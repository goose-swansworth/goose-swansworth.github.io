varying vec2 vUv;
out float speed;
uniform sampler2D positions;
uniform sampler2D lastPositions;
uniform float particleSize;
uniform vec3 camera;

void main() {
  vUv = uv;
  vec4 pos = texture2D(positions, uv);
  speed = pos.w;  
  vec4 modelViewPos = modelViewMatrix * vec4(pos.xyz, 1.0);
  // float distanceCamera = length(pos.xyz - camera);
  gl_PointSize = max(particleSize / -modelViewPos.z, 1.0);
  gl_Position = projectionMatrix * modelViewPos;
}