import { Box, TextField, Button, Container, Typography } from "@mui/material";
import { useState } from "react";

const LandingPage = () => {
  const [code, setCode] = useState("");

  const handleJoin = () => {
    // handle joining the game with the code
  };

  const handleCreate = () => {
    // handle creating a new game
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
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
          zIndex: "1"
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
            p: 3, // padding
            bgcolor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px)",
            zIndex: "1",
            borderRadius: "1ch",
          }}
          noValidate
          autoComplete="off"
        >
          <img
            src={"/logo.svg"}
            alt="Logo"
            style={{ width: "80%", padding: "3ch" }}
          />
          <Box
            sx={{ display: "flex", gap: "10px", zIndex: "1", width: "100%" }}
          >
            <TextField
              label="Enter Game Code"
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
      </Container>
    </div>
  );
};

export default LandingPage;
