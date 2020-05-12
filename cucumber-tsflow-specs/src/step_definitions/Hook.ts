import {AfterAll, BeforeAll} from 'cucumber';

// Synchronous
BeforeAll(function () {
  // perform some shared setup
  console.log("Before all");
});

// Asynchronous Promise
AfterAll(function () {
  console.log("After all");
});