const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Please provide a URL');
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const networkData = {
    html: '',
    css: [],
    js: [],
    xhr: [],
    images: [],
    docs: []
  };

  page.on('request', request => {
    const type = request.resourceType();
    const requestUrl = request.url();
    
    switch (type) {
      case 'stylesheet':
        networkData.css.push(requestUrl);
        break;
      case 'script':
        networkData.js.push(requestUrl);
        break;
      case 'xhr':
        networkData.xhr.push(requestUrl);
        break;
      case 'image':
        networkData.images.push(requestUrl);
        break;
      case 'document':
        networkData.docs.push(requestUrl);
        break;
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    networkData.html = await page.content();
    await browser.close();

    res.json(networkData);
  } catch (error) {
    await browser.close();
    res.status(500).send('Error while scraping the page');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
