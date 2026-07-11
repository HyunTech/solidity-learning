# @version ^0.3.0
# @license MIT

event Transfer:
    owner: indexed(address)
    to: indexed(address)
    amount: uint256

event Approval:
    spender: indexed(address)
    amount: uint256

owner: address
manager: address

name: public(String[64])
symbol: public(String[32])
decimals: public(uint256)
totalSupply: public(uint256)

balanceOf: public(HashMap[address, uint256])
allowances: public(HashMap[address, HashMap[address, uint256]])

@internal
def onlyOwner(_owner: address):
    assert self.owner == _owner, "You are not authorized"

@internal
def onlyManager(_manager: address):
    assert self.manager == _manager, "You are not authorized to manage this contract"

@external
def __init__(_name: String[64], _symbol: String[32], _decimals: uint256, _amount: uint256):
    initial_supply: uint256 = _amount * 10 ** _decimals

    self.name = _name
    self.symbol = _symbol
    self.decimals = _decimals
    self.owner = msg.sender
    self.manager = msg.sender
    self.balanceOf[msg.sender] += initial_supply
    self.totalSupply += initial_supply

    log Transfer(empty(address), msg.sender, initial_supply)

@external
def transfer(_amount: uint256, _to: address):
    assert self.balanceOf[msg.sender] >= _amount, "Insufficient balance"

    self.balanceOf[msg.sender] -= _amount
    self.balanceOf[_to] += _amount

    log Transfer(msg.sender, _to, _amount)

@external
def approve(_spender: address, _amount: uint256):
    self.allowances[msg.sender][_spender] = _amount

    log Approval(_spender, _amount)

@external
def transferFrom(_owner: address, _to: address, _amount: uint256):
    assert self.allowances[_owner][msg.sender] >= _amount, "Insufficient allowance"
    assert self.balanceOf[_owner] >= _amount, "Insufficient balance"

    self.allowances[_owner][msg.sender] -= _amount
    self.balanceOf[_owner] -= _amount
    self.balanceOf[_to] += _amount

    log Transfer(_owner, _to, _amount)

@external
def mint(_amount: uint256, _to: address):
    self.onlyManager(msg.sender)
    self.balanceOf[_to] += _amount
    self.totalSupply += _amount

    log Transfer(empty(address), _to, _amount)

@external
def setManager(_manager: address):
    self.onlyOwner(msg.sender)
    self.manager = _manager
