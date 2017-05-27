var gulp = require("gulp");
var workspace = require("gulp-npmworkspace");
var sequence = require("gulp-sequence");
var path = require("path");
var fs = require("fs");
var rimraf = require("rimraf");
var babel = require("gulp-babel");

gulp.task("install", function () {
    var postInstallActions = [
        workspace.postInstallActions.installTypings(),
        {
            action: function (packageDescriptor, packagePath, callback) {
                rimraf.sync(path.join(packagePath, "./typings/**/browser*"));

                callback();
            }
        }
    ];

    return workspace.workspacePackages()
        .pipe(workspace.npmInstall({ postInstallActions: postInstallActions, verboseLogging: true }));
});


gulp.task("uninstall", function () {
    var postUninstallActions = [
        {
            condition: function (packageDescriptor, packagePath) {
                return fs.existsSync(path.join(packagePath, "./typings"));
            },
            action: function (packageDescriptor, packagePath, callback) {
                rimraf.sync(path.join(packagePath, "./typings"));

                callback();
            }
        }  
    ];
    
    return workspace.workspacePackages()
        .pipe(workspace.npmUninstall( { postUninstallActions: postUninstallActions, verboseLogging: true } ));
});


gulp.task("tsflow-to-es5", function () {
    return gulp.src("./cucumber-tsflow/dist/**/*.js")
        .pipe(babel({
            presets: [ "es2015" ]
        }))
        .pipe(gulp.dest("./cucumber-tsflow/dist-es5"));
});

gulp.task("tsflow-specs-to-es5", function () {
    return gulp.src("./cucumber-tsflow-specs/dist/**/*.js")
        .pipe(babel({
            presets: [ "es2015" ]
        }))
        .pipe(gulp.dest("./cucumber-tsflow-specs/dist-es5"));
});


gulp.task("compile", function () {
    return workspace.workspacePackages()
        .pipe(workspace.buildTypeScriptProject());
});


gulp.task("build", sequence("compile", [ "tsflow-to-es5", "tsflow-specs-to-es5" ]));


gulp.task("publish", function () {
    return workspace.workspacePackages()
        .pipe(workspace.filter(function (packageDescriptor, packagePath) {
            return !packageDescriptor.private
        }))
        .pipe(workspace.npmPublish({ shrinkWrap: false, bump: "prerelease" }));
});
