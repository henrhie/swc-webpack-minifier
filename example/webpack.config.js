const path = require('path');
const { SwcWebpackMinifier } = require('swc-webpack-minfier');

module.exports = {
	mode: 'production',
	entry: {
		main: path.resolve(__dirname, './src/index.js'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js',
	},
	optimization: {
		minimizer: [new SwcWebpackMinifier()],
	},
};
