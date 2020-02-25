// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic} from '@polkadot/api/promise/types';

import React, { useState } from 'react';
import styled from 'styled-components';
import { InputAddress, InputNumber, Input,  Modal, TxButton } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import {SubmittableResult} from '@polkadot/api';
import { useTranslation } from '../translate';
import {MakerMessage} from '../Orderbook';
import {decimal_convert, ether_token_id, dai_token_id} from '../ethereum_calls';
import BN from 'bn.js';

interface Props {
  className?: string;
  onClose: () => void;
  onSuccess?: (data: SubmittableResult) => void;
  maker: MakerMessage;
  recipientId?: string;
  senderId?: string;
}

function TakerModal({ className, maker, onClose, onSuccess, recipientId: propRecipientId, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();

  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic>(api.tx.exchange.vaultRegistration("0x000000000000000000000000000000000000000000000001"));

  const [hasAvailable] = useState(true);
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  const [sig_r, setSigR] = useState<string>("0x00");
  const [sig_s, setSigS] = useState<string>("0x00");
  const [vault_a, setVaultA] = useState<BN>(new BN(0));
  const [vault_b, setVaultB] = useState<BN>(new BN(0));

  let converted_maker;

  // This means that the maker is buying eth so the vault a will be dai and vault b will be ether
  // The amount is ether denominated and price is dai per ether.
  if (maker.is_buy) {
    // These functions take the unit prices and turn them into the absolute prices
    let converted_ether_amount = decimal_convert(ether_token_id, new BN(maker.amount));
    let converted_dai_amount = decimal_convert(dai_token_id, new BN(maker.amount*maker.price));

    converted_maker = {
        vault_a: maker.vault_a,
        vault_b: maker.vault_b,
        amount_a: converted_ether_amount.toHexString(),
        amount_b: converted_dai_amount.toHexString(),
        token_a: ether_token_id,
        token_b: dai_token_id,
        trade_id: 0,
        signature: {
            r: maker.sig.r,
            s: maker.sig.s,
        }
    }
  } else {
    let converted_dai_amount = decimal_convert(ether_token_id, new BN(maker.amount));
    let converted_ether_amount = decimal_convert(dai_token_id, new BN(maker.amount*maker.price));
    
    converted_maker = {
        vault_a: maker.vault_a,
        vault_b: maker.vault_b,
        amount_a: converted_dai_amount.toHexString(),
        amount_b: converted_ether_amount.toHexString(),
        token_a: dai_token_id,
        token_b: ether_token_id,
        trade_id: 0,
        signature: {
            r: maker.sig.r,
            s: maker.sig.s,
        }
    }
  }
  console.log(converted_maker)

  let taker_message = {
    maker_message: converted_maker,
    vault_a: vault_a.toNumber(),
    vault_b: vault_b.toNumber(),
  }
  let taker_signature = {
      r: sig_r,
      s: sig_s,
  }

  const update_extrinsic: () => void = () => {
      setExtrinsic(api.tx.exchange.executeOrder(taker_message, taker_signature))
  }

  const update_vault_a: (vault_a: BN | undefined) => void = (vault_a: BN  | undefined) => {
      if (vault_a != undefined) {
        setVaultA(vault_a);
        taker_message.vault_a = vault_a.toNumber();
        update_extrinsic();
      }
  }

  const update_vault_b: (vault_b: BN | undefined) => void = (vault_b: BN  | undefined) => {
    if (vault_b != undefined) {
      setVaultB(vault_b)
      taker_message.vault_b = vault_b.toNumber();
      update_extrinsic();
    }
   }

    const update_sig_r: (sig_r: string | undefined) => void = (sig_r: string  | undefined) => {
        if (sig_r != undefined) {
        setSigR(sig_r);
        taker_signature.r = sig_r;
        update_extrinsic();
        }
    }

    const update_sig_s: (sig_s: string | undefined) => void = (sig_s: string  | undefined) => {
        if (sig_s != undefined) {
            setSigS(sig_s);
            taker_signature.s = sig_s;
            update_extrinsic();
        }
    }

  let token_a_label;
  let token_b_label;
  if (maker.is_buy) {
      token_a_label = "Pick the vault to receive dai in";
      token_b_label = "Pick the vault to spend ether from";
  } else {
    token_a_label = "Pick the vault to receive ether in";
    token_b_label = "Pick the vault to pay dai from";
  }

  return (
    <Modal
      className='app--Vaults-Modal'
      header={t('Get New Vault')}
    >
      <Modal.Content>
        <div className={className}>
          <InputAddress
            defaultValue={propSenderId}
            help={t('The substrate account you will make the trade with.')}
            isDisabled={!!propSenderId}
            label={t('send from account')}
            onChange={setSenderId}
            type='account'
          />
          
        </div>
        <InputNumber
            bitLength={32}
            isDecimal={false}
            isZeroable={true}
            label={token_a_label}
            onChange={update_vault_a}
        />
        <InputNumber
            bitLength={32}
            isDecimal={false}
            isZeroable={true}
            label={token_b_label}
            onChange={update_vault_b}
        />
        <Input
            label={"Enter the hex encoded vault signature r"}
            type={'text'}
            defaultValue="0x"
            onChange={update_sig_r}
        />
        <Input
            label={"Enter the hex encoded vault signature s"}
            type={'text'}
            defaultValue="0x"
            onChange={update_sig_s}
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={senderId}
          extrinsic={extrinsic}
          icon='send'
          isDisabled={!hasAvailable}
          isPrimary
          label={t('Take order')}
          onStart={onClose}
          onSuccess={onSuccess}
          withSpinner={true}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(TakerModal)`
  article.padded {
    box-shadow: none;
    margin-left: 2rem;
  }

  .balance {
    margin-bottom: 0.5rem;
    text-align: right;
    padding-right: 1rem;

    .label {
      opacity: 0.7;
    }
  }

  label.with-help {
    flex-basis: 10rem;
  }
`;
