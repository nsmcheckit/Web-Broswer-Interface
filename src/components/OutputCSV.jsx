import { useState } from "react";
import { saveAs } from "file-saver";
import { flattenDeep } from "lodash";
import { getNowDate } from "../utils/time";
import { getHLine } from "../utils/HLine";
import { alphabetMap } from "../const/alphabet";
import { numberArr } from "../const/number";
import {BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";
import Dialogue from "../Dialogue";
import axios from 'axios'

function OncheckBox(e)
          {
            if(document.getElementById('simpleType').checked){
              console.log(1);
            }
            else{
              console.log(0);
            }
          }

function OncheckBox2(e)
          {
            if(document.getElementById('noTestType').checked){
              console.log(1);
            }
            else{
              console.log(0);
            }
          }

function countNum(arr,item){
    let num = 0;
    for(let i = 0; i < arr.length; i++){
      if (arr[i]===(item)){
        num++;
      }
    }
    return num;
}

function fixMatchArr(matchArr){
  const newMatchArr = [...matchArr];
  for(let i = 0; i < newMatchArr.length; i++){
    if(countNum(newMatchArr,newMatchArr[i]) > 1){
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_"));
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_") + "_" + "01");
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_") + "_" + "02");
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_") + "_" + "03");
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_") + "_" + "04");
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_") + "_" + "05");
      matchArr.push(matchArr[i].split("_").slice(0,-1).join("_") + "_" + "06");
    }
  }
  return matchArr;
}

function OutputCSV() {
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [sfxObjectPath, setSFXObjectPath] = useState("");
  const [effObjectPath, setEFFObjectPath] = useState("");
  const [folObjectPath, setFOLObjectPath] = useState("");
  const [hitObjectPath, setHITObjectPath] = useState("");
  const [animMontagePath, setAnimMontagePath] = useState("");
  const [audioFilesFolder, setAuidoFilesFolder] = useState("");
  const [sfxAttachName,setSfxAttachName] = useState("");//UE中AttachName
  const [folAttachName,setFolAttachName] = useState("");
  const [effAttachName,setEffAttachName] = useState("");
  const [sfxAkEventPath,setsfxAkEventPath] = useState("");
  const [folAkEventPath,setFolAkEventPath] = useState("");
  const [effAkEventPath,setEffAkEventPath] = useState("");
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
    const matchArr = []; //简易版匹配
    const outputMatchArr = HLine.map((hdata) => {
      const splits = hdata.split('_');
      const filteredAudioFiles = audioFilesTextures.filter(audioFile => 
        audioFile.type + audioFile.lay === splits[0]
        && audioFile.match === splits.slice(1).join("_")

      )
      for(let i = 0; i < filteredAudioFiles.length; i++){
        const audioFileTexture = filteredAudioFiles[i].filename
        const filename = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        audioFileTexture.split("\\").pop() + "_" + designerName 
        :
        audioFileTexture.split("\\").pop().split("_").slice(0,-1).join("_")
        + "_" + designerName + "_"
        + audioFileTexture.split("\\").pop().split("_").slice(-1).join("_"); 
        const filenameSplits = filename.split('_')
        const simpleSecondLastWithNum = filenameSplits
        .filter((item)=> item!=="")
        .slice(0, ).join('_');
        const simpleMatch = simpleSecondLastWithNum.split("_").slice(0,1).join("_") + "_" +simpleSecondLastWithNum.split("_").slice(2,).join("_");//除去xxx
        matchArr.push(simpleMatch);
      }
      });
      fixMatchArr(matchArr);
    
    
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

        //以下是普通版内容
        const audioFileTexture = filteredAudioFiles[i].filename
        let filename = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        audioFileTexture.split("\\").pop() + "_" + designerName 
        :
        audioFileTexture.split("\\").pop().split("_").slice(0,-1).join("_")
        + "_" + designerName + "_"
        + audioFileTexture.split("\\").pop().split("_").slice(-1).join("_"); 
        if(designerName === ""){
          isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
          filename = filename.slice(0,-1)
          :
          filename = filename.replace("__","_")
        }
        const filenameSplits = filename.split('_')
        const secondLast = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        '<Random Container>' + filenameSplits.slice(0,).join('_')
        :
        '<Random Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_')
        const blendLast = (secondLast.split("_").slice(0,1).join("_")
        + "_" +
        secondLast.split("_").slice(2).join("_")).replace('<Random Container>','<Blend Container>');

        //以下是简约版内容
        const simpleFilename = audioFileTexture;
        const simpleObjectPath = getObjectPath(hdata).split("\\").slice(0,-1).join("\\");//简约版simpleObjectPath，去掉最后的容器，有时是<Random Container>
        const simpleObjectPathSlice = getObjectPath(hdata).split("\\").slice(-1);//简约版simpleObjectPath去掉的部分
        /////////////////
        const simpleSecondLast = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        filenameSplits
        .filter((item)=> (item!=="") && (!numberArr.includes(item)))
        .slice(0, ).join('_')
        :
        filenameSplits
        .filter((item)=> (item!=="") && (!numberArr.includes(item)))
        .slice(0, filenameSplits.length - 1).join('_');
        /////////////////
        const simpleBlendLast = '<Blend Container>' 
        +simpleSecondLast.split("_").slice(0,1).join("_")
        + "_" +
        simpleSecondLast.split("_").slice(2).join("_");
        /////////////////
        const simpleSecondLastWithNum = filenameSplits
        .filter((item)=> item!=="")
        .slice(0, ).join('_')
        /////////////////
        const simpleMatch = simpleSecondLastWithNum.split("_").slice(0,1).join("_") + "_" +simpleSecondLastWithNum.split("_").slice(2,).join("_");//除去xxx
        //console.log(matchArr)
        //console.log(simpleSecondLast)
        if(document.getElementById('simpleType').checked){
          ans.push({
            AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
            ObjectPath: countNum(matchArr,simpleMatch) > 1 ?
            simpleObjectPath 
            + "\\"
            + simpleBlendLast
            + "\\" + simpleObjectPathSlice 
            + simpleSecondLast
            + "\\" + simpleFilename
            :
            simpleObjectPath 
            + "\\" + simpleObjectPathSlice 
            + simpleSecondLast.split("_").slice(0,1).join("_")+ "_" +simpleSecondLast.split("_").slice(2).join("_")
            + "\\" + simpleFilename
          })
        }
        else{
        ans.push({
          AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
          ObjectPath:
            getObjectPath(hdata) + hdata + "\\" + 
            blendLast +
              (!isNaN(filteredAudioFiles[i].number) ? ("\\" + secondLast): '')
              + "\\" + filename,
        })
        
      }
      }
      return ans.length === 0 ? [
        {
          AudioFile: '',
          ObjectPath: getObjectPath(hdata) + hdata + "\\<Random Container>\\",
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
            const secondLine = artist === ""?
            `, ${objPathArr.slice(0, objPathArr.length - 2).join('\\')}, ,`
            :
            `, ${objPathArr.slice(0, objPathArr.length - 2).join('\\')}, ,<State Group:Test_SoundStyle>${artist}`
            if(document.getElementById('simpleType').checked){
              return [firstLine];
            }
            else{
              return [firstLine, secondLine];
            }
          }
          else{
            const firstLine = `${item.AudioFile}, ${item.ObjectPath}, Sound SFX,`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            const secondLine = 
            artist === ""?
            `, ${objPathArr.slice(0, objPathArr.length - 1).join('\\')}, ,`
            :
            `, ${objPathArr.slice(0, objPathArr.length - 1).join('\\')}, ,<State Group:Test_SoundStyle>${artist}`
            if(document.getElementById('simpleType').checked){
              return [firstLine];
            }
            else{
              return [firstLine, secondLine];
            }
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
    
    //console.log(HLineObject);
    const NotifyTrack = [];
    for(const NotifyTrackName in HLineMap) {
      
      const upperCaseNotifyTrackName = NotifyTrackName.toUpperCase()
      if(upperCaseNotifyTrackName.includes('HIT') || upperCaseNotifyTrackName.includes("FOOT")) continue;
      const AudioEventNames = HLineMap[NotifyTrackName];
      
      
      NotifyTrack.push({
        NotifyTrackName,
        AudioEventParam: 
        /*
        ()=>
        {
          if (NotifyTrackName === 'Audio_SFX'){
            return AudioEventNames.map(x => ({AudioEventName: x,AttachName: sfxAttachName,AkEventPath: sfxAkEventPath + x + "." + x,}));
          }
          else if (NotifyTrackName === 'Audio_FOL'){
            return AudioEventNames.map(x => ({AudioEventName: x,AttachName: folAttachName,AkEventPath: folAkEventPath + x + "." + x,}));
          }
          
          return AudioEventNames.map(x => ({AudioEventName: x,AttachName:"",AkEventPath:"",}));
        }
        */
        NotifyTrackName === 'Audio_SFX' ? 
        AudioEventNames.map(x => ({AudioEventName: x,AttachName: sfxAttachName,AkEventPath: sfxAkEventPath + x + "." + x,})) 
        : (NotifyTrackName === 'Audio_FOL' ?
        AudioEventNames.map(x => ({AudioEventName: x,AttachName: folAttachName,AkEventPath: folAkEventPath + x + "." + x,}))
        : (NotifyTrackName === 'Audio_EFF' ? 
        AudioEventNames.map(x => ({AudioEventName: x,AttachName: effAttachName,AkEventPath: effAkEventPath + x + "." + x,}))
        :
        AudioEventNames.map(x => ({AudioEventName: x,AttachName:"",AkEventPath:"",}))))//加入AttachName
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
    let Data = [];
    if(document.getElementById('noTestType').checked){
      Data = _Data;
  }
    else{
      Data = _Data.map(x => ({
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
      }))}
    //console.log(Data);
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
    const matchArr = []; //简易版匹配
    const outputMatchArr = HLine.map((hdata) => {
      const splits = hdata.split('_');
      const filteredAudioFiles = audioFilesTextures.filter(audioFile => 
        audioFile.type + audioFile.lay === splits[0]
        && audioFile.match === splits.slice(1).join("_")

      )
      for(let i = 0; i < filteredAudioFiles.length; i++){
        const audioFileTexture = filteredAudioFiles[i].filename
        const filename = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        audioFileTexture.split("\\").pop() + "_" + designerName 
        :
        audioFileTexture.split("\\").pop().split("_").slice(0,-1).join("_")
        + "_" + designerName + "_"
        + audioFileTexture.split("\\").pop().split("_").slice(-1).join("_"); 
        const filenameSplits = filename.split('_')
        const simpleSecondLastWithNum = filenameSplits
        .filter((item)=> item!=="")
        .slice(0, ).join('_');
        const simpleMatch = simpleSecondLastWithNum.split("_").slice(0,1).join("_") + "_" +simpleSecondLastWithNum.split("_").slice(2,).join("_");//除去xxx
        matchArr.push(simpleMatch);
      }
      });
      fixMatchArr(matchArr);
      //console.log(matchArr);


    const outputDatas = HLine.map((hdata) => {
      const splits = hdata.split('_');
      const filteredAudioFiles = audioFilesTextures.filter(audioFile => 
        // SFX 01 
        audioFile.type + audioFile.lay === splits[0]
        && audioFile.match === splits.slice(1).join("_")
      )

      const ans = []
      for(let i = 0; i < filteredAudioFiles.length; i++) {

        //以下是普通版内容
        const audioFileTexture = filteredAudioFiles[i].filename
        let filename = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        audioFileTexture.split("\\").pop() + "_" + designerName 
        :
        audioFileTexture.split("\\").pop().split("_").slice(0,-1).join("_")
        + "_" + designerName + "_"
        + audioFileTexture.split("\\").pop().split("_").slice(-1).join("_"); 
        if(designerName === ""){
          isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
          filename = filename.slice(0,-1)
          :
          filename = filename.replace("__","_")
        }
        const filenameSplits = filename.split('_')
        const secondLast = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        '<Random Container>' + filenameSplits.slice(0,).join('_')
        :
        '<Random Container>' + filenameSplits.slice(0, filenameSplits.length - 1).join('_')
        const blendLast = (secondLast.split("_").slice(0,1).join("_")
        + "_" +
        secondLast.split("_").slice(2).join("_")).replace('<Random Container>','<Blend Container>');

        //以下是简约版内容
        const simpleFilename = audioFileTexture;
        const simpleObjectPath = getObjectPath(hdata).split("\\").slice(0,-1).join("\\");//简约版simpleObjectPath，去掉最后的容器，有时是<Random Container>
        const simpleObjectPathSlice = getObjectPath(hdata).split("\\").slice(-1);//简约版simpleObjectPath去掉的部分
        /////////////////
        const simpleSecondLast = isNaN(audioFileTexture.split("\\").pop().split("_").slice(-1)) ? 
        filenameSplits
        .filter((item)=> (item!=="") && (!numberArr.includes(item)))
        .slice(0, ).join('_')
        :
        filenameSplits
        .filter((item)=> (item!=="") && (!numberArr.includes(item)))
        .slice(0, filenameSplits.length - 1).join('_');
        /////////////////
        const simpleBlendLast = '<Blend Container>' 
        +simpleSecondLast.split("_").slice(0,1).join("_")
        + "_" +
        simpleSecondLast.split("_").slice(2).join("_");
        //console.log(filenameSplits);
        //console.log(simpleSecondLast);
        /////////////////
        const simpleSecondLastWithNum = filenameSplits
        .filter((item)=> item!=="")
        .slice(0, ).join('_')
        /////////////////
        const simpleMatch = simpleSecondLastWithNum.split("_").slice(0,1).join("_") + "_" +simpleSecondLastWithNum.split("_").slice(2,).join("_");//除去xxx
        //console.log(matchArr)
        //console.log(simpleMatch)
        if(document.getElementById('simpleType').checked){
          ans.push({
            AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
            ObjectPath: countNum(matchArr,simpleMatch) > 1 ?
            simpleObjectPath 
            + "\\"
            + simpleBlendLast
            + "\\" + simpleObjectPathSlice 
            + simpleSecondLast
            + "\\" + simpleFilename
            :
            simpleObjectPath 
            + "\\" + simpleObjectPathSlice 
            + simpleSecondLast.split("_").slice(0,1).join("_")+ "_" +simpleSecondLast.split("_").slice(2).join("_")
            + "\\" + simpleFilename
          })
        }
        else{
        ans.push({
          AudioFile: `${audioFilesFolder}\\${audioFileTexture}.wav`,
          ObjectPath:
            getObjectPath(hdata) + hdata + "\\" + 
            blendLast +
              (!isNaN(filteredAudioFiles[i].number) ? ("\\" + secondLast): '')
              + "\\" + filename,
        })
        
      }
      }
      return ans.length === 0 ? [
        {
          AudioFile: '',
          ObjectPath: getObjectPath(hdata) + hdata + "\\<Random Container>\\",
        }
      ]: ans
    });

    const outputData = flattenDeep(outputDatas);
    // keep unique
    const bitmap = {};
    let whitespace = undefined;
    const outputText =
      "AudioFile\tObjectPath\t Object Type\tSwitch Assignation\n" +
      flattenDeep(
        flattenDeep(outputData
        .map((item) => {
          //AudioFilepopwav:路径去除.wav + designerName
            //artist:YM、ZY、LZY
          if(item.ObjectPath.includes('<Random Container>')) {
            const firstLine = `${item.AudioFile}\t${item.ObjectPath}\tSound SFX\t`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            const secondLine = artist === ""?
            `\t${objPathArr.slice(0, objPathArr.length - 2).join('\\')}\t\t`
            :
            `\t${objPathArr.slice(0, objPathArr.length - 2).join('\\')}\t\t<State Group:Test_SoundStyle>${artist}`
            if(document.getElementById('simpleType').checked){
              return [firstLine];
            }
            else{
              return [firstLine, secondLine];
            }
          }
          else{
            const firstLine = `${item.AudioFile}\t${item.ObjectPath}\tSound SFX\t`
            const objPathArr = item.ObjectPath.split('\\');
            const artist = designerName;
            const secondLine = 
            artist === ""?
            `\t${objPathArr.slice(0, objPathArr.length - 1).join('\\')}\t\t`
            :
            `\t${objPathArr.slice(0, objPathArr.length - 1).join('\\')}\t\t<State Group:Test_SoundStyle>${artist}`
            if(document.getElementById('simpleType').checked){
              return [firstLine];
            }
            else{
              return [firstLine, secondLine];
            }
          }
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
      <div>
      <a href ="dialogue">Dialogue Mode</a>
      </div>
      <h3>aXe音效批量导入工具 <img src='outbox.png' alt="" width="30" height="30"/></h3>
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
      <label>
        <input 
          type="checkbox"
          id = 'simpleType'
          onClick={(e)=>OncheckBox(e)}
          />简约版
      </label>
      <br />
      <br />
      <h>请输入SFX Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setSFXObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=> document.getElementById('simpleType').checked ?
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>SFX_Hero301\\<Random Container>')
        :
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>SFX_Hero301\\<Switch Container>')
        }>默认值</button>
      </h>
      <br />
      <br />
      <h>请输入FOL Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setFOLObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=> document.getElementById('simpleType').checked ?
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>FOL_Hero301\\<Random Container>')
        :
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>FOL_Hero301\\<Switch Container>')
        }>默认值</button>
      </h>
      <br />
      <br />
      <h>请输入EFF Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setEFFObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=> document.getElementById('simpleType').checked ?
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>EFF_Hero301\\<Random Container>')
        :
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>EFF_Hero301\\<Switch Container>')}>默认值</button>
      </h>
      <br />
      <br />
      <h>请输入HIT Object Path路径:&nbsp;&nbsp;
      <input
        type="text"
        onChange={(e) => setHITObjectPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=> document.getElementById('simpleType').checked ?
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>HIT_Hero301\\<Random Container>')
        :
        navigator.clipboard.writeText('\\Actor-Mixer Hierarchy\\Hero\\<Actor-Mixer>Hero301\\<Actor-Mixer>HIT_Hero301\\<Switch Container>')}>默认值</button>
      </h>
      <br />
      <br />
      For UE:
      <label>
        <input 
          type="checkbox"
          id = 'noTestType'
          onClick={(e)=>OncheckBox2(e)}
          />no Audio_TEST
      </label>
      <br />
      <br />
      AnimMontagePath:&nbsp;&nbsp;
      <input
        type="liltext"
        onChange={(e) => setAnimMontagePath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('/Game/Axe/Core/Characters/Hero301/MTG_Hero301')}>默认值</button>
      <br />
      <br />
      SFX AttachName:&nbsp;&nbsp;
      <input
        onChange={(e) => setSfxAttachName(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('WeaponSocket')}>默认值</button>
      &nbsp;&nbsp;FOL AttachName:&nbsp;&nbsp;
      <input
        onChange={(e) => setFolAttachName(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('WeaponSocket')}>默认值</button>
      &nbsp;&nbsp;EFF AttachName:&nbsp;&nbsp;
      <input
        onChange={(e) => setEffAttachName(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('WeaponSocket')}>默认值</button>
      <br />
      <br />
      SFX AkEventPath:&nbsp;&nbsp;
      <input
        onChange={(e) => setsfxAkEventPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('/game/WwiseAudio/Events/Fight/Hero301/SFX_Hero301/')}>默认值</button>
      &nbsp;&nbsp;FOL AkEventPath:&nbsp;&nbsp;
      <input
        onChange={(e) => setFolAkEventPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('/game/WwiseAudio/Events/Fight/Hero301/FOL_Hero301/')}>默认值</button>
      &nbsp;&nbsp;EFF AkEventPath:&nbsp;&nbsp;
      <input
        onChange={(e) => setEffAkEventPath(e.target.value)}
        defaultValue=""
      />
      <button style={{marginLeft: '20px'}} className="btn" onClick={()=>navigator.clipboard.writeText('/game/WwiseAudio/Events/Fight/Hero301/EFF_Hero301/')}>默认值</button>
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
