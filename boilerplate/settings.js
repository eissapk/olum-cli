module.exports = {
  dest: "build",
  src: ".pre-build",
  port: 8000,
  livereload: true,
  fallback: "/",
  comments: false,
  hash: 5,
  title: "My Note",
  asyncAwait: false,
  https: false,
  favicon: "./public/favicon.png",
  template: "./public/index.html",
  serviceWorker: false,
  manifest: {
    name: "My Note - Progressive Web App",
    short_name: "My Note",
    description: "Advanced todo app with markdown editor",
    background_color: "#ffffff",
    publicPath: "./",
    display: "standalone",
    orientation: "any",
    start_url: "index.html",
    theme_color: "#ffffff",
    icons: [
      {
        src: "./public/manifest.png",
        sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
      },
    ],
  },
};