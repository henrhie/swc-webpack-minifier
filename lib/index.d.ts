import webpack from 'webpack';
import swc from '@swc/core';
declare type Filter = string | RegExp;
declare type MinifyOptions = swc.JsMinifyOptions & {
    include?: Filter | Filter[];
    exclude?: Filter | Filter[];
    sourceMap?: boolean;
};
export declare class SwcWebpackMinifier {
    private options;
    constructor(options?: MinifyOptions);
    apply(compiler: webpack.Compiler): void;
    private processAssets;
}
export {};
