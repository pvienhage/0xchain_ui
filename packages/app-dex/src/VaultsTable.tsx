import React, { useState, useMemo } from 'react';
import {SortedVault} from './index';
import {Table, Bubble, Button} from '@polkadot/react-components';
import { useTranslation } from './translate';

interface Props {
    className?: string;
    deposit_callup: (vault_num: number, balance: number, token_id: string) => void;
    withdraw_callup: (vault_num: number, balance: number, token_id: string) => void;
    vaults: SortedVault[];
    key?: number;
}

interface RowProps {
    deposit_callup: (vault_num: number, balance: number, token_id: string) => void;
    withdraw_callup: (vault_num: number, balance: number, token_id: string) => void;
    vault: number;
    balance: number;
    id: string;
}


function VaultsTable({className, vaults, deposit_callup, withdraw_callup, key}: Props): React.ReactElement<Props> {
    let table = vaults.map( ({vault, balance, token_name}): React.ReactElement<Props> => 
    {return(<Row
        vault={vault}
        balance={balance}
        id={token_name}
        deposit_callup={deposit_callup}
        withdraw_callup={withdraw_callup}
    />)});
    
    const { t } = useTranslation();
    const [label, setLabel] = useState<string>();
    const [index, setIndex] = useState<number>(0);

    const label_updater:  () => void = () => {
        setIndex(index+1);
        setLabel(index?.toString());
    }
 
    return(
      <Table
        key={label}
      >
          <Table.Head>
              <h2>Vaults Listing     :
              <Button
                icon='sync'
                isPrimary
                label={t('Update')}
                onClick={label_updater}
              /> </h2>
          </Table.Head>
          {table}
      </Table>
    )
}

function Row({vault, balance, id, deposit_callup, withdraw_callup}: RowProps): React.ReactElement<Props> {
    const { t } = useTranslation();

    const reflect_deposit_call: () => void = () => {
        deposit_callup(vault, balance, id);
    }

    const reflect_withdraw_call: () => void = () => {
        withdraw_callup(vault, balance, id);
    }

    return(
        <div>
            <Bubble color='teal' icon='address card' label='Vault ID'>
                {vault}
            </Bubble>
            <Bubble color='olive' icon='address card' label='Token'>
                {id}
            </Bubble>
            <Bubble color='green' icon='address card' label='Balance'>
                {balance}
            </Bubble>
            <Button
                icon='add'
                isPrimary
                label={t('Deposit')}
                onClick={reflect_deposit_call}
            />
            <Button
                icon='minus'
                isPrimary
                label={t('Withdraw')}
                onClick={reflect_withdraw_call}
            />
        </div>
    )
  }

export default VaultsTable;