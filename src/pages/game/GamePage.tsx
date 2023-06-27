import {Chessboard} from "react-chessboard";
import createPieces from "../../assets/pieces/PieceFactory";
import "./GamePage.style.scss"
import {CSSProperties, useEffect, useRef, useState} from "react";
import {Chess, Move, PieceSymbol} from "chess.ts";
import {Square} from "chess.ts/dist/types";
import {BoardOrientation} from "react-chessboard/dist/chessboard/types";
import {useNavigate, useParams} from "react-router-dom";
import {child, get, getDatabase, onDisconnect, onValue, ref, update} from "firebase/database";
import Lobby from "../../types/Lobby.type";
import Cookies from "js-cookie";
import animationData from "../../assets/lottie/loading.json";
import Lottie from "lottie-react";
import {Box, Button} from "@mui/material";

const GamePage = () => {
    const {id} = useParams();
    const db = getDatabase();
    const isMounted = useRef(false);
    const currentUserId = Cookies.get("userID");
    const navigate = useNavigate();

    const [lobby, setLobby] = useState<Lobby>();
    const [game, setGame] = useState(new Chess());
    const [isOtherPlayerConnected, setOtherPlayerConnected] = useState(false);
    const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>("white");
    const [otherPlayer, setOtherPlayer] = useState("");
    const [playerColor, setPlayerColor] = useState("");
    const [gameEventText, setGameEventText] = useState("");
    const [showButtons, setShowButtons] = useState(false);

    const [moveFrom, setMoveFrom] = useState("");
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties | undefined>>({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [isPieceClicked, setPieceClicked] = useState(false);

    const [visibleClass, setVisibleClass] = useState("");
    const [scaleClass, setScaleClass] = useState("");


    useEffect(() => {
        isMounted.current = true;
        const fetchLobby = async () => {
            try {
                const lobbyRef = child(ref(db), `lobbies/${id}`);
                const snapshot = await get(lobbyRef);

                const lobby: Lobby = snapshot.val();
                if (isMounted.current) {
                    setLobby(lobby);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchLobby();

        return () => {
            isMounted.current = false;
        }
    }, []);

    useEffect(() => {
        const fenRef = ref(db, `lobbies/${id}/fen`);
        const pgnRef = ref(db, `lobbies/${id}/pgn`); // Create a reference to pgn

        const unsub = onValue(fenRef, async (snapshot) => {
            setGameEventText("");
            const updatedFen = snapshot.val();
            const updatedGame: Chess = new Chess(updatedFen);

            const pgnSnapshot = await get(pgnRef); // Fetch the current pgn value
            const updatedPgn = pgnSnapshot.val();

            updatedGame.loadPgn(updatedPgn);
            setGame(updatedGame);
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        if (!lobby) {
            return;
        }
        let currentPlayerConnected: string;

        if (lobby.player1 === currentUserId) {
            currentPlayerConnected = "player1Connected";
            setOtherPlayer("player2");
        } else {
            currentPlayerConnected = "player2Connected";
            setOtherPlayer("player1");
        }

        const lobbyRef = child(ref(db), `lobbies/${id}`);
        update(lobbyRef, {[currentPlayerConnected]: true});

        onDisconnect(child(lobbyRef, currentPlayerConnected)).set(false);

        configureBoard();

        return () => {
            update(lobbyRef, {[currentPlayerConnected]: false});
        };

    }, [lobby]);


    useEffect(() => {
        const otherPlayerRef = ref(db, `lobbies/${id}/${otherPlayer}Connected`);
        const unsub = onValue(otherPlayerRef, (snapshot) => {
            if (snapshot.exists()) {
                const otherPlayerConnected = snapshot.val();
                setOtherPlayerConnected(otherPlayerConnected);
            }
        });

        return () => {
            unsub();
        };
    }, [otherPlayer]);

    useEffect(() => {
        manageGameState();
    }, [game]);

    const openMainMenu = () => {
        navigate(`${process.env.REACT_APP_BASE_PATH}`);
    }

    const configureBoard = () => {
        if (!lobby) {
            return
        }

        if (lobby.white === currentUserId) {
            setBoardOrientation("white");
            setPlayerColor("w");
        } else {
            setBoardOrientation("black");
            setPlayerColor("b");
        }

        const loadedGame: Chess = new Chess(lobby.fen);
        loadedGame.loadPgn(lobby.pgn);
        setGame(loadedGame)

        setVisibleClass("visible");
        setScaleClass("scale");
    }

    const manageGameState = () => {
        if (game.inCheck()) {
            if (game.inCheckmate()) {
                const gameMessage: string = checkIfPlayersTurn() ? ", you lost" : ", you won";
                setGameEventText("Checkmate");
                setShowButtons(true);
            } else {
                setGameEventText("Check");
            }
        }

        if (game.inStalemate()) {
            setGameEventText("Stalemate");
        }
    }

    const getMoveOptions = (square: Square) => {
        const moves: Move[] = game.moves({
            square: square,
            verbose: true,
        });
        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: { [key: string]: CSSProperties } = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to) && game.get(move.to)?.color !== game.get(square)?.color
                        ? "radial-gradient(circle, rgba(0,0,0,.2) 65%, transparent 65%)"
                        : "radial-gradient(circle, rgba(0,0,0,.2) 25%, transparent 25%)",
                borderRadius: "50%",
            };
            return move;
        });

        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };
        setOptionSquares(newSquares);
        return true;
    }

    const onSquareClick = (square: Square) => {
        if (!checkIfPlayersTurn()) {
            return;
        }

        setRightClickedSquares({});

        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setPieceClicked(true);
                setMoveFrom(square);
            }
            return;
        }

        if (!moveTo) {
            setPieceClicked(false);
            const moves: Move[] = game.moves({
                square: moveFrom,
                verbose: true,
            });

            const foundMove = moves.find(
                (m) => m.from === moveFrom && m.to === square
            );

            if (!foundMove) {
                const hasMoveOptions = getMoveOptions(square);
                setMoveFrom(hasMoveOptions ? square : "");
                return;
            }

            setMoveTo(square);

            // if promotion move
            if (
                (foundMove.color === "w" &&
                    foundMove.piece === "p" &&
                    square[1] === "8") ||
                (foundMove.color === "b" &&
                    foundMove.piece === "p" &&
                    square[1] === "1")
            ) {
                setShowPromotionDialog(true);
                return;
            }

            const gameCopy: Chess = new Chess(game.fen());
            const move: Move | null = gameCopy.move({
                from: moveFrom,
                to: square,
                promotion: "q",
            });

            if (move === null) {
                const hasMoveOptions = getMoveOptions(square);
                if (hasMoveOptions) setMoveFrom(square);
                return;
            }

            setGame(gameCopy);
            saveGame(gameCopy);

            setMoveFrom("");
            setMoveTo(null);
            setOptionSquares({});
            return;
        }
    }

    const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
        if (!checkIfPlayersTurn()) {
            return false;
        }

        const moveFromSquare = sourceSquare || moveFrom;
        const gameCopy = new Chess(game.fen());
        const symbol: PieceSymbol = piece.charAt(1).toLowerCase() as PieceSymbol;
        const move = gameCopy.move({
            from: moveFromSquare,
            to: targetSquare,
            promotion: symbol ?? "q",
        });
        setGame(gameCopy);

        if (move === null) return false;

        saveGame(gameCopy);

        setOptionSquares({});
        setMoveFrom("");
        setMoveTo(null);
        return true;
    }

    const saveGame = (gameCopy: Chess) => {
        update(ref(db, `lobbies/${id}`), {
            fen: gameCopy.fen(),
            pgn: gameCopy.pgn(),
        });
    };

    const onSquareRightClick = (square: Square) => {
        const colour = "rgba(0, 0, 255, 0.4)";
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] &&
                rightClickedSquares[square]?.backgroundColor === colour
                    ? undefined
                    : {backgroundColor: colour},
        });
    }

    const onPieceDragBegin = (piece: string, square: Square) => {
        if (!checkIfPlayersTurn()) {
            return;
        }
        setRightClickedSquares({});

        // from square
        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            return;
        }
    }

    const onMouseOverSquare = (square: Square) => {
        if (!checkIfPlayersTurn()) {
            return;
        }
        if (!isPieceClicked) {
            getMoveOptions(square);
        }
    }

    const checkIfPlayersTurn = () => {
        const fen = game.fen();
        const activeColor = fen.split(" ")[1];

        return activeColor === playerColor;
    }


    return (
        <div className={`game-page-container ${visibleClass}`}>
            <img className={`logo-game-page ${visibleClass}`}
                 src={(process.env.REACT_APP_ENVIROMENT === "dev" ? ".." : process.env.REACT_APP_BASE_PATH) + "/logo.svg"}
                 alt={"logo"}/>
            <div className={`chessboard-container ${scaleClass}`}>
                <div className={`chessboard-overlay ${isOtherPlayerConnected ? "display-none" : ""}`}>
                    <div className={"waiting-for-players-container"}>
                        <Lottie className={"animation"} animationData={animationData}/>
                        waiting for other player...
                    </div>
                </div>
                <Chessboard
                    position={game.fen()}
                    boardOrientation={boardOrientation}
                    arePiecesDraggable
                    customDarkSquareStyle={{backgroundColor: "#573a2e"}}
                    customLightSquareStyle={{backgroundColor: "#8a785d"}}
                    customPieces={createPieces()}
                    snapToCursor={false}
                    onSquareClick={onSquareClick}
                    onSquareRightClick={onSquareRightClick}
                    customBoardStyle={{
                        borderRadius: "4px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                    }}
                    customSquareStyles={{
                        ...moveSquares,
                        ...optionSquares,
                        ...rightClickedSquares,
                    }}
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                    onPieceDrop={onDrop}
                    onPieceDragBegin={onPieceDragBegin}
                    onMouseOverSquare={onMouseOverSquare}
                />
            </div>
            <div className={"game-status-box"}>
                <Box className={`button-box ${showButtons ? "" : "display-none"}`}>
                    <Button variant={"outlined"} onClick={() => {openMainMenu()}}>Back to Main Menu</Button>
                </Box>
                <div className={`lobby-code ${visibleClass} ${isOtherPlayerConnected ? "display-none" : ""}`}>
                    {id}
                </div>
                <div className={`game-event ${!isOtherPlayerConnected && gameEventText ? "visible" : "display-none"}`}>
                    {gameEventText}
                </div>

            </div>
        </div>
    );
}

export default GamePage;
