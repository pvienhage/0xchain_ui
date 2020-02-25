// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic} from '@polkadot/api/promise/types';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { InputAddress, InputFile, Input , Modal, TxButton } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { Available } from '@polkadot/react-query';
import { GenericCall, getTypeDef } from '@polkadot/types';
import Params from '@polkadot/react-params';
import { RawParam } from '@polkadot/react-params/types';
import {SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { BareProps } from '@polkadot/react-components/types';
import { TypeDef } from '@polkadot/types/types';
// import Checks from '@polkadot/react-signer/Checks';

import { useTranslation } from '../translate';
type PublicKey = {x: string, y: string};

interface Props {
  className?: string;
  onClose: () => void;
  onSuccess: (key: PublicKey) => void;
  recipientId?: string;
  senderId?: string;
}

function getParams ({ meta }: SubmittableExtrinsicFunction<'promise'>): { name: string; type: TypeDef }[] {
    return GenericCall.filterOrigin(meta).map((arg): { name: string; type: TypeDef } => ({
      name: arg.name.toString(),
      type: getTypeDef(arg.type.toString()),
    }));
  }

function RegisterKey ({ className, onClose, onSuccess, recipientId: propRecipientId, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [public_key, setPublicKey] = useState<PublicKey>();
  const [signature,  setSignature] = useState<object>();
  const [params, setParams] = useState<RawParam[]>([]);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic>(api.tx.exchange.register(["0x0", "0x0"], ["0x1", "0x1"]));
  console.log(extrinsic)
  const [hasAvailable] = useState(true);

  useEffect(() => {
      if (params.length > 1) {
         if (public_key != params[0].value || signature != params[1].value) {
            setPublicKey(params[0].value)
            setSignature(params[1].value)
            setExtrinsic(api.tx.exchange.register(params[0].value, params[1].value))
         }
      }
  })

  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  let callback: () => void = () => {
    onClose();
    if (public_key != undefined) {
        onSuccess(public_key)
    }
  };
    
  return (
    <Modal
      className='app--register-Modal'
      header={t('Register Key')}
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
        <Params
            // key={`${section}.${method}:params` /* force re-render on change */}
            onChange={setParams}
            //onEnter={setParams}
            // onEscape={onEscape}
            // overrides={paramComponents}
            params={getParams(api.tx.exchange.register)}
        />
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={senderId}
          extrinsic={extrinsic}
          icon='send'
          isDisabled={!hasAvailable}
          isPrimary
          label={t('Register Key')}
          onStart={callback}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(RegisterKey)`
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
