var express = require('express');
var router = express.Router();
var Jimp = require('jimp');
const { TesseractWorker } = require('tesseract.js');
const path = require('path');

const worker = new TesseractWorker({
    langPath: path.join(__dirname, '..', 'lang-data'),
});

router.post('/', async function (req, res, next) {
    var base64 = req.body.image.split(',')[1];
    var endBase64 = "";
    var resultOCR = {
        "oriResult": "",
        "endResult": ""
    }
    
    //Image processing
    await Jimp.read(Buffer.from(base64, 'base64'))
        .then(image => {
            image.quality(100)
                .grayscale();
            image.mask('?', 20, 2, (err, data) => {
                    if (err) throw console.log(err);
                });
            image.brightness(0.3)
                .contrast(0.9)
                .write('img.png');
            image.getBase64("image/png", (err, data) => {
                if (err) throw console.log(err);
                endBase64 = data;
            });
        })
        .catch(err => {
            console.log(err);
        });

    //OCR
    worker.recognize(endBase64, 'vie')
        .progress(message => console.log(message))
        .catch(err => console.error(err))
        .then(result => {
            resultOCR.oriResult = result.text;
            var tmp = result.text.replace(/[^A-Za-z0-9Đ ]/g, '').trim();
            if (tmp.length < 3){
                resultOCR.endResult = '';
            } else if (tmp[2] !== ' ') {
                resultOCR.endResult = tmp.slice(0, 2) + " " + tmp.slice(2, tmp.length);
                console.log(resultOCR);
            } else {
                resultOCR.endResult = tmp;
                console.log(resultOCR);
            }
            res.send(resultOCR);
        })
        .finally();    
});

module.exports = router;
