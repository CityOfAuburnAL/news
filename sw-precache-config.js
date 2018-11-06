module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'images/*',
    'src/**/*'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /.*\.(png|jpg|gif|svg)/i,
      handler: 'fastest',
      options: {
        cache: {
          maxEntries: 200,
          name: 'data-images-cache'
        }
      }
    }
  ]
};
