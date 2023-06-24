import {Chessboard} from "react-chessboard";
import createPieces from "../../assets/pieces/PieceFactory";
import "./GamePage.style.scss"
import {CSSProperties, useEffect, useState} from "react";
import {Chess, Move, Piece, PieceSymbol} from "chess.ts";
import {Square} from "chess.ts/dist/types";
import {PromotionPieceOption} from "react-chessboard/dist/chessboard/types";

const GamePage = () => {
    const [game, setGame] = useState(new Chess());
    const [visibleClass, setVisibleClass] = useState('');
    const [scaleClass, setScaleClass] = useState('');
    const [moveFrom, setMoveFrom] = useState("");
    const [moveTo, setMoveTo] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, CSSProperties | undefined>>({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});

    useEffect(() => {
        setTimeout(() => {
            setVisibleClass('visible');
            setScaleClass('scale');
        }, 500);
    }, []);

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
            const moveToPiece = game.get(move.to);
            const squarePiece = game.get(square);

            if (moveToPiece && squarePiece) {
                newSquares[move.to] = {
                    background:
                        moveToPiece.color !== squarePiece.color
                            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
                            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
                    borderRadius: "50%",
                };
            }
            return move;
        });

        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };
        setOptionSquares(newSquares);
        return true;
    }

    const makeRandomMove = () => {
        const possibleMoves: string[] = game.moves();

        // exit if the game is over
        if (game.gameOver() || game.inDraw() || possibleMoves.length === 0)
            return;

        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        safeGameMutate((game) => {
            game.move(possibleMoves[randomIndex]);
        });
    }

    const onSquareClick = (square: Square) => {
        setRightClickedSquares({});

        // from square
        if (!moveFrom) {
            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            return;
        }

        // to square
        if (!moveTo) {
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

            setTimeout(makeRandomMove, 300);
            setMoveFrom("");
            setMoveTo(null);
            setOptionSquares({});
            return;
        }
    }

    const onPromotionPieceSelect = (piece: PromotionPieceOption | undefined) => {
        // if no piece passed then user has cancelled dialog, don't make move and reset
        if (piece && moveTo) { // Check that moveTo is not null
            const gameCopy: Chess = new Chess(game.fen());
            const symbol: PieceSymbol = piece.charAt(1) as PieceSymbol;
            gameCopy.move({
                from: moveFrom,
                to: moveTo,
                promotion: symbol ?? "q",
            });
            setGame(gameCopy);
            setTimeout(makeRandomMove, 300);
        }

        setMoveFrom("");
        setMoveTo(null);
        setShowPromotionDialog(false);
        setOptionSquares({});
        return true;
    }

    function onSquareRightClick(square: Square) {
        const colour = "rgba(0, 0, 255, 0.4)";
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] &&
                rightClickedSquares[square]?.backgroundColor === colour
                    ? undefined
                    : { backgroundColor: colour },
        });
    }

    return (
        <div className={`game-page-container ${visibleClass}`}>
            <img className={`logo-game-page ${visibleClass}`} src={"logo.svg"}/>
            <div className={`chessboard-container ${scaleClass}`}>
                <Chessboard
                    boardOrientation="black"
                    position={game.fen()}
                    arePiecesDraggable={false}
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
                    onPromotionPieceSelect={onPromotionPieceSelect}
                    promotionToSquare={moveTo}
                    showPromotionDialog={showPromotionDialog}
                />
            </div>
        </div>
    );
}

export default GamePage;