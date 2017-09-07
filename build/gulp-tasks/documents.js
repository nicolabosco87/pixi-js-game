/**
 * Media Task
 * ===============================
 */

module.exports = (gulp, $, options) => {

    const paths = require('../gulp-config/paths');

    gulp.task('documents', () => {

        const distPath = paths.toPath('dist.documents');

        return gulp.src(paths.toPath('src.documents/**/*.*'), { base: paths.toPath('src.documents') })
            .pipe($.changed(distPath))
            .pipe(gulp.dest(distPath))
            .pipe($.if(options.isWatching, $.notify({ message: 'Documents files synced', onLast: true })))
            .pipe($.size({ title: 'documents' }));
    });

};