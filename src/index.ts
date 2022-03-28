import webpack, { Compilation } from 'webpack';
import * as swc from '@swc/core';
import { matchObject } from 'webpack/lib/ModuleFilenameHelpers.js';
import { RawSource, SourceMapSource } from 'webpack-sources';

const pluginName = 'swc-webpack-minifier';

type Filter = string | RegExp;

type MinifyOptions = swc.JsMinifyOptions & {
	include?: Filter | Filter[];
	exclude?: Filter | Filter[];
};

const isWp5 = (compilation: webpack.Compilation) => {
	return compilation.hooks.processAssets;
};

const isJs = /\.[cm]?js(?:\?.*)?$/i;

export class SwcWebpackMinifier {
	constructor(
		private options: MinifyOptions = {
			include: '',
			exclude: '',
			sourceMap: true,
		}
	) {}

	apply(compiler: webpack.Compiler) {
		compiler.hooks.compilation.tap(pluginName, (compilation) => {
			if (isWp5(compilation)) {
				compilation.hooks.processAssets.tapPromise(
					{
						name: pluginName,
						stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
						additionalAssets: true,
					},
					async () => {
						await this.processAssets(compilation);
					}
				);
			} else {
				compilation.hooks.optimizeChunkAssets.tapPromise(
					pluginName,
					async () => {
						await this.processAssets(compilation);
					}
				);
			}
		});
	}

	private async processAssets(compilation: webpack.Compilation) {
		const { include, exclude, ...transformOpts } = this.options;

		const assets = compilation.getAssets().filter((asset) => {
			return (
				!asset.info.minimized &&
				isJs.test(asset.name) &&
				matchObject({ include, exclude }, asset.name)
			);
		});

		await Promise.all(
			assets.map(async (asset) => {
				const { source, map } = asset.source.sourceAndMap();
				const sourceString = source.toString();

				const output = await swc.minify(sourceString, transformOpts);
				compilation.updateAsset(
					asset.name,
					transformOpts.sourceMap
						? new SourceMapSource(
								output.code,
								asset.name,
								output.map as any,
								sourceString,
								map as any,
								true
						  )
						: new RawSource(output.code),
					{
						...asset.info,
						minimized: true,
					}
				);
			})
		);
	}
}
