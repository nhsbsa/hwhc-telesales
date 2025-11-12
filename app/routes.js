// External dependencies
const express = require('express');
const router = express.Router();

//
// DETECT CURRENT VERSION
//
router.use((req, res, next) => {

  console.log('----------------------------------');
  console.log(req.originalUrl);

  // Versions
  const versions = ['v1','v2'];

  // Clear current routes 
  router.stack = router.stack.filter(layer => layer.name !== 'router');

  // Get the current version needed
  let version = '';
  versions.forEach(function (vers) {
    if (req.originalUrl.toLowerCase().indexOf('/' + vers + '/') > -1) {
      version = vers;
    }
  });

  res.locals.version = version;
  
  // Load the required routes
  if (version) {
    console.log('Loading routes for ' + version);
    router.use('/' + version, require('./views/' + version + '/_routes'));
  }

  // Update the required filters
  if (version) {
    console.log('Loading filters for ' + version);
    const env = req.app.locals.env; // Remember to add to app.js - app.locals.env = nunjucksAppEnv;
    const filtersPath = './views/' + version + '/_filters.js';
    require(filtersPath)( env );
  }


  next();


});


module.exports = router;
