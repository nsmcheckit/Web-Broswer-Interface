import {BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";
import { useState } from "react";
import { flatMapDeep, flattenDeep, includes } from "lodash";
import { saveAs } from "file-saver";
import App from './App';

function Dialogue(){
    const [dialogueCsv, setDialogueCsv] = useState([]);
    const [audioFilesFolder, setAuidoFilesFolder] = useState("");
    const [audioFiles, setAudioFiles] = useState([]);
    //找到特定列
    const getColumns = (dialogueCsv) =>{
        const columns = (dialogueCsv || "")
        .replace(/,\n/g,'#')
        .split("#")
        .map((item) => item.replace(/"/g,""))
        .map((item) => item.replace(/\n/g,""));

        //console.log(columns);
        // const titlefirst = (dialogueCsv || "").split(/\"/);//通过"分割文件
        // const titlesecond = flattenDeep(titlefirst.map((item) => item.split(",")))
        // .map((item) => item.trim())
        // .filter(function (s) {
        //     return s && s.trim(); 
        // });;//每个单元格分出来

        const title = columns[1].split(",");
        //console.log(title);
        const findId = (name) =>{
            for(let i = 0; i<title.length; i++){
                if (title[i].includes(name)){
                    return i;
                }
                
            }
            return -1;
        }

        //找到特定列数
        const wwiseEventId = findId("WwiseEvent");
        const typeId = findId("Type");
        const technicalNameId = findId("TechnicalName");
        const audioFileNameId = findId("Audio File Name");

        const data = columns
        .slice(2,)
        .map((column) => column.split(",").map((item) => item.trim()))
        //console.log("data: " + data);
        const newData = data[0].map((col,i) => data.map(row => row[i]));//行列反转
        //console.log(newData);
        const wwiseEvent = newData[wwiseEventId];//事件名
        let technicalName = newData[technicalNameId];//角色名
        const audioFileName = newData[audioFileNameId];//文件名
        for (let i = 0; i < audioFileName.length; i++){
            if(audioFileName[i].includes(".wav") === false){
                audioFileName[i] += ".wav";
            }
        }
        if( typeof(technicalName) === 'undefined' ){
            //console.log(typeof(technicalName));
                technicalName = wwiseEvent.map((item)=>item.split("_").slice(1,2));
        }
        //console.log(audioFileName);
        const audioFileNameNoWav = audioFileName.map((item) => (item || "").split(".")[0]);//文件名不加.wav
        const randomName = audioFileNameNoWav.map((item)=>item.split("_").slice(0,-1).join("_"));
        const type = newData[typeId]//类型
            //  console.log("event: "+wwiseEvent);
            //  console.log("角色名: "+technicalName);
            //  console.log("表格文件名: "+audioFileName);
            //  console.log("类型: "+type);

        const audioFilesTexture = [];//音频文件名
        
        for(const file of audioFiles) {
            audioFilesTexture.push(file.name);
        }
        

        const wrongAudioFilesTextture = [];
        function testAudioFilesTextture(){
            for(let i = 0; i < wwiseEvent.length; i++){
                    if(audioFilesTexture.includes(audioFileName[i])){
                        continue;
                    }
                    else 
                        wrongAudioFilesTextture.push(audioFileName[i]);
                }
                
            
            return wrongAudioFilesTextture;
        }
        testAudioFilesTextture();
        //console.log(wrongAudioFilesTextture);

        if ( wrongAudioFilesTextture.length !== 0){
            var a = window.confirm( wrongAudioFilesTextture+" 与本地命名不一致！是否仍要导出？");
            if(a === true){
                //eslint-disable-line
                alert("导出成功");
            }
            else {
                alert("导出失败");
                return;
            }
        }



        // console.log("文件名: "+ audioFilesTexture);
        // console.log("path: "+ audioFilesFolder);
        const dia = [];//txt文件数组
        for(let i = 0; i < wwiseEvent.length; i++){
            dia.push(
                {
                    AudioFile:  audioFilesFolder + "\\" + audioFileName[i],
                    ObjectPath: wwiseEvent === randomName ? 
                    "\\Actor-Mixer Hierarchy\\Default Work Unit" + "\\<Actor-Mixer>" + type[i] 
                                + "\\<Switch Container>" + technicalName[i]
                                + "\\<Random Container>" + wwiseEvent[i]
                                + "\\" + audioFileNameNoWav[i]
                    :
                    "\\Actor-Mixer Hierarchy\\Default Work Unit" + "\\<Actor-Mixer>" + type[i] 
                                + "\\<Switch Container>" + technicalName[i]
                                + "\\<Random Container>" + randomName[i]
                                + "\\" + audioFileNameNoWav[i],
                    ObjectType: "Sound Voice"
                }
            )
        }
        //console.log(dia);

        const diaTxt =
            "Audio File\tObject Path\tObject Type\n" +
            flatMapDeep (
                dia.map((item) => {
                    const line = `${item.AudioFile}\t${item.ObjectPath}\t${item.ObjectType}\t`;
                    return [line];
                    }) 
            ).join("\n");
        
        console.log(diaTxt);
        let blob = new Blob(["\ufeff"+diaTxt], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `export.txt`);
        
   }
   
   

    function handleOutputDiaCsv() {
        if (dialogueCsv.length === 0) {
          alert("No files selected");
          return;
        }

        const file = dialogueCsv[0];
            let reader = new FileReader();
            reader.onload = function (e) {
            const data = e.target.result;
            getColumns(data);
        };
        reader.readAsText(file);
        
      }
    return (       
    <div> 
        <a href ="nomal">Nomal Mode</a>        
        <h3>aXe语音批量导入工具 </h3>
        <p id="background">
    <br/>  
        CSV表格:&nbsp;&nbsp;
        <input id="fileInput" type="file" multiple onChange={(e) => setDialogueCsv(e.target.files)}/>
    <br/>
    <br/>   
        语音文件:&nbsp;&nbsp;
        <input id="fileInput" type="file" multiple onChange={(e) => setAudioFiles(e.target.files)}/>
    <br/>
    <br/>
        <input placeholder="语音文件夹路径" type="text" onChange={(e) => setAuidoFilesFolder(e.target.value)}/>
    <br/>
    <br/> 
        <button onClick={handleOutputDiaCsv}>Output txt</button>
    <br/>
    <br/>  
        </p>
    </div>

    );
}

export default Dialogue;