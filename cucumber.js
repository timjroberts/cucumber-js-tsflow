module.exports = {
  default: {
    publishQuiet: true,
    require: ['cucumber-tsflow-specs/dist/**/*.js'],
    worldParameters: {
      foo: 'bar',
    }
  },
};
