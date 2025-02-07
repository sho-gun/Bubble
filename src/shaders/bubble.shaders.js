export const shaders = {
  frag: `
const float PI = 3.14159265358979323846;

varying vec2 v_Uv;
varying vec3 v_mvViewPosition;
varying vec3 v_mvNormal;

uniform vec3 u_directionalLightPos;
uniform vec3 u_directionalLightColor;
uniform vec3 u_ambientLightColor;
uniform vec3 u_materialColor;
uniform vec3 u_backgroundColor;
uniform float u_surfaceThickness; // nm
uniform float u_refractiveIndex;
uniform sampler2D u_texture;
uniform float u_alpha;

const vec3 wavelengths = vec3(620.0, 530.0, 485.0); // nm

vec3 getInterferenceColor() {
  vec3 interferenceColor = u_directionalLightColor;

  float cos_theta = dot(normalize(directionalLightPos), mvNormal);
  float sin_theta = sqrt(1.0 - pow(cos_theta, 2.0));
  float sin_phi = sin_theta / refractiveIndex;
  float distanceDiff = 2.0 * surfaceThickness * (1.0 - sin_theta*sin_phi) / sqrt(1.0 - pow(sin_phi, 2.0));

  interferenceColor *= 0.5 * sqrt(2.0 + 2.0 * cos(2.0 * PI * distanceDiff / wavelengths));

  return interferenceColor;
}

void main() {
  vec3 ambientColor = u_ambientLightColor * u_materialColor;
  vec3 diffuseColor = max(0.0, dot(normalize(u_directionalLightPos), v_mvNormal)) * u_directionalLightColor * u_materialColor;
  vec3 interferenceColor = getInterferenceColor();
  vec3 lightColor = mix(u_backgroundColor, ambientColor + diffuseColor + interferenceColor, 0.1);
  vec2 uv = v_Uv;
  // left side of bubble
  if(uv.x < 0.25)
    uv = vec2(0.25 - uv.x, (0.6 - uv.y) * 2.0); // flip side up and move to the bottom left.
  // right side of bubble
  else
    uv = vec2(uv.x, ( uv.y - 0.4 ) * 2.0); // move to the top right.
  uv = vec2(fract( uv.x * 4.0 ), uv.y);
  // distortion
  vec2 uvOffset = 0.01 * vec2(cos(uv.y * 20.), sin(uv.x * 20.));
  vec3 color = texture2D(u_texture, uv + uvOffset + v_mvViewPosition.y / 50.0).rgb;
  gl_FragColor.rgb = mix(lightColor, color, 0.3);
  gl_FragColor.a = u_alpha;
}`,
  vert: `
varying vec2 v_Uv;
varying vec3 v_mvViewPosition;
varying vec3 v_mvNormal;

void main() {
  v_Uv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition =  viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;

  v_mvViewPosition = -mvPosition.xyz;
  v_mvNormal = normalize(normalMatrix * normal);
}`,
};
