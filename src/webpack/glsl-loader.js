module.exports = {
  test: /\.(glsl|vs|fs|vert|frag)$/,
  use: [
    'raw-loader',
    {
      loader: 'glslify-loader',
      options: {
        transform: [
          ['glslify-import'],
          ['glslify-hex'],
        ],
      },
    },
  ],
};