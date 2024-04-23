const express = require('express');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.post('/convert', async (req, res) => {
  try {
    const { title, content } = req.body;

    const templatePath = path.join(__dirname, 'templates', 'template.ejs');
    const html = await ejs.renderFile(templatePath, { title, content });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    const pdfPath = path.join(__dirname, 'output', `${title || 'document'}.pdf`);
    await fs.writeFile(pdfPath, pdfBuffer, 'utf8');

    res.json({ pdfPath });

    // res.contentType('application/pdf').send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
