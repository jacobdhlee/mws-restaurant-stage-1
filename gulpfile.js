const gulp = require("gulp");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const concat = require("gulp-concat");

gulp.task("minHTML", function() {
  gulp.src("*.html").pipe(uglify()).pipe(gulp.dest("dist"));
});

gulp.task("minCSS", function() {
  gulp.src("css/*.css").pipe(uglify()).pipe(gulp.dest("dist/css"));
});

gulp.task("js", function() {
  gulp
    .src(["js/*.js", "*.js"])
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});

gulp.task("default", ["minHTML", "minCSS", "js"]);

gulp.task("watch", function() {
  gulp.watch("*.html", ["minHTML"]);
  gulp.watch("css/*.css", ["minCSS"]);
  gulp.watch(["js/*.js", "*.js"], ["js"]);
});
