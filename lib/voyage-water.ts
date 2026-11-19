import * as T from 'three';
import {voyageSeaPalette} from './sea-palette';

export const seaLevel = -.075;
export function waterHeight(x: number, z: number, time: number) {
  return seaLevel + Math.sin(x * .48 + z * .22 - time * .85) * .025
    + Math.sin(z * .73 - x * .18 + time * .63) * .018;
}

export function createVoyageWater(scene: T.Scene) {
  const clock = { value: 0 };
  const material = new T.MeshStandardMaterial({ color: voyageSeaPalette.water, roughness: .38, metalness: .18 });
  material.onBeforeCompile = shader => {
    shader.uniforms.seaTime = clock;
    const functions = `
      uniform float seaTime;
      float swell(vec2 p) {
        return sin(p.x*.48+p.y*.22-seaTime*.85)*.025
          +sin(p.y*.73-p.x*.18+seaTime*.63)*.018;
      }
    `;
    shader.vertexShader = functions + 'varying vec2 seaPosition;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
      vec2 seaP = position.xz + vec2(25., -15.);
      float dx = cos(seaP.x*.48+seaP.y*.22-seaTime*.85)*.012
        -cos(seaP.y*.73-seaP.x*.18+seaTime*.63)*.00324;
      float dz = cos(seaP.x*.48+seaP.y*.22-seaTime*.85)*.0055
        +cos(seaP.y*.73-seaP.x*.18+seaTime*.63)*.01314;
      vec3 objectNormal = normalize(vec3(-dx, 1., -dz));
    `).replace('#include <begin_vertex>', `
      vec3 transformed = vec3(position);
      seaPosition = position.xz + vec2(25., -15.);
      transformed.y += swell(seaPosition);
    `);
    shader.fragmentShader = functions + 'varying vec2 seaPosition;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      float ripples = sin(seaPosition.x*3.7+seaPosition.y*5.2-seaTime*1.5)
        *sin(seaPosition.y*2.8-seaPosition.x*1.9+seaTime*.7);
      float crest = smoothstep(.55, .98, ripples);
      diffuseColor.rgb *= 1. + swell(seaPosition)*1.4 + ripples*.025;
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.69,.85,.78), crest*.08);
    `);
  };
  const geometry = new T.PlaneGeometry(240, 180, 200, 150).rotateX(-Math.PI / 2);
  const mesh = new T.Mesh(geometry, material);
  mesh.name = 'animated-ocean';mesh.position.set(25, seaLevel, -15);mesh.receiveShadow = true;
  scene.add(mesh);
  return { color:material.color.getHexString(),update(time: number) { clock.value = time; } };
}

type WakeSample = { x: number; z: number; fx: number; fz: number; born: number; strength: number };
type Foam = WakeSample & { life: number; size: number; drift: number };

