// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, {useState } from 'react';
import styled from 'styled-components';
import {Modal, Dropdown, Button} from '@polkadot/react-components';
import {setup_ethereum, id_to_name} from '../ethereum_calls'
// import Checks from '@polkadot/react-signer/Checks';
 
import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  onTxFinal: (receipt: any) => void;
  recipientId?: string;
  senderId?: string;
  withdrawable: string[];
}

function FinalWithdrawModal({ className, onClose, onTxFinal, recipientId: propRecipientId, senderId: propSenderId, withdrawable }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const [token_id, set_token_id] = useState<string>();
  const names = id_to_name(withdrawable);
  const options = [];
  for (let i = 0; i < withdrawable.length; i++) {
    options.push({key: names[i], text: names[i], value: withdrawable[i], })
  }

  const ethereum_call: () => void = () =>{
    let contract = setup_ethereum();
    let tx_recepit = contract.withdraw(token_id);
    tx_recepit.then( (data: any) => {
        data.wait().then((mined_tx: any) => {
            onTxFinal(token_id);
        });
    })
    onClose();
  }

  return (
    <Modal
      className='app--Final-Withdraw-Modal'
      header={t('Deposit into vault')}
    >
      <Modal.Content>
        <Dropdown
            onChange={set_token_id}
            options={options}
            className="Token selector"
            defaultValue={"0x000000000000000000000000000000000000000000000001"}
            withLabel={true}
            label={"Select a token, if none are shown none are withdraw able on ethereum"}
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button
            icon='minus'
            isPrimary
            label={t('Withdraw token')}
            onClick={ethereum_call}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(FinalWithdrawModal)`
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
