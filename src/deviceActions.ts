import { Device, logger } from 'pc-nrfconnect-shared';
import { ModemPort } from 'modemtalk';
import { Dispatch } from 'redux';

import { setPort } from './reducer';
import { State } from '.';

const pickSerialPort = (device: Device) => {
    const serialports = [
        device.serialport,
        // device['serialport.1'],
        // device['serialport.2'],
    ];
    const platform = process.platform.slice(0, 3);
    switch (platform) {
        case 'win':
            return serialports.find(s => s && /MI_00/.test(s.pnpId || ''));
        case 'lin':
            return serialports.find(s => s && /-if00$/.test(s.pnpId || ''));
        case 'dar':
            return serialports.find(s => s && /1$/.test(s.path));
        default:
    }
    return undefined;
};

export const close = () => async (
    dispatch: Dispatch,
    getState: () => State
) => {
    const { port } = getState().app;
    if (port) {
        await port.close();
        dispatch(setPort());
    }
};

export const open = (device: Device) => async (dispatch: Dispatch) => {
    await dispatch(close());
    const { path } = pickSerialPort(device) || {};
    if (!path) {
        logger.error(
            'Selected device did not return serial port that could be opened'
        );
        return;
    }
    const port = new ModemPort(path, {
        baudRate: 115200,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        autoOpen: true,
    });
    dispatch(setPort(port));
};
