varying vec2 vUv;
varying vec2 velocity;
uniform sampler2D positions;
uniform sampler2D lastPositions;

void main() {
  vUv = uv;
  vec4 pos = texture2D(positions, uv);
  vec4 lastPos = texture2D(lastPositions, uv);
  velocity = pos.xy - lastPos.xy;
  vec4 modelViewPos = modelViewMatrix * pos;//* vec4(position, 1.0);
  gl_PointSize = 10. * (1. / -modelViewPos.z);
  gl_Position = projectionMatrix * modelViewPos;
}