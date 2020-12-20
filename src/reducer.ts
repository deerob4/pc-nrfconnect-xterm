type Port = any;

export interface AppState {
    port?: Port;
}

const initialState: AppState = {
    port: undefined,
};

enum ActionType {
    SetPort = '@TERMINAL/SET_PORT',
}

interface SetPort {
    type: ActionType.SetPort;
    payload?: Port;
}

type Action = SetPort;

export function setPort(port?: Port): SetPort {
    return {
        type: ActionType.SetPort,
        payload: port,
    };
}

export default (state = initialState, action: Action): AppState => {
    switch (action.type) {
        case ActionType.SetPort:
            return { port: action.payload };

        default:
            return state;
    }
};
