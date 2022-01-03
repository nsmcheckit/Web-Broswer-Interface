import { useState } from "react";
import { saveAs } from "file-saver";

// AM_Hero301_Atk_BranchAttack_00 => Hero301_Atk_BranchAttack_00
const handlePrefix = (texture) => {
  const splitArray = texture.split("_");
  splitArray.shift();
  return splitArray.join("_");
};

// transform {SFX: '3', FOL: '2'} to [SFX01, SFX02, SFX03, FOL01, FOL02]
const transformPrefixTexture = (textureObj) => {
  const trailingTextures = [];
  for (let title in textureObj) {
    let value = textureObj[title];

    let valueNumber = 0;
    try {
      valueNumber = Number.parseInt(value);
    } catch (e) {}

    for (let i = 1; i <= valueNumber; i++) {
      const valueNumberTexture = i < 10 ? `0${i}` : `${i}`;
      trailingTextures.push(title + valueNumberTexture);
    }
  }
  return trailingTextures;
};

function OutputCSV() {
  const [multipleFiles, setMultipleFiles] = useState([]);

  const [audioFiles, setAudioFiles] = useState("");
  const [sfxObjectPath, setSFXObjectPath] = useState("");
  const [effObjectPath, setEFFObjectPath] = useState("");
  const [folObjectPath, setFOLObjectPath] = useState("");
  const [hitObjectPath, setHITObjectPath] = useState("");

  const handleData = (result) => {
    const lines = result.split("\n");

    const data = lines
      .map((line) => line.split(",").map((item) => item.trim()))
      .filter((line) => line.length > 2);
    const titles = data.shift();

    // Signals Data Structure
    // ex: {title: 'SFX', columnIndex: 2}
    const prefixSignals = titles
      .map((title, columnIndex) => ({ title, columnIndex }))
      .filter((obj) => obj.columnIndex > 1 && obj.title !== "");

    const dataSignals = prefixSignals.map((signal) => {
      const { title, columnIndex } = signal;
      return {
        title,
        data: data.map((line) => ({
          value: line[columnIndex],
          trailingTexture: handlePrefix(line[0]) + "_" + line[1],
        })),
      };
    });

    const dataTextureObjs = dataSignals.map((signal) => {
      const { title, data } = signal;
      return {
        title,
        data: data.map(({ value, trailingTexture }) => {
          let valueNumber = 0;
          try {
            valueNumber = Number.parseInt(value);
          } catch (err) {}

          const textures = [];
          for (let i = 1; i <= valueNumber; i++) {
            const valueNumberTexture = i < 10 ? `0${i}` : `${i}`;
            textures.push(title + valueNumberTexture + "_" + trailingTexture);
          }
          return textures;
        }),
      };
    });

    const HLine = dataTextureObjs
      .reduce((prev, cur) => [...prev, ...cur.data], [])
      .reduce((prev, cur) => [...prev, ...cur], []);

    const paths = {
      SFX: sfxObjectPath,
      FOL: folObjectPath,
      EFF: effObjectPath,
      HIT: hitObjectPath,
    };

    const getObjectPath = (text) => {
      for (const key in paths) {
        if (text.toUpperCase().includes(key.toUpperCase())) return paths[key];
      }
      return "";
    };

    const outputData = HLine.map((hdata) => ({
      AudioFile: audioFiles,
      ObjectPath:
        getObjectPath(hdata) + hdata + "\\" + audioFiles.split("\\").pop(),
    }));

    const outputText =
      "AudioFile, ObjectPath\n" +
      outputData
        .map((item) => `${item.AudioFile}, ${item.ObjectPath}`)
        .join("\n");

    let blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
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
      <br />
      <br />
      <input
        type="text"
        onChange={(e) => setAudioFiles(e.target.value)}
        placeholder="请输入Audio Files路径: "
      />
      <br />
      <br />
      <input
        type="text"
        onChange={(e) => setSFXObjectPath(e.target.value)}
        placeholder="请输入SFX Object Path路径: "
      />
      <br />
      <br />
      <input
        type="text"
        onChange={(e) => setFOLObjectPath(e.target.value)}
        placeholder="请输入FOL Object Path路径: "
      />
      <br />
      <br />
      <input
        type="text"
        onChange={(e) => setEFFObjectPath(e.target.value)}
        placeholder="请输入EFF Object Path路径: "
      />
      <br />
      <br />
      <input
        type="text"
        onChange={(e) => setHITObjectPath(e.target.value)}
        placeholder="请输入HIT Object Path路径: "
      />
      <br />
      <br />
      <div className="line">
        <button onClick={handleDownload}>Submit</button>
      </div>
    </div>
  );
}

export default OutputCSV;
