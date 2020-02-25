// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// global app props
import { AppProps as Props } from '@polkadot/react-components/types';

// external imports (including those found in the packages/*
// of this repo)
import React, { useState, useMemo, useEffect } from 'react';
import { Tabs } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { useTranslation } from './translate';
import { SubmittableResult } from '@polkadot/api';
import { AnyJson} from '@polkadot/types/types';
import { Button} from '@polkadot/react-components';
import VaultsModal from './modals/VaultsModal';
import VaultsTable from './VaultsTable';
import DepositModal from './modals/DepositModal';
import WithdrawModal from './modals/WithdrawModal';
import FinalWithdrawModal from './modals/FinalWithdrawModal';
import Orderbook from './Orderbook';
import {MakerMessage} from './Orderbook';
import {withdraw_listener} from './ethereum_calls';
import MakerModal from './modals/MakeOrderModal';
import TakerModal from './modals/TakerModal';

// local imports and components
import AccountSelector from './AccountSelector';

import RegisterKey from './modals/RegisterModal';

type SortedVault = { vault: number; balance: number, token_name: string};
type PublicKey = {x: string, y: string};

export type StateObject = {
  current_key: PublicKey,
  vaults: Map<string, SortedVault[]>,
  orderbook: {
    buyorders: MakerMessage[],
    sellorders: MakerMessage[],
  }
}

