import * as joint from 'jointjs';
export interface ToSVGOptions {
    preserveDimensions?: boolean;
    convertImagesToDataUris?: boolean;
    blacklistedCssAttributes?: string[];
    elementsToRemoveSelector?: string;
}
export declare function toSVG(paper: joint.dia.Paper, opt?: ToSVGOptions): Promise<string>;
export interface ToDataURLOptions {
    /** 'image/png' | 'image/jpeg' | ... */
    type?: string;
    width?: number;
    height?: number;
    padding?: number;
    backgroundColor?: string;
    quality?: number;
    svgOptions?: ToSVGOptions;
}
export declare function toDataURL(paper: joint.dia.Paper, options?: ToDataURLOptions): Promise<string>;
export declare function fitRectKeepingAspectRatio(sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): {
    width: number;
    height: number;
};
/**
  * Creates and returns a blob from a data URL (either base64 encoded or not).
  *
  * @param {string} dataURL The data URL to convert.
  * @return {Blob} A blob representing the array buffer data.
  */
export declare function dataURLToBlob(dataURL: string): Blob;
