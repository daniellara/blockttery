pragma solidity ^0.4.17;

contract Blockttery {
  address public manager;
  address[] private players;
  uint16 public size;
  uint public price;

  function Blockttery (uint16 _size, uint _price) public {
    manager = msg.sender;
    size = _size;
    price = _price;
  }

  function modifyPrice (uint _price) public admin {
    price = _price;
  }

  function modifySize (uint16 _size) public admin {
    size = _size;
  }

  function enter () public payable {
    players.push(msg.sender);
  }

  function getPlayers () public view returns(address[]) {
    return players;
  }

  modifier admin() {
    require(msg.sender == manager);
    _;
  }
}