/*
 * This script will be use to compile the contract sourcecode and exports in as a JSON object
*/
const
  path = require('path'),
  fs = require('fs');

const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'Blockttery.sol');
const contractSourceCode = fs.readFileSync(contractPath, 'utf-8');

module.exports = solc.compile(contractSourceCode, 1).contracts[':Blockttery'];
