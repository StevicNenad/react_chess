import {Chessboard} from "react-chessboard";
import createPieces from "../../assets/pieces/PieceFactory";
import "./GamePage.style.scss"
import {CSSProperties, useEffect, useRef, useState} from "react";
import {Chess, Move, PieceSymbol} from "chess.ts";
import {Square} from "chess.ts/dist/types";
import {BoardOrientation} from "react-chessboard/dist/chessboard/types";
import {useNavigate, useParams} from "react-router-dom";
import {child, get, getDatabase, onDisconnect, onValue, ref, runTransaction, set, update} from "firebase/database";
import Lobby from "../../types/Lobby.type";
import Cookies from "js-cookie";
import animationData from "../../assets/lottie/loading.json";
import Lottie from "lottie-react";
import {Box, Button, Typography} from "@mui/material";
import RematchDialog from "../../component/Dialogs/RematchDialog/RematchDialog.component";
import WaitingResponseDialog from "../../component/Dialogs/WaitingDialog/WaitingDialog.component";
import RematchRejectedDialog from "../../component/Dialogs/RematchRejectedDialog/RematchRejectedDialog.component";

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
    const [currentPlayer, setCurrentPlayer] = useState("");
    const [opponent, setOpponent] = useState("");
    const [playerColor, setPlayerColor] = useState("");
    const [gameEventText, setGameEventText] = useState("");
    const [showButtons, setShowButtons] = useState(false);
    const [openRematchDialog, setOpenRematchDialog] = useState(false);
    const [openWaitingDialog, setOpenWaitingDialog] = useState(false);
    const [openRejectedDialog, setOpenRejectedDialog] = useState(false);
    const [currentPlayerScore, setCurrentPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);

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

        fetchLobby();

        return () => {
            isMounted.current = false;
        }
    }, []);

    useEffect(() => {
        const fenRef = ref(db, `lobbies/${id}/fen`);
        const pgnRef = ref(db, `lobbies/${id}/pgn`);

        const unsub = onValue(fenRef, async (snapshot) => {
            setGameEventText("");
            const updatedFen = snapshot.val();
            const updatedGame: Chess = new Chess(updatedFen);

            const pgnSnapshot = await get(pgnRef);
            const updatedPgn = pgnSnapshot.val();

            updatedGame.loadPgn(updatedPgn);
            setGame(updatedGame);
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        const rematchRequestsRef = ref(db, `lobbies/${id}/rematchRequests`);

        const unsub = onValue(rematchRequestsRef, async (snapshot) => {
            const rematchRequests = snapshot.val();

            if (rematchRequests) {
                if (rematchRequests.length > 1) {
                    setOpenRematchDialog(false);
                    setOpenWaitingDialog(false);
                    if (rematchRequests[0] === currentUserId) {
                        await startNewGame();
                    }
                } else if (rematchRequests.includes(currentUserId)) {
                    setOpenWaitingDialog(true);
                } else {
                    setOpenRematchDialog(true);
                }
            }
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        const matchCountRef = ref(db, `lobbies/${id}/matchCount`);

        const unsub = onValue(matchCountRef, (snapshot) => {
            const newMatchCount = snapshot.val();

            if (newMatchCount !== null) {
                fetchLobby();
            }
        });

        return () => {
            unsub();
        };
    }, [id, db]);

    useEffect(() => {
        const rematchRejectedRef = ref(db, `lobbies/${id}/rematchRejected`);

        const unsub = onValue(rematchRejectedRef, async (snapshot) => {
            const rematchRejected = snapshot.val();

            if (rematchRejected) {
                setOpenRematchDialog(false);
                setOpenWaitingDialog(false);
                setOpenRejectedDialog(true);

                setVisibleClass("");

                setTimeout(() => {
                    openMainMenu();
                }, 2500);
            }
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        if (!lobby) {
            return;
        }

        if (lobby.player1 === currentUserId) {
            setCurrentPlayerScore(lobby.player1Score);
            setOpponentScore(lobby.player2Score);
            setOpponent("player2");
            setCurrentPlayer("player1");
        } else {
            setCurrentPlayerScore(lobby.player2Score);
            setOpponentScore(lobby.player1Score);
            setOpponent("player1");
            setCurrentPlayer("player2");
        }

        configureBoard();

    }, [lobby]);

    useEffect(() => {
        if (!lobby || !currentPlayer) {
            return;
        }

        let currentPlayerConnected = `${currentPlayer}Connected`;

        const lobbyRef = child(ref(db), `lobbies/${id}`);
        update(lobbyRef, {[currentPlayerConnected]: true});

        onDisconnect(child(lobbyRef, currentPlayerConnected)).set(false);

        return () => {
            update(lobbyRef, {[currentPlayerConnected]: false});
        };
    }, [lobby, currentPlayer]);


    useEffect(() => {
        const currentPlayerScoreRef = ref(db, `lobbies/${id}/${currentPlayer}Score`);
        const opponentScoreRef = ref(db, `lobbies/${id}/${opponent}Score`);

        const unsubCurrentPlayer = onValue(currentPlayerScoreRef, async (snapshot) => {
            setCurrentPlayerScore(snapshot.val());
        });

        const unsubOpponent = onValue(opponentScoreRef, async (snapshot) => {
            setOpponentScore(snapshot.val());
        });

        return () => {
            unsubCurrentPlayer();
            unsubOpponent();
        };
    }, [opponent]);


    useEffect(() => {
        const otherPlayerRef = ref(db, `lobbies/${id}/${opponent}Connected`);
        const unsub = onValue(otherPlayerRef, (snapshot) => {
            if (snapshot.exists()) {
                const otherPlayerConnected = snapshot.val();
                setOtherPlayerConnected(otherPlayerConnected);
            }
        });

        return () => {
            unsub();
        };
    }, [opponent]);

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

        configureColors();

        const loadedGame: Chess = new Chess(lobby.fen);
        loadedGame.loadPgn(lobby.pgn);
        setGame(loadedGame)

        setVisibleClass("visible");
        setScaleClass("scale");
    }

    const configureColors = () => {
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
    }

    const manageGameState = async () => {
        if (game.inCheck()) {
            if (game.inCheckmate()) {
                if (checkIfPlayersTurn()) {
                    const opponentScoreRef = ref(db, `lobbies/${id}/${opponent}Score`);

                    await runTransaction(opponentScoreRef, (score) => {
                        if (score === null) {
                            score = 0;
                        } else {
                            score++;
                        }
                        return score;
                    });
                    setGameEventText("Defeat");
                } else {
                    setGameEventText("Victory");
                }
            } else {
                setGameEventText("Check");
            }
        }

        if (game.inStalemate()) {
            setGameEventText("Stalemate");
        }

        if (game.gameOver()) {
            setShowButtons(true);
        } else {
            setShowButtons(false);
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

    const sendRematchRequest = async () => {
        const rematchRequestsRef = ref(db, `lobbies/${id}/rematchRequests`);

        await runTransaction(rematchRequestsRef, (rematchRequests) => {
            if (rematchRequests) {
                if (!rematchRequests.includes(currentUserId)) {
                    rematchRequests.push(currentUserId);
                }
            } else {
                rematchRequests = [currentUserId];
            }
            return rematchRequests;
        });
    }

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

    const startNewGame = async () => {
        const game = new Chess();

        const fen = game.fen();
        const pgn = game.pgn();

        const gameRef = ref(db, `lobbies/${id}`);
        const snapshot = await get(gameRef);
        const gameData = snapshot.val();
        const {white, black} = gameData;

        const newGameData = {
            ...gameData,
            white: black,
            black: white,
            fen,
            pgn,
            rematchRequests: [],
            matchCount: gameData.matchCount + 1
        };

        await update(gameRef, newGameData);
    }

    const handleClose = () => {
        setOpenRematchDialog(false);
        setOpenWaitingDialog(false);
    };

    const handleConfirm = async () => {
        await sendRematchRequest();
        setOpenRematchDialog(false);
    };

    const handleReject = async () => {
        const rematchRejectedRef = ref(db, `lobbies/${id}/rematchRejected`);

        await set(rematchRejectedRef, true);
    }

    const handleCancel = () => {
        // potentially cancel the rematch request here
        setOpenWaitingDialog(false);
    };

    const handleCLose = (event: React.SyntheticEvent, reason: 'backdropClick' | 'escapeKeyDown') => {
        if (reason !== 'backdropClick') {
            return;
        }
        setOpenWaitingDialog(false);
    }


    return (
        <div className={`game-page-container ${visibleClass}`}>
            <WaitingResponseDialog open={openWaitingDialog} onCancel={handleCancel} onClose={handleClose}/>
            <RematchDialog open={openRematchDialog} onClose={handleReject} onConfirm={handleConfirm}/>
            <RematchRejectedDialog open={openRejectedDialog}/>
            <div className={`logo-score-container ${visibleClass}`}>
                <img className={`logo-game-page`}
                     src={(process.env.REACT_APP_ENVIROMENT === "dev" ? ".." : process.env.REACT_APP_BASE_PATH) + "/logo.svg"}
                     alt={"logo"}/>
                <Typography variant={"h3"} className={"score"}>{currentPlayerScore} - {opponentScore}</Typography>
            </div>
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
                    <Button variant={"contained"} onClick={sendRematchRequest}>Rematch</Button>
                    <Button variant={"outlined"} onClick={() => {
                        openMainMenu()
                    }}>Back to Main Menu</Button>
                </Box>
                <Typography className={`lobby-code ${visibleClass} ${isOtherPlayerConnected ? "display-none" : ""}`}>
                    {id}
                </Typography>
                <Typography
                    className={`game-event ${isOtherPlayerConnected && gameEventText ? "visible" : "display-none"}`}>
                    {gameEventText}
                </Typography>
            </div>
        </div>
    );
}

export default GamePage;
