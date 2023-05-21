import React from "react";
import "./index.css";
import { render } from "react-dom";
import Main from "./Main";

render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById("root")
);
