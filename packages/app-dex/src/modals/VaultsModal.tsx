// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic} from '@polkadot/api/promise/types';

import React, { useState } from 'react';
import styled from 'styled-components';
import { InputAddress, Dropdown,  Modal, TxButton } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import {SubmittableResult} from '@polkadot/api';
import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  onSuccess?: (data: SubmittableResult) => void;
  recipientId?: string;
  senderId?: string;
}

function VaultsModal({ className, onClose, onSuccess, recipientId: propRecipientId, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();

  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic>(api.tx.exchange.vaultRegistration("0x000000000000000000000000000000000000000000000001"));

  const [hasAvailable] = useState(true);

  let set_token: (name: string) => void = (name: string) => {
      setExtrinsic(api.tx.exchange.vaultRegistration(name))
  }

  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  return (
    <Modal
      className='app--Vaults-Modal'
      header={t('Get New Vault')}
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
          
        </div>
        <Dropdown
            className="Token selector"
            defaultValue={"Ether"}
            onChange={set_token}
            options={[
              {key: "Ether", text: "Ether", value: "0x000000000000000000000000000000000000000000000001"},
              {key: "Dai", text: "Dai", value: "0x000000000000000000000000000000000000000000000002"}]}
            withLabel={true}
            label="Chose the token ID"
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={senderId}
          extrinsic={extrinsic}
          icon='send'
          isDisabled={!hasAvailable}
          isPrimary
          label={t('Register Vault')}
          onStart={onClose}
          onSuccess={onSuccess}
          withSpinner={true}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(VaultsModal)`
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
