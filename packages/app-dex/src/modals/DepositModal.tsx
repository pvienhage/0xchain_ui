// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, {useState } from 'react';
import styled from 'styled-components';
import { InputNumber, Input, Modal, Bubble, Button} from '@polkadot/react-components';
import {SubmittableResult} from '@polkadot/api';
import BN from 'bn.js';
import { ethers } from 'ethers';
import {setup_ethereum, decimal_convert} from '../ethereum_calls'
// import Checks from '@polkadot/react-signer/Checks';
 
import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  onSuccess?: (data: SubmittableResult) => void;
  recipientId?: string;
  senderId?: string;
  vault: number;
  balance: number;
  token: string;
}

function DepositModal({ className, onClose, onSuccess, recipientId: propRecipientId, senderId: propSenderId, token, vault, balance }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const [amount, setAmount] = useState<BN>();
  const [sig_r, setSigR] = useState<string>();
  const [sig_s, setSigS] = useState<string>();

  const ethereum_call: () => void = () =>{
    let contract = setup_ethereum();
    let unitezed_amount;
    if (amount != undefined) {
      unitezed_amount = decimal_convert(token, amount);
      contract.deposit(token, vault, unitezed_amount, sig_r, sig_s);
      onClose();
    } 
  }

  return (
    <Modal
      className='app--Deposit-Modal'
      header={t('Deposit into vault')}
    >
      <Modal.Content>
        <Bubble color='teal' icon='address card' label='Vault ID'>
            {vault}
        </Bubble>
        <Bubble color='olive' icon='address card' label='Token'>
            {token}
        </Bubble>
        <InputNumber
            bitLength={256}
            isDecimal={true}
            isZeroable={true}
            label={"Enter the deposit Amount"}
            onChange={setAmount}
        />
        <Input
            label={"Enter the hex encoded vault signature r"}
            type={'text'}
            defaultValue="0x"
            onChange={setSigR}
        />
        <Input
            label={"Enter the hex encoded vault signature s"}
            type={'text'}
            defaultValue="0x"
            onChange={setSigS}
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button
            icon='add'
            isPrimary
            label={t('Add Funds')}
            onClick={ethereum_call}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(DepositModal)`
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
