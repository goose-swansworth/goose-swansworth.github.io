varying vec2 vUv;
uniform sampler2D positions;

void main() {
  vUv = uv;
  vec4 pos = texture2D(positions, uv);
  vec4 modelViewPos = modelViewMatrix * pos;//* vec4(position, 1.0);
  gl_PointSize = 10. * (1. / -modelViewPos.z);
  gl_Position = projectionMatrix * modelViewPos;
}