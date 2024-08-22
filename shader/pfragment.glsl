varying vec2 vUv;
uniform sampler2D positions;
uniform float dt;

void main() {
  vec4 pos = texture(positions, vUv);
  vec2 temp = pos.xy;
  float r = length(pos.xy);
  float theta = r * dt + 0.005;
  pos.x = cos(theta) * temp.x - sin(theta) * temp.y;
  pos.y = sin(theta) * temp.x + cos(theta) * temp.y;

  gl_FragColor = vec4(pos.xyz, 1.0);
}