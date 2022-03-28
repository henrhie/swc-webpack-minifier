"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwcWebpackMinifier = void 0;
const webpack_1 = require("webpack");
const swc = __importStar(require("@swc/core"));
const ModuleFilenameHelpers_js_1 = require("webpack/lib/ModuleFilenameHelpers.js");
const webpack_sources_1 = require("webpack-sources");
const pluginName = 'swc-webpack-minifier';
const isWp5 = (compilation) => {
    return compilation.hooks.processAssets;
};
const isJs = /\.[cm]?js(?:\?.*)?$/i;
class SwcWebpackMinifier {
    constructor(options = {
        include: '',
        exclude: '',
        sourceMap: true,
    }) {
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            if (isWp5(compilation)) {
                compilation.hooks.processAssets.tapPromise({
                    name: pluginName,
                    stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
                    additionalAssets: true,
                }, async () => {
                    await this.processAssets(compilation);
                });
            }
            else {
                compilation.hooks.optimizeChunkAssets.tapPromise(pluginName, async () => {
                    await this.processAssets(compilation);
                });
            }
        });
    }
    async processAssets(compilation) {
        const { include, exclude, ...transformOpts } = this.options;
        const assets = compilation.getAssets().filter((asset) => {
            return (!asset.info.minimized &&
                isJs.test(asset.name) &&
                (0, ModuleFilenameHelpers_js_1.matchObject)({ include, exclude }, asset.name));
        });
        await Promise.all(assets.map(async (asset) => {
            const { source, map } = asset.source.sourceAndMap();
            const sourceString = source.toString();
            const output = await swc.minify(sourceString, transformOpts);
            compilation.updateAsset(asset.name, transformOpts.sourceMap
                ? new webpack_sources_1.SourceMapSource(output.code, asset.name, output.map, sourceString, map, true)
                : new webpack_sources_1.RawSource(output.code), {
                ...asset.info,
                minimized: true,
            });
        }));
    }
}
exports.SwcWebpackMinifier = SwcWebpackMinifier;
