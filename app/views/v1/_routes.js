// External dependencies
const express = require('express');
const router = express.Router();

router.post(/index/, function (req, res) {
    const destination = 'search';
    res.redirect( destination );
});

module.exports = router;
