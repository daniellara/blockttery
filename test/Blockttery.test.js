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
  SIZE = 4,
  PRICE = 1;

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
    .send({ from: accounts[0], gas: '3000000'});
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
    await blockttery.methods.modifyPrice(2).send({
      from: accounts[0]
    });
    const price = await blockttery.methods.price().call();

    assert.equal(2, price);
  });

  it('fails modifying the size if the sender is not the manager', async () => {
    try {
      await blockttery.methods.modifySize(5).send({
        from: accounts[1]
      });
    } catch (err) {
      return assert(err);
    }
    assert(false);
  });

  it('fails modifying the price if the sender is not the manager', async () => {
    try {
      await blockttery.methods.modifyPrice(2).send({
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

  it('picks a winner when the draw is full', async () => {
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether'),
      gas: '3000000'
    });
    const players = await blockttery.methods.getPlayers().call();
    const winner = await blockttery.methods.winner().call();
    assert.equal(0, players.length);
    assert.equal(accounts[1], winner);
  });

  it('manager accounts gets the fees', async () => {
    const preBalance = await web3.eth.getBalance(accounts[0]);
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether')
    });
    await blockttery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.001', 'ether'),
      gas: '3000000'
    });
    const postBalance = await web3.eth.getBalance(accounts[0]);
    assert(preBalance < postBalance);
  });
});