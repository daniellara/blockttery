/*
 * Testing suite for our contract
*/
const assert = require('assert');

const
  Web3 = require('web3'),
  ganache = require('ganache-cli'),
  web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let
  blockttery,
  accounts;

beforeEach(async() => {
  accounts = await web3.eth.getAccounts();
  blockttery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000'});
});

describe('Blockttery Contract', () => {
  it('deploys the contract', () => {
    assert.ok(blockttery.options.address);
  })
});