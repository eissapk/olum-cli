import gulp from "gulp";
import connect from "gulp-connect";
import { olum as settings } from "../package.json";

const reload = () => gulp.src(`./${settings.dest}`).pipe(connect.reload());

export default reload;
