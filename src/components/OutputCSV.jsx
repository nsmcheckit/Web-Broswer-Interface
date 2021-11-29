import { useState } from "react";
import { saveAs } from "file-saver";

function OutputCSV(props) {
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [inputPrefix, setInputPrefix] = useState("");
  const [objectPrefix, setObjectPrefix] = useState("");
  const handleDownload = () => {
    let result = "Audio File,Object Path\n";
    for (let i = 0; i < multipleFiles.length; i++) {
      const filename = multipleFiles[i].name;
      const absPath =
        inputPrefix + (inputPrefix.endsWith("/") ? "" : "/") + filename;
      const objectPath =
        objectPrefix +
        (objectPrefix.endsWith("/") ? "" : "/") +
        filename.split("_").slice(0, -1).join("_") +
        "/<Sound SFX>" +
        filename;
      result += absPath + "," + objectPath + "\n";
    }
    let blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "export.csv");
  };
  return (
    <div className="app">
      <h3>Output CSV</h3>
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
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

export default OutputCSV;
