const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isProduction = process.env.NODE_ENV == 'production';


const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';




const config = {
	entry: {
		main: './src/script.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true, // remove old files (e.g. the replaced hero.png) on each build
		// versioned file names in production: the hash changes only when a file's content changes,
		// so browsers can cache JS/CSS forever and still get updates right after a deploy
		filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
		chunkFilename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				// GSAP + Lenis in their own file: they rarely change, so they stay cached across deploys
				vendor: {
					test: /[\\/]node_modules[\\/](gsap|lenis)[\\/]/,
					type: /javascript/, // JS only; lenis.css stays in main.css
					name: 'vendor',
					chunks: 'all',
					enforce: true,
				},
			},
		},
	},
	devServer: {
		open: true,
		host: 'localhost',
		hot: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
			filename: 'index.html',
		}),
		new HtmlWebpackPlugin({
			template: 'googlecee6295620a8d037.html',
			filename: 'googlecee6295620a8d037.html',
			inject: false, // Google site verification: the file must contain only its verification line
		}),
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/i,
				loader: 'babel-loader',
			},
			{
				test: /\.css$/i,
                use: [stylesHandler, 'css-loader', 'less-loader'],
			},
			{
				test: /\.less$/i,
				use: [stylesHandler, 'css-loader', 'less-loader'],
			},
			            {
                test: /\.(woff2?|ttf|eot)(\?v=\w+)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext][query]',
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp|mp4)(\?.*)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name][ext][query]',
                }
            },
            {
                test: /\.(ico|json|py|webmanifest|txt|xml)(\?.*)?$/,
                type: 'asset/resource',
				 generator: {
                    filename: '[name][ext][query]',
                }
            },
		],
	},
};

module.exports = () => {
	if (isProduction) {
		config.mode = 'production';
		config.plugins.push(
			new MiniCssExtractPlugin({
				filename: '[name].[contenthash:8].css',
				chunkFilename: '[name].[contenthash:8].css',
			})
		);
	} else {
		config.mode = 'development';
	}
	return config;
};
