module.exports = {
  dest: "build",
  src: ".pre-build",
  port: 8000,
  livereload: true,
  fallback: "/",
  comments: false,
  hash: 5,
  title: "Olum App",
  asyncAwait: false,
  https: false,
  favicon:"./public/favicon.png",
  template: "./public/index.html",
};