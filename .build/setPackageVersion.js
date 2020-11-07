const nbgv = require("nerdbank-gitversioning");

const setPackageVersionAndBuildNumber = (versionInfo) => {
    console.log("Setting package version to " + versionInfo.npmPackageVersion);
    
    nbgv.setPackageVersion("cucumber-tsflow");
};

const handleError = (err) => console.error("Failed to update the package version number. nerdbank-gitversion failed: " + err);

nbgv.getVersion()
    .then(setPackageVersionAndBuildNumber)
    .catch(handleError);
