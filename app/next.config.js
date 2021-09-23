module.exports = {
	async rewrites() {
		return [{ source: '/', destination: 'https://portr.xyz' }];
	},
	images: {
		loader: 'imgix',
		path: '/',
	},
};
