const fs = require('fs');
const assert = require('assert');
const path = require('path');
const ethereumAddress = require('ethereum-address');

(() => {
  const folder = fs.readdirSync(path.resolve('chains'));

  for (const f of folder) {
    const chainFolder = fs
      .readdirSync(path.join('chains', f), { withFileTypes: true })
      .filter((val) => val.isDirectory())
      .map((val) => val.name);

    for (const asset of chainFolder) {
      assert.ok(ethereumAddress.isAddress(asset), 'invalid address');
      const files = fs
        .readdirSync(path.join('chains', f, asset), { withFileTypes: true })
        .filter((val) => val.isFile())
        .map((val) => val.name);
      assert.ok(files.length === 2, 'require 2 files but found: ' + files.length);
      assert.ok(
        files.includes('info.json') && files.includes('logo.svg'),
        'expect folder to contain info.json & logo.svg files'
      );

      const infoFileContent = JSON.parse(fs.readFileSync(path.join('chains', f, asset, 'info.json')).toString());
      assert.ok(
        'name' in infoFileContent && 'symbol' in infoFileContent && 'decimals' in infoFileContent,
        'expect info.json file to contain required keys: name, symbol, decimals'
      );

      assert.ok(typeof infoFileContent.name === 'string', 'expect name to be a string');
      assert.ok(typeof infoFileContent.symbol === 'string', 'expect symbol to be a string');
      assert.ok(typeof infoFileContent.decimals === 'number', 'expect decimals to be a number');
    }
  }
  console.log('Check done!');
})();
