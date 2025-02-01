interface StripResult {
  indices: number[];
  useStrips: boolean;
}

export function convertToTriangleStrips(indices: number[]): StripResult {
  if (indices.length < 12) { // Less than 4 triangles
    return { indices, useStrips: false };
  }

  const strips: number[][] = [];
  const used = new Set<number>();
  
  // Process triangles
  let i = 0;
  while (i < indices.length) {
    // Try to find a strip starting with this triangle
    const strip = findStripStartingAt(indices, i, used);
    if (strip.length >= 6) { // Only keep strips of at least 2 triangles
      strips.push(strip);
      strip.forEach(v => used.add(v));
      i += 3;
    } else {
      // No good strip found, move to next triangle
      i += 3;
    }
  }

  // Handle remaining triangles
  const remainingIndices: number[] = [];
  for (let i = 0; i < indices.length; i += 3) {
    if (!used.has(indices[i]) && !used.has(indices[i + 1]) && !used.has(indices[i + 2])) {
      remainingIndices.push(indices[i], indices[i + 1], indices[i + 2]);
    }
  }

  // Combine all strips and remaining triangles
  const combinedIndices = [...strips.flat(), ...remainingIndices];
  return {
    indices: combinedIndices,
    useStrips: strips.length > 0 && combinedIndices.length < indices.length
  };
}

function findStripStartingAt(indices: number[], start: number, used: Set<number>): number[] {
  const strip: number[] = [];
  const visited = new Set<number>();
  let current = start;

  while (current < indices.length) {
    const [a, b, c] = [indices[current], indices[current + 1], indices[current + 2]];
    
    // Stop if we've already used these vertices
    if (used.has(a) || used.has(b) || used.has(c)) {
      break;
    }

    if (strip.length === 0) {
      // First triangle
      strip.push(a, b, c);
      visited.add(a).add(b).add(c);
    } else {
      // Try to connect to existing strip
      const lastTwo = strip.slice(-2);
      if (containsEdge(lastTwo, [a, b])) {
        strip.push(c);
        visited.add(c);
      } else if (containsEdge(lastTwo, [b, c])) {
        strip.push(a);
        visited.add(a);
      } else if (containsEdge(lastTwo, [a, c])) {
        strip.push(b);
        visited.add(b);
      } else {
        break;
      }
    }
    current += 3;
  }

  return strip;
}

function containsEdge(vertices: number[], edge: number[]): boolean {
  return vertices.includes(edge[0]) && vertices.includes(edge[1]);
}