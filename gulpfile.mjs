import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import ts from 'gulp-typescript';
import { deleteAsync } from 'del';
import header from 'gulp-header';
import browserSync from 'browser-sync';

const sassCompiler = gulpSass(sass);
const tsProject = ts.createProject('tsconfig.browser.json');
const bs = browserSync.create();

// Clean docs folder
const clean = () => deleteAsync(['docs']);

// Compile TypeScript files
const typescript = () => {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('docs'));
};

// Compile SASS files
const compileSass = () => {
  return gulp
    .src('src/css/**/*.scss')
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(gulp.dest('docs/css'));
};

// Copy HTML files
const html = () => {
  return gulp.src('src/**/*.html').pipe(gulp.dest('docs'));
};

// Copy image files
const images = () => {
  return gulp
    .src('src/imgs/**/*', { encoding: false })
    .pipe(gulp.dest('docs/imgs'));
};

// Add timestamp to JS files
const addTimestamp = () => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  const timestamp = new Date().toLocaleString('en-US', options);
  return gulp
    .src('docs/**/*.js')
    .pipe(header(`// Generated: ${timestamp}\n`))
    .pipe(gulp.dest('docs'));
};

// Build task
const build = gulp.series(
  clean,
  typescript,
  compileSass,
  html,
  images,
  addTimestamp
);

// Watch task
const watch = () => {
  gulp.watch('src/**/*.ts', gulp.series(typescript, addTimestamp));
  gulp.watch('src/css/**/*.scss', compileSass);
  gulp.watch('src/**/*.html', html);
  gulp.watch('src/imgs/**/*', images);
};

// Serve task
const serve = gulp.series(build, () => {
  bs.init({
    server: {
      baseDir: './docs'
    }
  });

  gulp.watch('src/**/*.ts', gulp.series(typescript, addTimestamp, bs.reload));
  gulp.watch('src/css/**/*.scss', gulp.series(compileSass, bs.reload));
  gulp.watch('src/**/*.html', gulp.series(html, bs.reload));
  gulp.watch('src/imgs/**/*', gulp.series(images, bs.reload));
});

export { build, watch, serve };
export default build;
