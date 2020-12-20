import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Device, DeviceSelector, logger } from 'pc-nrfconnect-shared';
import { open, close } from './deviceActions';

const deviceListing = {
    serialPort: true,
};

function mapState() {
    return { deviceListing };
}

function mapDispatch(dispatch: Dispatch) {
    return {
        onDeviceSelected: (device: Device) => {
            logger.info(`Selected device with s/n ${device.serialNumber}`);
            dispatch(open());
        },
        onDeviceDeselected: (device: Device) => {
            logger.info(`Deselected device with s/n ${device.serialNumber}`);
            dispatch(close());
        },
    };
}

export default connect(mapState, mapDispatch)(DeviceSelector);
