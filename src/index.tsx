import React from 'react';

import { App, NrfConnectState } from 'pc-nrfconnect-shared';

import SidePanel from './SidePanel';
import DeviceSelector from './DeviceSelector';
import Terminal from './Terminal/Terminal';
import reducer, { AppState } from './reducer';

export type State = NrfConnectState<AppState>;

export default () => (
    <App
        deviceSelect={<DeviceSelector />}
        sidePanel={<SidePanel />}
        appReducer={reducer}
        panes={[['Terminal', Terminal]]}
    />
);
