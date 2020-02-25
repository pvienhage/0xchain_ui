// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic} from '@polkadot/api/promise/types';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {InputAddress, InputNumber, Input, Modal, TxButton} from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import BN from 'bn.js';
import { GenericCall, getTypeDef } from '@polkadot/types';
import Params from '@polkadot/react-params';
import { RawParam } from '@polkadot/react-params/types';
import {SubmittableExtrinsicFunction } from '@polkadot/api/types';
import {SubmittableResult} from '@polkadot/api';

import { TypeDef } from '@polkadot/types/types';
// import Checks from '@polkadot/react-signer/Checks';

import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  onSuccess?: (data: SubmittableResult) => void;
  recipientId?: string;
  senderId?: string;
  vault: number,
}

function WithdrawModal ({ className, onClose, onSuccess, vault, recipientId: propRecipientId, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);
  const [amount, setAmount] = useState<BN>();
  const [sig_r, setSigR] = useState<string>();
  const [sig_s, setSigS] = useState<string>();

  const { api } = useApi();
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic>(api.tx.exchange.withdraw(0, 0, {r: "0x01", s: "0x01"}));
  
  // Functions which both update the variable state and the extrinsic to be submitted

  const update_amount_and_extrinsic: (value: BN | undefined) => void = (value: BN | undefined) => {
      setAmount(value);
      setExtrinsic(api.tx.exchange.withdraw(vault, value, {r: sig_r, s: sig_s}));
  };

  const update_sigR_and_extrinsic: (value: string | undefined) => void = (value: string | undefined) => {
    setSigR(value);
    setExtrinsic(api.tx.exchange.withdraw(vault, amount, {r: value, s: sig_s}));
  };

  const update_sigS_and_extrinsic: (value: string | undefined) => void = (value: string | undefined) => {
    setSigS(value);
    setExtrinsic(api.tx.exchange.withdraw(vault, amount, {r: sig_r, s: value}));
  };


  return (
    <Modal
      className='app--Withdraw-Modal'
      header={t('Substrate Withdraw')}
    >
      <Modal.Content>
        <div className={className}>
          <InputAddress
            defaultValue={propSenderId}
            help={t('The substrate account you will register this key with.')}
            isDisabled={!!propSenderId}
            label={t('send from account')}
            onChange={setSenderId}
            type='account'
          />
        <InputNumber
            bitLength={256}
            isDecimal={true}
            isZeroable={true}
            label={"Enter the withdraw amount"}
            onChange={update_amount_and_extrinsic}
        />
        <Input
            label={"Enter the hex encoded vault signature r"}
            type={'text'}
            defaultValue="0x"
            onChange={update_sigR_and_extrinsic}
        />
        <Input
            label={"Enter the hex encoded vault signature s"}
            type={'text'}
            defaultValue="0x"
            onChange={update_sigS_and_extrinsic}
        />
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
            accountId={senderId}
            extrinsic={extrinsic}
            icon='minus'
            isPrimary
            label={t('Withdraw from Substrate')}
            onStart={onClose}
            onSuccess={onSuccess}
            withSpinner={true}
        />
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(WithdrawModal)`
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
