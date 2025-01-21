import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock WebGL context for testing
export const mockWebGLContext = () => {
  const mockContext = {
    viewport: jest.fn(),
    clearColor: jest.fn(),
    clear: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    getExtension: jest.fn(),
    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    getShaderParameter: jest.fn(),
    createProgram: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getProgramParameter: jest.fn(),
    useProgram: jest.fn(),
    getAttribLocation: jest.fn(),
    getUniformLocation: jest.fn(),
    uniformMatrix4fv: jest.fn(),
    uniform1f: jest.fn(),
    uniform2f: jest.fn(),
    uniform3f: jest.fn(),
    uniform4f: jest.fn(),
    createBuffer: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    vertexAttribPointer: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
  };

  HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
  return mockContext;
};

export * from '@testing-library/react';
export { customRender as render };