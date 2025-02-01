import { WebGLStateSnapshot } from '../../types/sacred-geometry/state';

export function createDefaultGLState(gl: WebGL2RenderingContext): WebGLStateSnapshot {
  return {
    program: null,
    vertexArray: null,
    viewport: [0, 0, 0, 0],
    depthTest: true,
    blending: false,
    cullFace: false,
    frontFace: gl.CCW,
    depthMask: true,
    depthFunc: gl.LESS,
    blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
    clearColor: [0, 0, 0, 1],
    boundTextures: new Map(),
    boundBuffers: new Map(),
    activeAttributes: new Set()
  };
}

export function snapshotGLState(gl: WebGL2RenderingContext, currentState: WebGLStateSnapshot): WebGLStateSnapshot {
  return {
    ...currentState,
    boundTextures: new Map(currentState.boundTextures),
    boundBuffers: new Map(currentState.boundBuffers), 
    activeAttributes: new Set(currentState.activeAttributes)
  };
}

export function restoreGLState(gl: WebGL2RenderingContext, state: WebGLStateSnapshot): void {
  // Restore program
  gl.useProgram(state.program);

  // Restore vertex array
  gl.bindVertexArray(state.vertexArray);

  // Restore viewport
  gl.viewport(...state.viewport);

  // Restore depth test
  if (state.depthTest) {
    gl.enable(gl.DEPTH_TEST);
  } else {
    gl.disable(gl.DEPTH_TEST);
  }

  // Restore blending
  if (state.blending) {
    gl.enable(gl.BLEND);
  } else {
    gl.disable(gl.BLEND);
  }

  // Restore face culling
  if (state.cullFace) {
    gl.enable(gl.CULL_FACE);
  } else {
    gl.disable(gl.CULL_FACE);
  }

  // Restore other state
  gl.frontFace(state.frontFace);
  gl.depthMask(state.depthMask);
  gl.depthFunc(state.depthFunc);
  gl.blendFunc(...state.blendFunc);
  gl.clearColor(...state.clearColor);

  // Restore texture bindings
  state.boundTextures.forEach((texture, unit) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  });

  // Restore buffer bindings
  state.boundBuffers.forEach((buffer, target) => {
    gl.bindBuffer(target, buffer);
  });

  // Restore vertex attributes
  state.activeAttributes.forEach(location => {
    gl.enableVertexAttribArray(location);
  });
}