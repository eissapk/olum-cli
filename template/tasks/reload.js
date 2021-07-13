import gulp from "gulp";
import connect from "gulp-connect";
import { dest } from "../settings";

const reload = () => gulp.src(`./${dest}`).pipe(connect.reload());

export default reload;
