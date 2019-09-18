var express = require('express');
var router = express.Router();
const path = require('path');
var fs = require('fs');


router.get('/', function (req, res, next) {
    var pdfFiller   = require('pdffiller');
 
    var sourcePDF = "pdf-template.pdf";
    var destinationPDF =  path.join(__dirname, '..', 'test/test_complete.pdf');
    var data = {
        "hoVaTen": "Doan Phan Thanh",
    };
     
    pdfFiller.fillForm( sourcePDF, destinationPDF, data, function(err) {
        if (err) console.log(err);
        console.log("In callback (we're done).");
    });
    
});

module.exports = router;
