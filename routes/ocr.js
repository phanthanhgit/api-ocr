var express = require('express');
var router = express.Router();
var Tesseract = require('tesseract.js');
// const worker = TesseractWorker();
// Tesseract.TesseractWorker({
//     // langPath: 'public/lib/tesseract/lang/',
// });
const worker = new Tesseract.TesseractWorker({
});

router.post('/', function(req, res, next) {
    var base64 = req.body.image.split(',')[1];
    var resultOCR = {
        "messages": "OCR result",
        "text": ""
    }
    worker.recognize(Buffer.from(base64, 'base64'), 'vie')
    .progress(message => console.log(message))
    .catch(err => console.error(err))
    .then(result => {
        resultOCR.text = result.text.replace(/[^A-Za-z0-9ÂĐĂÔƠƯ ]/g, '').trim();
        res.send(resultOCR);
    })
    .finally(resultOrError => console.log(resultOrError));
});

module.exports = router;
