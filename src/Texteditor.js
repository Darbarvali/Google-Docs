import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBindingContentState,
  convertToRaw,
  convertFromRaw,
  Modifier,
  SelectionState,
  ContentState,
} from "draft-js";

import createUndoPlugin from "draft-js-undo-plugin";
import "draft-js-undo-plugin/lib/plugin.css";
import "./texteditor.css";
import "draft-js/dist/Draft.css";
import CustomScrollbar from "./CustomScrollbar";

function Texteditor() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  const initialContent = "Type @ to insert";
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(
      EditorState.createEmpty()
        .getCurrentContent()
        .merge(ContentState.createFromText(initialContent))
    )
  );

  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { UndoButton, RedoButton } = createUndoPlugin();
  const editorRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const colorPickerRef = useRef(null);
  const handleUndo = () => {
    const newEditorState = EditorState.undo(editorState);
    setEditorState(newEditorState);
  };
  const toggleOptionMenu = () => {
    setShowMoreOptions(!showMoreOptions);
  };

  const handleRedo = () => {
    const newEditorState = EditorState.redo(editorState);
    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };
  const toggleInlineStyle = (inlineStyle) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };
  const [isStarred, setIsStarred] = useState(false);

  const handleStarClick = () => {
    setIsStarred(!isStarred);
  };

  const handlePrint = () => {
    const editorContent = editorRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
            <html>
              <head>
                <title>Print</title>
              </head>
              <body>
                ${editorContent}
              </body>
            </html>
          `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleZoomChange = (event) => {
    const newZoomLevel = parseFloat(event.target.value);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomIn = () => {
    setZoomLevel(zoomLevel + 0.1);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.1) {
      setZoomLevel(zoomLevel - 0.1);
    }
  };
  const zoomStyles = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: "top left",
  };
  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    switch (type) {
      case "normal-text":
        return "normal-text";
      case "title-text":
        return "title-text";
      case "subtitle-text":
        return "subtitle-text";
      case "header-one":
        return "header-one";
      case "header-two":
        return "header-two";
      case "header-three":
        return "header-three";
      default:
        return null;
    }
  };

  const handleDropdownChange = (event) => {
    const style = event.target.value;
    setEditorState(RichUtils.toggleBlockType(editorState, style));
  };

  const fontOptions = [
    "Arial",
    "Times New Roman",
    "Courier New",
    // Add more font options as needed
  ];

  const toggleFontStyle = useCallback(
    (fontName) => {
      setEditorState(
        RichUtils.toggleInlineStyle(editorState, "FONT-" + fontName)
      );
    },
    [editorState]
  );

  const handleFontChange = (e) => {
    const selectedFont = e.target.value;
    toggleFontStyle(selectedFont);
  };

  const currentStyle = editorState.getCurrentInlineStyle();
  const handleFontSizeChange = (fontSize) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    const nextEditorState = currentStyle.reduce((state, style) => {
      if (style.startsWith("fontsize-")) {
        return RichUtils.toggleInlineStyle(state, style);
      }
      return state;
    }, editorState);

    setEditorState(
      RichUtils.toggleInlineStyle(nextEditorState, `fontsize-${fontSize}`)
    );
  };

  const increaseFontSize = () => {
    const currentFontSize = getCurrentFontSize();
    if (currentFontSize < 45) {
      handleFontSizeChange(currentFontSize + 1);
    }
  };

  const decreaseFontSize = () => {
    const currentFontSize = getCurrentFontSize();
    if (currentFontSize > 10) {
      handleFontSizeChange(currentFontSize - 1);
    }
  };
  const getCurrentFontSize = () => {
    const currentStyle = editorState.getCurrentInlineStyle();
    const fontSizeStyle = currentStyle.find((style) =>
      style.startsWith("fontsize-")
    );
    if (fontSizeStyle) {
      return parseInt(fontSizeStyle.split("-")[1], 10);
    }
    return 18; // Default font size
  };

  const fontSizeStyles = {
    fontSize: `${getCurrentFontSize()}px`,
  };
  const handleBoldClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
  };
  const handleItalicClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
  };
  const handleColorPickerToggle = () => {
    setColorPickerVisible(!colorPickerVisible);
  };
  const handleTextColorChange = (color) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    const selection = editorState.getSelection();
    const nextContentState = currentStyle.reduce((contentState, style) => {
      if (style.startsWith("color-")) {
        contentState = Modifier.removeInlineStyle(
          contentState,
          selection,
          style
        );
      }
      return contentState;
    }, editorState.getCurrentContent());

    const contentStateWithColor = Modifier.applyInlineStyle(
      nextContentState,
      selection,
      `color-${color}`
    );
    const nextEditorState = EditorState.push(
      editorState,
      contentStateWithColor,
      "change-inline-style"
    );
    setEditorState(nextEditorState);
  };

  const colorPickerStyle = {
    zIndex: "999",

    marginTop: "5px",
    display: colorPickerVisible ? "block" : "none",
  };
  const handleShareClick = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const contentAsText = JSON.stringify(rawContentState);
    console.log(contentAsText);
  };

  const handleColorPickerChange = (e) => {
    const color = e.target.value;
    handleTextColorChange(color);
  };
  const handleToggleOption = (tool) => {
    const newState = RichUtils.toggleInlineStyle(editorState, tool);
    setEditorState(newState);
    setShowMoreOptions(false);
  };

  return (
    <div className="texteditor">
      <div className="bar flex  items-center p-2 ml-1 pd-1 rounded-full">
        <div class="hover-container">
          <button class="hover-button design5 options" onClick={handleUndo}>
            {" "}
            <i class="fas fa-rotate-left"></i>
          </button>

          <span class="hover-text">Undo(Ctrl+Z)</span>
        </div>
        <div class="hover-container">
          <button class="hover-button design5 options" onClick={handleRedo}>
            <i class="fas fa-rotate-right" />
          </button>
          <span class="hover-text">Redo (Ctrl+Y)</span>
        </div>
        <div class="hover-container">
          <button class="hover-button design5 options" onClick={handlePrint}>
            {" "}
            <i class="fas fa-print"></i>
          </button>
          <span class="hover-text">Print (Ctrl+P)</span>
        </div>
        <div class="hover-container">
          <i class=" hover-button fas fa-spell-check design5 options"></i>
          <span class="hover-text">
            {" "}
            Spelling and Grammer Check (Ctrl+Alt+X)
          </span>
        </div>
        <div class="hover-container">
          <i class=" hover-button fas fa-paint-roller design5 options"></i>
          <span class="hover-text">Paint Format</span>
        </div>
        <div class="hover-container">
          <select
            className="hover-button dropDown design5 options"
            value={zoomLevel}
            onChange={handleZoomChange}
          >
            <option value={1}>100%</option>
            <option value={0.9}>90%</option>
            <option value={0.8}>80%</option>
          </select>
          <span class="hover-text">Zoom</span>
        </div>
        <div className="vertical-line "></div>
        <div class="  hover-container">
          <select
            className=" hover-button dropDown design options mobileview1 "
            onChange={handleDropdownChange}
          >
            <option value="normal-text">Normal Text</option>
            <option value="title-text">Title</option>
            <option value="subtitle-text">Subtitle</option>
            <option value="header-one">H1</option>
            <option value="header-two">H2</option>
            <option value="header-three">H3</option>
          </select>
          <span class="hover-text">Styles</span>
        </div>
        <div className="vertical-line mobileview1 "></div>
        <div class="  hover-container">
          <select
            className="hover-button dropDown1 options mobileview1 "
            value={
              currentStyle.has("FONT")
                ? currentStyle
                    .filter((style) => style.startsWith("FONT-"))
                    .first()
                : ""
            }
            onChange={handleFontChange}
          >
            <option value="">Open ...</option>
            {fontOptions.map((fontName, index) => (
              <option key={index} value={fontName}>
                {fontName}
              </option>
            ))}
          </select>
          <span class="hover-text">Font</span>
        </div>
        <div className="vertical-line mobileview1"></div>
        <div class="  hover-container mobileview1">
          <button
            className=" hover-button design1 options "
            onClick={increaseFontSize}
          >
            <i class="fa-solid fa-plus"></i>
          </button>
          <span class="hover-text ">Decrease Font Size</span>
        </div>
        <div>
          <button className=" fontsizedeign design options mobileview1">
            {getCurrentFontSize()}px
          </button>
        </div>
        <div class="  hover-container mobileview1 ">
          <button
            className=" hover-button design2 options"
            onClick={decreaseFontSize}
          >
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="hover-text">Increase Font Size</span>
        </div>
        <div className="vertical-line mobileview1"></div>
        <div class="  hover-container mobileview">
          <button
            className=" hover-button design4 options "
            onClick={handleBoldClick}
          >
            <i class=" fa-solid fa-b"></i>
          </button>{" "}
          <span class="hover-text">Bold (Ctrl+B)</span>
        </div>
        <div class="  hover-container mobileview">
          <button
            className=" hover-button design4 options"
            onClick={handleItalicClick}
          >
            <i class="fa-solid fa-italic"></i>
          </button>
          <span class="hover-text">Italic (Ctrl+I)</span>
        </div>
        <div class="  hover-container mobileview">
          <button
            className=" hover-button design4 options"
            onClick={() => toggleInlineStyle("UNDERLINE")}
          >
            <i class="fas fa-underline"></i>
          </button>
          <span class="hover-text">Underline (Ctrl+U)</span>
        </div>{" "}
        <div class="  hover-container mobileview">
          <button
            className=" hover-button design4 options"
            onClick={handleColorPickerToggle}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <i class="fa-solid fa-a fa-2l"></i>
            <i class="fa-solid fa-minus fa-1l"></i>
          </button>
          <span class="hover-text">Text Color</span>
        </div>
        <div style={colorPickerStyle}>
          <input
            type="color"
            ref={colorPickerRef}
            onChange={handleColorPickerChange}
          />
        </div>
        <div className="vertical-line mobileview"></div>
        <button onClick={toggleOptionMenu} className="more-options-btn">
          <i className="design7 options" class="fas fa-ellipsis-vertical"></i>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-3 ">
          <div className="icon ">
            <div>
              <button onClick={toggleSidebar}>
                {" "}
                <i
                  onClick={handleStarClick}
                  style={{ fontSize: "25px" }}
                  class={`fas fa-list fa-1.5x  options ${
                    isStarred ? "fa-list" : "fa-arrow-left text-gray-500"
                  }`}
                ></i>
              </button>
              {sidebarVisible && <Sidebar />}
              {/* Rest of your application */}
            </div>
          </div>
        </div>
        <div className="col-span-9 ">
          <CustomScrollbar>
            <div className="scrollable-container">
              <div className="editor-class " style={fontSizeStyles}>
                <div style={zoomStyles}>
                  <div ref={editorRef}>
                    <Editor
                      editorState={editorState}
                      onChange={setEditorState}
                      handleKeyCommand={handleKeyCommand}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CustomScrollbar>
        </div>
      </div>
    </div>
  );
}
function Sidebar() {
  return (
    <div>
      <div className="container">
        <p>Suggestions</p>
        <i class="fa-solid fa-plus options"></i>
      </div>
      <hr class="border-2  black" />
      <p class="pt-10">outline</p>
      <p class="pt-5 text-gray-500">
        <em>Heading you add to the document will appear here. </em>
      </p>
    </div>
  );
}

export default Texteditor;
