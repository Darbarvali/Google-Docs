import React, { useEffect, useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import App from "./App";
import Google from "./images/google.png";

function Main() {
  const [value, setValue] = useState("");
  const handleClick = () => {
    signInWithPopup(auth, provider).then((data) => {
      setValue(data.user.email);
      localStorage.setItem("email", data.user.email);
    });
  };

  useEffect(() => {
    setValue(localStorage.getItem("email"));
  });

  return (
    <div>
      <div>
        {value ? (
          <App />
        ) : (
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 16px",
              backgroundColor: "#fff",
              color: "#737373",
              marginTop: "20%",
              marginLeft: "44%",
              border: "1px solid #737373",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
            }}
            onClick={handleClick}
          >
            <img
              src={Google}
              alt="Google Icon"
              style={{ marginRight: "8px", width: "20px" }}
            />
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}

export default Main;
