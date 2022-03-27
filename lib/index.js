"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwcWebpackMinifier = void 0;
const webpack_1 = require("webpack");
const core_1 = __importDefault(require("@swc/core"));
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
        const { include, exclude, sourceMap, ...transformOpts } = this.options;
        const assets = compilation.getAssets().filter((asset) => {
            return (!asset.info.minimized &&
                isJs.test(asset.name) &&
                (0, ModuleFilenameHelpers_js_1.matchObject)({ include, exclude }, asset.name));
        });
        await Promise.all(assets.map(async (asset) => {
            const { source, map } = asset.source.sourceAndMap();
            const sourceString = source.toString();
            const output = await core_1.minify(sourceString, transformOpts);
            compilation.updateAsset(asset.name, sourceMap
                ? new webpack_sources_1.SourceMapSource(output.code, asset.name, output.map, sourceString, map && map.toString() || '', true)
                : new webpack_sources_1.RawSource(output.code), {
                ...asset.info,
                minimized: true,
            });
        }));
    }
}
exports.SwcWebpackMinifier = SwcWebpackMinifier;
