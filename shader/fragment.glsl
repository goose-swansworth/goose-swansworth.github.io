varying vec2 vUv;
in float speed;
uniform sampler2D positions;
uniform float time;
uniform sampler2D particleTexture;


vec2 getTextureCoords() {
  return vec2(
    gl_PointCoord.x,
    1.0 - gl_PointCoord.y
  );
}

void main() {
  vec4 red = vec4(0.8, 0.25, 0.25, 1);
  vec4 blue = vec4(0.5, 0.5, 0.25, 1);
  vec4 textureColor = texture2D(particleTexture, getTextureCoords());
  gl_FragColor = mix(blue, red, 0.0025 * speed) * textureColor;
  //gl_FragColor = //vec4(vUv, 0.0, 1.0);
  //gl_FragColor = mix(vec4(0.1333, 0.1333, 0.1333, 1.0), textureColor, textureColor.a);
} 