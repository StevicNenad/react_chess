import { Box, TextField, Button, Container, Typography } from "@mui/material";
import { useState } from "react";
import { nanoid } from "nanoid";
import Cookies from "js-cookie";

const LandingPage = () => {
  const [code, setCode] = useState("");
  const [showColorSelection, setShowColorSelection] = useState<Boolean>(false);

  const handleJoin = () => {
    // handle joining the game with the code
  };

  const handleCreate = () => {
    let userID = Cookies.get("userID"); // Check if the userID cookie exists
    if (!userID) {
      userID = nanoid(); // Generate a new user ID
      Cookies.set("userID", userID); // Save the user ID to a cookie
    }
    const lobbyCode = nanoid(8);
    setShowColorSelection(true);
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video
        autoPlay
        loop
        muted
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: "-1",
        }}
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: "0",
        }}
      />
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3ch",
            width: "45ch",
            p: 3,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            zIndex: "1",
            borderRadius: "1ch",
            transition: "opacity 0.3s",
            opacity: showColorSelection ? 0 : 1,
            visiblity: showColorSelection ? "hidden" : "visible",
          }}
          noValidate
          autoComplete="off"
        >
          <img
            src={"/logo.svg"}
            alt="Logo"
            style={{ width: "80%", padding: "6ch" }}
          />
          <Box
            sx={{ display: "flex", gap: "10px", zIndex: "1", width: "100%" }}
          >
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
          <Button variant="text" onClick={handleCreate}>
            Create Lobby
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: "1",
            borderRadius: "1ch",
            transition: "opacity 0.5s 0.5s",
            opacity: showColorSelection ? 1 : 0,
            visiblity: showColorSelection ? "visible" : "hidden",
          }}
        >
          <img
            src={"/choose-color.svg"}
            alt="choose color"
            style={{ width: "80%", padding: "6ch" }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              zIndex: "1",
              borderRadius: "1ch",
            }}
          >
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3ch",
                width: "45ch",
                p: 3,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                zIndex: "1",
                borderRadius: "1ch",
              }}
              noValidate
              autoComplete="off"
            >
              <Button variant="contained" onClick={handleJoin}>
                Join
              </Button>
            </Box>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3ch",
                width: "45ch",
                p: 3,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                zIndex: "1",
                borderRadius: "1ch",
              }}
              noValidate
              autoComplete="off"
            >
              <Button variant="contained" onClick={handleJoin}>
                Join
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default LandingPage;
