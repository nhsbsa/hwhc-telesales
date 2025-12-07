// External dependencies
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post(/index/, function (req, res) {
    let destination = 'search';
    if( req.session.data.role === 'backOffice' ){
        destination = 'dashboard'
    }
    res.redirect( destination );
});

router.post(/search/, function (req, res) {
    const destination = 'search-results';
    res.redirect( destination );
});

router.post(/process-application--single/, function (req, res) {
    const destination = 'review-application';
    res.redirect( destination );
});

router.post(/process-application--single/, function (req, res) {
    const destination = 'confirmation?confirmationStatus=applicationApproved';
    res.redirect( destination );
});

router.post(/cannot-process-application/, function( req, res){

    const cannotProcessApplication = req.session.data.cannotProcessApplication || 'sendALetter';

    let destination = 'confirmation';

    switch( cannotProcessApplication ){
        case 'sendALetter':
            destination = 'send-a-letter';
            break;
        case 'requestPaperKeyIn':
            destination = 'confirmation?confirmationStatus=requestPaperKeyIn';
            break;
        case 'unableToProcess':
            destination = 'confirmation?confirmationStatus=applicationRejected';
            break;
    }
    
    res.redirect( destination );

});

router.post(/process-application--postcode-results/, function (req, res) {
    const destination = 'review-application';
    res.redirect( destination );
});

router.post(/process-application--postcode/, function (req, res) {
    const destination = 'process-application--postcode-results';
    res.redirect( destination );
});

router.post(/process-application--manual-entry/, function (req, res) {
    const destination = 'review-application';
    res.redirect( destination );
});

router.post(/process-application--other/, function (req, res) {
    const destination = 'process-application--postcode';
    res.redirect( destination );
});

router.post(/send-a-letter/, function (req, res) {
    const destination = 'confirmation?confirmationStatus=letterSent';
    res.redirect( destination );
});

// This has to go last as it can be picked up in the earlier URLs...
router.post(/process-application/, function (req, res) {
    const destination = 'process-application--other';
    res.redirect( destination );
});


//
// RADIO ADDRESS METHOD 
// Can't actually route through this until they sort out the shai-halud fix...
//
//
router.get(/postcode-handler/, function (req, res) {

  // Prep the variables
  let addressSearchPostcode = req.session.data.imagePostcode.split(' ').join('').toUpperCase();
  const addressSearchHouseNumberOrName = req.session.data.imageHouseNumberOrName || '';
  const apiKey = process.env.POSTCODEAPIKEY;
  const regex = RegExp('^([A-PR-UWYZa-pr-uwyz](([0-9](([0-9]|[A-HJKSTUW])?)?)|([A-HK-Ya-hk-y][0-9]([0-9]|[ABEHMNPRVWXY])?)) ?[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2})$', 'i');
  addressSearchPostcode = ( regex.test(addressSearchPostcode) ) ? addressSearchPostcode : '';

  const updateResults = ( arr ) => {
    req.session.data.addressSearchResults = arr;
  };

  const toTitleCase = ( str ) => {
    return str.replace( /\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); } );
  }

  const formatAddress = ( address ) => {

    const formattedAddress = [];
    const addressParts = address.split(', ');
    addressParts.forEach( ( part, i ) => {
      if( i !== (addressParts.length - 1) ){
        formattedAddress.push( toTitleCase( part ) );
      } else {
        formattedAddress.push( part );
      }
    });

    return formattedAddress.join(', ');

  };

  let baseURL = '';

  if( addressSearchHouseNumberOrName ){
    baseURL = 'https://api.os.uk/search/places/v1/find?query=' + encodeURI(addressSearchHouseNumberOrName);
  }

  if( addressSearchPostcode ){
    baseURL = 'https://api.os.uk/search/places/v1/postcode?postcode=' + encodeURI(addressSearchPostcode);
  }

  // Make the call
  if( baseURL && apiKey ){

    let url = baseURL + '&key=' + apiKey;

    axios.get( url ).then( response => {

      let filteredResults = [];

      if( Array.isArray( response.data.results ) ){

        response.data.results.forEach(function(result){

          let resultPostcode = result.DPA.POSTCODE.split(' ').join('').toUpperCase();

          let obj = { 
            'text' : formatAddress( result.DPA.ADDRESS ),
            'value' : formatAddress( result.DPA.ADDRESS )
          };

          if( addressSearchPostcode ){

            if( addressSearchPostcode.indexOf(resultPostcode) === 0 ){

              let bnon = addressSearchHouseNumberOrName.trim().toUpperCase();
              if( bnon ){

                // WE HAVE A POSTCODE AND A BUILDING NAME/NUMBER, TRY TO NARROW THE RESULTS DOWN...

                if( result.DPA.BUILDING_NAME ){

                  if( result.DPA.SUB_BUILDING_NAME ){
                    // We can check the SUB_BUILDING_NAME field as well...
                    if( result.DPA.SUB_BUILDING_NAME.indexOf(bnon) > -1 || result.DPA.BUILDING_NAME.indexOf(bnon) > -1 ){
                      filteredResults.push(obj);
                    }
                  } else {
                    // We can only check the BUILDING_NAME field...
                    if( result.DPA.BUILDING_NAME.indexOf(bnon) > -1 ){
                      filteredResults.push(obj);
                    }
                  }
          
                } else if( result.DPA.BUILDING_NUMBER ) {
        
                    if( result.DPA.BUILDING_NUMBER === String(bnon) ){
                      filteredResults.push(obj);
                    }

                }
              } else {

                // WE HAVE A POSTCODE, BUT NO BUILDING NAME/NUMBER, ALLOW EVERYTHING...
                filteredResults.push(obj);
              }
            
            }

          } else {

            // WE DON'T HAVE A POSTCODE, ONLY BUILDING NAME/NUMBER, ALLOW ANYTHING...
            filteredResults.push(obj);

         }

        });

      }

      updateResults( filteredResults );
      res.redirect('process-application--postcode-results');


    }).catch( (error) => { console.log( error ); });
  

} else {

  updateResults([]);
  res.redirect('process-application--postcode?showErrors=true');

}

});

module.exports = router;
