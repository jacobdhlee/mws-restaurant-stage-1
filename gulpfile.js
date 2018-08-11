const gulp = require("gulp");
const uglify = require("gulp-uglify");
const pump = require("pump");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const csso = require("gulp-csso");
const autoprefixer = require("gulp-autoprefixer");
// const imagemin = require("gulp-imagemin");

gulp.task("js", function() {
  return gulp
    .src(["js/*.js", "sw.js"])
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
});

gulp.task("html", function(cb) {
  pump([gulp.src("*.html"), gulp.dest("./dist")], cb);
});

gulp.task("css", function(cb) {
  pump(
    [
      gulp.src("css/*.css"),
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      }),
      csso(),
      gulp.dest("./dist/css")
    ],
    cb
  );
});

// gulp.task("image", function(cb) {
//   pump([gulp.src("img/*.jpg"), imagemin(), gulp.dest("dist/img")], cb);
// });

gulp.task("default", ["html", "css", "js"]);

gulp.task("watch", function() {
  gulp.watch(["index*.html", "restaurant.html"], ["html"]);
  gulp.watch("css/*.css", ["css"]);
  gulp.watch(["js/*.js", "sw.js"], ["js"]);
});
