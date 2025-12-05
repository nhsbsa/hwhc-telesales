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
  env.addFilter('getTableHeadRows', function ( content ) {

    const version = this.ctx.version;

    const noOfFilteredRows = (Number.isInteger(parseInt(this.ctx.data[version].noOfFilteredRows))) ? parseInt(this.ctx.data[version].noOfFilteredRows) : 0;

    const sortBy = ( this.ctx.data[version].sortBy ) ? this.ctx.data[version].sortBy : 'lastName'; 
    const sortDirection = ( ['ascending','descending'].indexOf( this.ctx.data[version].sortDirection ) > -1 ) ? this.ctx.data[version].sortDirection : 'descending';

    const baseLink = '?' + version + '[currentPage]=0';
    const opposite = ( sortDirection === 'descending' ) ? 'ascending' : 'descending'; 

    // lastName
    let lastNameLink = ( sortBy === 'lastName' ) ? baseLink + '&' + version + '[sortBy]=lastName&' + version + '[sortDirection]=' + opposite : baseLink + '&sortBy=name&sortDirection=ascending';
    let lastNameObj = ( noOfFilteredRows < 2 ) ? { html: 'Name<br /><span class="nhsuk-body-s">NHS number</span>' } : {
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
              { text: 'Action' }
            ];

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

    // Convert into component rows
    const rows = [];

    paginatedPatientData.forEach(function (patient) {

      const obj = [
        { html: '<strong>' + patient.lastName + ', ' + patient.firstName + '</strong><br /><span class="nhsuk-body-s">' + patient.nhsNumber + '</span>' },
        { html: patient.address.postcode },
        { html: _getCertificateTypeTextOrTag( patient.certificateType, true )},
        { html: _getStatusTextOrTag( patient.status, true ) },
        { html: ( patient.status === 'processing' ) ? '<span class="nhsuk-body-s nhsuk-u-secondary-text-colour">'+ patient.certificateReference +'</span>' : patient.certificateReference },
        { text: patient.endDate },
        { html: '<a href="'+ patient.certificateType +'/case">View <span class="nhsuk-u-visually-hidden">' + patient.firstName + ' ' + patient.lastName + '\'s ' + _getCertificateTypeTextOrTag( patient.certificateType ) + '</span></a>' },
      ];

      rows.push(obj);

    });

    return rows;

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
  env.addFilter('getPatientData', function (content) {

    // Generate new patient data from 'data-patients.html'
    return '[{"firstName":"Olivia","lastName":"Smith","nhsNumber":"958 423 465","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5R81 ULRI","startDate":"7 April 2025","endDate":"7 January 2027","address":{"buildingNumber":"12","streetName":"Maple Grove","locality":"Ashford Hill","postTown":"Reading","county":"Berkshire","postcode":"RG4 8ZT"}},{"firstName":"Amelia","lastName":"Jones","nhsNumber":"195 737 170","certificateType":"hrtppc","status":"active","certificateReference":"HRT OCHF XCNP","startDate":"9 May 2025","endDate":"9 February 2027","address":{"buildingNumber":"44","streetName":"Bramley Road","locality":"East Mere","postTown":"Norwich","county":"Norfolk","postcode":"NR3 5QN"}},{"firstName":"Isla","lastName":"Taylor","nhsNumber":"629 994 787","certificateType":"hrtppc","status":"active","certificateReference":"HRT IJ2Y QHCJ","startDate":"8 February 2025","endDate":"8 November 2026","address":{"buildingNumber":"7","streetName":"Kestrel Close","locality":"Winterfold","postTown":"Guildford","county":"Surrey","postcode":"GU3 9LP"}},{"firstName":"Ava","lastName":"Brown","nhsNumber":"215 694 799","certificateType":"matex","status":"accepted","certificateReference":"29 244 125 762","startDate":"24 February 2025","endDate":"24 November 2026","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"}},{"firstName":"Emily","lastName":"Williams","nhsNumber":"809 650 355","certificateType":"matex","status":"processing","certificateReference":"2025 12 04 15 03 42N414178665","startDate":"23 January 2025","endDate":"23 October 2026","address":{"buildingNumber":"19","streetName":"Crown Street","locality":"Millbridge","postTown":"Plymouth","county":"Devon","postcode":"PL6 1TD"}},{"firstName":"Sophia","lastName":"Wilson","nhsNumber":"949 274 274","certificateType":"matex","status":"accepted","certificateReference":"98 537 320 617","startDate":"13 April 2025","endDate":"13 January 2027","address":{"buildingNumber":"5","streetName":"Linton Walk","locality":"Southgate Park","postTown":"Crawley","county":"West Sussex","postcode":"RH11 4XW"}},{"firstName":"Mia","lastName":"Davies","nhsNumber":"588 379 211","certificateType":"hrtppc","status":"active","certificateReference":"HRT BLKJ 4CG8","startDate":"23 April 2025","endDate":"23 January 2027","address":{"buildingNumber":"63","streetName":"Riverstone Court","locality":"Longmead","postTown":"Taunton","county":"Somerset","postcode":"TA2 3UP"}},{"firstName":"Ella","lastName":"Evans","nhsNumber":"629 189 003","certificateType":"hrtppc","status":"active","certificateReference":"HRT GO36 N1OZ","startDate":"24 February 2025","endDate":"24 November 2026","address":{"buildingNumber":"28","streetName":"Birch Avenue","locality":"Northcrest","postTown":"Leicester","county":"Leicestershire","postcode":"LE5 8YU"}},{"firstName":"Grace","lastName":"Thomas","nhsNumber":"070 174 749","certificateType":"matex","status":"reviewing","certificateReference":"96 391 670 372","startDate":"15 January 2025","endDate":"15 October 2026","address":{"buildingNumber":"90","streetName":"Fernbrook Drive","locality":"Westerleigh","postTown":"Bath","county":"Somerset","postcode":"BA2 9PF"}},{"firstName":"Lily","lastName":"Roberts","nhsNumber":"413 812 762","certificateType":"matex","status":"active","certificateReference":"39 982 960 355","startDate":"14 April 2025","endDate":"14 January 2027","address":{"buildingNumber":"14","streetName":"Windsor Rise","locality":"Redford","postTown":"Derby","county":"Derbyshire","postcode":"DE1 4SX"}},{"firstName":"Freya","lastName":"Johnson","nhsNumber":"278 163 307","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5JHE N55J","startDate":"27 December 2024","endDate":"27 September 2026","address":{"buildingNumber":"51","streetName":"Hawthorne Road","locality":"Claymere","postTown":"Chester","county":"Cheshire","postcode":"CH4 2MB"}},{"firstName":"Charlotte","lastName":"Lewis","nhsNumber":"087 578 809","certificateType":"hrtppc","status":"active","certificateReference":"HRT NJ8S PL41","startDate":"7 December 2024","endDate":"7 September 2026","address":{"buildingNumber":"3","streetName":"Mallow Street","locality":"Eastwood Vale","postTown":"Nottingham","county":"Nottinghamshire","postcode":"NG5 3JU"}},{"firstName":"Isabella","lastName":"Walker","nhsNumber":"949 419 231","certificateType":"matex","status":"active","certificateReference":"22 464 792 117","startDate":"2 May 2025","endDate":"2 February 2027","address":{"buildingNumber":"76","streetName":"Peach Tree Way","locality":"Brookfell","postTown":"York","county":"North Yorkshire","postcode":"YO3 6AP"}},{"firstName":"Daisy","lastName":"Hall","nhsNumber":"992 648 036","certificateType":"matex","status":"accepted","certificateReference":"26 609 148 343","startDate":"3 January 2025","endDate":"3 October 2026","address":{"buildingNumber":"24","streetName":"Millstream Row","locality":"Havenfield","postTown":"Lincoln","county":"Lincolnshire","postcode":"LN2 8FP"}},{"firstName":"Evie","lastName":"Clarke","nhsNumber":"241 026 629","certificateType":"matex","status":"active","certificateReference":"27 119 662 407","startDate":"13 February 2025","endDate":"13 November 2026","address":{"buildingNumber":"37","streetName":"Weavers Lane","locality":"Northgate","postTown":"Wolverhampton","county":"West Midlands","postcode":"WV4 3TT"}},{"firstName":"Phoebe","lastName":"Allen","nhsNumber":"327 404 230","certificateType":"matex","status":"accepted","certificateReference":"41 919 324 218","startDate":"27 April 2025","endDate":"27 January 2027","address":{"buildingNumber":"11","streetName":"Rose Mews","locality":"Kingswell","postTown":"Oxford","county":"Oxfordshire","postcode":"OX3 9DQ"}},{"firstName":"Sophie","lastName":"Young","nhsNumber":"601 305 066","certificateType":"matex","status":"reviewing","certificateReference":"83 639 640 599","startDate":"2 January 2025","endDate":"2 October 2026","address":{"buildingNumber":"8","streetName":"Elmbrook Gardens","locality":"Gransfield","postTown":"Peterborough","county":"Cambridgeshire","postcode":"PE2 7QF"}},{"firstName":"Harper","lastName":"King","nhsNumber":"892 768 697","certificateType":"matex","status":"processing","certificateReference":"2025 12 04 15 03 42N972685666","startDate":"20 March 2025","endDate":"20 December 2026","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"}},{"firstName":"Millie","lastName":"Wright","nhsNumber":"537 866 009","certificateType":"hrtppc","status":"active","certificateReference":"HRT ZEG4 441P","startDate":"18 April 2025","endDate":"18 January 2027","address":{"buildingNumber":"29","streetName":"Falcon Street","locality":"Ridgebury","postTown":"Worcester","county":"Worcestershire","postcode":"WR1 6JS"}},{"firstName":"Ella-Rose","lastName":"Green","nhsNumber":"569 541 691","certificateType":"hrtppc","status":"active","certificateReference":"HRT 2A5L 4HVE","startDate":"31 December 2024","endDate":"1 October 2026","address":{"buildingNumber":"16","streetName":"Harrier Way","locality":"Loxwood Green","postTown":"Horsham","county":"West Sussex","postcode":"RH13 7BN"}},{"firstName":"Poppy","lastName":"Baker","nhsNumber":"000 793 798","certificateType":"matex","status":"reviewing","certificateReference":"70 437 103 459","startDate":"20 March 2025","endDate":"20 December 2026","address":{"buildingNumber":"33","streetName":"Yew Tree Court","locality":"Silverbrook","postTown":"Shrewsbury","county":"Shropshire","postcode":"SY2 8RR"}},{"firstName":"Ruby","lastName":"Adams","nhsNumber":"491 561 361","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5EJS 2YJO","startDate":"18 May 2025","endDate":"18 February 2027","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Chloe","lastName":"Mitchell","nhsNumber":"294 631 579","certificateType":"matex","status":"reviewing","certificateReference":"67 983 188 025","startDate":"6 December 2024","endDate":"6 September 2026","address":{"buildingNumber":"22","streetName":"Stonemill Drive","locality":"Hawkinge Vale","postTown":"Canterbury","county":"Kent","postcode":"CT3 6LW"}},{"firstName":"Sienna","lastName":"Turner","nhsNumber":"152 020 902","certificateType":"hrtppc","status":"active","certificateReference":"HRT FN7L IO3A","startDate":"4 February 2025","endDate":"4 November 2026","address":{"buildingNumber":"9","streetName":"Willowbank Way","locality":"East Harling","postTown":"Ipswich","county":"Suffolk","postcode":"IP5 0YN"}},{"firstName":"Willow","lastName":"Carter","nhsNumber":"562 274 899","certificateType":"hrtppc","status":"active","certificateReference":"HRT DED1 RXOB","startDate":"24 March 2025","endDate":"24 December 2026","address":{"buildingNumber":"56","streetName":"Sandpiper Crescent","locality":"Cove Hill","postTown":"Southampton","county":"Hampshire","postcode":"SO9 7MC"}},{"firstName":"Jessica","lastName":"Morris","nhsNumber":"921 518 282","certificateType":"matex","status":"processing","certificateReference":"2025 12 04 15 03 42N405580800","startDate":"10 March 2025","endDate":"10 December 2026","address":{"buildingNumber":"15","streetName":"Beacon Lane","locality":"Craybourne","postTown":"Maidstone","county":"Kent","postcode":"ME16 2RS"}},{"firstName":"Matilda","lastName":"Hughes","nhsNumber":"557 865 179","certificateType":"matex","status":"processing","certificateReference":"2025 12 04 15 03 42N607321072","startDate":"29 March 2025","endDate":"29 December 2026","address":{"buildingNumber":"101","streetName":"Elm Walk","locality":"Hillford","postTown":"Harlow","county":"Essex","postcode":"CM19 6JQ"}},{"firstName":"Elsie","lastName":"Ward","nhsNumber":"642 725 367","certificateType":"hrtppc","status":"active","certificateReference":"HRT RODV EBY2","startDate":"15 February 2025","endDate":"15 November 2026","address":{"buildingNumber":"2","streetName":"Clearwater Road","locality":"Riverside","postTown":"Colchester","county":"Essex","postcode":"CO5 3LP"}},{"firstName":"Rosie","lastName":"Price","nhsNumber":"407 474 802","certificateType":"hrtppc","status":"active","certificateReference":"HRT JQYF GR7M","startDate":"22 December 2024","endDate":"22 September 2026","address":{"buildingNumber":"48","streetName":"Lavender Street","locality":"Westford","postTown":"Cambridge","county":"Cambridgeshire","postcode":"CB3 9UE"}},{"firstName":"Aria","lastName":"Cooper","nhsNumber":"622 155 059","certificateType":"hrtppc","status":"active","certificateReference":"HRT LBM4 B24D","startDate":"12 December 2024","endDate":"12 September 2026","address":{"buildingNumber":"72","streetName":"Greyfriars Way","locality":"Bellstead","postTown":"Bedford","county":"Bedfordshire","postcode":"MK41 1RF"}},{"firstName":"Layla","lastName":"Bailey","nhsNumber":"626 469 103","certificateType":"matex","status":"accepted","certificateReference":"31 330 424 255","startDate":"5 December 2024","endDate":"5 September 2026","address":{"buildingNumber":"36","streetName":"Highcliff Road","locality":"Marshgate","postTown":"Grimsby","county":"Lincolnshire","postcode":"DN3 7NS"}},{"firstName":"Luna","lastName":"Parker","nhsNumber":"066 055 261","certificateType":"matex","status":"processing","certificateReference":"2025 12 04 15 03 42N830491027","startDate":"20 December 2024","endDate":"20 September 2026","address":{"buildingNumber":"88","streetName":"Fenton Close","locality":"Broadwood","postTown":"Sheffield","county":"South Yorkshire","postcode":"S11 6TB"}},{"firstName":"Hannah","lastName":"Phillips","nhsNumber":"971 959 982","certificateType":"matex","status":"active","certificateReference":"58 898 058 484","startDate":"3 May 2025","endDate":"3 February 2027","address":{"buildingNumber":"41","streetName":"Tansy Court","locality":"Littlebourne","postTown":"Canterbury","county":"Kent","postcode":"CT4 1JX"}},{"firstName":"Zara","lastName":"Bennett","nhsNumber":"620 908 216","certificateType":"hrtppc","status":"active","certificateReference":"HRT 999H FPG2","startDate":"7 April 2025","endDate":"7 January 2027","address":{"buildingNumber":"97","streetName":"Sunnyside Avenue","locality":"Greenleigh","postTown":"Leeds","county":"West Yorkshire","postcode":"LS7 2PQ"}},{"firstName":"Florence","lastName":"Cox","nhsNumber":"742 027 395","certificateType":"matex","status":"accepted","certificateReference":"64 581 842 886","startDate":"7 February 2025","endDate":"7 November 2026","address":{"buildingNumber":"30","streetName":"Larch Lane","locality":"Warren Hill","postTown":"Hull","county":"East Yorkshire","postcode":"HU6 4ZY"}},{"firstName":"Maya","lastName":"Richardson","nhsNumber":"508 077 892","certificateType":"hrtppc","status":"active","certificateReference":"HRT QVO9 PKNF","startDate":"15 December 2024","endDate":"15 September 2026","address":{"buildingNumber":"62","streetName":"Poppyfield Way","locality":"Marston Ridge","postTown":"Oxford","county":"Oxfordshire","postcode":"OX4 7GE"}},{"firstName":"Esme","lastName":"Gray","nhsNumber":"124 597 929","certificateType":"hrtppc","status":"active","certificateReference":"HRT OJUC WCFB","startDate":"10 March 2025","endDate":"10 December 2026","address":{"buildingNumber":"21","streetName":"Ivywood Street","locality":"Southmere","postTown":"Cardiff","county":"South Glamorgan","postcode":"CF5 2JD"}},{"firstName":"Ivy","lastName":"Ross","nhsNumber":"892 679 062","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5AOK V0PE","startDate":"20 January 2025","endDate":"20 October 2026","address":{"buildingNumber":"14","streetName":"Oakridge Row","locality":"Firrendown","postTown":"Swansea","county":"West Glamorgan","postcode":"SA6 8PP"}},{"firstName":"Arabella","lastName":"Bell","nhsNumber":"026 449 833","certificateType":"hrtppc","status":"active","certificateReference":"HRT KBFD QHLV","startDate":"18 February 2025","endDate":"18 November 2026","address":{"buildingNumber":"81","streetName":"Bridgewater Drive","locality":"Lancot Green","postTown":"Luton","county":"Bedfordshire","postcode":"LU4 9WB"}},{"firstName":"Evelyn","lastName":"Cook","nhsNumber":"089 130 474","certificateType":"matex","status":"expired","certificateReference":"86 036 446 963","startDate":"25 April 2025","endDate":"25 January 2027","address":{"buildingNumber":"26","streetName":"Primrose Lane","locality":"Wickford Heath","postTown":"Basildon","county":"Essex","postcode":"SS14 3SR"}},{"firstName":"Thea","lastName":"Watson","nhsNumber":"470 120 627","certificateType":"matex","status":"active","certificateReference":"58 438 920 974","startDate":"15 May 2025","endDate":"15 February 2027","address":{"buildingNumber":"59","streetName":"Regent Gardens","locality":"Kingsreach","postTown":"Coventry","county":"West Midlands","postcode":"CV3 1BN"}},{"firstName":"Alice","lastName":"Sanders","nhsNumber":"847 780 714","certificateType":"matex","status":"accepted","certificateReference":"55 356 789 476","startDate":"28 March 2025","endDate":"28 December 2026","address":{"buildingNumber":"18","streetName":"Myrtle Row","locality":"Oldacre","postTown":"Warrington","county":"Cheshire","postcode":"WA3 2XT"}},{"firstName":"Emma","lastName":"Harrison","nhsNumber":"573 857 506","certificateType":"matex","status":"accepted","certificateReference":"22 889 996 268","startDate":"12 December 2024","endDate":"12 September 2026","address":{"buildingNumber":"6","streetName":"Wisteria Court","locality":"Cresthaven","postTown":"St Albans","county":"Hertfordshire","postcode":"AL4 8FJ"}},{"firstName":"Lottie","lastName":"Coleman","nhsNumber":"810 423 901","certificateType":"hrtppc","status":"active","certificateReference":"HRT B2UV R0JY","startDate":"13 April 2025","endDate":"13 January 2027","address":{"buildingNumber":"85","streetName":"Sparrow Lane","locality":"Northwood Vale","postTown":"Watford","county":"Hertfordshire","postcode":"WD24 6PH"}},{"firstName":"Amber","lastName":"Murphy","nhsNumber":"841 875 609","certificateType":"matex","status":"accepted","certificateReference":"98 492 111 684","startDate":"16 March 2025","endDate":"16 December 2026","address":{"buildingNumber":"11","streetName":"Ashen Close","locality":"Brookhill","postTown":"Slough","county":"Berkshire","postcode":"SL2 9MT"}},{"firstName":"Scarlett","lastName":"Graham","nhsNumber":"791 506 353","certificateType":"hrtppc","status":"active","certificateReference":"HRT XHGM PNN3","startDate":"28 February 2025","endDate":"28 November 2026","address":{"buildingNumber":"53","streetName":"Laurel Drive","locality":"Kingswood Park","postTown":"Bristol","county":"Bristol","postcode":"BS16 4DX"}},{"firstName":"Bonnie","lastName":"Stevens","nhsNumber":"234 966 224","certificateType":"matex","status":"accepted","certificateReference":"11 933 566 627","startDate":"22 February 2025","endDate":"22 November 2026","address":{"buildingNumber":"7","streetName":"Thornfield Way","locality":"Greenhollow","postTown":"Gloucester","county":"Gloucestershire","postcode":"GL1 5UP"}},{"firstName":"Imogen","lastName":"Simpson","nhsNumber":"880 140 749","certificateType":"matex","status":"reviewing","certificateReference":"30 731 411 293","startDate":"15 December 2024","endDate":"15 September 2026","address":{"buildingNumber":"40","streetName":"Cedar Brook","locality":"Ashvale","postTown":"High Wycombe","county":"Buckinghamshire","postcode":"HP12 8PD"}},{"firstName":"Harriet","lastName":"Butler","nhsNumber":"207 551 515","certificateType":"matex","status":"reviewing","certificateReference":"18 446 517 176","startDate":"28 March 2025","endDate":"28 December 2026","address":{"buildingNumber":"98","streetName":"Stag Lane","locality":"Marbleham","postTown":"Brighton","county":"East Sussex","postcode":"BN2 1WE"}},{"firstName":"Eleanor","lastName":"Chapman","nhsNumber":"725 688 576","certificateType":"hrtppc","status":"active","certificateReference":"HRT LANF FOE3","startDate":"25 March 2025","endDate":"25 December 2026","address":{"buildingNumber":"27","streetName":"Whistler Road","locality":"East Densford","postTown":"Portsmouth","county":"Hampshire","postcode":"PO4 7JF"}},{"firstName":"Aisha","lastName":"Ali","nhsNumber":"093 065 349","certificateType":"matex","status":"reviewing","certificateReference":"74 384 328 923","startDate":"20 February 2025","endDate":"20 November 2026","address":{"buildingNumber":"75","streetName":"Gorse Way","locality":"Heathrow End","postTown":"Hounslow","county":"Greater London","postcode":"TW4 5ZA"}},{"firstName":"Sofia","lastName":"Hussain","nhsNumber":"084 723 838","certificateType":"hrtppc","status":"active","certificateReference":"HRT D351 Q5LK","startDate":"6 April 2025","endDate":"6 January 2027","address":{"buildingNumber":"3","streetName":"Juniper Walk","locality":"Woodleigh","postTown":"Enfield","county":"Greater London","postcode":"EN3 1TP"}},{"firstName":"Amira","lastName":"Khan","nhsNumber":"228 562 170","certificateType":"matex","status":"reviewing","certificateReference":"94 519 255 920","startDate":"26 February 2025","endDate":"26 November 2026","address":{"buildingNumber":"58","streetName":"Chapel Row","locality":"Millthorpe","postTown":"Wakefield","county":"West Yorkshire","postcode":"WF3 8KD"}},{"firstName":"Leah","lastName":"Begum","nhsNumber":"716 346 390","certificateType":"matex","status":"active","certificateReference":"05 333 448 100","startDate":"7 April 2025","endDate":"7 January 2027","address":{"buildingNumber":"13","streetName":"Stonewall Lane","locality":"Northbridge","postTown":"Bradford","county":"West Yorkshire","postcode":"BD7 5TE"}},{"firstName":"Niamh","lastName":"O’Connor","nhsNumber":"837 775 575","certificateType":"hrtppc","status":"active","certificateReference":"HRT IBTA SPJR","startDate":"21 March 2025","endDate":"21 December 2026","address":{"buildingNumber":"60","streetName":"Queensbury Court","locality":"Palmstead","postTown":"Blackpool","county":"Lancashire","postcode":"FY2 9AH"}},{"firstName":"Aoife","lastName":"Kelly","nhsNumber":"351 036 608","certificateType":"matex","status":"reviewing","certificateReference":"76 403 044 220","startDate":"4 April 2025","endDate":"4 January 2027","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"}},{"firstName":"Erin","lastName":"McCarthy","nhsNumber":"731 150 023","certificateType":"matex","status":"active","certificateReference":"91 393 368 344","startDate":"19 May 2025","endDate":"19 February 2027","address":{"buildingNumber":"92","streetName":"Meadowbank Road","locality":"Harefield Park","postTown":"Liverpool","county":"Merseyside","postcode":"L8 6FP"}},{"firstName":"Orla","lastName":"Doyle","nhsNumber":"715 609 321","certificateType":"matex","status":"reviewing","certificateReference":"69 895 594 252","startDate":"2 January 2025","endDate":"2 October 2026","address":{"buildingNumber":"39","streetName":"Arbour Road","locality":"Phoenix Rise","postTown":"Manchester","county":"Greater Manchester","postcode":"M14 2YQ"}},{"firstName":"Cerys","lastName":"Griffiths","nhsNumber":"890 978 160","certificateType":"hrtppc","status":"active","certificateReference":"HRT CAZD 1OKQ","startDate":"30 May 2025","endDate":"2 March 2027","address":{"buildingNumber":"4","streetName":"Cherrytree Court","locality":"Stonemoor","postTown":"Stockport","county":"Greater Manchester","postcode":"SK4 3EW"}},{"firstName":"Megan","lastName":"Rees","nhsNumber":"707 137 799","certificateType":"hrtppc","status":"active","certificateReference":"HRT J882 KG8K","startDate":"2 January 2025","endDate":"2 October 2026","address":{"buildingNumber":"66","streetName":"Fieldhouse Lane","locality":"Greywood","postTown":"Bolton","county":"Greater Manchester","postcode":"BL3 9HB"}},{"firstName":"Ffion","lastName":"Evans","nhsNumber":"293 908 282","certificateType":"matex","status":"accepted","certificateReference":"90 556 005 535","startDate":"19 January 2025","endDate":"19 October 2026","address":{"buildingNumber":"20","streetName":"Honeysuckle Way","locality":"Oakwood Hill","postTown":"Preston","county":"Lancashire","postcode":"PR3 8LN"}},{"firstName":"Eilidh","lastName":"MacDonald","nhsNumber":"662 896 803","certificateType":"matex","status":"reviewing","certificateReference":"18 577 527 885","startDate":"10 February 2025","endDate":"10 November 2026","address":{"buildingNumber":"95","streetName":"Old Forge Street","locality":"Daleham","postTown":"Carlisle","county":"Cumbria","postcode":"CA2 5NJ"}},{"firstName":"Skye","lastName":"Fraser","nhsNumber":"817 288 902","certificateType":"hrtppc","status":"active","certificateReference":"HRT SJ4R DYO6","startDate":"15 April 2025","endDate":"15 January 2027","address":{"buildingNumber":"43","streetName":"Nightingale Row","locality":"Brambleton","postTown":"Durham","county":"County Durham","postcode":"DH1 3GP"}},{"firstName":"Maisie","lastName":"Armstrong","nhsNumber":"107 420 070","certificateType":"matex","status":"accepted","certificateReference":"04 477 866 435","startDate":"18 March 2025","endDate":"18 December 2026","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"}},{"firstName":"Penelope","lastName":"Hunter","nhsNumber":"475 272 828","certificateType":"hrtppc","status":"active","certificateReference":"HRT G1SF AOQ3","startDate":"2 February 2025","endDate":"2 November 2026","address":{"buildingNumber":"86","streetName":"Copse Lane","locality":"Hillmead","postTown":"Newcastle","county":"Tyne and Wear","postcode":"NE5 2PA"}},{"firstName":"Clara","lastName":"Lawrence","nhsNumber":"311 485 912","certificateType":"matex","status":"reviewing","certificateReference":"16 631 577 582","startDate":"8 April 2025","endDate":"8 January 2027","address":{"buildingNumber":"31","streetName":"Wildflower Road","locality":"Whitestone","postTown":"Darlington","county":"County Durham","postcode":"DL2 6MX"}},{"firstName":"Beatrice","lastName":"Spencer","nhsNumber":"492 413 893","certificateType":"matex","status":"active","certificateReference":"89 465 064 835","startDate":"4 February 2025","endDate":"4 November 2026","address":{"buildingNumber":"47","streetName":"Cloverbank Court","locality":"Iverston","postTown":"Middlesbrough","county":"North Yorkshire","postcode":"TS4 1WW"}},{"firstName":"Nancy","lastName":"Rogers","nhsNumber":"852 667 739","certificateType":"hrtppc","status":"active","certificateReference":"HRT RM1V FK9W","startDate":"8 May 2025","endDate":"8 February 2027","address":{"buildingNumber":"6","streetName":"Brookview Way","locality":"Langwood","postTown":"Harrogate","county":"North Yorkshire","postcode":"HG3 9QL"}},{"firstName":"Annabelle","lastName":"Watts","nhsNumber":"045 913 882","certificateType":"matex","status":"accepted","certificateReference":"81 480 493 603","startDate":"12 April 2025","endDate":"12 January 2027","address":{"buildingNumber":"52","streetName":"Warren Terrace","locality":"Elmwick","postTown":"Scarborough","county":"North Yorkshire","postcode":"YO14 2JG"}},{"firstName":"Heidi","lastName":"Henderson","nhsNumber":"336 345 915","certificateType":"hrtppc","status":"active","certificateReference":"HRT G5E0 DVDN","startDate":"23 March 2025","endDate":"23 December 2026","address":{"buildingNumber":"1","streetName":"Foxglove Lane","locality":"Brindlehurst","postTown":"Lancaster","county":"Lancashire","postcode":"LA3 7UH"}},{"firstName":"Rose","lastName":"Palmer","nhsNumber":"226 912 304","certificateType":"hrtppc","status":"active","certificateReference":"HRT RYSM YFRP","startDate":"1 February 2025","endDate":"1 November 2026","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Lara","lastName":"Nicholson","nhsNumber":"000 901 424","certificateType":"matex","status":"accepted","certificateReference":"23 667 301 014","startDate":"9 March 2025","endDate":"9 December 2026","address":{"buildingNumber":"15","streetName":"Beacon Lane","locality":"Craybourne","postTown":"Maidstone","county":"Kent","postcode":"ME16 2RS"}},{"firstName":"Julia","lastName":"Gardner","nhsNumber":"865 861 586","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5205 3712","startDate":"26 February 2025","endDate":"26 November 2026","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"}},{"firstName":"Ada","lastName":"Newton","nhsNumber":"565 745 230","certificateType":"hrtppc","status":"active","certificateReference":"HRT QNXG J458","startDate":"14 May 2025","endDate":"14 February 2027","address":{"buildingNumber":"28","streetName":"Birch Avenue","locality":"Northcrest","postTown":"Leicester","county":"Leicestershire","postcode":"LE5 8YU"}},{"firstName":"Summer","lastName":"Reed","nhsNumber":"089 392 019","certificateType":"hrtppc","status":"active","certificateReference":"HRT V8ZN G10O","startDate":"23 February 2025","endDate":"23 November 2026","address":{"buildingNumber":"101","streetName":"Elm Walk","locality":"Hillford","postTown":"Harlow","county":"Essex","postcode":"CM19 6JQ"}},{"firstName":"Victoria","lastName":"Harvey","nhsNumber":"793 287 065","certificateType":"hrtppc","status":"active","certificateReference":"HRT SQ5M G218","startDate":"15 March 2025","endDate":"15 December 2026","address":{"buildingNumber":"48","streetName":"Lavender Street","locality":"Westford","postTown":"Cambridge","county":"Cambridgeshire","postcode":"CB3 9UE"}},{"firstName":"Maria","lastName":"Fernandez","nhsNumber":"803 245 422","certificateType":"hrtppc","status":"active","certificateReference":"HRT 5ZSM 9S6L","startDate":"23 April 2025","endDate":"23 January 2027","address":{"buildingNumber":"3","streetName":"Juniper Walk","locality":"Woodleigh","postTown":"Enfield","county":"Greater London","postcode":"EN3 1TP"}},{"firstName":"Elena","lastName":"Silva","nhsNumber":"204 920 020","certificateType":"matex","status":"accepted","certificateReference":"04 561 378 794","startDate":"9 May 2025","endDate":"9 February 2027","address":{"buildingNumber":"11","streetName":"Ashen Close","locality":"Brookhill","postTown":"Slough","county":"Berkshire","postcode":"SL2 9MT"}},{"firstName":"Leila","lastName":"Patel","nhsNumber":"991 396 335","certificateType":"hrtppc","status":"active","certificateReference":"HRT 1FXG XWUN","startDate":"24 May 2025","endDate":"24 February 2027","address":{"buildingNumber":"75","streetName":"Gorse Way","locality":"Heathrow End","postTown":"Hounslow","county":"Greater London","postcode":"TW4 5ZA"}},{"firstName":"Fatima","lastName":"Iqbal","nhsNumber":"269 682 810","certificateType":"matex","status":"reviewing","certificateReference":"55 222 910 218","startDate":"16 December 2024","endDate":"16 September 2026","address":{"buildingNumber":"85","streetName":"Sparrow Lane","locality":"Northwood Vale","postTown":"Watford","county":"Hertfordshire","postcode":"WD24 6PH"}},{"firstName":"Jasmine","lastName":"Ahmed","nhsNumber":"358 348 053","certificateType":"hrtppc","status":"active","certificateReference":"HRT N7X6 VRQ0","startDate":"6 December 2024","endDate":"6 September 2026","address":{"buildingNumber":"58","streetName":"Chapel Row","locality":"Millthorpe","postTown":"Wakefield","county":"West Yorkshire","postcode":"WF3 8KD"}},{"firstName":"Nadia","lastName":"Rashid","nhsNumber":"396 400 071","certificateType":"matex","status":"active","certificateReference":"86 378 543 658","startDate":"10 January 2025","endDate":"10 October 2026","address":{"buildingNumber":"18","streetName":"Myrtle Row","locality":"Oldacre","postTown":"Warrington","county":"Cheshire","postcode":"WA3 2XT"}},{"firstName":"Tara","lastName":"Paterson","nhsNumber":"656 396 548","certificateType":"matex","status":"active","certificateReference":"07 553 927 476","startDate":"16 February 2025","endDate":"16 November 2026","address":{"buildingNumber":"6","streetName":"Wisteria Court","locality":"Cresthaven","postTown":"St Albans","county":"Hertfordshire","postcode":"AL4 8FJ"}},{"firstName":"Bethany","lastName":"Foster","nhsNumber":"671 931 401","certificateType":"matex","status":"expired","certificateReference":"85 629 552 733","startDate":"14 February 2025","endDate":"14 November 2026","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"}},{"firstName":"Lauren","lastName":"Fox","nhsNumber":"266 447 575","certificateType":"hrtppc","status":"active","certificateReference":"HRT RRP3 53T4","startDate":"4 March 2025","endDate":"4 December 2026","address":{"buildingNumber":"7","streetName":"Thornfield Way","locality":"Greenhollow","postTown":"Gloucester","county":"Gloucestershire","postcode":"GL1 5UP"}},{"firstName":"Georgia","lastName":"Grant","nhsNumber":"184 104 493","certificateType":"matex","status":"accepted","certificateReference":"51 160 043 694","startDate":"15 February 2025","endDate":"15 November 2026","address":{"buildingNumber":"59","streetName":"Regent Gardens","locality":"Kingsreach","postTown":"Coventry","county":"West Midlands","postcode":"CV3 1BN"}},{"firstName":"Abigail","lastName":"Murray","nhsNumber":"282 683 770","certificateType":"hrtppc","status":"active","certificateReference":"HRT 38JV 38P5","startDate":"7 February 2025","endDate":"7 November 2026","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"}},{"firstName":"Ella-May","lastName":"West","nhsNumber":"655 334 376","certificateType":"hrtppc","status":"active","certificateReference":"HRT XAC6 ITE8","startDate":"21 March 2025","endDate":"21 December 2026","address":{"buildingNumber":"59","streetName":"Regent Gardens","locality":"Kingsreach","postTown":"Coventry","county":"West Midlands","postcode":"CV3 1BN"}},{"firstName":"Robyn","lastName":"Matthews","nhsNumber":"808 202 703","certificateType":"matex","status":"expired","certificateReference":"31 862 543 287","startDate":"3 April 2025","endDate":"3 January 2027","address":{"buildingNumber":"86","streetName":"Copse Lane","locality":"Hillmead","postTown":"Newcastle","county":"Tyne and Wear","postcode":"NE5 2PA"}},{"firstName":"Kayla","lastName":"Holmes","nhsNumber":"688 850 318","certificateType":"hrtppc","status":"active","certificateReference":"HRT P7L8 JEPW","startDate":"13 May 2025","endDate":"13 February 2027","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"}},{"firstName":"Lydia","lastName":"Walsh","nhsNumber":"433 479 922","certificateType":"matex","status":"expired","certificateReference":"68 964 372 091","startDate":"1 February 2025","endDate":"1 November 2026","address":{"buildingNumber":"26","streetName":"Primrose Lane","locality":"Wickford Heath","postTown":"Basildon","county":"Essex","postcode":"SS14 3SR"}},{"firstName":"Alexandra","lastName":"Page","nhsNumber":"529 716 957","certificateType":"hrtppc","status":"active","certificateReference":"HRT 9H65 7UTM","startDate":"13 January 2025","endDate":"13 October 2026","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"}},{"firstName":"Natalie","lastName":"Jordan","nhsNumber":"653 779 522","certificateType":"matex","status":"accepted","certificateReference":"41 265 567 834","startDate":"21 February 2025","endDate":"21 November 2026","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Beth","lastName":"Barrett","nhsNumber":"931 781 061","certificateType":"matex","status":"expired","certificateReference":"52 047 501 993","startDate":"21 April 2025","endDate":"21 January 2027","address":{"buildingNumber":"11","streetName":"Rose Mews","locality":"Kingswell","postTown":"Oxford","county":"Oxfordshire","postcode":"OX3 9DQ"}},{"firstName":"Mollie","lastName":"Hayes","nhsNumber":"744 360 661","certificateType":"matex","status":"accepted","certificateReference":"96 254 289 696","startDate":"15 March 2025","endDate":"15 December 2026","address":{"buildingNumber":"66","streetName":"Fieldhouse Lane","locality":"Greywood","postTown":"Bolton","county":"Greater Manchester","postcode":"BL3 9HB"}},{"firstName":"Francesca","lastName":"Cunningham","nhsNumber":"066 938 952","certificateType":"hrtppc","status":"active","certificateReference":"HRT BYIR N46D","startDate":"15 January 2025","endDate":"15 October 2026","address":{"buildingNumber":"22","streetName":"Stonemill Drive","locality":"Hawkinge Vale","postTown":"Canterbury","county":"Kent","postcode":"CT3 6LW"}},{"firstName":"Amelie","lastName":"Barber","nhsNumber":"287 931 110","certificateType":"hrtppc","status":"active","certificateReference":"HRT JGSP UP83","startDate":"12 February 2025","endDate":"12 November 2026","address":{"buildingNumber":"90","streetName":"Fernbrook Drive","locality":"Westerleigh","postTown":"Bath","county":"Somerset","postcode":"BA2 9PF"}},{"firstName":"Lucia","lastName":"Knight","nhsNumber":"792 323 266","certificateType":"matex","status":"processing","certificateReference":"2025 12 04 15 03 42N799900946","startDate":"8 January 2025","endDate":"8 October 2026","address":{"buildingNumber":"19","streetName":"Crown Street","locality":"Millbridge","postTown":"Plymouth","county":"Devon","postcode":"PL6 1TD"}},{"firstName":"Eden","lastName":"Parsons","nhsNumber":"105 839 628","certificateType":"matex","status":"reviewing","certificateReference":"26 506 994 311","startDate":"27 April 2025","endDate":"27 January 2027","address":{"buildingNumber":"26","streetName":"Primrose Lane","locality":"Wickford Heath","postTown":"Basildon","county":"Essex","postcode":"SS14 3SR"}},{"firstName":"Tilly","lastName":"Bates","nhsNumber":"633 766 957","certificateType":"matex","status":"active","certificateReference":"84 365 218 426","startDate":"22 March 2025","endDate":"22 December 2026","address":{"buildingNumber":"52","streetName":"Warren Terrace","locality":"Elmwick","postTown":"Scarborough","county":"North Yorkshire","postcode":"YO14 2JG"}},{"firstName":"Holly","lastName":"Day","nhsNumber":"370 127 525","certificateType":"hrtppc","status":"active","certificateReference":"HRT F1XU WOJQ","startDate":"28 January 2025","endDate":"28 October 2026","address":{"buildingNumber":"27","streetName":"Whistler Road","locality":"East Densford","postTown":"Portsmouth","county":"Hampshire","postcode":"PO4 7JF"}},{"firstName":"Indie","lastName":"Francis","nhsNumber":"605 211 947","certificateType":"hrtppc","status":"active","certificateReference":"HRT KDG7 PSKF","startDate":"9 May 2025","endDate":"9 February 2027","address":{"buildingNumber":"11","streetName":"Ashen Close","locality":"Brookhill","postTown":"Slough","county":"Berkshire","postcode":"SL2 9MT"}},{"firstName":"Hope","lastName":"Burton","nhsNumber":"448 196 612","certificateType":"hrtppc","status":"active","certificateReference":"HRT GQVU KM15","startDate":"2 February 2025","endDate":"2 November 2026","address":{"buildingNumber":"88","streetName":"Fenton Close","locality":"Broadwood","postTown":"Sheffield","county":"South Yorkshire","postcode":"S11 6TB"}}]';

  });

  return true;
}

/**
 * @import { Environment } from 'nunjucks'
 */
