import { CopyMaterial, Pass } from 'postprocessing';
import { WebGLRenderer, WebGLRenderTarget } from 'three';

/**
 * This pass captures the current frame into a WebGLRenderTarget.
 */

export class CapturePass extends Pass {
	renderTarget: WebGLRenderTarget;
	autoResize: boolean;
	/**
	 * Constructs a new capture pass.
	 *
	 * @param {WebGLRenderTarget} [renderTarget] - A render target.
	 * @param {Boolean} [autoResize=true] - Whether the render target size should be updated automatically.
	 */
	constructor(renderTarget?: WebGLRenderTarget, autoResize: boolean = true) {
		super('CapturePass');
		this.fullscreenMaterial = new CopyMaterial();
		this.renderTarget = renderTarget || new WebGLRenderTarget(1, 1);
		this.renderTarget.texture.name = 'CapturePass.Target';
		this.needsSwap = false;
		this.autoResize = autoResize;
		this.renderToScreen = false;
	}
	render(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget) {
		(this.fullscreenMaterial as any).inputBuffer = inputBuffer.texture;
		renderer.setRenderTarget(this.renderTarget);
		renderer.render(this.scene, this.camera);
	}
	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */
	setSize(width: number, height: number) {
		if (this.autoResize) {
			this.renderTarget.setSize(width, height);
		}
	}
}
