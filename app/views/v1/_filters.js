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
  // GET FILTERED RESULTS FUNCTION
  // Applies the search criteria to the rows of patient data
  //
  function _getFilteredResults( rows, searchTerms ){

    console.log( '_getFilteredResults()' );

    const filteredRows = [];

    Object.keys( searchTerms ).forEach(function( key, i ){
    
      rows.forEach( function( row ){

        const needle = searchTerms[key].trim().toLowerCase();
        let haystack;

        switch( key ){

          case 'postcode':
            console.log( row );
            haystack = row.address[key].toLowerCase();
            break;

          case 'certificateReference':
            haystack = row[key].toLowerCase().split(' ').join('');
            break;

          default: 
            haystack = row[key].toLowerCase();
            break;

        }

         if( haystack.indexOf( needle ) > -1 ){
            filteredRows.push( row );
         }

      });

    });

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
    
    let caption = noOfFilteredRows + ' exemptions found';

    switch( noOfFilteredRows ){
      case 0:
        caption = 'No exemptions found';
        break;
      case 1:
        caption = '1 exemption found';
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
              { text: 'Exemption' },
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

    if( summary.length === 1 ){
      this.ctx.data.summaryText = 'All exemptions with ' + summary[0];
    } else {
      let last = summary.pop();
      this.ctx.data.summaryText = 'All exemptions with ' + summary.join(', ') + ' and ' + last;
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

      const statusTag = (patient.status === 'active') ? '<strong class="nhsuk-tag nhsuk-tag--white">Active</strong>' : '<strong class="nhsuk-tag nhsuk-tag--grey">Pending</strong>';
      
      const obj = [
        { html: '<strong>' + patient.lastName + ', ' + patient.firstName + '</strong><br /><span class="nhsuk-body-s">' + patient.nhsNumber + '</span>' },
        { html: patient.address.postcode },
        { html: _getCertificateTypeTextOrTag( patient.certificateType, true )},
        { html: statusTag },
        { html: patient.certificateReference },
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
  // GET PATIENT DATA FUNCTION
  //
  env.addFilter('getPatientData', function (content) {

    // Generate new patient data from 'data-patients.html'
    return '[{"firstName":"Olivia","lastName":"Smith","nhsNumber":"754 316 014","certificateType":"hrtppc","certificateReference":"HRT 52LC QQ2R","startDate":"10 December 2024","endDate":"10 September 2026","status":"active","address":{"buildingNumber":"12","streetName":"Maple Grove","locality":"Ashford Hill","postTown":"Reading","county":"Berkshire","postcode":"RG4 8ZT"}},{"firstName":"Amelia","lastName":"Jones","nhsNumber":"470 926 832","certificateType":"matex","certificateReference":"60 720 733 306","startDate":"26 January 2025","endDate":"26 October 2026","status":"pending","address":{"buildingNumber":"44","streetName":"Bramley Road","locality":"East Mere","postTown":"Norwich","county":"Norfolk","postcode":"NR3 5QN"}},{"firstName":"Isla","lastName":"Taylor","nhsNumber":"986 039 172","certificateType":"hrtppc","certificateReference":"HRT ZK22 5NJQ","startDate":"20 April 2025","endDate":"20 January 2027","status":"active","address":{"buildingNumber":"7","streetName":"Kestrel Close","locality":"Winterfold","postTown":"Guildford","county":"Surrey","postcode":"GU3 9LP"}},{"firstName":"Ava","lastName":"Brown","nhsNumber":"470 337 177","certificateType":"hrtppc","certificateReference":"HRT X2DC Y7PL","startDate":"2 April 2025","endDate":"2 January 2027","status":"active","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"}},{"firstName":"Emily","lastName":"Williams","nhsNumber":"353 962 481","certificateType":"hrtppc","certificateReference":"HRT ZG8J AVFM","startDate":"25 January 2025","endDate":"25 October 2026","status":"active","address":{"buildingNumber":"19","streetName":"Crown Street","locality":"Millbridge","postTown":"Plymouth","county":"Devon","postcode":"PL6 1TD"}},{"firstName":"Sophia","lastName":"Wilson","nhsNumber":"768 673 307","certificateType":"hrtppc","certificateReference":"HRT FBDJ MHDK","startDate":"5 March 2025","endDate":"5 December 2026","status":"active","address":{"buildingNumber":"5","streetName":"Linton Walk","locality":"Southgate Park","postTown":"Crawley","county":"West Sussex","postcode":"RH11 4XW"}},{"firstName":"Mia","lastName":"Davies","nhsNumber":"105 134 972","certificateType":"matex","certificateReference":"50 006 863 743","startDate":"15 December 2024","endDate":"15 September 2026","status":"pending","address":{"buildingNumber":"63","streetName":"Riverstone Court","locality":"Longmead","postTown":"Taunton","county":"Somerset","postcode":"TA2 3UP"}},{"firstName":"Ella","lastName":"Evans","nhsNumber":"685 868 394","certificateType":"hrtppc","certificateReference":"HRT V0J3 MDEB","startDate":"5 March 2025","endDate":"5 December 2026","status":"active","address":{"buildingNumber":"28","streetName":"Birch Avenue","locality":"Northcrest","postTown":"Leicester","county":"Leicestershire","postcode":"LE5 8YU"}},{"firstName":"Grace","lastName":"Thomas","nhsNumber":"327 816 582","certificateType":"hrtppc","certificateReference":"HRT QU2P NRU9","startDate":"12 February 2025","endDate":"12 November 2026","status":"active","address":{"buildingNumber":"90","streetName":"Fernbrook Drive","locality":"Westerleigh","postTown":"Bath","county":"Somerset","postcode":"BA2 9PF"}},{"firstName":"Lily","lastName":"Roberts","nhsNumber":"140 225 075","certificateType":"hrtppc","certificateReference":"HRT GVVL TMZ1","startDate":"19 April 2025","endDate":"19 January 2027","status":"active","address":{"buildingNumber":"14","streetName":"Windsor Rise","locality":"Redford","postTown":"Derby","county":"Derbyshire","postcode":"DE1 4SX"}},{"firstName":"Freya","lastName":"Johnson","nhsNumber":"224 131 437","certificateType":"hrtppc","certificateReference":"HRT RSPJ IE4O","startDate":"11 April 2025","endDate":"11 January 2027","status":"active","address":{"buildingNumber":"51","streetName":"Hawthorne Road","locality":"Claymere","postTown":"Chester","county":"Cheshire","postcode":"CH4 2MB"}},{"firstName":"Charlotte","lastName":"Lewis","nhsNumber":"303 648 306","certificateType":"matex","certificateReference":"35 407 645 544","startDate":"23 January 2025","endDate":"23 October 2026","status":"active","address":{"buildingNumber":"3","streetName":"Mallow Street","locality":"Eastwood Vale","postTown":"Nottingham","county":"Nottinghamshire","postcode":"NG5 3JU"}},{"firstName":"Isabella","lastName":"Walker","nhsNumber":"543 899 793","certificateType":"hrtppc","certificateReference":"HRT T5YJ S66V","startDate":"23 December 2024","endDate":"23 September 2026","status":"active","address":{"buildingNumber":"76","streetName":"Peach Tree Way","locality":"Brookfell","postTown":"York","county":"North Yorkshire","postcode":"YO3 6AP"}},{"firstName":"Daisy","lastName":"Hall","nhsNumber":"450 168 828","certificateType":"matex","certificateReference":"87 871 679 194","startDate":"29 December 2024","endDate":"29 September 2026","status":"active","address":{"buildingNumber":"24","streetName":"Millstream Row","locality":"Havenfield","postTown":"Lincoln","county":"Lincolnshire","postcode":"LN2 8FP"}},{"firstName":"Evie","lastName":"Clarke","nhsNumber":"705 953 307","certificateType":"matex","certificateReference":"91 507 845 878","startDate":"28 March 2025","endDate":"28 December 2026","status":"pending","address":{"buildingNumber":"37","streetName":"Weavers Lane","locality":"Northgate","postTown":"Wolverhampton","county":"West Midlands","postcode":"WV4 3TT"}},{"firstName":"Phoebe","lastName":"Allen","nhsNumber":"950 476 003","certificateType":"hrtppc","certificateReference":"HRT 5GFO PEU2","startDate":"3 January 2025","endDate":"3 October 2026","status":"active","address":{"buildingNumber":"11","streetName":"Rose Mews","locality":"Kingswell","postTown":"Oxford","county":"Oxfordshire","postcode":"OX3 9DQ"}},{"firstName":"Sophie","lastName":"Young","nhsNumber":"797 974 757","certificateType":"matex","certificateReference":"82 527 692 620","startDate":"25 November 2024","endDate":"25 August 2026","status":"active","address":{"buildingNumber":"8","streetName":"Elmbrook Gardens","locality":"Gransfield","postTown":"Peterborough","county":"Cambridgeshire","postcode":"PE2 7QF"}},{"firstName":"Harper","lastName":"King","nhsNumber":"797 714 579","certificateType":"matex","certificateReference":"81 637 544 617","startDate":"29 December 2024","endDate":"29 September 2026","status":"pending","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"}},{"firstName":"Millie","lastName":"Wright","nhsNumber":"567 000 829","certificateType":"matex","certificateReference":"36 790 615 596","startDate":"6 February 2025","endDate":"6 November 2026","status":"active","address":{"buildingNumber":"29","streetName":"Falcon Street","locality":"Ridgebury","postTown":"Worcester","county":"Worcestershire","postcode":"WR1 6JS"}},{"firstName":"Ella-Rose","lastName":"Green","nhsNumber":"863 493 861","certificateType":"hrtppc","certificateReference":"HRT HBG4 B1DO","startDate":"26 March 2025","endDate":"26 December 2026","status":"active","address":{"buildingNumber":"16","streetName":"Harrier Way","locality":"Loxwood Green","postTown":"Horsham","county":"West Sussex","postcode":"RH13 7BN"}},{"firstName":"Poppy","lastName":"Baker","nhsNumber":"000 321 553","certificateType":"hrtppc","certificateReference":"HRT JBGK T7U5","startDate":"2 February 2025","endDate":"2 November 2026","status":"active","address":{"buildingNumber":"33","streetName":"Yew Tree Court","locality":"Silverbrook","postTown":"Shrewsbury","county":"Shropshire","postcode":"SY2 8RR"}},{"firstName":"Ruby","lastName":"Adams","nhsNumber":"444 174 220","certificateType":"hrtppc","certificateReference":"HRT 51LD 8AFI","startDate":"13 April 2025","endDate":"13 January 2027","status":"active","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Chloe","lastName":"Mitchell","nhsNumber":"363 489 283","certificateType":"hrtppc","certificateReference":"HRT K8PD Y2NU","startDate":"10 May 2025","endDate":"10 February 2027","status":"active","address":{"buildingNumber":"22","streetName":"Stonemill Drive","locality":"Hawkinge Vale","postTown":"Canterbury","county":"Kent","postcode":"CT3 6LW"}},{"firstName":"Sienna","lastName":"Turner","nhsNumber":"224 587 117","certificateType":"matex","certificateReference":"34 295 048 134","startDate":"11 May 2025","endDate":"11 February 2027","status":"pending","address":{"buildingNumber":"9","streetName":"Willowbank Way","locality":"East Harling","postTown":"Ipswich","county":"Suffolk","postcode":"IP5 0YN"}},{"firstName":"Willow","lastName":"Carter","nhsNumber":"821 836 293","certificateType":"matex","certificateReference":"70 804 526 937","startDate":"10 March 2025","endDate":"10 December 2026","status":"active","address":{"buildingNumber":"56","streetName":"Sandpiper Crescent","locality":"Cove Hill","postTown":"Southampton","county":"Hampshire","postcode":"SO9 7MC"}},{"firstName":"Jessica","lastName":"Morris","nhsNumber":"159 257 716","certificateType":"matex","certificateReference":"17 191 388 332","startDate":"24 April 2025","endDate":"24 January 2027","status":"pending","address":{"buildingNumber":"15","streetName":"Beacon Lane","locality":"Craybourne","postTown":"Maidstone","county":"Kent","postcode":"ME16 2RS"}},{"firstName":"Matilda","lastName":"Hughes","nhsNumber":"704 489 359","certificateType":"matex","certificateReference":"33 309 979 499","startDate":"7 April 2025","endDate":"7 January 2027","status":"pending","address":{"buildingNumber":"101","streetName":"Elm Walk","locality":"Hillford","postTown":"Harlow","county":"Essex","postcode":"CM19 6JQ"}},{"firstName":"Elsie","lastName":"Ward","nhsNumber":"237 179 260","certificateType":"matex","certificateReference":"28 141 782 535","startDate":"11 January 2025","endDate":"11 October 2026","status":"active","address":{"buildingNumber":"2","streetName":"Clearwater Road","locality":"Riverside","postTown":"Colchester","county":"Essex","postcode":"CO5 3LP"}},{"firstName":"Rosie","lastName":"Price","nhsNumber":"110 689 846","certificateType":"hrtppc","certificateReference":"HRT 5MRL 5BQW","startDate":"24 January 2025","endDate":"24 October 2026","status":"active","address":{"buildingNumber":"48","streetName":"Lavender Street","locality":"Westford","postTown":"Cambridge","county":"Cambridgeshire","postcode":"CB3 9UE"}},{"firstName":"Aria","lastName":"Cooper","nhsNumber":"823 125 279","certificateType":"hrtppc","certificateReference":"HRT ECKO C5RY","startDate":"25 March 2025","endDate":"25 December 2026","status":"active","address":{"buildingNumber":"72","streetName":"Greyfriars Way","locality":"Bellstead","postTown":"Bedford","county":"Bedfordshire","postcode":"MK41 1RF"}},{"firstName":"Layla","lastName":"Bailey","nhsNumber":"203 113 976","certificateType":"matex","certificateReference":"07 697 201 849","startDate":"16 December 2024","endDate":"16 September 2026","status":"active","address":{"buildingNumber":"36","streetName":"Highcliff Road","locality":"Marshgate","postTown":"Grimsby","county":"Lincolnshire","postcode":"DN3 7NS"}},{"firstName":"Luna","lastName":"Parker","nhsNumber":"695 637 115","certificateType":"matex","certificateReference":"81 378 143 818","startDate":"27 April 2025","endDate":"27 January 2027","status":"active","address":{"buildingNumber":"88","streetName":"Fenton Close","locality":"Broadwood","postTown":"Sheffield","county":"South Yorkshire","postcode":"S11 6TB"}},{"firstName":"Hannah","lastName":"Phillips","nhsNumber":"042 603 273","certificateType":"matex","certificateReference":"73 042 474 506","startDate":"28 November 2024","endDate":"28 August 2026","status":"pending","address":{"buildingNumber":"41","streetName":"Tansy Court","locality":"Littlebourne","postTown":"Canterbury","county":"Kent","postcode":"CT4 1JX"}},{"firstName":"Zara","lastName":"Bennett","nhsNumber":"571 941 927","certificateType":"hrtppc","certificateReference":"HRT PF6N 4F7H","startDate":"13 May 2025","endDate":"13 February 2027","status":"active","address":{"buildingNumber":"97","streetName":"Sunnyside Avenue","locality":"Greenleigh","postTown":"Leeds","county":"West Yorkshire","postcode":"LS7 2PQ"}},{"firstName":"Florence","lastName":"Cox","nhsNumber":"695 429 394","certificateType":"hrtppc","certificateReference":"HRT BQRC OO71","startDate":"29 March 2025","endDate":"29 December 2026","status":"active","address":{"buildingNumber":"30","streetName":"Larch Lane","locality":"Warren Hill","postTown":"Hull","county":"East Yorkshire","postcode":"HU6 4ZY"}},{"firstName":"Maya","lastName":"Richardson","nhsNumber":"690 378 711","certificateType":"hrtppc","certificateReference":"HRT TTWR YHSP","startDate":"12 May 2025","endDate":"12 February 2027","status":"active","address":{"buildingNumber":"62","streetName":"Poppyfield Way","locality":"Marston Ridge","postTown":"Oxford","county":"Oxfordshire","postcode":"OX4 7GE"}},{"firstName":"Esme","lastName":"Gray","nhsNumber":"489 906 598","certificateType":"matex","certificateReference":"89 518 190 707","startDate":"31 December 2024","endDate":"1 October 2026","status":"active","address":{"buildingNumber":"21","streetName":"Ivywood Street","locality":"Southmere","postTown":"Cardiff","county":"South Glamorgan","postcode":"CF5 2JD"}},{"firstName":"Ivy","lastName":"Ross","nhsNumber":"752 603 646","certificateType":"matex","certificateReference":"31 278 428 970","startDate":"15 December 2024","endDate":"15 September 2026","status":"pending","address":{"buildingNumber":"14","streetName":"Oakridge Row","locality":"Firrendown","postTown":"Swansea","county":"West Glamorgan","postcode":"SA6 8PP"}},{"firstName":"Arabella","lastName":"Bell","nhsNumber":"586 689 237","certificateType":"matex","certificateReference":"96 392 017 719","startDate":"10 January 2025","endDate":"10 October 2026","status":"active","address":{"buildingNumber":"81","streetName":"Bridgewater Drive","locality":"Lancot Green","postTown":"Luton","county":"Bedfordshire","postcode":"LU4 9WB"}},{"firstName":"Evelyn","lastName":"Cook","nhsNumber":"036 880 606","certificateType":"hrtppc","certificateReference":"HRT 2AAL 6M7W","startDate":"8 March 2025","endDate":"8 December 2026","status":"active","address":{"buildingNumber":"26","streetName":"Primrose Lane","locality":"Wickford Heath","postTown":"Basildon","county":"Essex","postcode":"SS14 3SR"}},{"firstName":"Thea","lastName":"Watson","nhsNumber":"850 433 700","certificateType":"matex","certificateReference":"65 599 210 689","startDate":"14 May 2025","endDate":"14 February 2027","status":"active","address":{"buildingNumber":"59","streetName":"Regent Gardens","locality":"Kingsreach","postTown":"Coventry","county":"West Midlands","postcode":"CV3 1BN"}},{"firstName":"Alice","lastName":"Sanders","nhsNumber":"006 958 636","certificateType":"hrtppc","certificateReference":"HRT X8LD JTCY","startDate":"19 February 2025","endDate":"19 November 2026","status":"active","address":{"buildingNumber":"18","streetName":"Myrtle Row","locality":"Oldacre","postTown":"Warrington","county":"Cheshire","postcode":"WA3 2XT"}},{"firstName":"Emma","lastName":"Harrison","nhsNumber":"964 987 576","certificateType":"matex","certificateReference":"95 736 282 154","startDate":"15 April 2025","endDate":"15 January 2027","status":"pending","address":{"buildingNumber":"6","streetName":"Wisteria Court","locality":"Cresthaven","postTown":"St Albans","county":"Hertfordshire","postcode":"AL4 8FJ"}},{"firstName":"Lottie","lastName":"Coleman","nhsNumber":"957 190 177","certificateType":"hrtppc","certificateReference":"HRT EWSE U35O","startDate":"29 March 2025","endDate":"29 December 2026","status":"active","address":{"buildingNumber":"85","streetName":"Sparrow Lane","locality":"Northwood Vale","postTown":"Watford","county":"Hertfordshire","postcode":"WD24 6PH"}},{"firstName":"Amber","lastName":"Murphy","nhsNumber":"360 406 293","certificateType":"matex","certificateReference":"21 891 354 746","startDate":"3 May 2025","endDate":"3 February 2027","status":"active","address":{"buildingNumber":"11","streetName":"Ashen Close","locality":"Brookhill","postTown":"Slough","county":"Berkshire","postcode":"SL2 9MT"}},{"firstName":"Scarlett","lastName":"Graham","nhsNumber":"961 696 595","certificateType":"matex","certificateReference":"07 372 248 262","startDate":"4 March 2025","endDate":"4 December 2026","status":"pending","address":{"buildingNumber":"53","streetName":"Laurel Drive","locality":"Kingswood Park","postTown":"Bristol","county":"Bristol","postcode":"BS16 4DX"}},{"firstName":"Bonnie","lastName":"Stevens","nhsNumber":"399 872 213","certificateType":"hrtppc","certificateReference":"HRT VWIJ DITD","startDate":"11 March 2025","endDate":"11 December 2026","status":"active","address":{"buildingNumber":"7","streetName":"Thornfield Way","locality":"Greenhollow","postTown":"Gloucester","county":"Gloucestershire","postcode":"GL1 5UP"}},{"firstName":"Imogen","lastName":"Simpson","nhsNumber":"803 183 765","certificateType":"matex","certificateReference":"01 371 459 761","startDate":"22 December 2024","endDate":"22 September 2026","status":"pending","address":{"buildingNumber":"40","streetName":"Cedar Brook","locality":"Ashvale","postTown":"High Wycombe","county":"Buckinghamshire","postcode":"HP12 8PD"}},{"firstName":"Harriet","lastName":"Butler","nhsNumber":"637 989 763","certificateType":"hrtppc","certificateReference":"HRT FT8Z 5T9I","startDate":"8 January 2025","endDate":"8 October 2026","status":"active","address":{"buildingNumber":"98","streetName":"Stag Lane","locality":"Marbleham","postTown":"Brighton","county":"East Sussex","postcode":"BN2 1WE"}},{"firstName":"Eleanor","lastName":"Chapman","nhsNumber":"724 713 873","certificateType":"hrtppc","certificateReference":"HRT J1LN BRQ0","startDate":"26 December 2024","endDate":"26 September 2026","status":"active","address":{"buildingNumber":"27","streetName":"Whistler Road","locality":"East Densford","postTown":"Portsmouth","county":"Hampshire","postcode":"PO4 7JF"}},{"firstName":"Aisha","lastName":"Ali","nhsNumber":"057 533 961","certificateType":"hrtppc","certificateReference":"HRT 6RGM S6K3","startDate":"20 April 2025","endDate":"20 January 2027","status":"active","address":{"buildingNumber":"75","streetName":"Gorse Way","locality":"Heathrow End","postTown":"Hounslow","county":"Greater London","postcode":"TW4 5ZA"}},{"firstName":"Sofia","lastName":"Hussain","nhsNumber":"721 793 169","certificateType":"hrtppc","certificateReference":"HRT 5D1C UJN8","startDate":"11 February 2025","endDate":"11 November 2026","status":"active","address":{"buildingNumber":"3","streetName":"Juniper Walk","locality":"Woodleigh","postTown":"Enfield","county":"Greater London","postcode":"EN3 1TP"}},{"firstName":"Amira","lastName":"Khan","nhsNumber":"146 072 025","certificateType":"matex","certificateReference":"89 608 340 687","startDate":"29 December 2024","endDate":"29 September 2026","status":"pending","address":{"buildingNumber":"58","streetName":"Chapel Row","locality":"Millthorpe","postTown":"Wakefield","county":"West Yorkshire","postcode":"WF3 8KD"}},{"firstName":"Leah","lastName":"Begum","nhsNumber":"809 252 020","certificateType":"hrtppc","certificateReference":"HRT W27H XMCD","startDate":"16 January 2025","endDate":"16 October 2026","status":"active","address":{"buildingNumber":"13","streetName":"Stonewall Lane","locality":"Northbridge","postTown":"Bradford","county":"West Yorkshire","postcode":"BD7 5TE"}},{"firstName":"Niamh","lastName":"O’Connor","nhsNumber":"641 060 289","certificateType":"matex","certificateReference":"55 082 010 130","startDate":"11 March 2025","endDate":"11 December 2026","status":"active","address":{"buildingNumber":"60","streetName":"Queensbury Court","locality":"Palmstead","postTown":"Blackpool","county":"Lancashire","postcode":"FY2 9AH"}},{"firstName":"Aoife","lastName":"Kelly","nhsNumber":"451 568 921","certificateType":"matex","certificateReference":"49 189 788 248","startDate":"20 April 2025","endDate":"20 January 2027","status":"pending","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"}},{"firstName":"Erin","lastName":"McCarthy","nhsNumber":"111 928 710","certificateType":"matex","certificateReference":"45 201 223 626","startDate":"24 November 2024","endDate":"24 August 2026","status":"active","address":{"buildingNumber":"92","streetName":"Meadowbank Road","locality":"Harefield Park","postTown":"Liverpool","county":"Merseyside","postcode":"L8 6FP"}},{"firstName":"Orla","lastName":"Doyle","nhsNumber":"430 147 026","certificateType":"hrtppc","certificateReference":"HRT K7VX G28O","startDate":"4 March 2025","endDate":"4 December 2026","status":"active","address":{"buildingNumber":"39","streetName":"Arbour Road","locality":"Phoenix Rise","postTown":"Manchester","county":"Greater Manchester","postcode":"M14 2YQ"}},{"firstName":"Cerys","lastName":"Griffiths","nhsNumber":"863 312 654","certificateType":"matex","certificateReference":"80 494 384 164","startDate":"11 May 2025","endDate":"11 February 2027","status":"active","address":{"buildingNumber":"4","streetName":"Cherrytree Court","locality":"Stonemoor","postTown":"Stockport","county":"Greater Manchester","postcode":"SK4 3EW"}},{"firstName":"Megan","lastName":"Rees","nhsNumber":"279 578 581","certificateType":"matex","certificateReference":"22 327 827 014","startDate":"1 May 2025","endDate":"1 February 2027","status":"active","address":{"buildingNumber":"66","streetName":"Fieldhouse Lane","locality":"Greywood","postTown":"Bolton","county":"Greater Manchester","postcode":"BL3 9HB"}},{"firstName":"Ffion","lastName":"Evans","nhsNumber":"527 059 925","certificateType":"hrtppc","certificateReference":"HRT CSLB WGDS","startDate":"27 January 2025","endDate":"27 October 2026","status":"active","address":{"buildingNumber":"20","streetName":"Honeysuckle Way","locality":"Oakwood Hill","postTown":"Preston","county":"Lancashire","postcode":"PR3 8LN"}},{"firstName":"Eilidh","lastName":"MacDonald","nhsNumber":"807 368 156","certificateType":"matex","certificateReference":"29 938 494 734","startDate":"18 February 2025","endDate":"18 November 2026","status":"active","address":{"buildingNumber":"95","streetName":"Old Forge Street","locality":"Daleham","postTown":"Carlisle","county":"Cumbria","postcode":"CA2 5NJ"}},{"firstName":"Skye","lastName":"Fraser","nhsNumber":"464 464 403","certificateType":"matex","certificateReference":"23 546 671 540","startDate":"27 April 2025","endDate":"27 January 2027","status":"pending","address":{"buildingNumber":"43","streetName":"Nightingale Row","locality":"Brambleton","postTown":"Durham","county":"County Durham","postcode":"DH1 3GP"}},{"firstName":"Maisie","lastName":"Armstrong","nhsNumber":"336 280 581","certificateType":"hrtppc","certificateReference":"HRT 8XOI TOWT","startDate":"18 December 2024","endDate":"18 September 2026","status":"active","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"}},{"firstName":"Penelope","lastName":"Hunter","nhsNumber":"939 496 175","certificateType":"hrtppc","certificateReference":"HRT AEGS 83U6","startDate":"29 November 2024","endDate":"29 August 2026","status":"active","address":{"buildingNumber":"86","streetName":"Copse Lane","locality":"Hillmead","postTown":"Newcastle","county":"Tyne and Wear","postcode":"NE5 2PA"}},{"firstName":"Clara","lastName":"Lawrence","nhsNumber":"929 655 111","certificateType":"hrtppc","certificateReference":"HRT 4WMY 3S29","startDate":"22 March 2025","endDate":"22 December 2026","status":"active","address":{"buildingNumber":"31","streetName":"Wildflower Road","locality":"Whitestone","postTown":"Darlington","county":"County Durham","postcode":"DL2 6MX"}},{"firstName":"Beatrice","lastName":"Spencer","nhsNumber":"537 002 227","certificateType":"matex","certificateReference":"29 393 598 650","startDate":"31 December 2024","endDate":"1 October 2026","status":"active","address":{"buildingNumber":"47","streetName":"Cloverbank Court","locality":"Iverston","postTown":"Middlesbrough","county":"North Yorkshire","postcode":"TS4 1WW"}},{"firstName":"Nancy","lastName":"Rogers","nhsNumber":"766 746 994","certificateType":"matex","certificateReference":"37 728 071 057","startDate":"2 May 2025","endDate":"2 February 2027","status":"pending","address":{"buildingNumber":"6","streetName":"Brookview Way","locality":"Langwood","postTown":"Harrogate","county":"North Yorkshire","postcode":"HG3 9QL"}},{"firstName":"Annabelle","lastName":"Watts","nhsNumber":"565 864 621","certificateType":"matex","certificateReference":"96 144 080 993","startDate":"11 May 2025","endDate":"11 February 2027","status":"pending","address":{"buildingNumber":"52","streetName":"Warren Terrace","locality":"Elmwick","postTown":"Scarborough","county":"North Yorkshire","postcode":"YO14 2JG"}},{"firstName":"Heidi","lastName":"Henderson","nhsNumber":"298 464 727","certificateType":"hrtppc","certificateReference":"HRT JFNQ 8889","startDate":"19 December 2024","endDate":"19 September 2026","status":"active","address":{"buildingNumber":"1","streetName":"Foxglove Lane","locality":"Brindlehurst","postTown":"Lancaster","county":"Lancashire","postcode":"LA3 7UH"}},{"firstName":"Rose","lastName":"Palmer","nhsNumber":"149 598 987","certificateType":"hrtppc","certificateReference":"HRT M5O4 P33K","startDate":"16 May 2025","endDate":"16 February 2027","status":"active","address":{"buildingNumber":"101","streetName":"Elm Walk","locality":"Hillford","postTown":"Harlow","county":"Essex","postcode":"CM19 6JQ"}},{"firstName":"Lara","lastName":"Nicholson","nhsNumber":"948 815 075","certificateType":"matex","certificateReference":"33 976 241 888","startDate":"20 December 2024","endDate":"20 September 2026","status":"pending","address":{"buildingNumber":"65","streetName":"Pine Hollow","locality":"Northbrook","postTown":"Cheltenham","county":"Gloucestershire","postcode":"GL3 4HT"}},{"firstName":"Julia","lastName":"Gardner","nhsNumber":"944 084 883","certificateType":"matex","certificateReference":"43 559 858 227","startDate":"5 May 2025","endDate":"5 February 2027","status":"pending","address":{"buildingNumber":"75","streetName":"Gorse Way","locality":"Heathrow End","postTown":"Hounslow","county":"Greater London","postcode":"TW4 5ZA"}},{"firstName":"Ada","lastName":"Newton","nhsNumber":"243 558 583","certificateType":"hrtppc","certificateReference":"HRT UAN9 KJJY","startDate":"19 March 2025","endDate":"19 December 2026","status":"active","address":{"buildingNumber":"2","streetName":"Clearwater Road","locality":"Riverside","postTown":"Colchester","county":"Essex","postcode":"CO5 3LP"}},{"firstName":"Summer","lastName":"Reed","nhsNumber":"483 253 622","certificateType":"hrtppc","certificateReference":"HRT URM4 33TO","startDate":"22 January 2025","endDate":"22 October 2026","status":"active","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Victoria","lastName":"Harvey","nhsNumber":"300 425 388","certificateType":"matex","certificateReference":"44 983 869 360","startDate":"30 March 2025","endDate":"30 December 2026","status":"active","address":{"buildingNumber":"17","streetName":"Buttercup Close","locality":"Little Havers","postTown":"Stevenage","county":"Hertfordshire","postcode":"SG2 0YG"}},{"firstName":"Maria","lastName":"Fernandez","nhsNumber":"281 026 013","certificateType":"matex","certificateReference":"11 562 789 126","startDate":"27 November 2024","endDate":"27 August 2026","status":"pending","address":{"buildingNumber":"72","streetName":"Greyfriars Way","locality":"Bellstead","postTown":"Bedford","county":"Bedfordshire","postcode":"MK41 1RF"}},{"firstName":"Elena","lastName":"Silva","nhsNumber":"193 363 623","certificateType":"matex","certificateReference":"50 832 634 340","startDate":"11 December 2024","endDate":"11 September 2026","status":"pending","address":{"buildingNumber":"51","streetName":"Hawthorne Road","locality":"Claymere","postTown":"Chester","county":"Cheshire","postcode":"CH4 2MB"}},{"firstName":"Leila","lastName":"Patel","nhsNumber":"647 740 861","certificateType":"hrtppc","certificateReference":"HRT 2U7S ZUPD","startDate":"7 February 2025","endDate":"7 November 2026","status":"active","address":{"buildingNumber":"7","streetName":"Kestrel Close","locality":"Winterfold","postTown":"Guildford","county":"Surrey","postcode":"GU3 9LP"}},{"firstName":"Fatima","lastName":"Iqbal","nhsNumber":"230 944 048","certificateType":"matex","certificateReference":"94 330 269 394","startDate":"23 February 2025","endDate":"23 November 2026","status":"active","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Jasmine","lastName":"Ahmed","nhsNumber":"095 472 647","certificateType":"hrtppc","certificateReference":"HRT N354 JIJR","startDate":"24 March 2025","endDate":"24 December 2026","status":"active","address":{"buildingNumber":"28","streetName":"Birch Avenue","locality":"Northcrest","postTown":"Leicester","county":"Leicestershire","postcode":"LE5 8YU"}},{"firstName":"Nadia","lastName":"Rashid","nhsNumber":"149 256 208","certificateType":"hrtppc","certificateReference":"HRT 7PC8 5A7P","startDate":"24 November 2024","endDate":"24 August 2026","status":"active","address":{"buildingNumber":"48","streetName":"Lavender Street","locality":"Westford","postTown":"Cambridge","county":"Cambridgeshire","postcode":"CB3 9UE"}},{"firstName":"Tara","lastName":"Paterson","nhsNumber":"931 992 010","certificateType":"matex","certificateReference":"05 623 474 383","startDate":"1 May 2025","endDate":"1 February 2027","status":"active","address":{"buildingNumber":"19","streetName":"Crown Street","locality":"Millbridge","postTown":"Plymouth","county":"Devon","postcode":"PL6 1TD"}},{"firstName":"Bethany","lastName":"Foster","nhsNumber":"316 760 523","certificateType":"matex","certificateReference":"84 454 691 799","startDate":"1 February 2025","endDate":"1 November 2026","status":"pending","address":{"buildingNumber":"39","streetName":"Arbour Road","locality":"Phoenix Rise","postTown":"Manchester","county":"Greater Manchester","postcode":"M14 2YQ"}},{"firstName":"Lauren","lastName":"Fox","nhsNumber":"706 273 304","certificateType":"hrtppc","certificateReference":"HRT KYEE N3RK","startDate":"26 March 2025","endDate":"26 December 2026","status":"active","address":{"buildingNumber":"52","streetName":"Warren Terrace","locality":"Elmwick","postTown":"Scarborough","county":"North Yorkshire","postcode":"YO14 2JG"}},{"firstName":"Georgia","lastName":"Grant","nhsNumber":"136 949 461","certificateType":"hrtppc","certificateReference":"HRT Y52Z 8T6P","startDate":"25 April 2025","endDate":"25 January 2027","status":"active","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"}},{"firstName":"Abigail","lastName":"Murray","nhsNumber":"582 695 435","certificateType":"matex","certificateReference":"37 054 273 986","startDate":"29 January 2025","endDate":"29 October 2026","status":"pending","address":{"buildingNumber":"82","streetName":"Oakfield Lane","locality":"Hilltop View","postTown":"Exeter","county":"Devon","postcode":"EX2 7SJ"}},{"firstName":"Ella-May","lastName":"West","nhsNumber":"225 954 412","certificateType":"hrtppc","certificateReference":"HRT HKH3 UR37","startDate":"18 March 2025","endDate":"18 December 2026","status":"active","address":{"buildingNumber":"6","streetName":"Wisteria Court","locality":"Cresthaven","postTown":"St Albans","county":"Hertfordshire","postcode":"AL4 8FJ"}},{"firstName":"Robyn","lastName":"Matthews","nhsNumber":"242 772 713","certificateType":"matex","certificateReference":"48 849 248 060","startDate":"13 December 2024","endDate":"13 September 2026","status":"active","address":{"buildingNumber":"101","streetName":"Elm Walk","locality":"Hillford","postTown":"Harlow","county":"Essex","postcode":"CM19 6JQ"}},{"firstName":"Kayla","lastName":"Holmes","nhsNumber":"049 574 728","certificateType":"hrtppc","certificateReference":"HRT YB8Q 7DPB","startDate":"6 January 2025","endDate":"6 October 2026","status":"active","address":{"buildingNumber":"98","streetName":"Stag Lane","locality":"Marbleham","postTown":"Brighton","county":"East Sussex","postcode":"BN2 1WE"}},{"firstName":"Lydia","lastName":"Walsh","nhsNumber":"589 137 305","certificateType":"matex","certificateReference":"81 617 323 627","startDate":"6 March 2025","endDate":"6 December 2026","status":"pending","address":{"buildingNumber":"72","streetName":"Greyfriars Way","locality":"Bellstead","postTown":"Bedford","county":"Bedfordshire","postcode":"MK41 1RF"}},{"firstName":"Alexandra","lastName":"Page","nhsNumber":"213 738 977","certificateType":"matex","certificateReference":"73 138 878 534","startDate":"10 April 2025","endDate":"10 January 2027","status":"pending","address":{"buildingNumber":"4","streetName":"Osprey Road","locality":"Heathwick","postTown":"Birmingham","county":"West Midlands","postcode":"B15 8RT"}},{"firstName":"Natalie","lastName":"Jordan","nhsNumber":"243 584 290","certificateType":"hrtppc","certificateReference":"HRT EXU4 AR28","startDate":"24 December 2024","endDate":"24 September 2026","status":"active","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"}},{"firstName":"Beth","lastName":"Barrett","nhsNumber":"587 622 420","certificateType":"hrtppc","certificateReference":"HRT EMNW 6PFP","startDate":"4 January 2025","endDate":"4 October 2026","status":"active","address":{"buildingNumber":"5","streetName":"Linton Walk","locality":"Southgate Park","postTown":"Crawley","county":"West Sussex","postcode":"RH11 4XW"}},{"firstName":"Mollie","lastName":"Hayes","nhsNumber":"433 866 171","certificateType":"hrtppc","certificateReference":"HRT XIOG DINT","startDate":"12 March 2025","endDate":"12 December 2026","status":"active","address":{"buildingNumber":"5","streetName":"Linton Walk","locality":"Southgate Park","postTown":"Crawley","county":"West Sussex","postcode":"RH11 4XW"}},{"firstName":"Francesca","lastName":"Cunningham","nhsNumber":"646 752 267","certificateType":"matex","certificateReference":"64 603 381 193","startDate":"19 November 2024","endDate":"19 August 2026","status":"active","address":{"buildingNumber":"20","streetName":"Honeysuckle Way","locality":"Oakwood Hill","postTown":"Preston","county":"Lancashire","postcode":"PR3 8LN"}},{"firstName":"Amelie","lastName":"Barber","nhsNumber":"559 239 763","certificateType":"matex","certificateReference":"84 919 218 601","startDate":"3 April 2025","endDate":"3 January 2027","status":"active","address":{"buildingNumber":"66","streetName":"Fieldhouse Lane","locality":"Greywood","postTown":"Bolton","county":"Greater Manchester","postcode":"BL3 9HB"}},{"firstName":"Lucia","lastName":"Knight","nhsNumber":"797 003 928","certificateType":"matex","certificateReference":"26 860 558 634","startDate":"30 January 2025","endDate":"30 October 2026","status":"active","address":{"buildingNumber":"66","streetName":"Fieldhouse Lane","locality":"Greywood","postTown":"Bolton","county":"Greater Manchester","postcode":"BL3 9HB"}},{"firstName":"Eden","lastName":"Parsons","nhsNumber":"444 076 775","certificateType":"hrtppc","certificateReference":"HRT PDO0 BN2L","startDate":"12 December 2024","endDate":"12 September 2026","status":"active","address":{"buildingNumber":"9","streetName":"Willowbank Way","locality":"East Harling","postTown":"Ipswich","county":"Suffolk","postcode":"IP5 0YN"}},{"firstName":"Tilly","lastName":"Bates","nhsNumber":"859 052 398","certificateType":"matex","certificateReference":"61 767 811 358","startDate":"25 March 2025","endDate":"25 December 2026","status":"active","address":{"buildingNumber":"43","streetName":"Nightingale Row","locality":"Brambleton","postTown":"Durham","county":"County Durham","postcode":"DH1 3GP"}},{"firstName":"Holly","lastName":"Day","nhsNumber":"208 130 853","certificateType":"hrtppc","certificateReference":"HRT GWZ2 ZTWG","startDate":"18 November 2024","endDate":"18 August 2026","status":"active","address":{"buildingNumber":"63","streetName":"Riverstone Court","locality":"Longmead","postTown":"Taunton","county":"Somerset","postcode":"TA2 3UP"}},{"firstName":"Indie","lastName":"Francis","nhsNumber":"173 329 790","certificateType":"matex","certificateReference":"26 362 063 515","startDate":"10 February 2025","endDate":"10 November 2026","status":"active","address":{"buildingNumber":"30","streetName":"Larch Lane","locality":"Warren Hill","postTown":"Hull","county":"East Yorkshire","postcode":"HU6 4ZY"}},{"firstName":"Hope","lastName":"Burton","nhsNumber":"484 692 536","certificateType":"hrtppc","certificateReference":"HRT L7H6 8O1Z","startDate":"4 May 2025","endDate":"4 February 2027","status":"active","address":{"buildingNumber":"10","streetName":"Redwood Close","locality":"Southholm","postTown":"Sunderland","county":"Tyne and Wear","postcode":"SR3 1FQ"}}]';

  });

  return true;
}

/**
 * @import { Environment } from 'nunjucks'
 */
