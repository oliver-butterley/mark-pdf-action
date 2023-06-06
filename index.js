const core = require('@actions/core');
const github = require('@actions/github');
const pdflib = require('pdf-lib');
const fs = require('fs');

async function run() {
    try {
        const inputFilename = core.getInput('filename');
        const text = core.getInput('text')
        const shaText = `sha: ${github.context.sha}`
        const uint8Array = fs.readFileSync(inputFilename)
        const pdfDoc = await pdflib.PDFDocument.load(uint8Array)
        const courierFont = await pdfDoc.embedFont(pdflib.StandardFonts.Courier)
        console.log(`filename: ${inputFilename}, text: ${text}, sha: ${shaText}`)
        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        const textSize = 12;
        const textWidth = courierFont.widthOfTextAtSize(text, textSize);
        firstPage.drawText(text, {
            x: firstPage.getWidth() / 2 - textWidth / 2,
            y: 32,
            size: textSize,
            font: courierFont,
            color: pdflib.rgb(0.4, 0.4, 0.4),
        })        
        const shaTextWidth = courierFont.widthOfTextAtSize(shaText, textSize);
        firstPage.drawText(shaText, {
            x: firstPage.getWidth() / 2 - shaTextWidth / 2,
            y: 18,
            size: textSize,
            font: courierFont,
            color: pdflib.rgb(0.4, 0.4, 0.4),
        })    
        const pdfBytes = await pdfDoc.save()
        fs.writeFileSync(`marked-${inputFilename}`, pdfBytes)
    } catch (error) {
        core.setFailed(error.message);
    }
}

run()