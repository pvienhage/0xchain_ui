import { ethers } from 'ethers';
import BN from 'bn.js';

const contractAddress = "0x8aB1dFf843fa9FD7b561dE3B5BB6C141a64c758d";
const abi = [
    "function deposit(uint256, uint256, uint256, uint256, uint256) external",
    "function withdraw(uint256) external",
    "event  LogWithdrawal(uint256, uint256, uint256)"

];

// Returns a callable contract which is attached to the metamask provider
export function setup_ethereum(): ethers.Contract {
    const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()

    let contract = new ethers.Contract(contractAddress, abi, signer);

    window.ethereum.enable();
    return contract;
}

export const ether_token_id = "0x000000000000000000000000000000000000000000000001";
export const dai_token_id = "0x000000000000000000000000000000000000000000000002";

export function decimal_convert(token: string, amount: BN): ethers.utils.BigNumber {
    let unitezed_amount;
    // TODO - These values must be set to match quantization in the contracts.
    if (token = ether_token_id) {
        if (amount != undefined) {
            unitezed_amount = ethers.utils.parseEther(amount.toString(10));
        }
    } else {
        if (amount != undefined) {
            // Dai has 8 decimals
            unitezed_amount = ethers.utils.parseUnits(amount.toString(10), 18);
        }
    }
    if (unitezed_amount != undefined) {
        return unitezed_amount;
    } else {
        // Return 0 on failure
        return ethers.utils.parseUnits("0x00");
    }
}

let ids_to_names = new Map<string, string>([[ether_token_id, "Ether"], [dai_token_id, "Dai"]]);

export function id_to_name(ids: string[]): string[] {
    let known: string[] =[];
    ids.map( (value) => {
        let looked_up = ids_to_names.get(value);
        if (looked_up == undefined) {
            known.push("Unknown");
        } else {
            known.push(looked_up);
        }
    });
    return known;
}

export function withdraw_listener(current_x: string, withdrawable: string[], withdrawableUpdater: React.Dispatch<React.SetStateAction<string[]>>): void {
    // TODO - Move this off of ropsten
    let provider = ethers.getDefaultProvider('ropsten');
  
    let contract = new ethers.Contract(contractAddress, abi, provider);

    contract.on("LogWithdrawal", (starkKey, tokenId, amount) => {
        if (current_x == starkKey.toHexString()) {
            // Cut off the first two chars '0x' and then 16 more for 8 bytes of zero

            let shorted_byte_id = ethers.utils.hexZeroPad(tokenId.toHexString(), 24);
            // Note that withdrawable is short/ should be be less than 5 in most cases
            if (withdrawable.indexOf(shorted_byte_id) == -1) {
                console.log("added to withdrawable")
                // We add the new withdrawable token and update the list.
                withdrawable.push(shorted_byte_id);
                withdrawableUpdater(withdrawable);
            }
        }
    })
}