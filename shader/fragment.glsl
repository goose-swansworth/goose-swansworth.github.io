varying vec2 vUv;
varying vec2 velocity;
uniform sampler2D positions;

void main() {
  vec4 blue = vec4(1, 0, 1, 1);
  vec4 red = vec4(1, 1, 0, 1);
  gl_FragColor = mix(blue, red, 0.25 * length(velocity));//vec4(vUv, 0.0, 1.0);
}