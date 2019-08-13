var express = require('express');
var router = express.Router();
const { TesseractWorker } = require('tesseract.js'); //Tesseract
const path = require('path');
const sharp = require('sharp'); //Sharp
var Jimp = require('jimp'); //Jimp

//path traindata
const worker = new TesseractWorker({
    langPath: path.join(__dirname, '..', 'lang-data'),
});

router.post('/', async function (req, res, next) {
    var base64 = req.body.image.split(',')[1];
    var img = Buffer.from(base64, 'base64');
    var endBase64 = "";
    var resultOCR = {
        "oriResult": "",
        "endResult": ""
    }

    //Image processing
    var dt = await sharp(img)  
        .grayscale()
        .sharpen(50, 5, 0.5)
        .toBuffer();

    await Jimp.read(dt)
        .then(image => {
            image.gaussian(1);
            image.brightness(0.270);
            image.contrast(0.975).write('img-jimp.png');
            image.getBase64("image/png", (err, data) => {
                if (err) throw console.log(err);
                endBase64 = data;
            });
        })
        .catch(err => {
            console.log(err);
        })

    //OCR
    worker.recognize(endBase64, 'vie')
        .progress(message => console.log(message))
        .catch(err => console.error(err))
        .then(result => {
            resultOCR.oriResult = result.text;
            var tmp = result.text.replace(/[^A-Za-z0-9Đ ]/g, '').trim();
            if (tmp.length < 3){
                resultOCR.endResult = '';
            } else {
                resultOCR.endResult = tmp;
            }
            console.log(resultOCR);
            res.send(resultOCR);
        })
        .finally();    
});

module.exports = router;
