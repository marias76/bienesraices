const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const terser = require('gulp-terser-js');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
/*const imageminWebp = require('imagemin-webp');*/
const imageminWebp = require('imagemin-webp').default;
const cache = require('gulp-cache');
const clean = require('gulp-clean');

const paths = {
  scss: 'src/scss/**/*.scss',
  js: 'src/js/**/*.js',
  imagenes: 'src/img/**/*.{png,jpg,jpeg}'
};

// Tarea: Compilar SCSS
function css() {
  return src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('build/css'))
    .on('end', () => notify({ message: 'CSS compilado', onLast: true }).write(''));
}

// Tarea: Minificar JS
function javascript() {
  return src(paths.js)
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('build/js'))
    .on('end', () => notify({ message: 'JS minificado', onLast: true }).write(''));
}

// Tarea: Optimizar imágenes
function imagenes() {
  return src(paths.imagenes)
    .pipe(cache(imagemin({ optimizationLevel: 3 })))
    .pipe(dest('build/img'))
    .on('end', () => notify({ message: 'Imágenes optimizadas', onLast: true }).write(''));
}

// Tarea: Convertir imágenes a WebP
function versionWebp() {
  return src(paths.imagenes)
    .pipe(imagemin([imageminWebp({ quality: 75 })]))
    .pipe(rename({ extname: '.webp' }))
    .pipe(dest('build/img'))
    .on('end', () => notify({ message: 'WebP generado', onLast: true }).write(''));
}

// Tarea: Watch
function watchArchivos() {
  watch(paths.scss, css);
  watch(paths.js, javascript);
  watch(paths.imagenes, series(imagenes, versionWebp));
}

// Exportar tareas
exports.css = css;
exports.javascript = javascript;
exports.imagenes = imagenes;
exports.versionWebp = versionWebp;
exports.watchArchivos = watchArchivos;
exports.default = series(
  parallel(css, javascript, imagenes, versionWebp),
  watchArchivos
);
