// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from './types';

import Dex from '@polkadot/app-dex';

export default ([
  {
    Component: Dex,
    display: {
      isHidden: false,
      needsAccounts: true,
      needsApi: [
        'tx.balances.transfer'
      ]
    },
    i18n: {
      defaultValue: 'Exchange'
    },
    icon: 'exchange',
    name: 'dex'
  }
] as Routes);
