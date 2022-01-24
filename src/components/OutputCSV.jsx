import { useState } from "react";
import { saveAs } from "file-saver";
import { flattenDeep } from "lodash";
import { getNowDate } from "../utils/time";
import { getHLine } from "../utils/HLine";
import { alphabetMap } from "../const/alphabet";

function OutputCSV() {
  const [multipleFiles, setMultipleFiles] = useState([]);

  const [audioFiles, setAudioFiles] = useState([]);
  const [sfxObjectPath, setSFXObjectPath] = useState("");
  const [effObjectPath, setEFFObjectPath] = useState("");
  const [folObjectPath, setFOLObjectPath] = useState("");
  const [hitObjectPath, setHITObjectPath] = useState("");
  const [animMontagePath, setAnimMontagePath] = useState("");
  const [audioFilesFolder, setAuidoFilesFolder] = useState("");

  const handleData = (result) => {
    let audioFilesTextures = [];
    for(const file of audioFiles) {
      const filenameSplit = file.name.split('.');
      const filename = filenameSplit.slice(0, filenameSplit.length - 1).join('.')
      const filenameSplits = filename.split('_');

      let number = -1;
      try {
        number = Number.parseInt(filenameSplits[filenameSplits.length - 1]);
      }catch(e) {}

      audioFilesTextures.push({
        filename, 
        red: filenameSplits[1],
        name: isNaN(number) ? filenameSplits[filenameSplits.length - 1] :  filenameSplits[filenameSplits.length - 2],
        number: isNaN(number) ? NaN: (number < 10 ? `0${number}`: `${number}`),
        purple: filenameSplits[2],
        green: filenameSplits[3],
      });
    }

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

    const HLine = getHLine(result);
    const outputDatas = HLine.map((hdata) => {
      const splits = hdata.split('_');
      const filteredAudioFiles = audioFilesTextures.filter(audioFile => 
        // SFX 01 
        audioFile.green + alphabetMap[audioFile.purple] ===  splits[0]
        && audioFile.red === splits[splits.length - 1]
      )

      const ans = []
      for(let i = 0; i < filteredAudioFiles.length; i++) {
        const audioFileTexture = filteredAudioFiles[i].filename
        const filename = audioFileTexture.split("\\").pop(); 
        const filenameSplits = filename.split('_')
        const secondLast = '<Random Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_')
        ans.push({
          AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
          ObjectPath:
            getObjectPath(hdata) + hdata + 
              (!isNaN(filteredAudioFiles[i].number) ? ("\\" + secondLast): '')
              + "\\" + filename,
        })
      }
      return ans.length === 0 ? [
        {
          AudioFile: '',
          ObjectPath:
            getObjectPath(hdata) + hdata + "\\<Random Container>\\",
        }
      ]: ans
    });

    const outputData = flattenDeep(outputDatas);
    // keep unique
    const bitmap = {};
    let whitespace = undefined;
    const outputText =
      "AudioFile, ObjectPath, Object Type, Switch Assignation\n" +
      flattenDeep(
        flattenDeep(outputData
        .map((item) => {
          if(item.ObjectPath.includes('<Random Container>')) {
            const firstLine = `${item.AudioFile}, ${item.ObjectPath}, Sound SFX,`
            const objPathArr = item.ObjectPath.split('\\');
            const secondLine = `${item.AudioFile}, ${objPathArr.slice(0, objPathArr.length - 1).join('\\')}, , <Switch Group:Sound_Style>`
            return [firstLine, secondLine];
          }
          return `${item.AudioFile}, ${item.ObjectPath}, , <Switch Group:Sound_Style>`
        }))
        .filter((item) => {
          if(item.includes('<Switch Group:Sound_Style>')) {
            const key = item.split(',')[1].trim();
            if(bitmap[key]) return false;
            bitmap[key] = true;
            return true;
          }
          return true;
        })
        // whitespace
        .map((line) => {
          const splits = line.split(',');
          let compareWhitespace = undefined;
          if(splits[0].trim().length > 0) {
            const sectionWord = splits[1].split(',').find(word => word.includes('<Random Container>'))
            if(sectionWord) {
              const randomContainerWord = sectionWord.split('\\').find(word => word.includes('<Random Container>'));
              compareWhitespace = randomContainerWord;
            }
          }
          if(splits[0].trim().length === 0 && whitespace !== undefined) {
            whitespace = undefined;
            return [',,,', line];
          } else if(whitespace !== compareWhitespace) {
            whitespace = compareWhitespace;
            return [',,,', line];
          } else {
            return line;
          }
        })
      )
        .join("\n");

    let blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `export.csv`);
  };
  const handleOutputCsv = (ext) => {
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

  const handleOutputData = (data) => {
    const nowDate = getNowDate();
    const HLine = getHLine(data);
    const HLineMap = {};
    const HLineObject = HLine.map(line => ({
      NotifyTrackName: `Audio_${line.split(/\d+/)[0]}`,
      AudioEventName: line,
    }))
    HLineObject.forEach(obj => HLineMap[obj.NotifyTrackName] 
        ? HLineMap[obj.NotifyTrackName].push(obj.AudioEventName)
        : HLineMap[obj.NotifyTrackName] = [obj.AudioEventName]);
    
    const NotifyTrack = [];
    for(const NotifyTrackName in HLineMap) {
      const AudioEventNames = HLineMap[NotifyTrackName];
      NotifyTrack.push({
        NotifyTrackName,
        AudioEventParam: AudioEventNames.map(x => ({AudioEventName: x}))
      })
    }


    const Data = data.split('\n')
      .slice(0, data.split('\n').length - 1)
      .map(line => line.split(',')[0])
      .filter(x => x && x.length > 0)
      .map(anim => ({
        AnimMontagePath: `Animation Montage'${animMontagePath}/${anim}.${anim}'`,
        NotifyTrack: NotifyTrack.map(x => ({
          ...x,
          AudioEventParam: x.AudioEventParam.filter(y => y
            .AudioEventName.includes(
              anim.split('_')
              .slice(1)
              .join('_')))
        })),
      }))
    
    const outputJson = {
      Time: nowDate,
      Data,
    }
    
    let blob = new Blob([JSON.stringify(outputJson)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `export.json`);
  }
  const handleOutputJson = (ext) => {
    if (multipleFiles.length === 0) {
      alert("No files selected");
      return;
    }
    const file = multipleFiles[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      handleOutputData(data);
    };
    reader.readAsText(file);
  }
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
        onChange={(e) => setAuidoFilesFolder(e.target.value)}
        placeholder="请输入Audio Files文件夹路径: "
      />
      <br />
      <br />
      请输入Audio Files路径: &nbsp;&nbsp;
      <input
        id="fileInput"
        type="file"
        multiple
        onChange={(e) => setAudioFiles(e.target.files)}
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
      <input
        type="text"
        onChange={(e) => setAnimMontagePath(e.target.value)}
        placeholder="请输入Anim Montage Path路径: "
      />
      <div className="line">
        <button style={{marginRight: '20px'}} onClick={handleOutputCsv}>Output Csv</button>
        <button onClick={handleOutputJson}>Output Json</button>
      </div>
    </div>
  );
}

export default OutputCSV;