/** A bounded world-space wake: older water stays behind as the ship changes course. */
export function createShipWake(scene: T.Scene) {
  const capacity = 150, lifetime = 4.2;
  const samples: WakeSample[] = [], foam: Foam[] = [];
  const geometry = new T.BufferGeometry();
  const positions = new Float32Array(capacity * 3 * 6 * 3);
  const colors = new Float32Array(capacity * 3 * 6 * 4);
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3).setUsage(T.DynamicDrawUsage));
  geometry.setAttribute('color', new T.BufferAttribute(colors, 4).setUsage(T.DynamicDrawUsage));
  const material = new T.MeshBasicMaterial({ color: '#eef7e6', vertexColors: true, transparent: true, depthWrite: false, side: T.DoubleSide });
  const trail = new T.Mesh(geometry, material);trail.name = 'persistent-ship-wake';trail.frustumCulled = false;trail.renderOrder = 2;scene.add(trail);

  const foamGeometry = new T.CircleGeometry(1, 7).rotateX(-Math.PI / 2);
  const foamOpacity = new T.InstancedBufferAttribute(new Float32Array(180), 1).setUsage(T.DynamicDrawUsage);
  foamGeometry.setAttribute('foamOpacity', foamOpacity);
  const foamMaterial = new T.MeshBasicMaterial({ color: '#f4faec', transparent: true, depthWrite: false, side: T.DoubleSide });
  foamMaterial.onBeforeCompile = shader => {
    shader.vertexShader = 'attribute float foamOpacity; varying float vFoamOpacity;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvFoamOpacity = foamOpacity;');
    shader.fragmentShader = 'varying float vFoamOpacity;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vFoamOpacity;');
  };
  const particles = new T.InstancedMesh(foamGeometry, foamMaterial, 180);
  particles.name = 'ship-foam';particles.instanceMatrix.setUsage(T.DynamicDrawUsage);particles.frustumCulled = false;particles.renderOrder = 3;particles.count = 0;scene.add(particles);

  const bow = new T.Group();bow.name = 'bow-pressure-waves';scene.add(bow);
  const bowMaterial = new T.MeshBasicMaterial({ color: '#f1f7e6', transparent: true, opacity: 0, depthWrite: false });
  for (const sign of [-1, 1]) {
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(2.1, 0, sign * .12), new T.Vector3(1.25, 0, sign * .77),
      new T.Vector3(-.3, 0, sign * 1.12), new T.Vector3(-2.5, 0, sign * 1.03),
    ]);
    bow.add(new T.Mesh(new T.TubeGeometry(curve, 28, .025, 4, false), bowMaterial));
  }
  const dummy = new T.Object3D(), previous = new T.Vector3();
  let initialized = false, lastEmission = 0, serial = 0, smoothedSpeed = 0;

  function emit(x: number, z: number, fx: number, fz: number, time: number, strength: number) {
    samples.unshift({ x: x - fx * 2.8, z: z - fz * 2.8, fx, fz, born: time, strength });
    if (samples.length > capacity) samples.pop();
    for (const side of [-1, 1]) {
      const seed = serial++;
      const stern = seed % 3 !== 0;
      const jitter = Math.sin(seed * 78.233);
      const along = (stern ? -2.6 : 1.3) + jitter * .32;
      const across = side * ((stern ? .65 : .72) + Math.sin(seed * 31.17) * .24);
      foam.push({ x: x + fx * along - fz * across, z: z + fz * along + fx * across,
        fx, fz, born: time, strength: strength * (.72 + Math.abs(jitter) * .28), life: (stern ? 2.6 : 1.3) + jitter * .25,
        size: .045 + (seed % 7) * .012, drift: side * (.12 + (seed % 5) * .055) });
    }
    if (foam.length > 180) foam.splice(0, foam.length - 180);
  }

  function update(position: T.Vector3, heading: number, time: number, dt: number, reduced: boolean) {
    const distance = initialized ? previous.distanceTo(position) : 0;
    const speed = distance / Math.max(.001, dt);
    smoothedSpeed = T.MathUtils.damp(smoothedSpeed, speed, 7, dt);
    const strength = reduced ? 0 : Math.min(1, smoothedSpeed / 4);
    const fx = Math.cos(heading), fz = -Math.sin(heading);
    if (!reduced && initialized && distance > .002 && distance < 4 && time - lastEmission > .025) {
      const count = Math.min(12, Math.max(1, Math.ceil(distance / .18)));
      for (let i = 1; i <= count; i++) {
        const fraction = i / count;
        emit(T.MathUtils.lerp(previous.x, position.x, fraction), T.MathUtils.lerp(previous.z, position.z, fraction), fx, fz, time - dt * (1 - fraction), strength);
      }
      lastEmission = time;
    }
    previous.copy(position);initialized = true;
    while (samples.length && time - samples[samples.length - 1].born > lifetime) samples.pop();
    for (let i = foam.length - 1; i >= 0; i--) if (time - foam[i].born > foam[i].life) foam.splice(i, 1);

    let vertex = 0;
    function write(sample: WakeSample, side: number, edge: number, center: boolean) {
      const age = time - sample.born, fade = Math.max(0, 1 - age / lifetime);
      const spread = center ? 0 : side * (1.02 + age * .55);
      const width = center ? .22 + age * .24 : .045 + age * .055;
      const wobble = Math.sin(age * 5 + sample.born * 8) * .045;
      const offset = spread + edge * width + wobble;
      const x = sample.x - sample.fz * offset, z = sample.z + sample.fx * offset;
      positions[vertex * 3] = x;positions[vertex * 3 + 1] = waterHeight(x, z, time) + .021;positions[vertex * 3 + 2] = z;
      colors[vertex * 4] = 1;colors[vertex * 4 + 1] = 1;colors[vertex * 4 + 2] = 1;
      colors[vertex * 4 + 3] = fade * fade * sample.strength * (center ? .16 : .55);
      vertex++;
    }
    for (let i = 0; i < samples.length - 1; i++) {
      // Do not bridge a pause or a discontinuous reduced-motion jump.
      if (samples[i].born - samples[i + 1].born > .25) continue;
      for (const side of [-1, 0, 1]) {
        const a = samples[i], b = samples[i + 1], center = side === 0;
        write(a, side, -1, center);write(b, side, -1, center);write(a, side, 1, center);
        write(a, side, 1, center);write(b, side, -1, center);write(b, side, 1, center);
      }
    }
    geometry.setDrawRange(0, vertex);geometry.attributes.position.needsUpdate = true;geometry.attributes.color.needsUpdate = true;
    foam.forEach((p, i) => {
      const age = time - p.born, life = age / p.life;
      const x = p.x - p.fz * p.drift * age, z = p.z + p.fx * p.drift * age;
      // The circles lie on the water rather than floating up like smoke.
      dummy.position.set(x, waterHeight(x, z, time) + .032, z);
      dummy.rotation.set(0, p.born * 3, 0);dummy.scale.set(p.size * (1 + life * 2), 1, p.size * (1 + life));dummy.updateMatrix();particles.setMatrixAt(i, dummy.matrix);
      foamOpacity.setX(i, (1 - life) ** 2 * p.strength * .72);
    });
    particles.count = foam.length;particles.instanceMatrix.needsUpdate = true;foamOpacity.needsUpdate = true;
    bow.position.set(position.x, waterHeight(position.x, position.z, time) + .028, position.z);bow.rotation.y = heading;
    bowMaterial.opacity = strength * (.42 + Math.sin(time * 9) * .07);
    bow.scale.set(1 + Math.sin(time * 6) * .015, 1, 1 + Math.sin(time * 5) * .035);
    bow.visible = !reduced && strength > .01;
    return { strength, particles: foam.length, samples: samples.length };
  }
  return { update };
}
