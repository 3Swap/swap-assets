const express = require('express');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const router = express.Router();
const app = express();

const port = process.env.PORT || 12000;

router.get('/assets_data', (req, res) => {
  try {
    const chains = fs.readdirSync(path.join(__dirname, 'chains'));

    let chainData = {};

    for (const chain of chains) {
      chainData = _.assign(chainData, { [chain]: {} });
      const assets = _.map(
        fs
          .readdirSync(path.join(__dirname, 'chains', chain), { withFileTypes: true })
          .filter((val) => val.isDirectory()),
        (val) => val.name
      );

      for (const asset of assets) {
        let assetData = JSON.parse(
          fs.readFileSync(path.join(__dirname, 'chains', chain, asset, 'info.json')).toString()
        );
        assetData = { ...assetData, image: `${req.headers.host}/${chain}/${asset}/logo` };
        let chainValues = chainData[chain];
        chainValues = _.assign(chainValues, { [asset]: assetData });
        chainData = _.assign(chainData, { [chain]: { ...chainValues } });
      }
    }
    return res.status(200).json({ ...chainData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/chains_data', (req, res) => {
  try {
    const chains = fs.readdirSync(path.join(__dirname, 'chains'));

    let chainData = {};

    for (const chain of chains) {
      const info = JSON.parse(fs.readFileSync(path.join(__dirname, 'chains', chain, 'info.json')).toString());
      chainData = _.assign(chainData, { [chain]: { ...info } });
    }
    return res.status(200).json({ ...chainData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:chain/:asset/logo', (req, res) => {
  return res.sendFile(path.join(__dirname, 'chains', req.params.chain, req.params.asset, 'logo.svg'));
});

app.use(require('morgan')('dev'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/', router);
app.listen(port, () => console.log(`Server running on ${port}`));
