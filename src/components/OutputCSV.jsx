import { useState } from "react";
import { saveAs } from "file-saver";

function OutputCSV() {
  const [multipleFiles, setMultipleFiles] = useState([]);
  const handleData = (result) => {
    const lines = result.split("\n");

    const titles = lines[0];

    const radios = [];

    // splits logic
    let tmp = [],
      adjust = false,
      baseTime;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().length === 0) continue;
      const phrases = lines[i].split(",");
      if (phrases[0].endsWith(".m")) {
        // xxx.m.mov
        if (tmp.length !== 0) {
          radios.push(tmp);
          tmp = [];
          adjust = true;
          baseTime = Number.parseFloat(phrases[1]);
        }
      } else {
        if (adjust) {
          phrases[1] = "" + Number.parseFloat(phrases[1]) - baseTime;
        }
        tmp.push(phrases.join(","));
      }
    }
    if (tmp.length !== 0) {
      radios.push(tmp);
      tmp = [];
    }

    let ans = "";
    ans += titles + "\n";
    for (let i = 0; i < radios.length; i++) {
      ans += radios[i].join("\n") + "\n\n";
    }

    let blob = new Blob([ans], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `export.csv`);
  };
  const handleDownload = (ext) => {
    if (multipleFiles.length === 0) {
      alert("No files selected");
      return;
    }
    const file = multipleFiles[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      handleData(data);
    };
    reader.readAsText(file);
  };
  return (
    <div className="app">
      <h3>Output Csv</h3>
      <input
        id="fileInput"
        type="file"
        multiple
        onChange={(e) => setMultipleFiles(e.target.files)}
      />
      <div className="line">
        <button onClick={handleDownload}>Submit</button>
      </div>
    </div>
  );
}

export default OutputCSV;
