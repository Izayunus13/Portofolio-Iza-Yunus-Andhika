import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Bake stationary details into a few material batches, preserving animated parts. */
export function batchStaticDetails(root: T.Group, animated: Set<T.Object3D> = new Set()) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map<string, T.Mesh[]>();
  root.traverse(object => {
    if (!(object instanceof T.Mesh) || object instanceof T.InstancedMesh || animated.has(object) || Array.isArray(object.material)) return;
    for(let parent=object.parent;parent&&parent!==root;parent=parent.parent)if(animated.has(parent))return;
    const attributes = Object.keys(object.geometry.attributes).sort().map(key => `${key}:${object.geometry.attributes[key].itemSize}`).join(',');
    const key = `${object.material.uuid}:${object.castShadow}:${object.receiveShadow}:${object.renderOrder}:${attributes}`;
    const group = groups.get(key) ?? [];group.push(object);groups.set(key, group);
  });
  const removed = new Set<T.BufferGeometry>();
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    const geometry = mergeGeometries(meshes.map(mesh => {
      const clone = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      clone.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
      return clone;
    }));
    if (!geometry) continue;
    const first = meshes[0], batch = new T.Mesh(geometry, first.material);
    batch.castShadow = first.castShadow;batch.receiveShadow = first.receiveShadow;batch.renderOrder = first.renderOrder;
    batch.userData = { ...root.userData };batch.name = `${root.name}-details`;
    root.add(batch);
    meshes.forEach(mesh => { removed.add(mesh.geometry);mesh.removeFromParent(); });
  }
  const retained = new Set<T.BufferGeometry>();
  root.traverse(object => { if (object instanceof T.Mesh) retained.add(object.geometry); });
  removed.forEach(geometry => { if (!retained.has(geometry)) geometry.dispose(); });
}
