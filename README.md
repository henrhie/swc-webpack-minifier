# swc-webpack-minifier - webpack plugin

Speed up ⚡⚡⚡ webpack build by delegating javascript minification to [swc](https://swc.rs/)

<br>

swc-webpack-minifier is an attempt to explore the various ways developer experience can be greatly improved upon without compromising quality of code. Under the hood, this webpack plugin utilizes the sheer speed of the swc minifier (written in Rust) to generate small and optimized bundles for browser javascript environments.

## Install

```bash
npm install swc-webpack-minifier --save-dev
```

<br>

## Usage

`webpack.config.js`

```js
module.exports = {
	...
	optimization: {
		minimizer: [
			new SwcWebpackMinifier({
				...transformationOptions
			}),
		],
	},
	devtool: 'source-map',
};
```

```js
type transformationOptions = swc.JsMinifyOptions & {
	include?: Filter | Filter[];
	exclude?: Filter | Filter[];
}
```
[swc.JsMinifyOptions](https://swc.rs/docs/configuration/minification)

`index.js`

```js
function foo(x) {
	if (x) {
		return JSON.stringify(x);
	}
	return 'default string';
}

foo(55);
```

`dist/main.bundle.js`

```js
(()=>{var __webpack_exports__={};function foo(x){if(x){return JSON.stringify(x)}return"default string"}foo(55)})()
//# sourceMappingURL=main.bundle.js.map
```

## Benchmarks

Go to https://github.com/privatenumber/minification-benchmarks to see how the swc minifier stacks up against other popular options in terms of speed and bundle size.

## License

[MIT](https://choosealicense.com/licenses/mit/)
