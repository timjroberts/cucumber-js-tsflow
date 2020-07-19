// this script change the "scope" for publishing to github package registry
// so we could publish to both npm and gpr

const fs = require('fs')
const { join } = require('path')

let myArgs = process.argv.slice(2)
if (myArgs.length <= 1){
    console.log("No repo name is provided, existing")
    process.exit(1)
}

let repoParts =myArgs.split("/");
if (repoParts.length != 2){
    console.log("Please uses format of owner/repo for the argument")
    process.exit(1)
}

// Get the package obejct and change the name
const pkg = require('./package.json')
//append the scope to the original package name
pkg.name =  "@" + repoParts[0] + "/" + pkg.name
console.log("Setting package name to: ", pkg.name)

// Update package.json with the udpated name
fs.writeFileSync(join(__dirname, './package.json'), JSON.stringify(pkg))
