import {Box, Button, Container, TextField} from "@mui/material";
import {useState} from "react";
import {nanoid} from "nanoid";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./HomePage.style.scss";
import ColorChooserBox from "../../component/ColorChooserBox/ColorChooserBox.component";
import {getDatabase, ref, set} from "firebase/database";


const HomePage = () => {
    const [code, setCode] = useState("");
    const [showColorSelection, setShowColorSelection] = useState<Boolean>(false);
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

    const handleJoin = () => {
        // handle joining the game with the code
    };

    const createLobby = async (color: string) => {
        try {
            let userID = Cookies.get("userID");
            if (!userID) {
                userID = nanoid();
                Cookies.set("userID", userID);
            }
            const lobbyId = nanoid(8);
            const lobbyData = { [color]: userID };
            const db = getDatabase();

            await set(ref(db, "lobbies/" + lobbyId), lobbyData); // Wait for the server request to complete

            setFadeOut(true);

            setTimeout(() => {
                navigate("/lobby");
            }, 2500);
        } catch (error) {
            // Handle error, e.g., show an error message
            console.error("Error creating lobby:", error);
        }
    };

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
