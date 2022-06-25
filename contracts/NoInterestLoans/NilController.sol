// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MoarStableToken.sol";
import "./Interfaces/NilPoolInterface.sol";

/**
 * @title MOAR's NilToken Contract
 * @notice No Interest Loans Controller Contract
 * @author MOAR
 */
contract NilController is ReentrancyGuard, Ownable {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    MoarStableToken             public  stableMoar;
    address[]                   public  markets;
    mapping(address => Market)  public  marketsData;

    /* ========== DATA STRUCTURES ========= */

    struct Market {
        bool    created;
        bool    enabled;
    }

    /* ========== EVENTS ========== */

    event MarketCreated(address nilToken, bool enabled);
    event MarketUpdated(address nilToken, bool enabled);

    /* ========== CONSTRUCTOR ========== */

    constructor(address _stableMoar) public Ownable() {
        stableMoar = MoarStableToken(_stableMoar);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function mintStableMoar(address to, uint256 amount) external onlyEnabledMarket {
        stableMoar.mint(to, amount);
    }

    function burnStableMoar(address from, uint256 amount) external onlyEnabledMarket {
        stableMoar.burn(from, amount);
    }

    /* ========== VIEWS ========== */


    /* ========== ADMIN CONFIGURATION ========== */

    function addMarket(address _nilToken, bool _enabled) external onlyOwner {
        require(marketsData[_nilToken].created == false, "Market already exists");
        markets.push(_nilToken);
        marketsData[_nilToken] = Market({
                created: true,
                enabled: _enabled
            });
        emit MarketCreated(_nilToken, _enabled);
    }

    function updateMarket(address _nilToken, bool _enabled) external onlyOwner {
        marketsData[_nilToken].enabled = _enabled;
        emit MarketCreated(_nilToken, _enabled);
    }

    /* ========== MODIFIERS ========== */

    modifier onlyEnabledMarket() {
        require(marketsData[_msgSender()].enabled == true, "Caller is not an enabled market");
        _;
    }

}