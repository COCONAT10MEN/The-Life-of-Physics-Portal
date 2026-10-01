const buf = require('buffer');
if (!buf.SlowBuffer) {
	buf.SlowBuffer = buf.Buffer;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ['utfs.io', 'images.unsplash.com', 'img.clerk.com'],
	},
};

module.exports = nextConfig;
