const cucumberPkg = require('@cucumber/cucumber/package.json');

module.exports = cucumberPkg.version.startsWith('7.')
  ? {
    default: [
      '--publish-quiet',
      '--require cucumber-tsflow-specs/dist/**/*.js',
      '--world-parameters \'{"foo":"bar"}\'',
    ].join(' ')
  }
  : {
    default: {
      publishQuiet: true,
      require: ['cucumber-tsflow-specs/dist/**/*.js'],
      worldParameters: {
        foo: 'bar',
      }
    },
  };
