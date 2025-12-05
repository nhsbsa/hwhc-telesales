// External dependencies
const express = require('express');
const router = express.Router();

router.post(/index/, function (req, res) {
    let destination = 'search';
    if( req.session.data.role === 'backOffice' ){
        destination = 'back-office-dashboard'
    }
    res.redirect( destination );
});

router.post(/search/, function (req, res) {
    const destination = 'search-results';
    res.redirect( destination );
});

router.post(/process-application/, function (req, res) {
    const destination = 'confirm-application';
    res.redirect( destination );
});

router.post(/cannot-process-application/, function( req, res){
    const destination = 'confirmation-letter-sent';
    res.redirect( destination );
});

module.exports = router;
