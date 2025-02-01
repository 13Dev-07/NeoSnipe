export class WebGLStateManager {
    private gl: WebGL2RenderingContext;
    private boundBuffers: Map<number, WebGLBuffer | null>;
    private boundProgram: WebGLProgram | null;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.boundBuffers = new Map();
        this.boundProgram = null;
    }

    useProgram(program: WebGLProgram | null): void {
        if (this.boundProgram !== program) {
            this.gl.useProgram(program);
            this.boundProgram = program;
        }
    }

    bindBuffer(target: number, buffer: WebGLBuffer | null): void {
        if (this.boundBuffers.get(target) !== buffer) {
            this.gl.bindBuffer(target, buffer);
            this.boundBuffers.set(target, buffer);
        }
    }

    reset(): void {
        this.useProgram(null);
        this.boundBuffers.clear();
    }

    dispose(): void {
        this.boundBuffers.forEach((buffer) => {
            if (buffer) {
                this.gl.deleteBuffer(buffer);
            }
        });
        this.reset();
    }
}