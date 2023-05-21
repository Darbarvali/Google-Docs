import "./styles.css";
import React, { useState, useEffect } from "react";
import { ContentState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Editor } from "react-draft-wysiwyg";
import { auth } from "./firebase";
import CustomScrollbar from "./CustomScrollbar";
import Calender from "./images/calender.png";
import Keep from "./images/keep.png";
import Contact from "./images/contact.png";
import Maps from "./images/maps.png";
import Download from "./images/download.png";
import Message from "./images/message.png";
import Lock from "./images/lock.png";
import Meet from "./images/Screenshot_2023-05-19_214832-removebg-preview.png";
import firebase from "firebase/compat/app";
import Texteditor from "./Texteditor";

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isStarred, setIsStarred] = useState(false);

  const handleStarClick = () => {
    setIsStarred(!isStarred);
  };

  // Handle window resize event
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to handle button click and toggle the popup state
  const handleButtonClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const [inputValue, setInputValue] = useState("Untitled Document");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = () => {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        setUser(currentUser);
        console.log("User:", currentUser);
        console.log("User Name:", currentUser.displayName);
        console.log("User Email:", currentUser.email);
      } else {
        console.log("User not signed in");
      }
    };

    // Subscribe to authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup the subscription
    return () => unsubscribe();

    // Fetch user data after subscribing to auth state changes
    fetchUserData();
  }, []);

  // Create ContentState for text editor
  const _contentState = ContentState.createFromText("Type @ to insert");
  const raw = convertToRaw(_contentState); // RawDraftContentState JSON
  const [contentState, setContentState] = useState(raw); // ContentState JSON

  return (
    <div>
      <header className="flex justify-between items-center p-2 ml-1 pd-1">
        {/* Render a file icon */}
        <i class="fa-solid fa-file-lines fa-3x" style={{ color: "#186bfb" }} />

        <div className="flex-grow px-2">
          <div className="flex items-center text-lg space-x-1">
            {/* Input field */}
            <input
              className="input"
              type="text"
              style={{ width: "200px" }}
              value={inputValue}
              onChange={handleInputChange}
            />
            {/* Star button */}
            <button className="pl-10" onClick={handleStarClick}>
              <i
                className={`fa-regular fa-star fa-1.5xl options ${
                  isStarred
                    ? "fas text-blue bg-blue"
                    : "fa-regular text-gray-500"
                }`}
              ></i>
            </button>
          </div>
          <div className="flex items-center text-lg space-x-1 -ml-1 h-5 text-grey-600 mt-1 menu1">
            {/* Menu options */}
            <p className="option">File</p>
            <p className="option">Edit</p>
            <p className="option">View</p>
            <p className="option">Insert</p>
            <p className="option">Format</p>
            <p className="option">Tools</p>
            <p className="option">Extensions</p>
            <p className="option">Help</p>
          </div>
        </div>

        <div class="hover-container">
          {/* Message icon */}
          <img src={Message} className=" hover-button message options" />
          <span class="hover-text">Open Comment History</span>
        </div>
        <div class="hover-container">
          {/* Meet icon */}
          <img src={Meet} className=" hover-button top options" />
          <span class="hover-text">
            Join a call or present this tab to a call
          </span>
        </div>
        <button
          onClick={handleButtonClick}
          class="hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4  rounded-full shadow lock"
        >
          <div class="flex items-center">
            {/* Lock icon */}
            <img src={Lock} class="w-7 h-7 mr-2" />
            <span className="share-text">Share</span>
          </div>
        </button>

        {/* Render the popup if it's open */}
        {isPopupOpen && (
          <div className="popup" style={{ top: `${windowHeight / 2}px` }}>
            {/* Content of the popup */}
            <div className="header1">
              <h1>Name before sharing</h1>
              <button onClick={handleButtonClick}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <p>Give your Untitled document a name before it's shared:</p>
            <input
              className="input"
              type="text"
              style={{ width: "100%", padding: "2% 5%" }}
              value={inputValue}
              onChange={handleInputChange}
            />
            <div className="combin">
              <button class="hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 shadow skip">
                Skip
              </button>
              <button class="text-gray-800 font-semibold py-2 px-4 border border-gray-400 shadow save">
                Save
              </button>
            </div>
          </div>
        )}
        {isPopupOpen && (
          <div className="overlay" onClick={handleButtonClick}></div>
        )}

        <button class="photo options">
          {user ? (
            <div>
              <div class="hover-container">
                <button class="hover-button">
                  <img src={user.photoURL} alt="Profile" />
                </button>
                <span class="google-text google mb-0">
                  Google Account
                  <h2 className="text-gray-300 font-bold ">
                    {user.displayName}
                  </h2>
                  <p className="text-gray-300 ">{user.email}</p>
                </span>
              </div>
            </div>
          ) : (
            <p></p>
          )}
        </button>
      </header>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-11 ">
          <Texteditor />
        </div>
        <div className="col-span-1 ">
          <div className="sidebar">
            <div class="hover-container">
              <a
                className="hover-button"
                href="https://calendar.google.com/calendar/u/0/r"
              >
                <img src={Calender} className="image options" alt="Calendar" />
              </a>
              <span class="hover-text">Calender</span>
            </div>
          </div>
          <div>
            <div class="hover-container">
              <a class="hover-button" href="https://keep.google.com/u/0/">
                <img src={Keep} className="image options" />
              </a>
              <span class="hover-text">Keep</span>
            </div>
          </div>

          <div>
            <div class="hover-container">
              <a
                class="hover-button"
                href="https://developers.google.com/tasks"
              >
                <img src={Download} className="image options" />
              </a>
              <span class="hover-text">Tasks</span>
            </div>
          </div>
          <div>
            <div class="hover-container">
              <a class="hover-button" href="https://contacts.google.com/">
                <img src={Contact} className="image options" />
              </a>
              <span class="hover-text">Contacts</span>
            </div>
          </div>
          <div>
            <div class="hover-container">
              <a class="hover-button" href="https://maps.google.com/">
                <img src={Maps} className="image options" />
              </a>
              <span class="hover-text">Maps</span>
            </div>

            <div class="hover-container">
              <a class="hover-btn hover-button">
                <i class="fa-solid fa-plus fa-2xl options"></i>
              </a>
              <span class="hover-text">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
