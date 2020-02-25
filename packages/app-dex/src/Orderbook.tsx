import React, { useState, useMemo } from 'react';
import {SortedVault} from './index';
import {Column, Columar, Bubble, Button} from '@polkadot/react-components';
import { useTranslation } from './translate';

type Signature = {r: string, s: string};
export type MakerMessage = {
  amount: number,
  price: number,
  sig: Signature,
  is_buy: boolean,
  vault_a: number,
  vault_b: number,
};


interface Props {
    className?: string;
    taker_callup: (maker_message: MakerMessage) => void;
    maker_callup: (is_buy: boolean) => void;
    buyOrders: MakerMessage[];
    sellOrders: MakerMessage[];
}

interface OrderProps {
    taker_callup: (maker_message: MakerMessage) => void;
    makerMessage: MakerMessage;
}


function Orderbook({className, buyOrders, sellOrders, taker_callup, maker_callup}: Props): React.ReactElement<Props> {
    let buy_orders = buyOrders.map( (maker_message): React.ReactElement<Props> => 
    {return(<Order
        makerMessage={maker_message}
        taker_callup={taker_callup}
    />)});
    
    let sell_orders = sellOrders.map( (maker_message): React.ReactElement<Props> => 
    {return(<Order
        makerMessage={maker_message}
        taker_callup={taker_callup}
    />)});

    const { t } = useTranslation();
    const [label, setLabel] = useState<string>();
    const [index, setIndex] = useState<number>(0);

    const label_updater:  () => void = () => {
        setIndex(index+1);
        setLabel(index?.toString());
    }

    const buy_button_call: () => void = () => {
        maker_callup(true);
    }

    const sell_button_call: () => void = () => {
        maker_callup(false);
    }
 
    return(
        <Columar>
            <Column 
            key={label}
            headerText={t('Orders Buying')}
            buttons={[
            <Button
                icon='sync'
                isPrimary
                label={t('Update orderbook')}
                onClick={label_updater}
            />,
            button_with("Buy Eth", buy_button_call , 'ethereum')
            ]}
            >
               {buy_orders}
            </Column>
            <Column 
            key={label}
            headerText={t('Orders Selling')}
            buttons={[
                <Button
                    icon='sync'
                    isPrimary
                    label={t('Update orderbook')}
                    onClick={label_updater}
                />,
                button_with("Sell Eth", sell_button_call, 'dollar sign')
            ]}
            >
              {sell_orders}
            </Column>
        </Columar>
    )
}

function Order({makerMessage, taker_callup}: OrderProps): React.ReactElement<Props> {
    const { t } = useTranslation();

    const reflect_taker_callup: () => void = () => {
        taker_callup(makerMessage);
    }

    if (makerMessage.is_buy) {
        return(
        <div>
            <Bubble color='grey' icon='address card' label='Amount'>
            {makerMessage.amount}
            </Bubble>
            <Bubble color='green' icon='dollar sign' label='Price'>
            {makerMessage.price}
            </Bubble>
            <Button
            icon='exchange'
            isPrimary
            label={t('Take Order')}
            onClick={reflect_taker_callup}
            />
        </div>
        )
    } else {
        return(
        <div>
            <Bubble color='grey' icon='address card' label='Amount'>
            {makerMessage.amount}
            </Bubble>
            <Bubble color='red' icon='dollar sign' label='Price'>
            {makerMessage.price}
            </Bubble>
            <Button
            icon='exchange'
            isPrimary
            label={t('Take Order')}
            onClick={reflect_taker_callup}
            />
        </div>
        )
    }
  }

function button_with(text: string, call: any, which_icon: string): React.ReactNode {
    const { t } = useTranslation();
    return(
        <Button icon= {which_icon} 
        isPrimary 
        label={t(text)} 
        onClick={call}/>
    )
}

export default Orderbook;