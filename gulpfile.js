var gulp = require("gulp");
var workspace = require("gulp-npmworkspace");
var path = require("path");
var fs = require("fs");
var process = require("process");
var typings = require("typings");
var rimraf = require("rimraf");

gulp.task("install", function() {
    var typingsPostInstaller = {
        condition: function(packageDescriptor, packagePath) {
            return fs.existsSync(path.join(packagePath, "typings.json"));
        },
        action: function(packagePath, packageDescriptor) {
            typings.install({ cwd: packagePath }).then(function () {
                rimraf.sync(path.join(packagePath, "./typings/**/browser*"));
            });
        }
    };

    return workspace.workspacePackages()
        .pipe(workspace.npmInstall({ postInstall: typingsPostInstaller }));
});


gulp.task("compile", function() {
    return workspace.workspacePackages()
        .pipe(workspace.buildTypeScriptProject());
});


gulp.task("publish", function() {
    return workspace.workspacePackages()
        .pipe(workspace.npmPublish({ bump: "patch" }));
});
