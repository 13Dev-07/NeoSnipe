export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];

export type Matrix3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

export type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface BoundingSphere {
  center: Vector3;
  radius: number;
}

export interface GeometryTransform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface Plane {
  normal: Vector3;
  distance: number;
}

export interface Ray {
  origin: Vector3;
  direction: Vector3;
}

export interface Intersection {
  point: Vector3;
  normal: Vector3;
  distance: number;
  inside: boolean;
}

export interface ViewFrustum {
  planes: Plane[];
}

export function createIdentityMatrix4(): Matrix4 {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export function createZeroVector3(): Vector3 {
  return [0, 0, 0];
}

export function createBoundingBox(): BoundingBox {
  return {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity]
  };
}

export function expandBoundingBox(box: BoundingBox, point: Vector3): void {
  box.min[0] = Math.min(box.min[0], point[0]);
  box.min[1] = Math.min(box.min[1], point[1]);
  box.min[2] = Math.min(box.min[2], point[2]);
  box.max[0] = Math.max(box.max[0], point[0]);
  box.max[1] = Math.max(box.max[1], point[1]);
  box.max[2] = Math.max(box.max[2], point[2]);
}