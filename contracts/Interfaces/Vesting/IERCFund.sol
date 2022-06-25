// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

interface IERCFund {
    /**
     * @return feeSharingEnabled indicator enabled or not
     */
    function feeShareEnabled() external view returns (bool);

    //Doesn't support Fee on Transfer tokens, convert those to something else first
    //Transfer token from sender, then transfers it to the fee distributor
    function depositToFeeDistributor(address token, uint256 amount) external;

    /**
     * @notice feeDistributor notifies reward amount
     * @param token address of certain token
     */
    function notifyFeeDistribution(address token) external;

    /**
     * @return fee amount
     */
    function getFee() external view returns (uint256);
    /**
     * @notice owner sends all amount of definite token to his/her own address
     * @param token address of token to be recovered 
     */
    function recover(address token) external;
}