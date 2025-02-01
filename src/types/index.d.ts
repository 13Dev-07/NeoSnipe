declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  import React from 'react';
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

declare module '*.json' {
  const value: any;
  export default value;
}

// Add support for importing glsl files
declare module '*.vert' {
  const content: string;
  export default content;
}

declare module '*.frag' {
  const content: string;
  export default content;
}