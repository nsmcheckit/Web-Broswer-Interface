import { useState } from "react";
import { saveAs } from "file-saver";
import Plus from "../assets/plus.svg";

const Selector = ({ onChange }) => {
  return (
    <select className="select" onChange={onChange}>
      <option value="Physical Folder">请选择 Wwise 路径</option>
      <option value="Physical Folder">Physical Folder</option>
      <option value="Virtual Folder">Virtual Folder</option>
      <option value="Actor-Mixer">Actor-Mixer</option>
      <option value="<Random Container>">Random Container</option>
      <option value="<Sequence Container>">Sequence Container</option>
      <option value="<Switch Container>">Switch Container</option>
      <option value="<Blend Container>">Blend Container</option>
      <option value="Sound SFX">Sound SFX</option>
      <option value="Sound Voice">Sound Voice</option>
      <option value="Audio Bus">Audio Bus</option>
      <option value="Auxiliary Bus">Auxiliary Bus</option>
      <option value="Actor-Mixer Hierarchy">Actor-Mixer Hierarchy</option>
      <option value="Default Work Unit">Default Work Unit</option>
    </select>
  );
};
function OutputCSV() {
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [inputPrefix, setInputPrefix] = useState("");
  const [selectorPaths, setSelectorPaths] = useState([""]);
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
      const absPath = inputPrefix + "\\" + filename;

      let splitPrefix;
      if (filename.includes("_"))
        splitPrefix = filename.split("_").slice(0, -1).join("_");
      else splitPrefix = filename.split("-").slice(0, -1).join("-");

      const objectPath =
        "\\" +
        selectorPaths.join("\\") +
        "\\" +
        splitPrefix +
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
      <input
        type="text"
        onChange={(e) => setInputPrefix(e.target.value)}
        placeholder="请输入音频文件夹路径: "
      />
      <br />
      <br />
      <div className="selector-container">
        {selectorPaths.map((path, index) => (
          <Selector
            key={index}
            onChange={(e) => {
              let newPaths = [...selectorPaths];
              newPaths[index] = e.target.value;
              setSelectorPaths(newPaths);
            }}
          />
        ))}
        <div className="plus-icon">
          <img
            src={Plus}
            alt="plus"
            width={30}
            height={30}
            onClick={() => setSelectorPaths([...selectorPaths, ""])}
          />
        </div>
      </div>
      <div className="live-text">
        {"\\" + selectorPaths.join("\\") + "\\xxx.wav"}
      </div>
      <div className="btn-group">
        <button onClick={() => handleDownload("csv")}>Download CSV</button>
        <button onClick={() => handleDownload("txt")}>Download TXT</button>
      </div>
    </div>
  );
}

export default OutputCSV;
