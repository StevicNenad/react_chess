interface Lobby {
    white: string | null;
    black: string | null;
    player1: string | null;
    player1Connected: boolean;
    player2: string | null;
    player2Connected: boolean;
    fen: string;
}

export default Lobby;