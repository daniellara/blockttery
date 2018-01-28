/*
 * Testing suite for our contract
*/
const assert = require('assert');

const
  Web3 = require('web3'),
  ganache = require('ganache-cli'),
  provider = ganache.provider();
  web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

const
  SIZE = 3,
  PRICE = 1000000000000000;

let
  blockttery,
  accounts;

beforeEach(async() => {
  accounts = await web3.eth.getAccounts();
  blockttery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [SIZE, PRICE]
    })
    .send({ from: accounts[0], gas: '1000000'});
  blockttery.setProvider(provider);
});

describe('Blockttery Contract', () => {
  it('deploys the contract', async () => {
    const price = await blockttery.methods.price().call();
    const size = await blockttery.methods.size().call();

    assert.ok(blockttery.options.address);
    assert.equal(PRICE, price);
    assert.equal(SIZE, size);
  });

  it('use the creator address as manager', async () => {
    const manager = await blockttery.methods.manager().call();
    assert(accounts[0], manager);
  });

  it('modify the size', async () => {
    await blockttery.methods.modifySize(5).send({
      from: accounts[0]
    });
    const size = await blockttery.methods.size().call();

    assert.equal(5, size);
  });

  it('modify the price', async () => {
    await blockttery.methods.modifyPrice(2000000000000000).send({
      from: accounts[0]
    });
    const price = await blockttery.methods.price().call();

    assert.equal(2000000000000000, price);
  });

  it('fails modifying the size if the modifier is not the manager', async () => {
    try {
      await blockttery.methods.modifySize(5).send({
        from: accounts[1]
      });
    } catch (err) {
      return assert(err);
    }
    assert(false);
  });

  it('fails modifying the price if the modifier is not the manager', async () => {
    try {
      await blockttery.methods.modifyPrice(2000000000000000).send({
        from: accounts[1]
      });
    } catch (err) {
      return assert(err);
    }
    assert(false);
  });

  it('allows one account to enter the lottery', async () => {
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });

    const players = await blockttery.methods.getPlayers().call();

    assert.equal(accounts[1], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter the lottery', async () => {
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[3],
      value: web3.utils.toWei('0.001', 'ether')
    });

    const players = await blockttery.methods.getPlayers().call();

    assert.equal(accounts[1], players[0]);
    assert.equal(accounts[2], players[1]);
    assert.equal(accounts[3], players[2]);
    assert.equal(3, players.length);
  });

  it('requires the correct amount of ether', async () => {
    try {
      await blockttery.methods.enter().send({
        from: accounts[1],
        value: web3.utils.toWei('2', 'ether')
      });
      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });
});