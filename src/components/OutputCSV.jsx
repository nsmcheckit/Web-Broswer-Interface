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
  const [attachName,setAttachName] = useState("");//UE中AttachName
  const [sfxAkEventPath,setsfxAkEventPath] = useState("");
  const [designerName,setDesignerName] = useState("");

  //output CSV
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

      //DAW导出的文件名
      audioFilesTextures.push({
        filename,
        type:filenameSplits[0].slice(0,-2),//类型SFX，FOL，EFF，FOOT
        lay:filenameSplits[0].slice(-2),//段位：‘SFX01’中的‘01’
        match:isNaN(number) ? filenameSplits.slice(2).join("_") : filenameSplits.slice(2,-1).join("_"),//需要匹配的地方，有xxx的时候，需优化
        red:isNaN(number) ? filenameSplits[filenameSplits.length - 1]:filenameSplits[filenameSplits.length - 2],//出招表（有出招表的和伪出招表）
        number: isNaN(filenameSplits.slice(-1)) ? NaN: (number < 10 ? `0${number}`: `${number}`),
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

    //文件名和Switch Container一一对应
    const HLine = getHLine(result);
    const outputDatas = HLine.map((hdata) => {
      const splits = hdata.split('_');//hdata:Switch Container的名字
      const filteredAudioFiles = audioFilesTextures.filter(audioFile => 
        // SFX 01 
        /*
        audioFile.green + alphabetMap[audioFile.purple] ===  splits[0]
        && audioFile.red === splits[splits.length - 1]
        */
        audioFile.type + audioFile.lay === splits[0]
        && audioFile.match === splits.slice(1).join("_")

      )
      /*
      设置Object Path层级
      audioFileTexture:SFX01_xxx_Hero301_Atk_Parry_PR_01 
      filename:SFX01_xxx_Hero301_Atk_Parry_PR_ZYM_01 
      secondLast:<Random Container>SFX01_xxx_Hero301_Atk_Parry_PR_ZYM
      blendLast:<Random Container>SFX01_xxx_Hero301_Atk_Parry_PR_ZYM
      */
      const ans = []
      for(let i = 0; i < filteredAudioFiles.length; i++) {
        const audioFileTexture = filteredAudioFiles[i].filename
        const filename = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        audioFileTexture.split("\\").pop() + "_" + designerName 
        :
        audioFileTexture.split("\\").pop().split("_").slice(0,-1).join("_")
        + "_" + designerName + "_"
        + audioFileTexture.split("\\").pop().split("_").slice(-1).join("_"); 
        //audioFileTexture.split("\\").pop(); 
        const filenameSplits = filename.split('_')
        const secondLast = '<Random Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_')
        const blendLast = '<Blend Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_') 

        ans.push({
          AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
          ObjectPath:
            getObjectPath(hdata) + hdata + "\\" + 
            blendLast +
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
          //AudioFilepopwav:路径去除.wav + designerName
            //artist:YM、ZY、LZY
          if(item.ObjectPath.includes('<Random Container>')) {
            const firstLine = `${item.AudioFile}, ${item.ObjectPath}, Sound SFX,`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            const secondLine = `, ${objPathArr.slice(0, objPathArr.length - 2).join('\\')}, ,<State Group:Test_SoundStyle>${artist}`
            return [firstLine, secondLine];
          }
          else{
            const firstLine = `${item.AudioFile}, ${item.ObjectPath}, Sound SFX,`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            const secondLine = `, ${objPathArr.slice(0, objPathArr.length - 1).join('\\')}, ,<State Group:Test_SoundStyle>${artist}`
            return [firstLine, secondLine];
          }
        }))
        .filter((item) => {
          if(item.includes('<State Group:Test_SoundStyle>')) {
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
          } else {
            return line;
          }
        })
      )
        .join("\n");

    let blob = new Blob(["\ufeff"+outputText], { type: "text/plain;charset=utf-8" });
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

  //Json
  const handleOutputData = (data) => {
    const nowDate = getNowDate();
    const HLine = getHLine(data);
    const HLineMap = {};
    const HLineObject = HLine.map(line => ({
      NotifyTrackName: `Audio_${line.split(/\d+/)[0]}`,
      //AudioEventName: (line.includes("Hit") && (line.includes("Hero")))? line.slice(0,-1):line,//包括Hit并且包括Hero，因为在这种情况下没有出招表且有多余下划线
      AudioEventName: line,
    }))
    
    HLineObject.forEach(obj => HLineMap[obj.NotifyTrackName] 
        ? HLineMap[obj.NotifyTrackName].push(obj.AudioEventName)
        : HLineMap[obj.NotifyTrackName] = [obj.AudioEventName]);
    
    console.log(HLineObject);
    const NotifyTrack = [];
    for(const NotifyTrackName in HLineMap) {
      
      const upperCaseNotifyTrackName = NotifyTrackName.toUpperCase()
      if(upperCaseNotifyTrackName.includes('HIT') || upperCaseNotifyTrackName.includes("FOOT")) continue;
      const AudioEventNames = HLineMap[NotifyTrackName];
      
      
      NotifyTrack.push({
        NotifyTrackName,
        AudioEventParam: NotifyTrackName === 'Audio_SFX' ? 
        AudioEventNames.map(x => ({AudioEventName: x,AttachName: attachName,AkEventPath: sfxAkEventPath + x + "." + x,})) 
        : AudioEventNames.map(x => ({AudioEventName: x,AttachName:"",AkEventPath:"",}))//加入AttachName
      })
    }
    
    /*
    AudioEventName: 
    "SFX01_Hero301_Atk_Parry_PR"
    "SFX01_Captain_Common_Dead"
    */

    /*
    anim:
    AM_Hero301_Atk_Parry
    AM_Hero301_Atk_BranchAttack_00
    AM_Hero304_Hit_Smash

    AM_Captain_Common_Dead

    AM_Captain_Common_Hit_ExRise

    AudioEventName: 
    SFX01_Hero301_Atk_Parry_PR
    SFX01_Hero301_Atk_BranchAttack_00_PR
    SFX01_Hero304_Hit_Smash

    SFX01_Captain_Common_Dead

    SFX01_Captain_Common_Hit_ExRise
    */
    const _Data = data.split('\n')
      .slice(0, data.split('\n').length)//length - 1 ??
      .map(line => line.split(',')[0])
      .filter(x => x && x.length > 0)
      .map(anim => ({
        AnimMontagePath: `Animation Montage'${animMontagePath}/${anim}.${anim}'`,
        NotifyTrack: NotifyTrack.map(x => ({
          ...x,
          AudioEventParam:   
          (anim.includes("Hit") || !(anim.includes("Hero"))) ? //是Hit或不是主角？（这两个都没出招表）
            x.AudioEventParam
            .filter(y => (y
            .AudioEventName.split('_').slice(1).join('_'))//SFX01_Hero304_Hit_Smash -> Hero304_Hit_Smash, SFX01_Captain_Common_Dead -> Captain_Common_Dead
              ===(
              anim.split('_')
              .slice(1)
              .join('_')))
            :
            x.AudioEventParam
            .filter(y => (y
            .AudioEventName.split('_').slice(1,-1).join('_'))//SFX01_Hero301_Atk_BranchAttack_00_PR->Hero301_Atk_BranchAttack_00
              ===(
              anim.split('_')
              .slice(1)
              .join('_')))
        })),
      }))
      
    const Data = _Data.map(x => ({
      AnimMontagePath: x.AnimMontagePath,
      NotifyTrack: [
        ...x.NotifyTrack,
        {
          NotifyTrackName: 'Audio_TEST',
          AudioEventParam: [{
            AudioEventName: x.AnimMontagePath.split('.')[1].slice(0, x.AnimMontagePath.split('.')[1].length - 1)
          }]
        }
      ]
    }))
    console.log(Data);
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

  //TXT
  function handleDataTxt(result) {
    let audioFilesTextures = [];
    for(const file of audioFiles) {
      const filenameSplit = file.name.split('.');
      const filename = filenameSplit.slice(0, filenameSplit.length - 1).join('.')
      const filenameSplits = filename.split('_');

      let number = -1;
      try {
        number = Number.parseInt(filenameSplits[filenameSplits.length - 1]);
      }catch(e) {}

    //DAW导出的文件名
    audioFilesTextures.push({
      filename,
      type:filenameSplits[0].slice(0,-2),//类型SFX，FOL，EFF，FOOT
      lay:filenameSplits[0].slice(-2),//段位：‘SFX01’中的‘01’
      match:isNaN(number) ? filenameSplits.slice(2).join("_") : filenameSplits.slice(2,-1).join("_"),//需要匹配的地方，有xxx的时候，需优化
      red:isNaN(number) ? filenameSplits[filenameSplits.length - 1]:filenameSplits[filenameSplits.length - 2],//出招表（有出招表的和伪出招表）
      number: isNaN(filenameSplits.slice(-1)) ? NaN: (number < 10 ? `0${number}`: `${number}`),
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
        audioFile.type + audioFile.lay === splits[0]
        && audioFile.match === splits.slice(1).join("_")
      )

      const ans = []
      for(let i = 0; i < filteredAudioFiles.length; i++) {
        const audioFileTexture = filteredAudioFiles[i].filename
        const filename = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        audioFileTexture.split("\\").pop() + "_" + designerName 
        :
        audioFileTexture.split("\\").pop().split("_").slice(0,-1).join("_")
        + "_" + designerName + "_"
        + audioFileTexture.split("\\").pop().split("_").slice(-1).join("_"); 
        //audioFileTexture.split("\\").pop(); 
        const filenameSplits = filename.split('_')
        const secondLast = '<Random Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_')
        const blendLast = '<Blend Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_') 

        ans.push({
          AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
          ObjectPath:
            getObjectPath(hdata) + hdata + "\\" + 
            blendLast +
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
      "AudioFile\tObjectPath\tObject Type\tSwitch Assignation\n" +
      flattenDeep(
        flattenDeep(outputData
        .map((item) => {
          //AudioFilepopwav:路径去除.wav
            //artist:YM、ZY、LZY
            const AudioFilepopwav = item.AudioFile.split(".")[0];
            
          if(item.ObjectPath.includes('<Random Container>')) {
            const firstLine = `${item.AudioFile}\t${item.ObjectPath}\tSound SFX\t`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            // if (isNaN (Number((AudioFilepopwav.slice(-1)))))
            //     artist=AudioFilepopwav.split("_").slice(-1);
            // else
            //     artist=AudioFilepopwav.split("_").slice(-2);
            const secondLine = `\t${objPathArr.slice(0, objPathArr.length - 2).join('\\')}\t \t<State Group:Test_SoundStyle>${artist}`
            return [firstLine, secondLine];
          }
          else{
            const firstLine = `${item.AudioFile}\t${item.ObjectPath}\tSound SFX\t`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            const secondLine = `\t${objPathArr.slice(0, objPathArr.length - 1).join('\\')}\t\t<State Group:Test_SoundStyle>${artist}`
            return [firstLine, secondLine];
          }
          
          const artist = AudioFilepopwav.split("_").slice(-1)[0];
          return `${item.AudioFile}\t ${item.ObjectPath}\tSound SFX\t<State Group:Test_SoundStyle>${artist}`
        }))
        .filter((item) => {
          if(item.includes('<State Group:Test_SoundStyle>')) {
            const key = item.split('\t')[1].trim();
            if(bitmap[key]) return false;
            bitmap[key] = true;
            return true;
          }
          return true;
        })
        // whitespace
        .map((line) => {
          const splits = line.split('\t');
          let compareWhitespace = undefined;
          if(splits[0].trim().length > 0) {
            const sectionWord = splits[1].split('\t').find(word => word.includes('<Random Container>'))
            if(sectionWord) {
              const randomContainerWord = sectionWord.split('\\').find(word => word.includes('<Random Container>'));
              compareWhitespace = randomContainerWord;
            }
          }
          if(splits[0].trim().length === 0 && whitespace !== undefined) {
            whitespace = undefined;
            return ['\t\t\t', line];
          // } else if(whitespace !== compareWhitespace) {
          //   whitespace = compareWhitespace;
          //   return [',,,', line];
          } else {
            return line;
          }
        })
      )
        .join("\n");

    let blob = new Blob(["\ufeff"+outputText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `export.txt`);
  }
  
  function handleOutputTxt() {
    if (multipleFiles.length === 0) {
      alert("No files selected");
      return;
    }
    const file = multipleFiles[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      handleDataTxt(data);
    };
    reader.readAsText(file);
  }

//   function Copy(str) {
//     var save = function (e) {
//         //设置需要复制模板的内容
//         e.clipboardData.setData('text/plain',str);
//         //阻止默认行为
//         e.preventDefault();
//     }
//     // h5监听copy事件，调用save函数保存到模板中
//     document.addEventListener('copy',save);
//     // 调用右键复制功能
//     document.execCommand('copy');
//     //移除copy事件
//     document.removeEventListener('copy',save);
//     alert("复制成功");
//     //console.log(Copy);
// }
  return (
    <div className="app">
      <h3>aXe音频批量导入工具 <img src='outbox.png' alt="" width="30" height="30"/></h3>
      <body bgcolor="#F0E68C">
      <br />
      <img src='paper.png' alt="" width="30" height="30"/>
      请选择CSV文件:&nbsp;&nbsp;
      <input
        id="fileInput"
        type="file"
        multiple
        onChange={(e) => setMultipleFiles(e.target.files)}
      />
      <br />
      <br />
      </body>
      <body bgcolor="#FFD700">
      <br />
      请输入Audio Files文件夹路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setAuidoFilesFolder(e.target.value)}
      />
      <br />
      <br />
      <img src='folder.png' alt="" width="30" height="30"/>
      请全选音频文件:&nbsp;&nbsp;
      

      <input
        id="fileInput"
        type="file"
        multiple
        onChange={(e) => setAudioFiles(e.target.files)}
      />
      <br />
      <br />
      请输入音效设计师名字:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setDesignerName(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '2px'}} className="btn" onClick={()=>navigator.clipboard.writeText('ZYM')}>ZYM</button>
      <button style={{marginLeft: '2px'}} className="btn" onClick={()=>navigator.clipboard.writeText('ZY')}>ZY</button>
      <button style={{marginLeft: '2px'}} className="btn" onClick={()=>navigator.clipboard.writeText('LZY')}>LZY</button>
      <br />
      <br />
      </body>
      <body bgcolor="#DAA520">
  
      <br />
      For Wwise:
      <br />
      <br />
      <h>请输入SFX Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setSFXObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>SFX_Hero301\\<Switch Container>')}>默认值</button>
      </h>
      <br />
      <br />
      <h>请输入FOL Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setFOLObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>FOL_Hero301\\<Switch Container>')}>默认值</button>
      </h>
      <br />
      <br />
      <h>请输入EFF Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setEFFObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>EFF_Hero301\\<Switch Container>')}>默认值</button>
      </h>
      <br />
      <br />
      <h>请输入HIT Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setHITObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>HIT_Hero301\\<Switch Container>')}>默认值</button>
      </h>
      <br />
      <br />
      For UE:
      <br />
      <br />
      请输入AnimMontagePath路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setAnimMontagePath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('/Game/Axe/Core/Characters/Hero301/MTG_Hero301')}>默认值</button>
      <br />
      <br />
      请输入SFX AttachName的值:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setAttachName(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('WeaponSocket')}>默认值</button>
      <br />
      <br />
      请输入SFX AkEventPath的值:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setsfxAkEventPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('/game/WwiseAudio/Events/Fight/Hero301/SFX_Hero301/')}>默认值</button>
      <br />
      <br />
      <div className="line">
        <button style={{marginRight: '20px'}} onClick={handleOutputCsv}>Output Csv</button>
        <button style={{marginRight: '20px'}} onClick={handleOutputJson}>Output Json</button>
        <button onClick={handleOutputTxt}>Output txt</button>
      
      <br />
      <br />
      <br />
      <br />
      </div>
      </body>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('Physical Folder')}>Physical Folder</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('Virtual Folder')}>Virtual Folder</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('<Actor-Mixer>')}>Actor-Mixer</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('<Random Container>')}>Random Container</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('<Switch Container>')}>Switch Container</button>
      <p/>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('<Sequence Container>')}>Sequence Container</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('<Blend Container>')}>Blend Container</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('<Sound SFX>')}>Sound SFX</button>
      <button style={{marginRight: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('Audio Bus')}>Audio Bus</button>
      <p/>
    </div>
  );
}

export default OutputCSV;
