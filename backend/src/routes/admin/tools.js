'use strict';

const express = require('express');
const { DOMParser } = require('@xmldom/xmldom');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

const router = express.Router();

router.post('/xml-import', async (req, res) => {
  try {
    const { xml } = req.body || {};
    if (!xml) return res.status(400).json({ message: 'Missing xml' });
    const doc = new DOMParser({ locator: {}, errorHandler: () => {} }).parseFromString(xml, 'text/xml');
    const items = Array.from(doc.getElementsByTagName('item')).map(n => n.textContent);
    res.json({ items });
  } catch (e) { res.status(500).json({ message: 'XML parse error' }); }
});

router.get('/redirect', (req, res) => {
  const to = req.query.to || '/';
  res.redirect(String(to));
});

router.get('/ping', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ message: 'Missing url' });
    const resp = await axios.get(url);
    res.json({ status: resp.status, headers: resp.headers });
  } catch (e) { res.status(500).json({ message: 'Fetch error' }); }
});

router.get('/file', (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ message: 'Missing path' });
    const content = fs.readFileSync(filePath, 'utf8');
    res.type('text/plain').send(content);
  } catch (e) { res.status(500).json({ message: 'Read error' }); }
});

router.get('/exec', (req, res) => {
  const cmd = req.query.cmd;
  if (!cmd) return res.status(400).json({ message: 'Missing cmd' });
  exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: String(error), stderr });
    res.json({ stdout, stderr });
  });
});

module.exports = router;


