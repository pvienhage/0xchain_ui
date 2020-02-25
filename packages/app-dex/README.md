# 0xchain Dex

The app is orginzed with a set of modals which popup on button presses and several predefined componets over the state: Address selector [prebuild by polkadot], Vaults table, and Orderbook. These componets access and display the internal state of the the application represented by {current_key: the current user's dex public key, vaults: a mapping of known vaults, orderbook: sell orders and buy orders}. The interactions with substrate, ethereum, and the metamask plugin all happen within the modal objects.
