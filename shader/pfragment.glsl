varying vec2 vUv;
uniform sampler2D positions;
uniform float dt;
uniform float time;
uniform vec2 mouse;
uniform bool attract;
uniform float sigma;
uniform float rho;
uniform float beta;
uniform float pointerRadius;

float PI = 3.141;

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec3 lorenz(vec3 u) {
  return vec3(
    sigma * (u.y - u.x),
    u.x * (rho - u.z) - u.y,
    u.x * u.y - beta * u.z
  );
}

vec3 eulerStep(vec3 xn, vec3 f) {
  return xn + 0.5 * dt * f;
}

vec3 ralstonStep(vec3 xn, vec3 f) {
  return xn + dt * (0.25 * f + 0.75 * lorenz(xn + 2.0 / 3.0 * dt * f));
}

void main() {
  vec4 pos = texture(positions, vUv);
  vec2 temp = pos.xy;
  //float r = length(pos.xy);
  //float theta = r * dt + 0.005;

  vec2 toMouse = normalize(mouse - pos.xy);
  float distToMouse = length(mouse - pos.xy);

  if (attract) {
    float q = random(vUv.st);
    float p = random(vUv.ts);
    float s = vUv.s;
    float t = vUv.t;
    float r = random(vec2(s + t, s * t));
    float theta = 2.0 * PI * p;
    float phi = PI * r;
    vec3 target = pointerRadius * q * vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta)) + vec3(mouse.xy, 0);
    vec3 toTarget = target - pos.xyz;
    pos.xyz += 1.5 * dt * toTarget;
  } else {
    vec3 lorenz_f = lorenz(pos.xyz);
    pos.xyz = ralstonStep(pos.xyz, lorenz_f);
    pos.a = length(lorenz_f);
  }

  //pos.x = cos(theta) * temp.x - sin(theta) * temp.y;
  //pos.y = sin(theta) * temp.x + cos(theta) * temp.y;

  

  

  //pos.xy += toMouse + 0.01;
  //pos.xy += toMouse * dt * 0.1;

  gl_FragColor = pos;
}