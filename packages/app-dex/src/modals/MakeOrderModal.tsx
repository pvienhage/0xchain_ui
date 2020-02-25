import React, { useState } from 'react';
import styled from 'styled-components';
import { InputNumber, Input , Modal, Button } from '@polkadot/react-components';
import BN from 'bn.js';
import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
  addNewOrder: (is_buy: boolean, vault_a :number, vault_b :number, amount: number, price: number, sig_r :string, sig_s: string) => void;
  isBuy: boolean;
  recipientId?: string;
  senderId?: string;
}


function MakerModal ({ className, onClose, addNewOrder, isBuy, recipientId: propRecipientId, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [vault_a, setVaultA] = useState<BN>();
  const [vault_b, setVaultB] = useState<BN>();
  const [amount, setAmount] = useState<BN>();
  const [price, setPrice] = useState<BN>();
  const [sig_r, setSigR] = useState<string>("");
  const [sig_s, setSigS] = useState<string>("");


const update_and_close: () => void = () => {
    addNewOrder(isBuy, vault_a?.toNumber(), vault_b?.toNumber(), amount?.toNumber(), price?.toNumber(), sig_r, sig_s);
    onClose();
}

  let token_a_label;
  let token_b_label;
  if (isBuy) {
      token_a_label = "Pick the vault to spend dai from";
      token_b_label = "Pick the vault to recive ether in";
  } else {
    token_a_label = "Pick the vault to sell ether from";
    token_b_label = "Pick the vault to get dai in";
  }

  return (
    <Modal
      className='app--maker-Modal'
      header={t('Register Key')}
    >
      <Modal.Content>
        <InputNumber
            bitLength={32}
            isDecimal={false}
            isZeroable={true}
            label={token_a_label}
            onChange={setVaultA}
        />
        <InputNumber
            bitLength={32}
            isDecimal={false}
            isZeroable={true}
            label={token_b_label}
            onChange={setVaultB}
        />
        <InputNumber
            bitLength={64}
            isDecimal={true}
            isZeroable={true}
            label={"Enter the trade Amount"}
            onChange={setAmount}
        />
        <InputNumber
            bitLength={64}
            isDecimal={true}
            isZeroable={true}
            label={"Enter the price"}
            onChange={setPrice}
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
            icon='plus'
            isPrimary
            label={t('Put trade in orderbook')}
            onClick={update_and_close}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(MakerModal)`
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
