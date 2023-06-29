interface Lobby {
    white: string | null;
    black: string | null;
    player1: string | null;
    player1Connected: boolean;
    player1Score: number;
    player2: string | null;
    player2Connected: boolean;
    player2Score: number;
    fen: string;
    pgn: string;
    lobbyStatus: LobbyStatus;
    rematchRequests?: string[];
    rematchRejected?: boolean;
    matchCount: number;
}

export enum LobbyStatus {
    NewGame = "NEW",
    InProgress = "IN_PROGRESS",
    Completed = "COMPLETED"
}

export default Lobby;