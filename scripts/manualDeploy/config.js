const { tokens } = require('./../../test/utils/testHelpers')

module.exports = {
    'usdt': {
        name: 'mToken USDT',
        symbol: 'mUSDT',
        decimals: '8',
        initialExchangeRate: '200000000000000',
        assetAddress: '0xEEbfb6D26558eA337C15b57Ec1d51F3e2056a8CD',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '39222804184156400',
            jumpMultiplierPerYear: '3272914755156920000',
            kink: '800000000000000000',
        },
        mpc: '10000',
        reserveFactor: tokens('0.1'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.1'),
        rewardDistribution: tokens('0'),
    },
    'usdc': {
        name: 'mToken USDC',
        symbol: 'mUSDC',
        decimals: '8',
        initialExchangeRate: '200000000000000',
        assetAddress: '0x3813a8Ba69371e6DF3A89b78bf18fC72Dd5B43c5',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '39222804184156400',
            jumpMultiplierPerYear: '3272914755156920000',
            kink: '800000000000000000',
        },
        mpc: '10000',
        reserveFactor: tokens('0.1'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.85'),
        rewardDistribution: tokens('0'),
    },
    'wbtc': {
        name: 'mToken WBTC',
        symbol: 'mWBTC',
        decimals: '8',
        initialExchangeRate: '20000000000000000',
        assetAddress: '0x19cDab1A0b017dc97f733FC2304Dc7aEC678a5E9',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '262458573636948000',
            jumpMultiplierPerYear: '370843987858870000',
            kink: '800000000000000000',
        },
        mpc: '8500',
        reserveFactor: tokens('0.2'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.75'),
        rewardDistribution: tokens('0'),
    },
    'eth': {
        name: 'mToken WETH',
        symbol: 'mWETH',
        decimals: '8',
        initialExchangeRate: '200000000000000000000000000',
        assetAddress: '0xc778417e063141139fce010982780140aa0cd5ab',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '95322621997923200',
            jumpMultiplierPerYear: '222330528872230000',
            kink: '800000000000000000',
        },
        mpc: '8500',
        reserveFactor: tokens('0.2'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.75'),
        rewardDistribution: tokens('0'),
    },
    'unn': {
        name: 'mToken UNN',
        symbol: 'mUNN',
        decimals: '8',
        initialExchangeRate: '200000000000000000000000000',
        assetAddress: '0xc2b2602344d5Ca808F888954f30fCb2B5E13A08F',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '182367147429835000',
            jumpMultiplierPerYear: '3675373581049680000',
            kink: '800000000000000000',
        },
        mpc: '2500',
        reserveFactor: tokens('0.35'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.35'),
        rewardDistribution: tokens('0'),
    },
    'moar': {
        name: 'mToken MOAR',
        symbol: 'mMOAR',
        decimals: '8',
        initialExchangeRate: '200000000000000000000000000',
        assetAddress: '0x03f2b2B8A3c1F37F1fE304472D4028e395429c52',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '182367147429835000',
            jumpMultiplierPerYear: '3675373581049680000',
            kink: '800000000000000000',
        },
        mpc: '2500',
        reserveFactor: tokens('0.35'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.35'),
        rewardDistribution: tokens('0'),
    },
    'link': {
        name: 'mToken LINK',
        symbol: 'mLINK',
        decimals: '8',
        initialExchangeRate: '200000000000000000000000000',
        assetAddress: '0xdb4b042EB2f978Cf4b84A28C0De6bfFAE50e0FF9',
        jumpRateModel: {
            baseRatePerYear: '0',
            multiplierPerYear: '139788671296901000',
            jumpMultiplierPerYear: '3492099225838310000',
            kink: '800000000000000000',
        },
        mpc: '8500',
        reserveFactor: tokens('0.35'),
        splitReserveFactor: tokens('0'),
        collateralFactor: tokens('0.7'),
        rewardDistribution: tokens('0'),
    }
}