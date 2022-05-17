module.exports = {
	reactStrictMode: true,
	async redirects() {
		return [
			{
				source: '/',
				destination: 'https://app.optimism.io/bridge/',
				permanent: false,
				basePath: false,
			},
		];
	},
};
