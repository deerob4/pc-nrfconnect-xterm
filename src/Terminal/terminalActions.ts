enum TerminalAction {
    MOVE_FORWARD_IN_HISTORY = '@TERMINAL/MOVE_FORWARD_IN_HISTORY',
    MOVE_BACKWARDS_IN_HISTORY = '@TERMINAL/MOVE_BACKWARDS_IN_HISTORY',
}

interface MoveForwardInHistory {
    type: TerminalAction.MOVE_FORWARD_IN_HISTORY;
}

interface MoveBackwardsInHistory {
    type: TerminalAction.MOVE_BACKWARDS_IN_HISTORY;
}

export function moveForwardInHistory(): MoveForwardInHistory {
    return { type: TerminalAction.MOVE_FORWARD_IN_HISTORY };
}

export function moveBackwardsInHistory(): MoveBackwardsInHistory {
    return { type: TerminalAction.MOVE_BACKWARDS_IN_HISTORY };
}
