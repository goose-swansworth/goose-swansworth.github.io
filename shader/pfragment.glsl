varying vec2 vUv;
uniform sampler2D positions;
uniform float dt;
uniform vec2 mouse;

vec2 duffing(vec2 u) {
  float gamma = 2.5;
  float alpha = -1.0;
  float beta = 0.25;
  float delta = 0.1;
  float omega = 2.0;
  return vec2(
    u.y,
    gamma * cos(u.x) - delta * u.y - alpha * u.x - beta * u.x * u.x * u.x
  );
}

vec2 eulerStep(vec2 xn) {
  return xn + dt * duffing(xn);
}

void main() {
  vec4 pos = texture(positions, vUv);
  vec2 temp = pos.xy;
  //float r = length(pos.xy);
  //float theta = r * dt + 0.005;

  vec2 toMouse = normalize(mouse - pos.xy);
  float distToMouse = length(mouse - pos.xy);
  float r = 0.5;

  //pos.x = cos(theta) * temp.x - sin(theta) * temp.y;
  //pos.y = sin(theta) * temp.x + cos(theta) * temp.y;

  pos.xy = eulerStep(pos.xy);
  if (distToMouse < r) {
    pos.xy -= toMouse * dt;
  }

  //pos.xy += toMouse + 0.01;
  //pos.xy += toMouse * dt * 0.1;

  gl_FragColor = vec4(pos.xyz, 1.0);
}