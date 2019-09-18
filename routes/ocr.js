var express = require('express');
var router = express.Router();
const { TesseractWorker, OEM } = require('tesseract.js'); //Tesseract
const path = require('path');
const sharp = require('sharp'); //Sharp
var Jimp = require('jimp'); //Jimp
var fs = require('fs');
const multer = require('multer');
var gm = require('gm');

//path traindata
const worker = new TesseractWorker({
    langPath: path.join(__dirname, '..', 'lang-data'),
});

var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, 'upload-img')
    },
})

var upload = multer({ storage });

router.post('/', upload.single('file'), async function (req, res, next) {
    var img = await fs.readFileSync(req.file.path);
    var endBase64 = "";
    var resultOCR = {
        "oriResult": "",
        "endResult": ""
    }

    //Image processing
    await Jimp.read(img)
        .then(image => {
            var iHeight = 120;
            var orH = image.getHeight();
            if(image.getHeight() > 120)
                image.resize(Jimp.AUTO, iHeight);

            image
                .color([
                    { apply: 'desaturate', params: [90]}
                ]);
            image.write('img-desaturate.png');

            // if(orH > 100)
            //     for(var x = 0; x < image.getWidth(); x++){
            //         for(var y = 0; y < image.getHeight(); y++){
            //             var pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
            //             if (pixel.r < 69 && pixel.g < 69 && pixel.b < 69){
            //                 image.setPixelColor(Jimp.cssColorToHex('#000'), x, y);
            //             } else if (pixel.r > 69 && pixel.g > 69 && pixel.b > 69){
            //                 image.setPixelColor(Jimp.cssColorToHex('#fff'), x, y)
            //             }
            //         }
            //     }
            // image.write('img-setcolor.png');
            
            image.write('img-end.png');
            image.getBase64("image/png", (err, data) => {
                if (err) throw console.log(err);
                endBase64 = data;
            });
        })
        .catch(err => {
            console.log(err);
        });

    //OCR
    //OEM.OEM_TESSERACT_LSTM_COMBINED
    worker.recognize(endBase64,  'vie', {
            tessedit_ocr_engine_mode: 3,
            tessedit_char_whitelist: 'Đ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ ',
        })
        .progress(message => console.log(message))
        .catch(err => console.error(err))
        .then(result => {
            resultOCR.oriResult = result.text;
            var tmp = result.text.replace(/[^A-Za-z0-9ĐÐ ]/g, '').trim();
            tmp = tmp.replace('Ð', 'Đ');
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