export default function DexApp ({ basePath }: Props): React.ReactElement<Props>  {
  const { api } = useApi();
  const [accountId, setAccountId] = useState<string | null>(null);
  const { t } = useTranslation();
  const items = useMemo(() => [{
    isRoot: true,
    name: 'create',
    text: t('0x Chain')
  }], [t]);


  let key_to_vault = new Map();
  let init_vaults =  [{vault: 10, balance: 100, token_name: "DAI"}, {vault: 1555, balance: 10, token_name: "ETH"}];
  key_to_vault.set("0x0194a8e9cddb08ee476d977b93270f127bd1206ffb229569b0b1661c8f82ee4b", init_vaults)

  let init_state: StateObject = {
    current_key: {x: "0x0194a8e9cddb08ee476d977b93270f127bd1206ffb229569b0b1661c8f82ee4b", y: "0x02e589705fe9bb9f84d7f5f2e8b16a2748499b507907635233e0c76254ee7752"},
    vaults: key_to_vault,
    orderbook: {
      sellorders: [{amount: 10, price: 100, sig: {r: "0x0", s: "0x0"}, is_buy: false, vault_a: 0, vault_b: 0}],
      buyorders:  [{amount: 100, price: 10, sig: {r: "0x0", s: "0x0"}, is_buy: true, vault_a: 0, vault_b: 0}],
    }
  };

  const [state, setState] = useState<StateObject>(init_state);
  const [vault, setCurrentVaults] = useState<SortedVault[]>(init_vaults);

  const parse_callback_events: (data: SubmittableResult) => void = (data: SubmittableResult) => {
    data.events.forEach((record: any) => {
      // Extract the phase, event and the event types
      const { event, phase } = record;

      if (event.section =="exchange" && event.method =="VaultRegistered") {
        add_vault(parseInt(event.data[0].toString()), JSON.parse(event.data[1].toString()));
      }
    });
  }

  const set_key: (input: PublicKey) => void = (input: PublicKey) => {
    state.current_key = input;
    if (state.vaults.get(input.x) == undefined) {
      state.vaults.set(input.x, []);
    }
    setState(state);
  };

  const add_vault: (id: number, vault: any) => void = (id: number, vault: any) => {
    let owner_x = vault.owner.x;
    let vault_array = state.vaults.get(owner_x);
    console.log(vault_array)
    let name;
    if (vault.token_id == "0x000000000000000000000000000000000000000000000001") {
      name = "Eth";
    } else {
      name = "Dai";
    }
    if (vault_array == undefined) {
      state.vaults.set(owner_x, [{vault: id, balance: 0, token_name: name}])
    } else {
      vault_array.push({vault: id, balance: 0, token_name: name});
      state.vaults.set(owner_x, vault_array);
    }
    setState(state)
  };

  // This function parses through the state object and updates any vault record seen
  const refresh_vault: (vault_id: number) => void = (vault_id: number) => {
    for (let data of state.vaults.entries()) {
      for (let i =0; i < data[1].length; i ++) {
        if (data[1][i].vault == vault_id) {
          api.query.exchange.vaults(vault_id).then( (state_vault) => {
            // Balance is the third element of the codec
            let json_vault: AnyJson = state_vault?.toJSON();
            if (json_vault != undefined) {
              let balance = json_vault.balance;
                if (balance != undefined) {
                   data[1][i].balance = balance;
                   state.vaults.set(data[0], data[1]);
                   setCurrentVaults(data[1]);
                   setState(state);
                }
            }
          })
        }
      }
    }
  };

  // This listens to events produced by the chain
  api.query.system.events((events) => {

    events.forEach((record) => {
      // event object
      const { event } = record;

      // Checks that this is the exchange events
      if (event.section == 'exchange') {
        // If the event is a deposit or withdraw we then update 
        // the vault state by calling the refresh vault function.
        if (event.method == 'Deposit' || event.method == 'Withdraw') {
          refresh_vault(event.data.toJSON()[2]);
        }
      }
    })
  });


  const [currentVaultId, setCurrentVaultId] = useState<number>(0);
  const [currentVaultBalance, setCurrentVaultBalance] = useState<number>(0);
  const [currentTokenId, setCurrentTokenId] = useState<string>("0x00");

  // This state coordinates which withdraws are available on ethereum.
  const [withdrawable, setWithdrawable] = useState<string[]>([]);
  withdraw_listener(state.current_key.x, withdrawable, setWithdrawable);
  const token_withdrawn = (token_id: string) => {
    let remove_index = withdrawable.indexOf(token_id);
    if (remove_index >= 0) {
      withdrawable.splice(remove_index, 1);
      setWithdrawable(withdrawable);
    }
  };

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVaultsOpen, setIsVaultsOpen] = useState(false);
  const [isDeposit, setIsDeposit] = useState(false);
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [isEtherWithdraw, setIsEtherWithdraw] = useState(false);
  const [isMakerOrder, setIsMakerOrder] = useState(false);
  const [isTakerOrder, setIsTakerOrder] = useState(false);

  const _toggleDeposit = (): void => setIsDeposit(!isDeposit);
  const _toggleWithdraw = (): void => setIsWithdraw(!isWithdraw);
  const _toggleRegister = (): void => setIsRegisterOpen(!isRegisterOpen);  
  const _toggleAddVaults = (): void => setIsVaultsOpen(!isVaultsOpen);
  const _toggleEtherWithdraw = (): void => setIsEtherWithdraw(!isEtherWithdraw);
  const _toggleMakerOrder = (): void => setIsMakerOrder(!isMakerOrder);
  const _toggleTakerOrder = (): void => setIsTakerOrder(!isTakerOrder);

  const callup_deposit_vaults: (vault_num: number, balance: number, token_id: string) => void = (vault_num: number, balance: number, token_id: string) => 
  {
    setCurrentTokenId(token_id);
    setCurrentVaultId(vault_num);
    setCurrentVaultBalance(balance);
    _toggleDeposit();
  };

  const callup_withdraw_vaults: (vault_num: number, balance: number, token_id: string) => void = (vault_num: number, balance: number, token_id: string) => 
  {
    setCurrentTokenId(token_id);
    setCurrentVaultId(vault_num);
    setCurrentVaultBalance(balance);
    _toggleWithdraw();
  };

  const trivial_maker_message = {
    amount: 0,
    price: 0,
    sig: {
      r: "0x00",
      s: "0x00"
    },
    is_buy: false,
    vault_a: 0,
    vault_b: 0,
  };

  const [maker_order_buy, setMakerOrderBuy] = useState(true);
  const [maker_message, setMakerMessage] =  useState<MakerMessage>(trivial_maker_message);
  const taker_trigger: (maker_message: MakerMessage) => void = (maker_message: MakerMessage) => {
    setMakerMessage(maker_message);
    _toggleTakerOrder();
  };
  const maker_trigger: (is_buy: boolean) => void = (is_buy: boolean) =>  {
    _toggleMakerOrder()
    setMakerOrderBuy(is_buy);
  };

  const add_new_order: (
          is_buy: boolean, 
          vault_a :number, 
          vault_b :number, 
          amount: number, 
          price: number, 
          sig_r :string, 
          sig_s: string) => void = 
  (is_buy: boolean, vault_a :number, vault_b :number, amount: number, price: number, sig_r :string, sig_s: string) => {
    let maker_message = {
        vault_a: vault_a,
        vault_b: vault_b,
        amount: amount,
        price: price,
        sig: {r: sig_r, s: sig_s},
        is_buy: is_buy,
    };
    if (is_buy) {
      state.orderbook.buyorders.push(maker_message);
    } else {
      state.orderbook.sellorders.push(maker_message);
    }
    setState(state);
  }

  return (
    // in all apps, the main wrapper is setup to allow the padding
    // and margins inside the application. (Just from a consistent pov)
    <main className={basePath}>
      <header>
        <Tabs
          basePath={basePath}
          items={items}
        />
      </header> 
      {isRegisterOpen && (
        <RegisterKey
          onClose={_toggleRegister}
          onSuccess={set_key}
        />
      )}
      {isVaultsOpen && (
        <VaultsModal
           onClose={_toggleAddVaults}
           onSuccess={parse_callback_events}
        />
      )}
      {isDeposit && (
          <DepositModal
              onClose={_toggleDeposit}
              vault={currentVaultId}
              token={currentTokenId}
              balance={currentVaultBalance}
          />
      )}
      {isWithdraw && (
          <WithdrawModal
              onClose={_toggleWithdraw}
              vault={currentVaultId}
          />
      )}
      {isEtherWithdraw && (
        <FinalWithdrawModal
            onClose={_toggleEtherWithdraw}
            withdrawable={withdrawable}
            onTxFinal={token_withdrawn}
        />
      )}
      {isMakerOrder && (
        <MakerModal
            onClose={_toggleMakerOrder}
            isBuy={maker_order_buy}
            addNewOrder={add_new_order}
        />
      )}
      {isTakerOrder && (
        <TakerModal
            onClose={_toggleTakerOrder}
            maker={maker_message}
        />
      )}
      <AccountSelector onChange={setAccountId} />
      <section className={`Stark Key Registry`}>
        <Button.Group>
          <Button
            icon='add'
            isPrimary
            label={t('Register STARK Key')}
            onClick={_toggleRegister}
          />
          <Button.Or />
          <Button
            icon='sync'
            isPrimary
            label={t('Get Vault')}
            onClick={_toggleAddVaults}
          />
          <Button.Or />
          <Button
            icon='minus'
            isPrimary
            label={t('Withdraw into ethereum')}
            onClick={_toggleEtherWithdraw}
          />
        </Button.Group>
      </section>
      <VaultsTable
        vaults={vault}
        deposit_callup={callup_deposit_vaults}
        withdraw_callup={callup_withdraw_vaults}
      />
      <Orderbook 
        buyOrders={state.orderbook.buyorders}
        sellOrders={state.orderbook.sellorders}
        taker_callup={taker_trigger}
        maker_callup={maker_trigger}
      />
    </main>
  );
}

function do_nothing() {

}

