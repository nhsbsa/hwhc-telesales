module.exports = {

    debug: 'false',

    role: 'callCentre', // callCentre, backOffice,
    
    NHSPrescriptionCost: '£9.90',
    HRTPPCCost: '£19.80',

    v1: {
        accessKeys: 'on',
        rowsPerPage: 10,
        currentPage: 0,
        certificateTypes: ['matex','hrtppc'],
        sortBy: 'lastName',
        sortDirection: 'descending', // Test
        
    }

}