import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import jspm from 'jspm';

import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('jspm', ['eslint'], (cb) => {
  const builder = new jspm.Builder();

  builder.buildStatic(
    'js/head',
    'js/dist/bodyBundle.js',
    {
      minify: false,
      format: 'global',
      globalName: 'Achbar',
      sourceMaps: true,
    }
  ).then(
    builder.buildStatic(
      'js/head',
      'js/dist/bodyBundle.min.js',
      {
        minify: true,
        format: 'global',
        globalName: 'Achbar',
        sourceMaps: true,
      }
    )
  )
  .then(() => {
    cb();
  })
  .catch((err) => {
    console.log(err); // eslint-disable-line no-console
    cb();
  });
});

gulp.task('jspm:watch', () => {
  gulp.watch('js/body/**/*', ['jspm:body']);
});

function eslint(files, options) {
  return () => gulp.src(files)
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('eslint', eslint(['**/*.js']));

gulp.task('jsdoc', $.shell.task([
  'node_modules/.bin/jsdoc --verbose -c jsdoc.conf.json',
]));

// Push documentation to github
gulp.task('gh-pages', $.shell.task([
  './gh-pages.sh',
  `git subtree push --prefix docs/htz-a11y-tabs/${pkg.version} origin gh-pages`,
]));

gulp.task('cleanDocs', del.bind(null, ['docs']));

gulp.task('serve', () => {
  browserSync({
    notify: true,
    port: 9001,
    server: {
      baseDir: './',
    },
  });

  gulp.watch(['src/**/*.js', 'test.js', 'index.html', 'test.css'], ['eslint']).on('change', reload);
});

gulp.task('serve:docs', ['jsdoc'], () => {
  browserSync({
    notify: true,
    port: 9002,
    server: {
      baseDir: `./docs/htz-a11y-tabs/${pkg.version}`,
    },
  });

  gulp.watch(['src/**/*.js', 'README.md'], ['jsdoc']).on('change', reload);
});


// Build for deployment
gulp.task('default', ['serve']);
