import { GeometryData } from '../../types/sacred-geometry';

export function buildVertexConnections(geometry: GeometryData): Map<number, Set<number>> {
  const connections = new Map<number, Set<number>>();
  
  for (let i = 0; i < geometry.indices.length; i += 3) {
    const [a, b, c] = [
      geometry.indices[i],
      geometry.indices[i + 1],
      geometry.indices[i + 2]
    ];
    
    addConnection(connections, a, b);
    addConnection(connections, b, c);
    addConnection(connections, c, a);
  }
  
  return connections;
}

export function addConnection(map: Map<number, Set<number>>, a: number, b: number): void {
  if (!map.has(a)) map.set(a, new Set());
  if (!map.has(b)) map.set(b, new Set());
  
  map.get(a)!.add(b);
  map.get(b)!.add(a);
}

export function compareVertexConnectivity(
  aConnections: Map<number, Set<number>>,
  bConnections: Map<number, Set<number>>
): boolean {
  if (aConnections.size !== bConnections.size) {
    return false;
  }

  for (const [vertexIndex, connections] of aConnections) {
    const bVertex = bConnections.get(vertexIndex);
    if (!bVertex || bVertex.size !== connections.size) {
      return false;
    }
  }

  return true;
}