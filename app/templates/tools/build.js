{
    "optimize": "uglify2",
    "removeCombined": true,
    "generateSourceMaps": false,
    "preserveLicenseComments": false,
    "optimizeCss": "none",
    "mainConfigFile": "../dev/Documents/app/js/common.js",
    "appDir": "../dev",
    "dir": "../build",
    "baseUrl": "Documents/app/js",
    "modules": [{
        "name": "config"
    }, {
        "name": "common",
        "exclude": ["config"]
    }, {
        "name": "main",
        "include": ["app/main"],
        "exclude": ["config", "common"]
    }]
}