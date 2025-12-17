const { first } = require('lodash');

/**
 * @param {Environment} env
 */
module.exports = function (env) {

  //
  // GET CERTIFICATE TYPE TAG FUNCTION
  //
  function _getCertificateTypeTextOrTag( service, isTag ){

    let txt = '';

    switch( service ){

      case 'hrtppc':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--blue">HRT PPC</strong>' : 'HRT PPC';
        break;

      case 'matex':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--green">MATEX</strong>' : 'MATEX';
        break;

    }

    return txt;

  }

  // 
  // GET CERTIFICATE TYPE TAG FILTER
  //
  env.addFilter('getCertificateTypeTextOrTag', function ( service, isTag ) {
    return _getCertificateTypeTextOrTag( service, isTag );
  });



  //
  // GET STATUS TEXT OR TAG FUNCTION
  // Statuses are outlined at https://miro.com/app/board/uXjVJqtsJuE=/?share_link_id=507026377839
  //
  function _getStatusTextOrTag( status, isTag ){

    let txt = '';

    switch( status ){

      case 'processing':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--dark-grey">Processing</strong>' : 'Processing';
        break;

      case 'reviewing':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--grey">Reviewing</strong>' : 'Reviewing';
        break;

      case 'accepted':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--grey">Accepted</strong>' : 'Accepted';
        break;

      case 'active':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--white">Active</strong>' : 'Active';
        break;

      case 'expired':
        txt = ( isTag ) ? '<strong class="nhsuk-tag nhsuk-tag--expired-grey">Expired</strong>' : 'Expired';
        break;

     
    }

    return txt;

  }

  // 
  // GET CERTIFICATE TYPE TAG FILTER
  //
  env.addFilter('getStatusTextOrTag', function ( status, isTag ) {
    return _getStatusTextOrTag( status, isTag );
  });



  //
  // GET APPLICATION CHANNEL FUNCTION
  //
  const APPLICATION_CHANNEL_MAP = {
    // HRT PPC
    online: 'Online',
    pharmacy: 'Pharmacy',
    phone: 'Phone',
  
    // MATEX
    digital: 'Digital',
    paper: 'Paper'
  };
  
  function _getApplicationChannelText(channel) {
    return APPLICATION_CHANNEL_MAP[channel];
  }
  
  env.addFilter('getApplicationChannelText', _getApplicationChannelText);
  



    //
    // GET CERTIFICATE FULFILMENT FUNCTION
    //
    const CERTIFICATE_FULFILMENT_MAP = {
      email: 'Email',
      post: 'Post'
    };
    
    function _getCertificateFulfilmentText(fulfilment) {
      return CERTIFICATE_FULFILMENT_MAP[fulfilment];
    }
    
    env.addFilter('getCertificateFulfilmentText', _getCertificateFulfilmentText);    



  //
  // GET FILTERED RESULTS FUNCTION
  // Applies the search criteria to the rows of patient data
  //
  function _getFilteredResults( rows, searchTerms ){

    console.log( '_getFilteredResults()' );

    let filteredRows = [];

    if( Object.keys( searchTerms ).length > 0 ){

      Object.keys( searchTerms ).forEach(function( key, i ){

        let fRows = ( i === 0 ) ? rows : filteredRows.slice();
        filteredRows = [];        
      
        fRows.forEach( function( row ){

          const needles = ( key === 'status' ) ?  searchTerms[key].split(',') : [searchTerms[key].trim().toLowerCase()];
          let haystack;

          switch( key ){

            case 'postcode':
              haystack = row.address[key].toLowerCase();
              break;

            case 'certificateReference':
              haystack = row[key].toLowerCase().split(' ').join('');
              break;

            default: 
              haystack = row[key].toLowerCase();
              break;

          }

          needles.forEach(function( needle, i ){
            if( haystack.indexOf( needle ) > -1 ){
              filteredRows.push( row );
            }
          });
          

        });

      });

    } else {

      // Return everything if no search terms are provided...
      filteredRows = rows;

    }

    return filteredRows;

  }

  //
  // GET SORTED RESULTS FUNCTION
  // Applies table sorting to the results
  //
  function _getSortedResults( rows, sortBy, sortDirection ) {

    console.log( '_getSortedResults( rows, ' + sortBy + ', ' + sortDirection + ')' );

    let sortedRows = Array.from(rows); // Should already be a row, really...
    sortedRows.sort(function( a, b ){

        // Text check
        let comparisonA = a[sortBy];
        let comparisonB = b[sortBy];

        return comparisonA.localeCompare( comparisonB );

    });

    if( sortDirection === 'ascending' ){
        sortedRows = sortedRows.reverse();
    }

    return sortedRows;

  }


  //
  // GET PAGINATED RESULTS FUNCTION
  //
  function _getPaginatedResults( rows, rowsPerPage, currentPage) {

    console.log( '_getPaginatedResults()' );

    let paginatedRows = [];

    if (rows.length > rowsPerPage) {

      let start = currentPage * rowsPerPage;
      let end = start + rowsPerPage;

      paginatedRows = rows.slice(start, end);

    } else {

      paginatedRows = rows;

    }

    return paginatedRows;

  }

  //
  // TRUNCATE PAGINATION LINKS FUNCTION
  //
  function _truncatePaginationLinks( pageObjects, currentPage ) {
      
      const noOfPages = pageObjects.length;
    
      // Start building the truncated array
      const result = [];
    
      // Handle edge case when currentPage is the first item
      if (currentPage === 0) {
        // Always include the first item
        result.push(pageObjects[0]);
    
        // Add the next two items if they exist
        if (noOfPages > 1) result.push(pageObjects[1]);
        if (noOfPages > 2) result.push(pageObjects[2]);
    
        if (noOfPages > 3) result.push({ 'ellipsis': true }); // Add ellipsis if there are more items beyond the first three
    
        // Always include the last item
        result.push(pageObjects[noOfPages - 1]);
    
        return result;
      }
    
      // Handle edge case when currentPage is the last item
      if (currentPage === noOfPages - 1) {
        // Always include the first item
        result.push(pageObjects[0]);
    
        if (noOfPages > 4) result.push({ 'ellipsis': true }); // Add ellipsis if there are more than four items
    
        // Include the last three items
        if (noOfPages > 2) result.push(pageObjects[noOfPages - 3]);
        if (noOfPages > 1) result.push(pageObjects[noOfPages - 2]);
        result.push(pageObjects[noOfPages - 1]);
    
        return result;
      }
    
      // Normal case: currentPage is somewhere in the middle
      // Always include the first item
      result.push(pageObjects[0]);
    
      // Determine the range of items around the current item
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(noOfPages - 2, currentPage + 1);
    
      // Add ellipsis if necessary between the first item and the range
      if (start > 1) {
        result.push({ 'ellipsis': true });
      }
    
      // Add the range of items around the current item
      for (let i = start; i <= end; i++) {
        result.push(pageObjects[i]);
      }
    
      // Add ellipsis if necessary between the range and the last item
      if (end < noOfPages - 2) {
        result.push({ 'ellipsis': true });
      }
    
      // Always include the last item
      result.push(pageObjects[noOfPages - 1]);
    
      return result;

  }

  //
  // GET SEARCH TITLE FILTER
  //
  env.addFilter('getSearchTitle', function(){

    const version = this.ctx.version;
    const noOfFilteredRows = (Number.isInteger(parseInt(this.ctx.data[version].noOfFilteredRows))) ? parseInt(this.ctx.data[version].noOfFilteredRows) : 0;
    
    let caption = noOfFilteredRows + ' certificates found';

    switch( noOfFilteredRows ){
      case 0:
        caption = 'No certificates found';
        break;
      case 1:
        caption = '1 certificate found';
        break;
    }
    
    return caption;

  });

  //
  // GET TABLE HEAD ROWS FILTER
  //
  env.addFilter('getTableHeadRows', function ( sortColumns ) {

    sortColumns = ( typeof sortColumns === 'boolean' ) ? sortColumns : true;

    const version = this.ctx.version;

    const noOfFilteredRows = (Number.isInteger(parseInt(this.ctx.data[version].noOfFilteredRows))) ? parseInt(this.ctx.data[version].noOfFilteredRows) : 0;

    const sortBy = ( this.ctx.data[version].sortBy ) ? this.ctx.data[version].sortBy : 'lastName'; 
    const sortDirection = ( ['ascending','descending'].indexOf( this.ctx.data[version].sortDirection ) > -1 ) ? this.ctx.data[version].sortDirection : 'descending';

    const baseLink = '?' + version + '[currentPage]=0';
    const opposite = ( sortDirection === 'descending' ) ? 'ascending' : 'descending'; 

    // lastName
    let lastNameLink = ( sortBy === 'lastName' ) ? baseLink + '&' + version + '[sortBy]=lastName&' + version + '[sortDirection]=' + opposite : baseLink + '&sortBy=name&sortDirection=ascending';
    let lastNameObj = ( noOfFilteredRows < 2 || !sortColumns ) ? { html: 'Name<br /><span class="nhsuk-body-s">NHS number</span>' } : {
        html: '<a href="'+lastNameLink+'">Name</a><br /><span class="nhsuk-body-s">NHS number</span>',
        attributes: {
            'aria-sort': ( sortBy === 'lastName' ) ? sortDirection : 'none'
        } 
    };

    const rows = [
              lastNameObj,
              { text: 'Postcode' },
              { text: 'Type' },
              { text: 'Status' },
              { text: 'Reference' },
              { text: 'End date' },
              { html: '<span class="nhsuk-u-visually-hidden">Action</span>' }
            ];

    return rows;

  });



  //
  // DRAW ROWS FUNCTION
  //
  function _drawRows( inputRows ){

    const rows = [];

    inputRows.forEach(function (patient) {

      const obj = [
        { html: '<strong>' + patient.lastName + ', ' + patient.firstName + '</strong><br /><span class="nhsuk-body-s">' + patient.nhsNumber + '</span>' },
        { html: patient.address.postcode },
        { html: _getCertificateTypeTextOrTag( patient.certificateType, true )},
        { html: _getStatusTextOrTag( patient.status, true ) },
        { html: ( patient.status === 'processing' ) ? '<span class="nhsuk-body-s nhsuk-u-secondary-text-colour">'+ patient.certificateReference +'</span>' : patient.certificateReference },
        { text: patient.endDate },
        { html: '<a href="'+ patient.certificateType +'/case?patientID=' + patient.id + '">View <span class="nhsuk-u-visually-hidden">' + patient.firstName + ' ' + patient.lastName + '\'s ' + _getCertificateTypeTextOrTag( patient.certificateType ) + '</span></a>' },
      ];

      rows.push(obj);

    });

    return rows;

  };


  //
  // GET DASHBOARD TABLE ROWS FILTER
  // Gets five certificates with status either 'Reviewing' or 'Accepted'
  //
  env.addFilter( 'getDashboardTableRows', function( patientData, count ){

    if( typeof patientData === 'string' ){
      patientData = JSON.parse( patientData );
    }

    count = ( !Number.isNaN( parseInt( count ) ) ) ? parseInt( count ) : 5;

    const loop = ( Array.isArray( patientData) ) ? patientData.length : 0;
    const rows = [];

    for( let i = 0; i<loop; i++ ){

      if( rows.length < count ){

        const patient = patientData[i];

        if( patient.status === 'reviewing' || patient.status === 'accepted' ){

          const obj = [
            { html: '<strong>' + patient.lastName + ', ' + patient.firstName + '</strong><br /><span class="nhsuk-body-s">' + patient.nhsNumber + '</span>' },
            { html: patient.address.postcode },
            { html: _getStatusTextOrTag( patient.status, true ) },
            { html: ( patient.status === 'processing' ) ? '<span class="nhsuk-body-s nhsuk-u-secondary-text-colour">'+ patient.certificateReference +'</span>' : patient.certificateReference },
            { html: ( patient.lastNote.text ) ? patient.lastNote.title + '<br /><span class="nhsuk-body-s nhsuk-u-secondary-text-colour">' + patient.lastNote.text + '</span>' : patient.lastNote.title  },
            { html: '<a href="'+ patient.certificateType +'/case?patientID=' + patient.id + '">View <span class="nhsuk-u-visually-hidden">' + patient.firstName + ' ' + patient.lastName + '\'s ' + _getCertificateTypeTextOrTag( patient.certificateType ) + '</span></a>' },
          ];

          rows.push(obj);

        }

      } else {

        break;

      }

    }

    return rows;

  });

  //
  // GET TABLE ROWS FILTER
  //
  env.addFilter('getTableRows', function ( patientData ) {

    if( typeof patientData === 'string' ){
      patientData = JSON.parse( patientData );
    }

    // Filter variables
    const searchTerms = {};
    const summary = [];

    let start = 'Searched for all certificates';

    if( this.ctx.data.searchCertificateType ){
      searchTerms.certificateType = this.ctx.data.searchCertificateType;
      start = 'Searched for all ' + _getCertificateTypeTextOrTag( this.ctx.data.searchCertificateType ) + ' certificates'
    }

    if( this.ctx.data.searchStatus ){
      searchTerms.status = this.ctx.data.searchStatus;
      summary.push( 'status "Processing", "Reviewing" or "Accepted"' ); // Only used for role=backOffice
    }
    if( this.ctx.data.searchCertificateReference ){
      searchTerms.certificateReference = this.ctx.data.searchCertificateReference;
      summary.push( '"'+searchTerms.certificateReference+'" in certificate reference' );
    }
    if( this.ctx.data.searchLastName ){
      searchTerms.lastName = this.ctx.data.searchLastName;
      summary.push( '"'+searchTerms.lastName+'" in last name' );
    }
    if( this.ctx.data.searchFirstName ){
      searchTerms.firstName = this.ctx.data.searchFirstName;
      summary.push( '"'+searchTerms.firstName+'" in first name' );
    }
    if( this.ctx.data.searchPostcode ){
      searchTerms.postcode = this.ctx.data.searchPostcode;
      summary.push( '"'+searchTerms.postcode+'" in postcode' );
    }

    

    if( summary.length === 0 ){
      this.ctx.data.summaryText = start;
    } else if( summary.length === 1 ){
      this.ctx.data.summaryText = start + ' with ' + summary[0];
    } else {
      let last = summary.pop();
      this.ctx.data.summaryText = start + ' with ' + summary.join(', ') + ' and ' + last;
    }


    // Sorting variables
    const sortBy = ( this.ctx.data[this.ctx.version].sortBy ) ? this.ctx.data[this.ctx.version].sortBy : 'lastName'; 
    const sortDirection = ( ['ascending','descending'].indexOf( this.ctx.data[this.ctx.version].sortDirection ) > -1 ) ? this.ctx.data[this.ctx.version].sortDirection : 'descending';

    // Pagination variables
    const rowsPerPage = (Number.isInteger(parseInt(this.ctx.data[this.ctx.version].rowsPerPage))) ? parseInt(this.ctx.data[this.ctx.version].rowsPerPage) : 5;
    const currentPage = (Number.isInteger(parseInt(this.ctx.data[this.ctx.version].currentPage))) ? parseInt(this.ctx.data[this.ctx.version].currentPage) : 0;

    // Process the patients
    const filteredPatientData = _getFilteredResults( patientData, searchTerms );
    const sortedPatientData = _getSortedResults( filteredPatientData, sortBy, sortDirection );
    const paginatedPatientData = _getPaginatedResults( sortedPatientData, rowsPerPage, currentPage);

    this.ctx.data[this.ctx.version].noOfFilteredRows = filteredPatientData.length;

    return _drawRows( paginatedPatientData );

  });


  //
  // GET PAGINATION LINKS FILTER
  //
  env.addFilter('getPaginationLinks', function ( classes ) {

    // content: blank string

    const rowsPerPage = (Number.isInteger(parseInt(this.ctx.data[this.ctx.version].rowsPerPage))) ? parseInt(this.ctx.data[this.ctx.version].rowsPerPage) : 5;
    const currentPage = (Number.isInteger(parseInt(this.ctx.data[this.ctx.version].currentPage))) ? parseInt(this.ctx.data[this.ctx.version].currentPage) : 0;

    const noOfFilteredRows = (Number.isInteger(this.ctx.data[this.ctx.version].noOfFilteredRows)) ? this.ctx.data[this.ctx.version].noOfFilteredRows : 0;
    const noOfPages = Math.ceil(noOfFilteredRows / rowsPerPage);

    const obj = {};

    if (noOfFilteredRows > rowsPerPage) {

      const items = [];

      if (currentPage !== 0) {
        obj.previous = { 'href': '?'+ this.ctx.version +'[currentPage]=' + (currentPage - 1) }
      }
      if (currentPage !== (noOfPages - 1)) {
        obj.next = { 'href': '?' + this.ctx.version +'[currentPage]=' + (currentPage + 1) }
      }

      for (let i = 0; i < noOfPages; i++) {

        let itemObj = { 'number': (i + 1), 'href': '?' + this.ctx.version +'[currentPage]=' + i };
        if (i === currentPage) {
          itemObj.current = true;
        }

        items.push( itemObj );

      }

      // Add ellipses if needed...
      if (items.length > 6) {
        obj.items = _truncatePaginationLinks( items, currentPage );
      } else {
        obj.items = items;
      }

    }

    if( classes ){
      obj.classes = classes;
    }

    return obj;

  });

  //
  // GET CONFIDENCE TAG FUNCTION
  //
  env.addFilter('getConfidenceTag', function( num ){
    
    if( !Number.isInteger( num ) ){
      num = 0;
    }

    let confidenceLevel = 'empty';
    let tag = '<span class="confidence-level"><span class="nhsuk-tag nhsuk-tag--grey">Empty</span></span>';

    if( num > 0 ) {
      confidenceLevel = 'low';
      tag =  '<span class="confidence-level confidence-level--'+confidenceLevel+'"><span class="nhsuk-tag nhsuk-tag--red">Low</span>'
      tag += '<span class="nhsuk-tag nhsuk-tag--red confidence-score">'+num+'</span></span>';
    }
    
    if( num > 30 ){
      confidenceLevel = 'medium';
      tag =  '<span class="confidence-level confidence-level--'+confidenceLevel+'"><span class="nhsuk-tag nhsuk-tag--yellow">Medium</span>'
      tag += '<span class="nhsuk-tag nhsuk-tag--yellow confidence-score">'+num+'</span></span>';
    }

    if( num > 60 ){
      confidenceLevel = 'high';
      tag =  '<span class="confidence-level confidence-level--'+confidenceLevel+'"><span class="nhsuk-tag nhsuk-tag--green">High</span>'
      tag += '<span class="nhsuk-tag nhsuk-tag--green confidence-score">'+num+'</span></span>';
    }

    return tag;

  });

  //
  // PROCESS FULL NAME FILTER
  //
  env.addFilter('processFullName', function( firstName, lastName ){

    let fullName = '';

    console.log( 'PROCESSING: ' + firstName + ' ' + lastName );

    firstName = firstName || '';
    lastName = lastName || '';
    
    if( firstName && lastName ){
      fullName = firstName + ' ' + lastName; 
    } else if( firstName && !lastName ){
      fullName = firstName;
    } else if ( !firstName && lastName ) {
      fullName = lastName;
    }

    return fullName;

  });

  //
  // PROCESS ADDRESS FILTER
  //
  env.addFilter('processAddress', function( houseNumber, addressLine1, addressLine2, town, county, postcode ){

    houseNumber = houseNumber || '';
    addressLine1 = addressLine1 || '';
    addressLine2 = addressLine2 || '';
    town = town || '';
    county = county || '';
    postcode = postcode || '';

    let firstLine = '';

    if( houseNumber && addressLine1 ){
      firstLine = houseNumber + ' ' + addressLine1;
    } else if( !houseNumber && addressLine1 ){
      firstLine = addressLine1;
    } else if( houseNumber && !addressLine1 ){
      firstLine = houseNumber;
    }

    let elements = [ firstLine ];

    if( addressLine2 ){
      elements.push( addressLine2 );
    }

    if( town ){
      elements.push( town );
    }

    if( county ){
      elements.push( county );
    }

    if( postcode ){
      elements.push( postcode );
    }

    return elements.join( ', <br />' );





  });

  //
  // PROCESS DATE FILTER
  //
  env.addFilter('processDate', function(){

    return '12 September 1999';

  });

  //
  // GET PATIENT DATA FILTER
  //
  env.addFilter('getPatientData', function ( code ) {

    let patientData = '[{"firstName":"Olivia","lastName":"Smith","id":0,"nhsNumber":"599 794 620","certificateType":"matex","status":"accepted","certificateReference":"64 737 514 846","startDate":"5 June 2025","endDate":"5 March 2027","address":{"buildingNumber":"12","streetName":"Maple Grove","locality":"Ashford Hill","postTown":"Reading","county":"Berkshire","postcode":"RG4 8ZT"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Amelia","lastName":"Jones","id":1,"nhsNumber":"130 066 342","certificateType":"matex","status":"accepted","certificateReference":"93 390 984 384","startDate":"19 May 2025","endDate":"19 February 2027","address":{"buildingNumber":"44","streetName":"Bramley Road","locality":"East Mere","postTown":"Norwich","county":"Norfolk","postcode":"NR3 5QN"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Isla","lastName":"Taylor","id":2,"nhsNumber":"160 019 694","certificateType":"hrtppc","status":"active","certificateReference":"HRT WKH2 KW6Z","startDate":"31 May 2025","endDate":"3 March 2027","address":{"buildingNumber":"7","streetName":"Kestrel Close","locality":"Winterfold","postTown":"Guildford","county":"Surrey","postcode":"GU3 9LP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Ava","lastName":"Brown","id":3,"nhsNumber":"715 391 180","certificateType":"matex","status":"expired","certificateReference":"44 003 775 331","startDate":"2 April 2025","endDate":"2 January 2027","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Emily","lastName":"Williams","id":4,"nhsNumber":"789 787 339","certificateType":"hrtppc","status":"active","certificateReference":"HRT GOXI KQQ8","startDate":"30 April 2025","endDate":"30 January 2027","address":{"buildingNumber":"19","streetName":"Crown Street","locality":"Millbridge","postTown":"Plymouth","county":"Devon","postcode":"PL6 1TD"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Sophia","lastName":"Wilson","id":5,"nhsNumber":"449 188 201","certificateType":"matex","status":"reviewing","certificateReference":"57 510 061 553","startDate":"24 April 2025","endDate":"24 January 2027","address":{"buildingNumber":"5","streetName":"Linton Walk","locality":"Southgate Park","postTown":"Crawley","county":"West Sussex","postcode":"RH11 4XW"},"lastNote":{"title":"Paper key-in requested"}},{"firstName":"Mia","lastName":"Davies","id":6,"nhsNumber":"658 162 745","certificateType":"matex","status":"accepted","certificateReference":"84 174 723 528","startDate":"11 February 2025","endDate":"11 November 2026","address":{"buildingNumber":"63","streetName":"Riverstone Court","locality":"Longmead","postTown":"Taunton","county":"Somerset","postcode":"TA2 3UP"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Ella","lastName":"Evans","id":7,"nhsNumber":"487 575 482","certificateType":"hrtppc","status":"active","certificateReference":"HRT DHE7 YYCL","startDate":"12 May 2025","endDate":"12 February 2027","address":{"buildingNumber":"28","streetName":"Birch Avenue","locality":"Northcrest","postTown":"Leicester","county":"Leicestershire","postcode":"LE5 8YU"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Grace","lastName":"Thomas","id":8,"nhsNumber":"725 223 721","certificateType":"matex","status":"accepted","certificateReference":"25 605 161 625","startDate":"20 December 2024","endDate":"20 September 2026","address":{"buildingNumber":"90","streetName":"Fernbrook Drive","locality":"Westerleigh","postTown":"Bath","county":"Somerset","postcode":"BA2 9PF"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Lily","lastName":"Roberts","id":9,"nhsNumber":"385 034 301","certificateType":"matex","status":"reviewing","certificateReference":"96 756 781 176","startDate":"27 April 2025","endDate":"27 January 2027","address":{"buildingNumber":"14","streetName":"Windsor Rise","locality":"Redford","postTown":"Derby","county":"Derbyshire","postcode":"DE1 4SX"},"lastNote":{"title":"Application returned to GP","text":"Missing patient postcode. Letter PE07 sent."}},{"firstName":"Freya","lastName":"Johnson","id":10,"nhsNumber":"689 461 800","certificateType":"hrtppc","status":"active","certificateReference":"HRT 1V4F PXJO","startDate":"20 May 2025","endDate":"20 February 2027","address":{"buildingNumber":"51","streetName":"Hawthorne Road","locality":"Claymere","postTown":"Chester","county":"Cheshire","postcode":"CH4 2MB"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Charlotte","lastName":"Lewis","id":11,"nhsNumber":"779 968 056","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5L27 RPLU","startDate":"5 January 2025","endDate":"5 October 2026","address":{"buildingNumber":"3","streetName":"Mallow Street","locality":"Eastwood Vale","postTown":"Nottingham","county":"Nottinghamshire","postcode":"NG5 3JU"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Isabella","lastName":"Walker","id":12,"nhsNumber":"433 365 365","certificateType":"matex","status":"active","certificateReference":"11 936 956 341","startDate":"12 May 2025","endDate":"12 February 2027","address":{"buildingNumber":"76","streetName":"Peach Tree Way","locality":"Brookfell","postTown":"York","county":"North Yorkshire","postcode":"YO3 6AP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Daisy","lastName":"Hall","id":13,"nhsNumber":"361 230 619","certificateType":"hrtppc","status":"active","certificateReference":"HRT YACP 0Q71","startDate":"7 June 2025","endDate":"7 March 2027","address":{"buildingNumber":"24","streetName":"Millstream Row","locality":"Havenfield","postTown":"Lincoln","county":"Lincolnshire","postcode":"LN2 8FP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Evie","lastName":"Clarke","id":14,"nhsNumber":"900 391 755","certificateType":"matex","status":"expired","certificateReference":"50 781 281 414","startDate":"31 May 2025","endDate":"3 March 2027","address":{"buildingNumber":"37","streetName":"Weavers Lane","locality":"Northgate","postTown":"Wolverhampton","county":"West Midlands","postcode":"WV4 3TT"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Phoebe","lastName":"Allen","id":15,"nhsNumber":"796 112 214","certificateType":"matex","status":"processing","certificateReference":"2025 12 16 15 36 16N167566592","startDate":"13 February 2025","endDate":"13 November 2026","address":{"buildingNumber":"11","streetName":"Rose Mews","locality":"Kingswell","postTown":"Oxford","county":"Oxfordshire","postcode":"OX3 9DQ"},"lastNote":{"title":"Application scanned"}},{"firstName":"Sophie","lastName":"Young","id":16,"nhsNumber":"517 509 905","certificateType":"matex","status":"processing","certificateReference":"2025 12 16 15 36 16N147085539","startDate":"6 May 2025","endDate":"6 February 2027","address":{"buildingNumber":"8","streetName":"Elmbrook Gardens","locality":"Gransfield","postTown":"Peterborough","county":"Cambridgeshire","postcode":"PE2 7QF"},"lastNote":{"title":"Application scanned"}},{"firstName":"Harper","lastName":"King","id":17,"nhsNumber":"469 912 553","certificateType":"hrtppc","status":"active","certificateReference":"HRT HN8S WO8E","startDate":"19 March 2025","endDate":"19 December 2026","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Millie","lastName":"Wright","id":18,"nhsNumber":"293 333 814","certificateType":"hrtppc","status":"active","certificateReference":"HRT KDUW 3I4O","startDate":"26 May 2025","endDate":"26 February 2027","address":{"buildingNumber":"29","streetName":"Falcon Street","locality":"Ridgebury","postTown":"Worcester","county":"Worcestershire","postcode":"WR1 6JS"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Ella-Rose","lastName":"Green","id":19,"nhsNumber":"144 208 970","certificateType":"hrtppc","status":"active","certificateReference":"HRT 0LWN B10M","startDate":"22 May 2025","endDate":"22 February 2027","address":{"buildingNumber":"16","streetName":"Harrier Way","locality":"Loxwood Green","postTown":"Horsham","county":"West Sussex","postcode":"RH13 7BN"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Poppy","lastName":"Baker","id":20,"nhsNumber":"293 340 444","certificateType":"hrtppc","status":"active","certificateReference":"HRT TEHC FYZ0","startDate":"17 April 2025","endDate":"17 January 2027","address":{"buildingNumber":"33","streetName":"Yew Tree Court","locality":"Silverbrook","postTown":"Shrewsbury","county":"Shropshire","postcode":"SY2 8RR"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Ruby","lastName":"Adams","id":21,"nhsNumber":"770 191 002","certificateType":"hrtppc","status":"active","certificateReference":"HRT R33P ITIX","startDate":"21 March 2025","endDate":"21 December 2026","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Chloe","lastName":"Mitchell","id":22,"nhsNumber":"827 867 069","certificateType":"hrtppc","status":"active","certificateReference":"HRT WT81 KTSB","startDate":"19 January 2025","endDate":"19 October 2026","address":{"buildingNumber":"22","streetName":"Stonemill Drive","locality":"Hawkinge Vale","postTown":"Canterbury","county":"Kent","postcode":"CT3 6LW"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Sienna","lastName":"Turner","id":23,"nhsNumber":"802 159 006","certificateType":"hrtppc","status":"active","certificateReference":"HRT P57O 6P8M","startDate":"14 March 2025","endDate":"14 December 2026","address":{"buildingNumber":"9","streetName":"Willowbank Way","locality":"East Harling","postTown":"Ipswich","county":"Suffolk","postcode":"IP5 0YN"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Willow","lastName":"Carter","id":24,"nhsNumber":"277 258 496","certificateType":"matex","status":"active","certificateReference":"68 172 530 484","startDate":"21 January 2025","endDate":"21 October 2026","address":{"buildingNumber":"56","streetName":"Sandpiper Crescent","locality":"Cove Hill","postTown":"Southampton","county":"Hampshire","postcode":"SO9 7MC"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Jessica","lastName":"Morris","id":25,"nhsNumber":"586 298 908","certificateType":"hrtppc","status":"active","certificateReference":"HRT MQ56 P5VS","startDate":"24 December 2024","endDate":"24 September 2026","address":{"buildingNumber":"15","streetName":"Beacon Lane","locality":"Craybourne","postTown":"Maidstone","county":"Kent","postcode":"ME16 2RS"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Matilda","lastName":"Hughes","id":26,"nhsNumber":"852 755 489","certificateType":"matex","status":"processing","certificateReference":"2025 12 16 15 36 16N133988158","startDate":"27 May 2025","endDate":"27 February 2027","address":{"buildingNumber":"101","streetName":"Elm Walk","locality":"Hillford","postTown":"Harlow","county":"Essex","postcode":"CM19 6JQ"},"lastNote":{"title":"Application scanned"}},{"firstName":"Elsie","lastName":"Ward","id":27,"nhsNumber":"891 602 280","certificateType":"hrtppc","status":"active","certificateReference":"HRT BITK HI5O","startDate":"26 April 2025","endDate":"26 January 2027","address":{"buildingNumber":"2","streetName":"Clearwater Road","locality":"Riverside","postTown":"Colchester","county":"Essex","postcode":"CO5 3LP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Rosie","lastName":"Price","id":28,"nhsNumber":"016 996 070","certificateType":"hrtppc","status":"active","certificateReference":"HRT 075A SNPT","startDate":"6 February 2025","endDate":"6 November 2026","address":{"buildingNumber":"48","streetName":"Lavender Street","locality":"Westford","postTown":"Cambridge","county":"Cambridgeshire","postcode":"CB3 9UE"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Aria","lastName":"Cooper","id":29,"nhsNumber":"875 670 764","certificateType":"hrtppc","status":"active","certificateReference":"HRT HZRD 22ZQ","startDate":"7 January 2025","endDate":"7 October 2026","address":{"buildingNumber":"72","streetName":"Greyfriars Way","locality":"Bellstead","postTown":"Bedford","county":"Bedfordshire","postcode":"MK41 1RF"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Layla","lastName":"Bailey","id":30,"nhsNumber":"939 972 104","certificateType":"hrtppc","status":"active","certificateReference":"HRT 9YYE R4GR","startDate":"11 March 2025","endDate":"11 December 2026","address":{"buildingNumber":"36","streetName":"Highcliff Road","locality":"Marshgate","postTown":"Grimsby","county":"Lincolnshire","postcode":"DN3 7NS"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Luna","lastName":"Parker","id":31,"nhsNumber":"276 833 794","certificateType":"matex","status":"active","certificateReference":"98 570 333 664","startDate":"20 December 2024","endDate":"20 September 2026","address":{"buildingNumber":"88","streetName":"Fenton Close","locality":"Broadwood","postTown":"Sheffield","county":"South Yorkshire","postcode":"S11 6TB"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Hannah","lastName":"Phillips","id":32,"nhsNumber":"204 222 165","certificateType":"matex","status":"active","certificateReference":"08 644 768 424","startDate":"25 May 2025","endDate":"25 February 2027","address":{"buildingNumber":"41","streetName":"Tansy Court","locality":"Littlebourne","postTown":"Canterbury","county":"Kent","postcode":"CT4 1JX"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Zara","lastName":"Bennett","id":33,"nhsNumber":"678 940 477","certificateType":"hrtppc","status":"active","certificateReference":"HRT LYUQ VWWQ","startDate":"29 December 2024","endDate":"29 September 2026","address":{"buildingNumber":"97","streetName":"Sunnyside Avenue","locality":"Greenleigh","postTown":"Leeds","county":"West Yorkshire","postcode":"LS7 2PQ"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Florence","lastName":"Cox","id":34,"nhsNumber":"686 932 425","certificateType":"hrtppc","status":"active","certificateReference":"HRT 282E XXET","startDate":"12 March 2025","endDate":"12 December 2026","address":{"buildingNumber":"30","streetName":"Larch Lane","locality":"Warren Hill","postTown":"Hull","county":"East Yorkshire","postcode":"HU6 4ZY"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Maya","lastName":"Richardson","id":35,"nhsNumber":"329 993 878","certificateType":"matex","status":"active","certificateReference":"82 951 424 921","startDate":"8 June 2025","endDate":"8 March 2027","address":{"buildingNumber":"62","streetName":"Poppyfield Way","locality":"Marston Ridge","postTown":"Oxford","county":"Oxfordshire","postcode":"OX4 7GE"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Esme","lastName":"Gray","id":36,"nhsNumber":"463 921 676","certificateType":"matex","status":"expired","certificateReference":"89 150 567 073","startDate":"10 May 2025","endDate":"10 February 2027","address":{"buildingNumber":"21","streetName":"Ivywood Street","locality":"Southmere","postTown":"Cardiff","county":"South Glamorgan","postcode":"CF5 2JD"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Ivy","lastName":"Ross","id":37,"nhsNumber":"888 725 652","certificateType":"matex","status":"expired","certificateReference":"62 033 968 403","startDate":"22 April 2025","endDate":"22 January 2027","address":{"buildingNumber":"14","streetName":"Oakridge Row","locality":"Firrendown","postTown":"Swansea","county":"West Glamorgan","postcode":"SA6 8PP"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Arabella","lastName":"Bell","id":38,"nhsNumber":"985 712 423","certificateType":"hrtppc","status":"active","certificateReference":"HRT 0FSD Z4YS","startDate":"23 December 2024","endDate":"23 September 2026","address":{"buildingNumber":"81","streetName":"Bridgewater Drive","locality":"Lancot Green","postTown":"Luton","county":"Bedfordshire","postcode":"LU4 9WB"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Evelyn","lastName":"Cook","id":39,"nhsNumber":"888 616 225","certificateType":"matex","status":"accepted","certificateReference":"48 411 238 480","startDate":"4 February 2025","endDate":"4 November 2026","address":{"buildingNumber":"26","streetName":"Primrose Lane","locality":"Wickford Heath","postTown":"Basildon","county":"Essex","postcode":"SS14 3SR"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Thea","lastName":"Watson","id":40,"nhsNumber":"645 461 794","certificateType":"hrtppc","status":"active","certificateReference":"HRT JDZ3 UB2X","startDate":"22 January 2025","endDate":"22 October 2026","address":{"buildingNumber":"59","streetName":"Regent Gardens","locality":"Kingsreach","postTown":"Coventry","county":"West Midlands","postcode":"CV3 1BN"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Alice","lastName":"Sanders","id":41,"nhsNumber":"441 466 226","certificateType":"matex","status":"reviewing","certificateReference":"14 808 265 244","startDate":"1 June 2025","endDate":"1 March 2027","address":{"buildingNumber":"18","streetName":"Myrtle Row","locality":"Oldacre","postTown":"Warrington","county":"Cheshire","postcode":"WA3 2XT"},"lastNote":{"title":"Paper key-in requested"}},{"firstName":"Emma","lastName":"Harrison","id":42,"nhsNumber":"075 705 715","certificateType":"matex","status":"reviewing","certificateReference":"72 238 587 021","startDate":"24 January 2025","endDate":"24 October 2026","address":{"buildingNumber":"6","streetName":"Wisteria Court","locality":"Cresthaven","postTown":"St Albans","county":"Hertfordshire","postcode":"AL4 8FJ"},"lastNote":{"title":"Paper key-in requested"}},{"firstName":"Lottie","lastName":"Coleman","id":43,"nhsNumber":"481 871 632","certificateType":"matex","status":"reviewing","certificateReference":"70 984 728 106","startDate":"29 January 2025","endDate":"29 October 2026","address":{"buildingNumber":"85","streetName":"Sparrow Lane","locality":"Northwood Vale","postTown":"Watford","county":"Hertfordshire","postcode":"WD24 6PH"},"lastNote":{"title":"Paper key-in requested"}},{"firstName":"Amber","lastName":"Murphy","id":44,"nhsNumber":"063 759 272","certificateType":"hrtppc","status":"active","certificateReference":"HRT 71OP NXGC","startDate":"20 January 2025","endDate":"20 October 2026","address":{"buildingNumber":"11","streetName":"Ashen Close","locality":"Brookhill","postTown":"Slough","county":"Berkshire","postcode":"SL2 9MT"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Scarlett","lastName":"Graham","id":45,"nhsNumber":"201 467 962","certificateType":"matex","status":"reviewing","certificateReference":"08 915 448 067","startDate":"2 April 2025","endDate":"2 January 2027","address":{"buildingNumber":"53","streetName":"Laurel Drive","locality":"Kingswood Park","postTown":"Bristol","county":"Bristol","postcode":"BS16 4DX"},"lastNote":{"title":"Application returned to patient","text":"No GP stamp on form. Letter PE05 sent."}},{"firstName":"Bonnie","lastName":"Stevens","id":46,"nhsNumber":"447 153 165","certificateType":"hrtppc","status":"active","certificateReference":"HRT E5Y4 CGR4","startDate":"2 April 2025","endDate":"2 January 2027","address":{"buildingNumber":"7","streetName":"Thornfield Way","locality":"Greenhollow","postTown":"Gloucester","county":"Gloucestershire","postcode":"GL1 5UP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Imogen","lastName":"Simpson","id":47,"nhsNumber":"510 868 674","certificateType":"matex","status":"accepted","certificateReference":"63 545 900 831","startDate":"7 June 2025","endDate":"7 March 2027","address":{"buildingNumber":"40","streetName":"Cedar Brook","locality":"Ashvale","postTown":"High Wycombe","county":"Buckinghamshire","postcode":"HP12 8PD"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Harriet","lastName":"Butler","id":48,"nhsNumber":"546 598 405","certificateType":"matex","status":"expired","certificateReference":"02 256 615 189","startDate":"12 June 2025","endDate":"12 March 2027","address":{"buildingNumber":"98","streetName":"Stag Lane","locality":"Marbleham","postTown":"Brighton","county":"East Sussex","postcode":"BN2 1WE"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Eleanor","lastName":"Chapman","id":49,"nhsNumber":"916 011 880","certificateType":"hrtppc","status":"active","certificateReference":"HRT YQOI OB1W","startDate":"20 February 2025","endDate":"20 November 2026","address":{"buildingNumber":"27","streetName":"Whistler Road","locality":"East Densford","postTown":"Portsmouth","county":"Hampshire","postcode":"PO4 7JF"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Aisha","lastName":"Ali","id":50,"nhsNumber":"088 499 103","certificateType":"hrtppc","status":"active","certificateReference":"HRT I6UY DPDU","startDate":"28 March 2025","endDate":"28 December 2026","address":{"buildingNumber":"75","streetName":"Gorse Way","locality":"Heathrow End","postTown":"Hounslow","county":"Greater London","postcode":"TW4 5ZA"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Sofia","lastName":"Hussain","id":51,"nhsNumber":"481 897 903","certificateType":"hrtppc","status":"active","certificateReference":"HRT CVB2 GSY7","startDate":"22 February 2025","endDate":"22 November 2026","address":{"buildingNumber":"3","streetName":"Juniper Walk","locality":"Woodleigh","postTown":"Enfield","county":"Greater London","postcode":"EN3 1TP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Amira","lastName":"Khan","id":52,"nhsNumber":"630 013 999","certificateType":"hrtppc","status":"active","certificateReference":"HRT 15ZD PR0Z","startDate":"13 June 2025","endDate":"13 March 2027","address":{"buildingNumber":"58","streetName":"Chapel Row","locality":"Millthorpe","postTown":"Wakefield","county":"West Yorkshire","postcode":"WF3 8KD"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Leah","lastName":"Begum","id":53,"nhsNumber":"201 977 513","certificateType":"matex","status":"active","certificateReference":"56 513 716 643","startDate":"10 February 2025","endDate":"10 November 2026","address":{"buildingNumber":"13","streetName":"Stonewall Lane","locality":"Northbridge","postTown":"Bradford","county":"West Yorkshire","postcode":"BD7 5TE"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Niamh","lastName":"O’Connor","id":54,"nhsNumber":"039 843 835","certificateType":"matex","status":"processing","certificateReference":"2025 12 16 15 36 16N796775999","startDate":"20 January 2025","endDate":"20 October 2026","address":{"buildingNumber":"60","streetName":"Queensbury Court","locality":"Palmstead","postTown":"Blackpool","county":"Lancashire","postcode":"FY2 9AH"},"lastNote":{"title":"Application scanned"}},{"firstName":"Aoife","lastName":"Kelly","id":55,"nhsNumber":"420 596 086","certificateType":"hrtppc","status":"active","certificateReference":"HRT 1WD4 H5UC","startDate":"30 April 2025","endDate":"30 January 2027","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Erin","lastName":"McCarthy","id":56,"nhsNumber":"037 424 560","certificateType":"hrtppc","status":"active","certificateReference":"HRT KZSK 5W8R","startDate":"17 January 2025","endDate":"17 October 2026","address":{"buildingNumber":"92","streetName":"Meadowbank Road","locality":"Harefield Park","postTown":"Liverpool","county":"Merseyside","postcode":"L8 6FP"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Orla","lastName":"Doyle","id":57,"nhsNumber":"038 636 167","certificateType":"hrtppc","status":"active","certificateReference":"HRT Z35Z XJXV","startDate":"12 June 2025","endDate":"12 March 2027","address":{"buildingNumber":"39","streetName":"Arbour Road","locality":"Phoenix Rise","postTown":"Manchester","county":"Greater Manchester","postcode":"M14 2YQ"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Cerys","lastName":"Griffiths","id":58,"nhsNumber":"689 485 205","certificateType":"hrtppc","status":"active","certificateReference":"HRT VMA7 BCYB","startDate":"4 March 2025","endDate":"4 December 2026","address":{"buildingNumber":"4","streetName":"Cherrytree Court","locality":"Stonemoor","postTown":"Stockport","county":"Greater Manchester","postcode":"SK4 3EW"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Megan","lastName":"Rees","id":59,"nhsNumber":"028 238 048","certificateType":"matex","status":"active","certificateReference":"00 383 513 480","startDate":"15 April 2025","endDate":"15 January 2027","address":{"buildingNumber":"66","streetName":"Fieldhouse Lane","locality":"Greywood","postTown":"Bolton","county":"Greater Manchester","postcode":"BL3 9HB"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Ffion","lastName":"Evans","id":60,"nhsNumber":"915 714 648","certificateType":"matex","status":"accepted","certificateReference":"86 290 896 798","startDate":"29 January 2025","endDate":"29 October 2026","address":{"buildingNumber":"20","streetName":"Honeysuckle Way","locality":"Oakwood Hill","postTown":"Preston","county":"Lancashire","postcode":"PR3 8LN"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Eilidh","lastName":"MacDonald","id":61,"nhsNumber":"776 649 933","certificateType":"hrtppc","status":"active","certificateReference":"HRT 7D58 EZB4","startDate":"1 June 2025","endDate":"1 March 2027","address":{"buildingNumber":"95","streetName":"Old Forge Street","locality":"Daleham","postTown":"Carlisle","county":"Cumbria","postcode":"CA2 5NJ"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Skye","lastName":"Fraser","id":62,"nhsNumber":"206 620 952","certificateType":"matex","status":"accepted","certificateReference":"84 360 595 017","startDate":"9 February 2025","endDate":"9 November 2026","address":{"buildingNumber":"43","streetName":"Nightingale Row","locality":"Brambleton","postTown":"Durham","county":"County Durham","postcode":"DH1 3GP"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Maisie","lastName":"Armstrong","id":63,"nhsNumber":"594 116 490","certificateType":"matex","status":"active","certificateReference":"50 648 999 772","startDate":"26 March 2025","endDate":"26 December 2026","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Penelope","lastName":"Hunter","id":64,"nhsNumber":"260 121 455","certificateType":"matex","status":"reviewing","certificateReference":"80 032 773 880","startDate":"22 December 2024","endDate":"22 September 2026","address":{"buildingNumber":"86","streetName":"Copse Lane","locality":"Hillmead","postTown":"Newcastle","county":"Tyne and Wear","postcode":"NE5 2PA"},"lastNote":{"title":"Paper key-in requested"}},{"firstName":"Clara","lastName":"Lawrence","id":65,"nhsNumber":"607 194 986","certificateType":"matex","status":"expired","certificateReference":"84 931 256 141","startDate":"14 April 2025","endDate":"14 January 2027","address":{"buildingNumber":"31","streetName":"Wildflower Road","locality":"Whitestone","postTown":"Darlington","county":"County Durham","postcode":"DL2 6MX"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Beatrice","lastName":"Spencer","id":66,"nhsNumber":"018 220 054","certificateType":"matex","status":"accepted","certificateReference":"32 942 238 368","startDate":"25 May 2025","endDate":"25 February 2027","address":{"buildingNumber":"47","streetName":"Cloverbank Court","locality":"Iverston","postTown":"Middlesbrough","county":"North Yorkshire","postcode":"TS4 1WW"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Nancy","lastName":"Rogers","id":67,"nhsNumber":"305 775 434","certificateType":"hrtppc","status":"active","certificateReference":"HRT 0JRO I4SJ","startDate":"21 April 2025","endDate":"21 January 2027","address":{"buildingNumber":"6","streetName":"Brookview Way","locality":"Langwood","postTown":"Harrogate","county":"North Yorkshire","postcode":"HG3 9QL"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Annabelle","lastName":"Watts","id":68,"nhsNumber":"812 853 246","certificateType":"matex","status":"reviewing","certificateReference":"84 418 880 462","startDate":"15 February 2025","endDate":"15 November 2026","address":{"buildingNumber":"52","streetName":"Warren Terrace","locality":"Elmwick","postTown":"Scarborough","county":"North Yorkshire","postcode":"YO14 2JG"},"lastNote":{"title":"Application returned to patient","text":"No GP stamp on form. Letter PE05 sent."}},{"firstName":"Heidi","lastName":"Henderson","id":69,"nhsNumber":"038 952 250","certificateType":"matex","status":"accepted","certificateReference":"48 818 031 701","startDate":"5 May 2025","endDate":"5 February 2027","address":{"buildingNumber":"1","streetName":"Foxglove Lane","locality":"Brindlehurst","postTown":"Lancaster","county":"Lancashire","postcode":"LA3 7UH"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Rose","lastName":"Palmer","id":70,"nhsNumber":"496 153 470","certificateType":"matex","status":"active","certificateReference":"63 074 074 010","startDate":"28 March 2025","endDate":"28 December 2026","address":{"buildingNumber":"62","streetName":"Poppyfield Way","locality":"Marston Ridge","postTown":"Oxford","county":"Oxfordshire","postcode":"OX4 7GE"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Lara","lastName":"Nicholson","id":71,"nhsNumber":"121 205 802","certificateType":"hrtppc","status":"active","certificateReference":"HRT D136 F105","startDate":"9 January 2025","endDate":"9 October 2026","address":{"buildingNumber":"56","streetName":"Sandpiper Crescent","locality":"Cove Hill","postTown":"Southampton","county":"Hampshire","postcode":"SO9 7MC"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Julia","lastName":"Gardner","id":72,"nhsNumber":"421 540 775","certificateType":"matex","status":"active","certificateReference":"57 373 739 685","startDate":"6 February 2025","endDate":"6 November 2026","address":{"buildingNumber":"72","streetName":"Greyfriars Way","locality":"Bellstead","postTown":"Bedford","county":"Bedfordshire","postcode":"MK41 1RF"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Ada","lastName":"Newton","id":73,"nhsNumber":"162 525 016","certificateType":"hrtppc","status":"active","certificateReference":"HRT ZKRA 0M93","startDate":"25 December 2024","endDate":"25 September 2026","address":{"buildingNumber":"18","streetName":"Myrtle Row","locality":"Oldacre","postTown":"Warrington","county":"Cheshire","postcode":"WA3 2XT"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Summer","lastName":"Reed","id":74,"nhsNumber":"741 638 345","certificateType":"matex","status":"reviewing","certificateReference":"81 609 041 828","startDate":"17 December 2024","endDate":"17 September 2026","address":{"buildingNumber":"6","streetName":"Brookview Way","locality":"Langwood","postTown":"Harrogate","county":"North Yorkshire","postcode":"HG3 9QL"},"lastNote":{"title":"Paper key-in requested"}},{"firstName":"Victoria","lastName":"Harvey","id":75,"nhsNumber":"362 210 430","certificateType":"hrtppc","status":"active","certificateReference":"HRT PKCK 1VQT","startDate":"4 March 2025","endDate":"4 December 2026","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Maria","lastName":"Fernandez","id":76,"nhsNumber":"043 553 073","certificateType":"matex","status":"reviewing","certificateReference":"32 209 276 380","startDate":"21 March 2025","endDate":"21 December 2026","address":{"buildingNumber":"36","streetName":"Highcliff Road","locality":"Marshgate","postTown":"Grimsby","county":"Lincolnshire","postcode":"DN3 7NS"},"lastNote":{"title":"Application returned to GP","text":"Missing GP signature. Letter PE07 sent."}},{"firstName":"Elena","lastName":"Silva","id":77,"nhsNumber":"557 799 098","certificateType":"matex","status":"reviewing","certificateReference":"71 653 330 980","startDate":"12 April 2025","endDate":"12 January 2027","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"},"lastNote":{"title":"Application returned to GP","text":"Missing GP signature. Letter PE07 sent."}},{"firstName":"Leila","lastName":"Patel","id":78,"nhsNumber":"231 041 611","certificateType":"hrtppc","status":"active","certificateReference":"HRT W0WV URAI","startDate":"24 March 2025","endDate":"24 December 2026","address":{"buildingNumber":"86","streetName":"Copse Lane","locality":"Hillmead","postTown":"Newcastle","county":"Tyne and Wear","postcode":"NE5 2PA"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Fatima","lastName":"Iqbal","id":79,"nhsNumber":"471 578 236","certificateType":"hrtppc","status":"active","certificateReference":"HRT V1VE KVZI","startDate":"21 April 2025","endDate":"21 January 2027","address":{"buildingNumber":"41","streetName":"Tansy Court","locality":"Littlebourne","postTown":"Canterbury","county":"Kent","postcode":"CT4 1JX"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Jasmine","lastName":"Ahmed","id":80,"nhsNumber":"227 469 498","certificateType":"matex","status":"reviewing","certificateReference":"56 913 186 386","startDate":"18 April 2025","endDate":"18 January 2027","address":{"buildingNumber":"59","streetName":"Regent Gardens","locality":"Kingsreach","postTown":"Coventry","county":"West Midlands","postcode":"CV3 1BN"},"lastNote":{"title":"Application returned to patient","text":"Missing patient signature. Letter PE05 sent."}},{"firstName":"Nadia","lastName":"Rashid","id":81,"nhsNumber":"263 647 832","certificateType":"matex","status":"active","certificateReference":"40 845 081 026","startDate":"29 December 2024","endDate":"29 September 2026","address":{"buildingNumber":"95","streetName":"Old Forge Street","locality":"Daleham","postTown":"Carlisle","county":"Cumbria","postcode":"CA2 5NJ"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Tara","lastName":"Paterson","id":82,"nhsNumber":"357 450 576","certificateType":"hrtppc","status":"active","certificateReference":"HRT WG0R FP13","startDate":"14 February 2025","endDate":"14 November 2026","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Bethany","lastName":"Foster","id":83,"nhsNumber":"622 499 167","certificateType":"matex","status":"accepted","certificateReference":"78 380 885 184","startDate":"8 January 2025","endDate":"8 October 2026","address":{"buildingNumber":"24","streetName":"Millstream Row","locality":"Havenfield","postTown":"Lincoln","county":"Lincolnshire","postcode":"LN2 8FP"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Lauren","lastName":"Fox","id":84,"nhsNumber":"394 240 895","certificateType":"matex","status":"accepted","certificateReference":"11 991 808 337","startDate":"26 December 2024","endDate":"26 September 2026","address":{"buildingNumber":"31","streetName":"Wildflower Road","locality":"Whitestone","postTown":"Darlington","county":"County Durham","postcode":"DL2 6MX"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Georgia","lastName":"Grant","id":85,"nhsNumber":"367 540 084","certificateType":"matex","status":"active","certificateReference":"80 201 383 464","startDate":"3 March 2025","endDate":"3 December 2026","address":{"buildingNumber":"56","streetName":"Sandpiper Crescent","locality":"Cove Hill","postTown":"Southampton","county":"Hampshire","postcode":"SO9 7MC"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Abigail","lastName":"Murray","id":86,"nhsNumber":"714 724 068","certificateType":"hrtppc","status":"active","certificateReference":"HRT WR0S CGLM","startDate":"10 January 2025","endDate":"10 October 2026","address":{"buildingNumber":"27","streetName":"Whistler Road","locality":"East Densford","postTown":"Portsmouth","county":"Hampshire","postcode":"PO4 7JF"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Ella-May","lastName":"West","id":87,"nhsNumber":"992 964 554","certificateType":"matex","status":"reviewing","certificateReference":"45 171 437 694","startDate":"20 December 2024","endDate":"20 September 2026","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"},"lastNote":{"title":"Application returned to patient","text":"No GP stamp on form. Letter PE05 sent."}},{"firstName":"Robyn","lastName":"Matthews","id":88,"nhsNumber":"351 050 166","certificateType":"matex","status":"active","certificateReference":"46 675 316 433","startDate":"30 May 2025","endDate":"2 March 2027","address":{"buildingNumber":"6","streetName":"Wisteria Court","locality":"Cresthaven","postTown":"St Albans","county":"Hertfordshire","postcode":"AL4 8FJ"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Kayla","lastName":"Holmes","id":89,"nhsNumber":"699 899 261","certificateType":"hrtppc","status":"active","certificateReference":"HRT P4FN YZQ0","startDate":"21 December 2024","endDate":"21 September 2026","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Lydia","lastName":"Walsh","id":90,"nhsNumber":"755 333 671","certificateType":"matex","status":"accepted","certificateReference":"97 074 599 503","startDate":"21 January 2025","endDate":"21 October 2026","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Alexandra","lastName":"Page","id":91,"nhsNumber":"625 104 441","certificateType":"hrtppc","status":"active","certificateReference":"HRT 3KQ1 7335","startDate":"10 February 2025","endDate":"10 November 2026","address":{"buildingNumber":"19","streetName":"Crown Street","locality":"Millbridge","postTown":"Plymouth","county":"Devon","postcode":"PL6 1TD"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Natalie","lastName":"Jordan","id":92,"nhsNumber":"501 634 807","certificateType":"hrtppc","status":"active","certificateReference":"HRT YCGQ K0AL","startDate":"31 December 2024","endDate":"1 October 2026","address":{"buildingNumber":"5","streetName":"Linton Walk","locality":"Southgate Park","postTown":"Crawley","county":"West Sussex","postcode":"RH11 4XW"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Beth","lastName":"Barrett","id":93,"nhsNumber":"845 635 047","certificateType":"matex","status":"accepted","certificateReference":"19 839 729 621","startDate":"13 June 2025","endDate":"13 March 2027","address":{"buildingNumber":"98","streetName":"Stag Lane","locality":"Marbleham","postTown":"Brighton","county":"East Sussex","postcode":"BN2 1WE"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Mollie","lastName":"Hayes","id":94,"nhsNumber":"985 577 436","certificateType":"hrtppc","status":"active","certificateReference":"HRT DGRN IL7B","startDate":"12 February 2025","endDate":"12 November 2026","address":{"buildingNumber":"60","streetName":"Queensbury Court","locality":"Palmstead","postTown":"Blackpool","county":"Lancashire","postcode":"FY2 9AH"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Francesca","lastName":"Cunningham","id":95,"nhsNumber":"783 256 973","certificateType":"hrtppc","status":"active","certificateReference":"HRT ALAD QYTG","startDate":"19 January 2025","endDate":"19 October 2026","address":{"buildingNumber":"15","streetName":"Beacon Lane","locality":"Craybourne","postTown":"Maidstone","county":"Kent","postcode":"ME16 2RS"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Amelie","lastName":"Barber","id":96,"nhsNumber":"816 980 114","certificateType":"matex","status":"expired","certificateReference":"47 404 046 569","startDate":"8 February 2025","endDate":"8 November 2026","address":{"buildingNumber":"62","streetName":"Poppyfield Way","locality":"Marston Ridge","postTown":"Oxford","county":"Oxfordshire","postcode":"OX4 7GE"},"lastNote":{"title":"Certificate expired"}},{"firstName":"Lucia","lastName":"Knight","id":97,"nhsNumber":"140 171 137","certificateType":"matex","status":"processing","certificateReference":"2025 12 16 15 36 16N798906222","startDate":"13 May 2025","endDate":"13 February 2027","address":{"buildingNumber":"12","streetName":"Maple Grove","locality":"Ashford Hill","postTown":"Reading","county":"Berkshire","postcode":"RG4 8ZT"},"lastNote":{"title":"Application scanned"}},{"firstName":"Eden","lastName":"Parsons","id":98,"nhsNumber":"886 475 134","certificateType":"matex","status":"accepted","certificateReference":"60 431 210 805","startDate":"16 January 2025","endDate":"16 October 2026","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"},"lastNote":{"title":"Application accepted and awaiting print"}},{"firstName":"Tilly","lastName":"Bates","id":99,"nhsNumber":"023 603 527","certificateType":"matex","status":"processing","certificateReference":"2025 12 16 15 36 16N996865889","startDate":"3 January 2025","endDate":"3 October 2026","address":{"buildingNumber":"52","streetName":"Warren Terrace","locality":"Elmwick","postTown":"Scarborough","county":"North Yorkshire","postcode":"YO14 2JG"},"lastNote":{"title":"Application scanned"}},{"firstName":"Holly","lastName":"Day","id":100,"nhsNumber":"064 451 601","certificateType":"hrtppc","status":"active","certificateReference":"HRT RRG0 NSJS","startDate":"29 May 2025","endDate":"1 March 2027","address":{"buildingNumber":"18","streetName":"Myrtle Row","locality":"Oldacre","postTown":"Warrington","county":"Cheshire","postcode":"WA3 2XT"},"lastNote":{"title":"Certificate issued"}},{"firstName":"Indie","lastName":"Francis","id":101,"nhsNumber":"298 735 435","certificateType":"matex","status":"reviewing","certificateReference":"49 184 140 257","startDate":"21 February 2025","endDate":"21 November 2026","address":{"buildingNumber":"90","streetName":"Fernbrook Drive","locality":"Westerleigh","postTown":"Bath","county":"Somerset","postcode":"BA2 9PF"},"lastNote":{"title":"Application returned to patient","text":"Missing patient signature. Letter PE05 sent."}},{"firstName":"Hope","lastName":"Burton","id":102,"nhsNumber":"930 764 581","certificateType":"hrtppc","status":"active","certificateReference":"HRT NIEW NVQ2","startDate":"24 December 2024","endDate":"24 September 2026","address":{"buildingNumber":"27","streetName":"Whistler Road","locality":"East Densford","postTown":"Portsmouth","county":"Hampshire","postcode":"PO4 7JF"},"lastNote":{"title":"Certificate issued"}}]';

    let returnPatientData = patientData;

    if( code ){
      
      patientData = JSON.parse( patientData );
      
      const loop = patientData.length;

      for( let i = 0; i<loop; i++ ){
        if( String(patientData[i].id) === code ){
          returnPatientData = patientData[i];
          break;
        }
      }

    }

    // Generate new patient data from 'data-patients.html'
    return returnPatientData;
  });





  return true;
}

/**
 * @import { Environment } from 'nunjucks'
 */
