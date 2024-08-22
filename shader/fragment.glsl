varying vec2 vUv;
uniform sampler2D positions;

void main() {
  gl_FragColor = vec4(vUv, 0.0, 1.0);
}