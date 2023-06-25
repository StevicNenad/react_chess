import {Chessboard} from "react-chessboard";
import createPieces from "../../assets/pieces/PieceFactory";
import "./GamePage.style.scss"
import {CSSProperties, useEffect, useState} from "react";
import {Chess, Move, PieceSymbol} from "chess.ts";
import {Square} from "chess.ts/dist/types";
import {BoardOrientation} from "react-chessboard/dist/chessboard/types";
import {useParams} from "react-router-dom";
import {child, get, getDatabase, goOffline, onDisconnect, ref, set} from "firebase/database";
import Lobby from "../../types/Lobby.type";
import Cookies from "js-cookie";


const GamePage = () => {
    const {id} = useParams();
    const db = getDatabase();
    const [game, setGame] = useState(new Chess());
    const [visibleClass, setVisibleClass] = useState('');
    const [scaleClass, setScaleClass] = useState('');
    const [moveFrom, setMoveFrom] = useState("");
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties | undefined>>({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>("white");
    const [isPieceClicked, setPieceClicked] = useState(false);

    useEffect(() => {
        get(child(ref(db), `lobbies/${id}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const lobby: Lobby = snapshot.val();
                console.log(lobby);

                const userId = Cookies.get("userID");
                if (lobby.white === userId) {
                    setBoardOrientation("white");
                } else {
                    setBoardOrientation("black");
                }

                let playerDisconnectStatus;

                if (lobby.player1 === userId) {
                    lobby.player1Connected = true;
                    playerDisconnectStatus = ref(db, `/lobbies/${id}/player1Connected`);
                } else if (lobby.player2 === userId) {
                    lobby.player2Connected = true;
                    playerDisconnectStatus = ref(db, `/lobbies/${id}/player2Connected`);
                }

                if (playerDisconnectStatus) {
                    onDisconnect(playerDisconnectStatus).set(false);
                }

                setGame(new Chess(lobby.fen));

                set(ref(db, `lobbies/${id}`), lobby).then(r => console.log(r));
            } else {
                console.log("No data available");
                return;
            }
        }).catch((error) => {
            console.error(error);
        });

        setTimeout(() => {
            setVisibleClass('visible');
            setScaleClass('scale');
        }, 500);
    }, []);

    window.onpopstate = () => {
        goOffline(db);
    }

    const safeGameMutate = (modify: (game: Chess) => void) => {
        setGame((g: Chess) => {
            const update = new Chess(g.fen());
            modify(update);
            return update;
        });
    };

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
        setRightClickedSquares({});

        // from square
        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setPieceClicked(true);
                setMoveFrom(square);
            }
            return;
        }

        // to square
        if (!moveTo) {
            setPieceClicked(false);
            // check if valid move before showing dialog
            const moves: Move[] = game.moves({
                square: moveFrom,
                verbose: true,
            });
            const foundMove = moves.find(
                (m) => m.from === moveFrom && m.to === square
            );
            // not a valid move
            if (!foundMove) {
                // check if clicked on new piece
                const hasMoveOptions = getMoveOptions(square);
                // if new piece, setMoveFrom, otherwise clear moveFrom
                setMoveFrom(hasMoveOptions ? square : "");
                return;
            }

            // valid move
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

            // is normal move
            const gameCopy: Chess = new Chess(game.fen());
            const move: Move | null = gameCopy.move({
                from: moveFrom,
                to: square,
                promotion: "q",
            });

            // if invalid, setMoveFrom and getMoveOptions
            if (move === null) {
                const hasMoveOptions = getMoveOptions(square);
                if (hasMoveOptions) setMoveFrom(square);
                return;
            }

            setGame(gameCopy);
            saveGame(gameCopy);

            //setTimeout(makeRandomMove, 300);
            setMoveFrom("");
            setMoveTo(null);
            setOptionSquares({});
            return;
        }
    }

    const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
        const gameCopy = new Chess(game.fen());
        const symbol: PieceSymbol = piece.charAt(1).toLowerCase() as PieceSymbol;
        const move = gameCopy.move({
            from: moveFrom,
            to: targetSquare,
            promotion: symbol ?? "q",
        });
        setGame(gameCopy);

        // illegal move
        if (move === null) return false;

        saveGame(gameCopy);

        // store timeout so it can be cleared on undo/reset so computer doesn't execute move
        //const newTimeout = setTimeout(makeRandomMove, 200);
        //setCurrentTimeout(newTimeout);
        setOptionSquares({});
        setMoveFrom("");
        setMoveTo(null);
        return true;
    }

    const saveGame = (gameCopy: Chess) => {
        set(ref(db, `lobbies/${id}/fen`), gameCopy.fen());
    }

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
        if (!isPieceClicked) {
            getMoveOptions(square);
        }
    }


    return (
        <div className={`game-page-container ${visibleClass}`}>
            <img className={`logo-game-page ${visibleClass}`} src={"../logo.svg"} alt={"logo"}/>
            <div className={`chessboard-container ${scaleClass}`}>
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
            <div className={`lobby-code ${visibleClass}`}>{id}</div>
        </div>
    );
}

export default GamePage;