import React from "react";

import blackBishop from "./bB.svg";
import blackKnight from "./bN.svg";
import blackPawn from "./bP.svg";
import blackQueen from "./bQ.svg";
import blackRook from "./bR.svg";
import blackKing from "./bK.svg";
import whiteBishop from "./wB.svg";
import whiteKnight from "./wN.svg";
import whitePawn from "./wP.svg";
import whiteQueen from "./wQ.svg";
import whiteRook from "./wR.svg";
import whiteKing from "./wK.svg";

const createPieces = () => {

    const pieces: string[] = [
        "wP",
        "wN",
        "wB",
        "wR",
        "wQ",
        "wK",
        "bP",
        "bN",
        "bB",
        "bR",
        "bQ",
        "bK",
    ];

    const piecesMap: { [key: string]: string } = {
        wP: whitePawn,
        wN: whiteKnight,
        wB: whiteBishop,
        wR: whiteRook,
        wQ: whiteQueen,
        wK: whiteKing,
        bP: blackPawn,
        bN: blackKnight,
        bB: blackBishop,
        bR: blackRook,
        bQ: blackQueen,
        bK: blackKing,
    };

    const customPieces: { [key: string]: React.FC<{ squareWidth: number }> } = {};

    pieces.forEach((p) => {

        const PieceComponent: React.FC<{ squareWidth: number }> = ({ squareWidth }) => (
            <img src={piecesMap[p]} alt="Piece" style={{ width: squareWidth, height: squareWidth }} />
        );

        customPieces[p] = PieceComponent;
    });

    return customPieces;
};

export default createPieces;
