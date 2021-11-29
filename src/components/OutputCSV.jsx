import { useState } from "react";
import { saveAs } from "file-saver";

function OutputCSV() {
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [inputPrefix, setInputPrefix] = useState("");
  const [objectPrefix, setObjectPrefix] = useState("");
  const handleDownload = (ext) => {
    let splitSig;
    switch (ext) {
      case "csv":
        splitSig = ",";
        break;
      case "txt":
        splitSig = "\t";
        break;
      default:
        throw new Error("Invalid type");
    }

    let result = "Audio File" + splitSig + "Object Path\n";
    for (let i = 0; i < multipleFiles.length; i++) {
      const filename = multipleFiles[i].name;
      const absPath = inputPrefix + filename;
      const objectPath =
        objectPrefix +
        filename.split("_").slice(0, -1).join("_") +
        "\\<Sound SFX>" +
        filename;
      result += absPath + splitSig + objectPath + "\n";
    }
    let blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `export.${ext}`);
  };
  return (
    <div className="app">
      <h3>Output Tab Delimited Text Files For Wwise</h3>
      <input
        id="fileInput"
        type="file"
        multiple
        onChange={(e) => setMultipleFiles(e.target.files)}
      />
      <br />
      <br />
      <input type="text" onChange={(e) => setInputPrefix(e.target.value)} />
      <br />
      <br />
      <input type="text" onChange={(e) => setObjectPrefix(e.target.value)} />
      <br />
      <br />
      <div className="btn-group">
        <button onClick={() => handleDownload("csv")}>Download CSV</button>
        <button onClick={() => handleDownload("txt")}>Download TXT</button>
      </div>
    </div>
  );
}

export default OutputCSV;
