const
  HDWalletProvider = require('truffle-hdwallet-provider'),
  Web3 = require('web3'),
  { interface, bytecode } = require('./compile'),
  { mnemonic, INFURA_KEY } = require('./config/config'),
  infuraURL = `https://rinkeby.infura.io/${INFURA_KEY}`;

const
  provider = new HDWalletProvider(
    mnemonic,
    infuraURL
  ),
  web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy with the following account:', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [25, 0.001]
    })
    .send({
      from: accounts[0],
      gas: '3000000'
    });
  console.log('Interface', interface);
  console.log('Contract deployed to:', result.options.address);
};

deploy();