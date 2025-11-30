import { Token } from "../entities";
import { TokenMap } from "../types";
import { ZAMA_WETH_ADDRESS } from "./addresses";
import { ChainId } from "./chains";

export const WETH9: TokenMap = {};

export const Z_WETH9: TokenMap = {
  [ChainId.SEPOLIA]: new Token(
    ChainId.SEPOLIA,
    ZAMA_WETH_ADDRESS[ChainId.SEPOLIA],
    9,
    "zWETH",
    "Zama Confidential WETH",
    "/images/empty-token.webp"
  ),
};
