import {Box, Button, Container, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {nanoid} from "nanoid";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./HomePage.style.scss";
import ColorChooserBox from "../../component/ColorChooserBox/ColorChooserBox.component";
import {getDatabase, ref, set, goOnline, get, child, onDisconnect,} from "firebase/database";
import {BoardOrientation} from "react-chessboard/dist/chessboard/types";
import Lobby from "../../types/Lobby.type";
import {Chess} from "chess.ts";


const HomePage = () => {
    const db = getDatabase();
    const [code, setCode] = useState("");
    const [showColorSelection, setShowColorSelection] = useState<Boolean>(false);
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        //goOnline(db);
    },[])

    const handleJoin = async () => {
        get(child(ref(db), `lobbies/${code}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const lobby: Lobby = snapshot.val();
                const userID = getUserID();

                if (userID && lobby.white !== userID && lobby.black !== userID) {
                    if(lobby.white === null) {
                        lobby.white = userID;
                    } else {
                        lobby.black = userID;
                    }
                }

                if(userID && lobby.player1 !== userID && lobby.player2 !== userID) {
                    lobby.player2 = userID;
                }

                set(ref(db, `lobbies/${code}`), lobby);
            } else {
                console.log("No data available");
                return;
            }
        }).catch((error) => {
            console.error(error);
        });

        setFadeOut(true);
        setTimeout(() => {
            navigate(`/lobby/${code}`);
        }, 2500);
    };

    const createLobby = async (color: BoardOrientation) => {
        try {
            const lobbyId = nanoid(8);
            const userID = getUserID();

            let lobby: Lobby = {
                white: null,
                black: null,
                player1: userID,
                player1Connected: false,
                player2: null,
                player2Connected: false,
                fen: new Chess().fen(),
            };

            lobby[color] = userID;

            await set(ref(db, "lobbies/" + lobbyId), lobby); // Wait for the server request to complete

            setFadeOut(true);
            setTimeout(() => {
                navigate(`/lobby/${lobbyId}`);
            }, 2500);
        } catch (error) {
            // Handle error, e.g., show an error message
            console.error("Error creating lobby:", error);
        }
    };

    const getUserID = () => {
        let userID = Cookies.get("userID");

        if (!userID) {
            userID = nanoid();
            Cookies.set("userID", userID);
        }

        return userID;
    }

    const startCreate = () => {
        setShowColorSelection(true);
    };

    return (
        <div className={`page-container ${fadeOut ? 'fade-out' : ''}`}>
            <video autoPlay loop muted className={"background-video"}>
                <source src="/background.mp4" type="video/mp4"/>
            </video>
            <div className={"overlay"}/>
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    zIndex: "1",
                }}
            >
                <Box
                    component="form"
                    sx={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "3ch",
                        width: "45ch",
                        p: 3,
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        border: "2px rgba(255, 255, 255, 0.1) solid",
                        backdropFilter: "blur(8px)",
                        zIndex: "2",
                        borderRadius: "1ch",
                        transition: "opacity 0.3s, visibility 0.3s",
                        opacity: showColorSelection ? 0 : 1,
                        visibility: showColorSelection ? "hidden" : "visible",
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <img className={"logo"} src={"/logo.svg"} alt="Logo"/>
                    <Box sx={{display: "flex", gap: "10px", zIndex: "1", width: "100%"}}>
                        <TextField
                            label="Enter Lobby Code"
                            variant="outlined"
                            value={code}
                            fullWidth
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleJoin}>
                            Join
                        </Button>
                    </Box>
                    <Button variant="text" onClick={startCreate}>
                        Create Lobby
                    </Button>
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "5ch",
                        zIndex: "1",
                        width: "70%",
                        maxWidth: "1000px",
                        borderRadius: "1ch",
                        transition: "opacity 0.5s 0.5s, visibility 0.5s 0.5s",
                        opacity: showColorSelection ? 1 : 0,
                        visibility: showColorSelection ? "visible" : "hidden",
                    }}
                >
                    <img src={"/choose-color.svg"} alt="choose color" style={{width: "80%", padding: "6ch"}}/>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-evenly",
                            gap: "2ch",
                            zIndex: "1",
                            width: "100%",
                            borderRadius: "1ch",
                        }}
                    >
                        <ColorChooserBox src="./color-pick-white.svg" color="white"
                                         onClick={() => createLobby("white")}/>
                        <ColorChooserBox src="/color-pick-black.svg" color="black"
                                         onClick={() => createLobby("black")}/>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

export default HomePage;
