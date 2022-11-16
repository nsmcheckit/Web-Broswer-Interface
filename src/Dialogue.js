import $ from "jquery";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLinkClickHandler,
} from "react-router-dom";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import { flatMapDeep, flattenDeep, includes } from "lodash";
import { saveAs } from "file-saver";
import "./test1.txt";
import { wwr_run_update } from "./main";
import { wwr_req_recur } from "./main";
import { wwr_req } from "./main";
import fs from "fs";
import App from "./App";
import axios from "axios";
import waapi from "../src/AK/WwiseAuthoringAPI/js/waapi.js";
import MergeData from "./MergeData";

// //数据库相关
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const app = new express();
// app.use(bodyParser.json()); // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// // 连接数据库
// mongoose.connect('mongodb://localhost/test');
// mongoose.connection
//     .on('open',function () {
//         process.env.connect_database = 1;
//         console.log('数据库连接成功');

//     })
//     .on('error',function () {
//         process.env.connect_database = 0;
//       console.log('数据库连接失败');

//     });

wwr_req(encodeURIComponent("_RS2c8ae3a590f03c49a57448d21a0eb76c999cc7f7")); //open reaper console
// Show a generic message
var showMessage = function (kind, message) {
  var e = document.getElementById(kind);
  if (message.length === 0) e.style.display = "none";
  else e.style.display = "block";

  e.innerHTML = message;
};

function waapiCall(uri, args, options, onSuccess, onError) {
  (() => {
    const axios = require("axios");
    const ak = require("..\\src\\AK\\WwiseAuthoringAPI\\js\\waapi.js").ak;
    const data = {
      uri: uri,
      options: {},
      args: args,
    };

    const handleResponse = (status, headers, objectPayload) => {
      if (status != 200) {
        console.log(status, headers, objectPayload);
        //   if (headers["content-type"] == "application/json") {
        //       console.log(`Error: ${objectPayload.uri}: ${JSON.stringify(objectPayload)}`);
        //   } else {
        //       console.log(`Error: ${Buffer.from(objectPayload).toString("utf8")}`);
        //   }
      } else {
        console.log("Hello wappi");
      }
    };

    let xhr = new XMLHttpRequest();
    //第二步  使用open 创建请求 第一个参数是请求方式 第二个是请求的地址  第三个是同步或者异步
    xhr.open("post", "http://localhost:8090/waapi", true);
    //如果是post请求  必须要写请求头
    // xhr.setRequestHeader("content-type", "application/json") //设置请求头
    //第三步  为xhr.onreadystatechange  设置监听事件
    xhr.onreadystatechange = function () {
      console.log(xhr);
      //     if(xhr.readyState == 4) {
      //     if(xhr.status == 200){
      //     alert(xhr.responseTwxt)
      // //readyState  0 请求未初始化  刚刚实例化XMLHttpRequest
      // //readyState  1 客户端与服务器建立链接  调用open方法
      // //readyState  2 请求已经被接收
      // //readyState  3 请求正在处理中
      // //readyState  4 请求成功
      //             }
      //        }
    };
    // 第四步 发送请求数据  调用send 发送请求 如果不需要参数就写一个null
    xhr.send(JSON.stringify(data));
  })();
}

function Dialogue() {
  document.title = "SoundTeam Web Interface";
  //uri: ak.wwise.core.getInfo, show wwise infomation
  (() => {
    const axios = require("axios");
    const ak = require("..\\src\\AK\\WwiseAuthoringAPI\\js\\waapi.js").ak;
    const data = {
      uri: ak.wwise.core.getInfo,
      options: {},
      args: {},
    };

    const handleResponse = (status, headers, objectPayload) => {
      if (status != 200) {
        //    if (headers["content-type"] == "application/json") {
        //        console.log(`Error: ${objectPayload.uri}: ${JSON.stringify(objectPayload)}`);
        //    } else {
        //        console.log(`Error: ${Buffer.from(objectPayload).toString("utf8")}`);
        //    }
      } else {
        //console.log(`Hello ${objectPayload.displayName} ${objectPayload.version.displayName}`);
        showMessage(
          "load_success_message",
          `Connected to ${objectPayload.displayName} ${objectPayload.version.displayName}.`
        );
      }
    };

    axios({
      method: "get",
      url: "http://localhost:8090/waapi",
      // params:data,
      // data: data,
      headers: { "content-type": "application/json" },
    })
      .then((response) => {
        handleResponse(response.status, response.headers, response.data);
      })
      .catch((err) => {
        if (err.response) {
          handleResponse(
            err.response.status,
            err.response.headers,
            err.response.data
          );
        } else {
          console.log(`Error: ${err.message}`);
        }
      });
  })();
  //remote Act Reaper
  const [reaScript, setReaScript] = useState("");
  $("#exampleDataList").change(function () {
    if (reaScript == "Giant_MoveWithCursor") {
      wwr_req(
        encodeURIComponent("_RS00f968458d44a5b9b4516c4963b700e85537bac9")
      );
    } else if (reaScript == "Giant_moveItemStartPosition") {
      alert("功能开发中");
    } else if (reaScript == "Giant_Export_ItemList") {
      wwr_req(
        encodeURIComponent("_RS00f968458d44a5b9b4516c4963b700e85537bac9")
      );
    }
  });

  //reaperJson, react hook for reaperMontageJson
  const [reaperJson, setReaperJson] = useState([]);
  function remixReaperJson(data) {
    data = JSON.parse(data);
    console.log(data);
    //识别视频和音频轨, rework trigger time
    let montageTime = 0;
    let montage = "";
    for (let i = 0; i < data.length; i++) {
      if (data[i].Item.includes("AM_")) {
        montageTime = data[i].triggerTime;
        montage = data[i].Item;
      } else {
        data[i].triggerTime -= montageTime;
        data[i].montage = montage;
      }
      console.log(montage);
    }

    //识别视频和音频轨, rework Skill
    let skill = "";
    for (let i = 0; i < data.length; i++) {
      if (data[i].Item.includes("AM_")) {
        skill = data[i].Skill;
        data[i].Event =
          data[i].Character +
          "_" +
          skill +
          "_" +
          data[i].Item +
          "_" +
          data[i].Type;
      } else {
        data[i].Event =
          data[i].Character +
          "_" +
          skill +
          "_" +
          data[i].Item +
          "_" +
          data[i].Type;
      }
    }

    //rework attachname
    for (let i = 0; i < data.length; i++) {
      if (data[i].attachName === "") {
        data[i].attachName = "WeaponSocket";
      }
    }

    //delete keys unuseful
    for (let i = 0; i < data.length; i++) {
      delete data[i].Character;
      delete data[i].Skill;
      delete data[i].Item;
      delete data[i].Type;
    }
    //mix same events into an array
    let remixJson = {};
    let wwiseEventGroup = [];
    for (let i = 0; i < data.length; i++) {
      if (!wwiseEventGroup.includes(data[i].Event)) {
        wwiseEventGroup.push(data[i].Event);
        remixJson[data[i].Event] = [];
        remixJson[data[i].Event].push(data[i]);
      } else {
        remixJson[data[i].Event].unshift(data[i]);
      }
    }

    //delete unuseful events
    for (let i = 0; i < wwiseEventGroup.length; i++) {
      if (wwiseEventGroup[i].includes("AM_")) {
        delete remixJson[wwiseEventGroup[i]];
        wwiseEventGroup.splice(i, 1);
      }
    }

    let wwiseEventGroupWithEvent = [];

    //even add "Event:" prefix
    for (let i = 0; i < wwiseEventGroup.length; i++) {
      wwiseEventGroupWithEvent[i] = "Event:" + wwiseEventGroup[i];
    }
    console.log(wwiseEventGroupWithEvent);
    console.log(remixJson);

    //call wappi
    for (let i = 0; i < wwiseEventGroup.length; i++) {
      remixJson[wwiseEventGroup[i]] = { Config: remixJson[wwiseEventGroup[i]] };
      //console.log(configGroup["config"])
      waapiCall(
        "ak.wwise.core.object.setNotes",
        {
          object: wwiseEventGroupWithEvent[i],
          value: JSON.stringify(remixJson[wwiseEventGroup[i]], null, "\t"),
        },
        null,
        null,
        null
      );
    }
  }

  //this is a test for Web broswer interface run reaper script, remote insert new tracks and rename them
  const [articyJson, setArticyJson] = useState([]);
  const diaEvent = [];
  function createTracks(articyJson) {
    articyJson = JSON.parse(articyJson);
    for (let i = 1; i < articyJson.length; i++) {
      diaEvent[i - 1] = articyJson[i]["Wwise Event (Do not edit manually)"];
      console.log(diaEvent[i - 1]);
      wwr_run_update();
      setTimeout(() => {
        wwr_req("SET/PROJEXTSTATE/reaperWeb/trackname/" + diaEvent[i - 1]);
        setTimeout(() => {
          wwr_req(
            encodeURIComponent("_RSa06f9b6da150a2b4ad3415129a4bc3a4797b6f95")
          );
        }, 3000);
      }, 3000);
      console.log(i);
    }
  }

  //rppp, remixRecordingSession Json, new a rpp project for each speaker
  const [recordingSession, setRecordingSession] = useState([]);
  const [recordingSession2, setRecordingSession2] = useState([]);
  let recordingSessionTemp = []; //[0]recordingSession+[1]recordingSession2
  function creatDialogueRpp(recordingSession) {
    try {
      recordingSession = JSON.parse(recordingSession);
    } catch (e) {
      alert("JSON不符合规范");
      return;
    }

    const keyWordsNum = Object.keys(recordingSession[0]).length; //keywordsnum
    const keyWords = Object.keys(recordingSession[0]); //keywords
    let trackNameGroup = [];
    let remixRecordingSession = {}; //将TechnicalName提取出作为键
    for (let i = 0; i < recordingSession.length; i++) {
      if (!trackNameGroup.includes(recordingSession[i]["TechnicalName"])) {
        trackNameGroup.push(recordingSession[i]["TechnicalName"]);
        remixRecordingSession[recordingSession[i]["TechnicalName"]] = [];
        remixRecordingSession[recordingSession[i]["TechnicalName"]].push(
          recordingSession[i]
        );
      } else {
        remixRecordingSession[recordingSession[i]["TechnicalName"]].push(
          recordingSession[i]
        );
      }
    }
    // console.log(remixRecordingSession);
    // console.log(trackNameGroup)
    var remixRecordingSessionLength = 0; //计算remixRecordingSession的长度
    for (var ever in remixRecordingSession) {
      remixRecordingSessionLength++;
    }
    let trackName = "";
    let time = 0;
    let id = 0;
    const rppp = require("rppp");
    const project = new rppp.objects.ReaperProject(); //新建一个rpp项目
    const projectNotes = new rppp.objects.ReaperNotes();
    projectNotes.params = [JSON.stringify(remixRecordingSession)];
    console.log(projectNotes.params);
    console.log(JSON.parse(projectNotes.params));
    project.add(projectNotes);
    const diaTrack = new rppp.objects.ReaperTrack(); //新建一个显示字幕的track: diaTrack
    let diaItem = new rppp.objects.ReaperItem(); //每个region下的台词Item
    let diaNotes; //每个台词Item里的notes
    project.addTrack(diaTrack);
    project.getOrCreateStructByToken("TRACK", 0).add({
      token: "NAME",
      params: ["Dialogue Lines"],
    }); //目前speaker track之前有1个track

    //创建speakers track
    for (let i = 0; i < trackNameGroup.length; i++) {
      //speaker tracks
      project.addTrack(new rppp.objects.ReaperTrack());
      trackName = JSON.stringify(trackNameGroup[i]).replace(/"/g, "");
      project
        .getOrCreateStructByToken("TRACK", i * 2 + 1)
        .add({ token: "NAME", params: [trackName] });
      project
        .getOrCreateStructByToken("TRACK", i * 2 + 1)
        .add({ token: "ISBUS", params: [1, 1] });
      //speaker track out
      project.addTrack(new rppp.objects.ReaperTrack());
      trackName = JSON.stringify(trackNameGroup[i]).replace(/"/g, "");
      project
        .getOrCreateStructByToken("TRACK", i * 2 + 1 + 1)
        .add({ token: "NAME", params: [`${trackName} OUT 01`] });
      project
        .getOrCreateStructByToken("TRACK", i * 2 + 1 + 1)
        .add({ token: "ISBUS", params: [2, -1] });
    }

    //打region和marker,item
    for (let i = 0; i < trackNameGroup.length; i++) {
      project.contents.push({
        token: "MARKER",
        params: [
          id,
          time == 0 ? time : time - 0.1,
          JSON.stringify(trackNameGroup[i]).replace(/"/g, ""),
          0,
          0,
          1,
          "R",
          "{05F831CA-BC3B-4E10-AB10-557AFBDEB267}", //marker
        ],
      }); //insert marker
      id++;
      for (
        let j = 0;
        j < remixRecordingSession[trackNameGroup[i]].length;
        j++
      ) {
        remixRecordingSession[trackNameGroup[i]][j][
          "Dialogue(CN)(台词)"
        ].replace(/[\r\n]/g, ""); //reaper的region不能识别回车
        diaNotes = new rppp.objects.ReaperNotes();
        diaNotes.params = [
          `${remixRecordingSession[trackNameGroup[i]][j][
            "Dialogue(CN)(台词)"
          ].replace(/[\r\n]/g, "")}`,
        ];
        diaItem = new rppp.objects.ReaperItem(); //刷新diaItem
        diaItem.add(diaNotes);
        diaItem.add({ token: "POSITION", params: [time] }); //empty item position
        diaItem.add({
          token: "LENGTH",
          params: [
            remixRecordingSession[trackNameGroup[i]][j][
              "Dialogue(CN)(台词)"
            ].replace(/[\r\n]/g, "").length / 4,
          ],
        }); //empty item length
        diaTrack.add(diaItem);
        project.contents.push({
          token: "MARKER",
          params: [
            id, //id
            time, //标记点
            remixRecordingSession[trackNameGroup[i]][j][
              "Audio File Name"
            ].replace(/[\r\n]/g, ""), //region名称
            1,
            1,
            1,
            "R",
            "{00000000-0000-0000-0000-" +
              j.toString(10).padStart(12, "0") +
              "}", //idx {1171F644-29E1-41B0-BBAD-F131D78F1582}
            //region
          ],
        });
        project.contents.push({
          token: "MARKER",
          params: [
            id,
            time +
              remixRecordingSession[trackNameGroup[i]][j][
                "Dialogue(CN)(台词)"
              ].replace(/[\r\n]/g, "").length /
                4,
            "",
            1,
            1,
            1,
            "R",
            "", //region
          ],
        });

        time +=
          remixRecordingSession[trackNameGroup[i]][j][
            "Dialogue(CN)(台词)"
          ].replace(/[\r\n]/g, "").length /
            4 +
          5;
        id++;
      }
    }
    console.log(project);
    let blob = new Blob(["\ufeff" + project.dump()], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, 1 + `.rpp`);
  }

  function mergeJson() {
    console.log(recordingSessionTemp);
    recordingSessionTemp[2] = [];
    for (let i = 0; i < recordingSessionTemp[0].length; i++) {
      for (let j = 0; j < recordingSessionTemp[1].length; j++) {
        if (
          recordingSessionTemp[0][i]["Audio File Name"] ==
          recordingSessionTemp[1][j]["Audio File Name"]
        ) {
          recordingSessionTemp[2].push(
            Object.assign(
              recordingSessionTemp[0][i],
              recordingSessionTemp[1][j]
            )
          );
          break;
        }
        recordingSessionTemp[2].push(recordingSessionTemp[0][i]);
      }
    }
    setTimeout(() => {
      console.log(recordingSessionTemp[2]);
      let blob = new Blob(
        ["\ufeff" + JSON.stringify(recordingSessionTemp[2])],
        { type: "text/plain;charset=utf-8" }
      );
      saveAs(blob, "newJson" + `.json`);
    }, 3000);
  }
  class MergeData {
    mergeJsonWhenDataExist() {
      if (this.data1 && this.data2) {
        mergeJson();
      }
    }
    setData1(data1) {
      this.data1 = data1;
      this.mergeJsonWhenDataExist();
    }
    setData2(data2) {
      this.data2 = data2;
      this.mergeJsonWhenDataExist();
    }
  }
  //wwise waapi react hook
  const [dialogueCsv, setDialogueCsv] = useState([]);
  const [audioFilesFolder, setAuidoFilesFolder] = useState("");
  const [audioFiles, setAudioFiles] = useState([]);
  const [language, setLanguage] = useState("");
  //waapi import
  //找到特定列
  const getColumns = (dialogueCsv) => {
    const columns = (dialogueCsv || "")
      .replace(/,\n/g, "#")
      .split("#")
      .map((item) => item.replace(/"/g, ""))
      .map((item) => item.replace(/\n/g, ""));

    console.log(columns);
    // const titlefirst = (dialogueCsv || "").split(/\"/);//通过"分割文件
    // const titlesecond = flattenDeep(titlefirst.map((item) => item.split(",")))
    // .map((item) => item.trim())
    // .filter(function (s) {
    //     return s && s.trim();
    // });;//每个单元格分出来

    const title = columns[1].split(",");
    //console.log(title);
    const findId = (name) => {
      for (let i = 0; i < title.length; i++) {
        if (title[i].includes(name)) {
          return i;
        }
      }
      return -1;
    };

    //找到特定列数
    const wwiseEventId = findId("WwiseEvent");
    const typeId = findId("Type");
    const technicalNameId = findId("TechnicalName");
    const audioFileNameId = findId("Audio File Name");

    const data = columns
      .slice(2)
      .map((column) => column.split(",").map((item) => item.trim()));
    //console.log("data: " + data);
    const newData = data[0].map((col, i) => data.map((row) => row[i])); //行列反转
    //console.log(newData);
    const wwiseEvent = newData[wwiseEventId]; //事件名
    let technicalName = newData[technicalNameId]; //角色名
    const audioFileName = newData[audioFileNameId]; //文件名
    for (let i = 0; i < audioFileName.length; i++) {
      if (audioFileName[i].includes(".wav") === false) {
        audioFileName[i] += ".wav";
      }
    }
    if (typeof technicalName === "undefined") {
      //console.log(typeof(technicalName));
      technicalName = wwiseEvent.map((item) => item.split("_").slice(1, 2));
    }
    //console.log(audioFileName);
    const audioFileNameNoWav = audioFileName.map(
      (item) => (item || "").split(".")[0]
    ); //文件名不加.wav
    const randomName = audioFileNameNoWav.map((item) =>
      item.split("_").slice(0, -1).join("_")
    );
    const type = newData[typeId]; //类型
    //  console.log("event: "+wwiseEvent);
    //  console.log("角色名: "+technicalName);
    //  console.log("表格文件名: "+audioFileName);
    //  console.log("类型: "+type);

    const audioFilesTexture = []; //音频文件名

    for (const file of audioFiles) {
      audioFilesTexture.push(file.name);
    }

    const wrongAudioFilesTextture = [];
    function testAudioFilesTextture() {
      for (let i = 0; i < wwiseEvent.length; i++) {
        if (audioFilesTexture.includes(audioFileName[i])) {
          continue;
        } else wrongAudioFilesTextture.push(audioFileName[i]);
      }

      return wrongAudioFilesTextture;
    }
    testAudioFilesTextture();
    //console.log(wrongAudioFilesTextture);

    if (wrongAudioFilesTextture.length !== 0) {
      var a = window.confirm(
        wrongAudioFilesTextture + " 与本地命名不一致！是否仍要导出？"
      );
      if (a === true) {
        //eslint-disable-line
        alert("导出成功");
      } else {
        alert("导出失败");
        return;
      }
    }

    // console.log("文件名: "+ audioFilesTexture);
    // console.log("path: "+ audioFilesFolder);
    const dia = []; //txt文件数组
    for (let i = 0; i < wwiseEvent.length; i++) {
      dia.push({
        AudioFile: audioFilesFolder + "\\" + audioFileName[i],
        ObjectPath:
          wwiseEvent === randomName
            ? "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              wwiseEvent[i] +
              "\\" +
              audioFileNameNoWav[i]
            : "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              randomName[i] +
              "\\" +
              audioFileNameNoWav[i],
        ObjectType: "Sound Voice",
      });
    }
    //console.log(dia);

    const diaTxt =
      "Audio File\tObject Path\tObject Type\n" +
      flatMapDeep(
        dia.map((item) => {
          const line = `${item.AudioFile}\t${item.ObjectPath}\t${item.ObjectType}\t`;
          return [line];
        })
      ).join("\n");

    const diaJson = {
      importOperation: "createNew",
      default: {
        importLanguage: language,
      },
      imports: [],
    };

    for (let i = 0; i < wwiseEvent.length; i++) {
      diaJson.imports.push({
        objectPath:
          wwiseEvent === randomName
            ? "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              wwiseEvent[i] +
              "\\<Sound Voice>" +
              audioFileNameNoWav[i]
            : "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              randomName[i] +
              "\\<Sound Voice>" +
              audioFileNameNoWav[i],
        audioFile: audioFilesFolder + "\\" + audioFileName[i],
      });
    }
    //console.log(diaJson);
    let blob = new Blob(["\ufeff" + diaTxt], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, `export.txt`);
  };

  const getJson = (dialogueCsv) => {
    const columns = (dialogueCsv || "")
      .replace(/,\n/g, "#")
      .split("#")
      .map((item) => item.replace(/"/g, ""))
      .map((item) => item.replace(/\n/g, ""));

    //console.log(columns);
    // const titlefirst = (dialogueCsv || "").split(/\"/);//通过"分割文件
    // const titlesecond = flattenDeep(titlefirst.map((item) => item.split(",")))
    // .map((item) => item.trim())
    // .filter(function (s) {
    //     return s && s.trim();
    // });;//每个单元格分出来

    const title = columns[1].split(",");
    //console.log(title);
    const findId = (name) => {
      for (let i = 0; i < title.length; i++) {
        if (title[i].includes(name)) {
          return i;
        }
      }
      return -1;
    };

    //找到特定列数
    const wwiseEventId = findId("WwiseEvent");
    const typeId = findId("Type");
    const technicalNameId = findId("TechnicalName");
    const audioFileNameId = findId("Audio File Name");

    const data = columns
      .slice(2)
      .map((column) => column.split(",").map((item) => item.trim()));
    //console.log("data: " + data);
    const newData = data[0].map((col, i) => data.map((row) => row[i])); //行列反转
    //console.log(newData);
    const wwiseEvent = newData[wwiseEventId]; //事件名
    let technicalName = newData[technicalNameId]; //角色名
    const audioFileName = newData[audioFileNameId]; //文件名
    for (let i = 0; i < audioFileName.length; i++) {
      if (audioFileName[i].includes(".wav") === false) {
        audioFileName[i] += ".wav";
      }
    }
    if (typeof technicalName === "undefined") {
      //console.log(typeof(technicalName));
      technicalName = wwiseEvent.map((item) => item.split("_").slice(1, 2));
    }
    //console.log(audioFileName);
    const audioFileNameNoWav = audioFileName.map(
      (item) => (item || "").split(".")[0]
    ); //文件名不加.wav
    const randomName = audioFileNameNoWav.map((item) =>
      item.split("_").slice(0, -1).join("_")
    );
    const type = newData[typeId]; //类型
    //  console.log("event: "+wwiseEvent);
    //  console.log("角色名: "+technicalName);
    //  console.log("表格文件名: "+audioFileName);
    //  console.log("类型: "+type);

    const audioFilesTexture = []; //音频文件名

    for (const file of audioFiles) {
      audioFilesTexture.push(file.name);
    }

    const wrongAudioFilesTextture = [];
    function testAudioFilesTextture() {
      for (let i = 0; i < wwiseEvent.length; i++) {
        if (audioFilesTexture.includes(audioFileName[i])) {
          continue;
        } else wrongAudioFilesTextture.push(audioFileName[i]);
      }

      return wrongAudioFilesTextture;
    }
    testAudioFilesTextture();
    //console.log(wrongAudioFilesTextture);

    if (wrongAudioFilesTextture.length !== 0) {
      var a = window.confirm(
        wrongAudioFilesTextture + " 与本地命名不一致！是否仍要导出？"
      );
      if (a === true) {
        //eslint-disable-line
        //alert("导出成功");
      } else {
        alert("导出失败");
        return;
      }
    }

    // console.log("文件名: "+ audioFilesTexture);
    // console.log("path: "+ audioFilesFolder);
    const dia = []; //txt文件数组
    for (let i = 0; i < wwiseEvent.length; i++) {
      dia.push({
        AudioFile: audioFilesFolder + "\\" + audioFileName[i],
        ObjectPath:
          wwiseEvent === randomName
            ? "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              wwiseEvent[i] +
              "\\" +
              audioFileNameNoWav[i]
            : "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              randomName[i] +
              "\\" +
              audioFileNameNoWav[i],
        ObjectType: "Sound Voice",
      });
    }
    if (language === "") {
      alert("请选择语言");
      return;
    }

    const diaJson = {
      importOperation: "useExisting",
      default: {
        importLanguage: language,
      },
      imports: [],
    };

    for (let i = 0; i < wwiseEvent.length; i++) {
      diaJson.imports.push({
        objectPath:
          wwiseEvent === randomName
            ? "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              wwiseEvent[i] +
              "\\<Sound Voice>" +
              audioFileNameNoWav[i]
            : "\\Actor-Mixer Hierarchy\\Default Work Unit" +
              "\\<Actor-Mixer>" +
              type[i] +
              "\\<Switch Container>" +
              technicalName[i] +
              "\\<Random Container>" +
              randomName[i] +
              "\\<Sound Voice>" +
              audioFileNameNoWav[i],
        audioFile: audioFilesFolder + "\\" + audioFileName[i],
      });
    }
    waapiCall("ak.wwise.core.audio.import", diaJson, null, null, null);
    //console.log(diaJson);
    alert("已导入到Wwise");
  };

  //handle funcs
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

  function sendToWwise() {
    wwr_req_recur("_RSfc419379da3c8e35eeb01fd19731ccf4cc0a8fad");
    if (dialogueCsv.length === 0) {
      alert("No files selected");
      return;
    }

    const file = dialogueCsv[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      getJson(data);
    };
    reader.readAsText(file);
  }

  //handle reaperJson from Giant_Export_ItemList.lua
  function handleOutputJson() {
    if (reaperJson.length === 0) {
      alert("No files selected");
      return;
    }

    const file = reaperJson[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      remixReaperJson(data);
      //console.log(data);
    };
    reader.readAsText(file);
  }

  //handle articy json to insert new tracks and rename them
  function handleVoiceFiles() {
    if (articyJson.length === 0) {
      alert("No files selected");
      return;
    }
    const file = articyJson[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      createTracks(data);
    };
    reader.readAsText(file);
  }

  //rppp: handle articy json to create rpp
  function handleEmptyRPP() {
    if (recordingSession.length === 0) {
      alert("No files selected");
      return;
    }
    const file = recordingSession[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      creatDialogueRpp(data);
    };
    reader.readAsText(file);
  }

  //rppp: merge rpp json and articy json
  function handleMergeJson() {
    if (recordingSession.length === 0 && recordingSession2.length === 0) {
      alert("Should select two files");
      return;
    } else {
      recordingSessionTemp = [];
      const mergeData = new MergeData();
      const file = recordingSession[0];
      let reader1 = new FileReader();
      reader1.readAsText(file);
      reader1.onload = function (e) {
        try {
          mergeData.setData1(JSON.parse(e.target.result));
        } catch (e) {
          alert("JSON不符合规范");
          return;
        }
        recordingSessionTemp[0] = data1;
      };
      const file2 = recordingSession2[0];
      let reader2 = new FileReader();
      reader2.readAsText(file2);
      reader2.onload = function (e) {
        data2 = e.target.result;
        try {
          mergeData.setData2(JSON.parse(data2));
        } catch (e) {
          alert("JSON不符合规范");
          return;
        }
        recordingSessionTemp[1] = data2;
      };
    }
    setTimeout(() => {
      mergeJson();
    }, 300);
  }

  return (
    <div class="text-center row">
      <h3 class="alert alert-primary" role="alert">
        SoundTeam Web Interface
      </h3>
      <div class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingOne">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              #Dialogue CSV To Wwise
            </button>
          </h2>
          <div
            id="collapseOne"
            class="accordion-collapse collapse show"
            aria-labelledby="headingOne"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <p>
                <br />
                <br />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  class="bi bi-filetype-csv"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M14 4.5V14a2 2 0 0 1-2 2h-1v-1h1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM3.517 14.841a1.13 1.13 0 0 0 .401.823c.13.108.289.192.478.252.19.061.411.091.665.091.338 0 .624-.053.859-.158.236-.105.416-.252.539-.44.125-.189.187-.408.187-.656 0-.224-.045-.41-.134-.56a1.001 1.001 0 0 0-.375-.357 2.027 2.027 0 0 0-.566-.21l-.621-.144a.97.97 0 0 1-.404-.176.37.37 0 0 1-.144-.299c0-.156.062-.284.185-.384.125-.101.296-.152.512-.152.143 0 .266.023.37.068a.624.624 0 0 1 .246.181.56.56 0 0 1 .12.258h.75a1.092 1.092 0 0 0-.2-.566 1.21 1.21 0 0 0-.5-.41 1.813 1.813 0 0 0-.78-.152c-.293 0-.551.05-.776.15-.225.099-.4.24-.527.421-.127.182-.19.395-.19.639 0 .201.04.376.122.524.082.149.2.27.352.367.152.095.332.167.539.213l.618.144c.207.049.361.113.463.193a.387.387 0 0 1 .152.326.505.505 0 0 1-.085.29.559.559 0 0 1-.255.193c-.111.047-.249.07-.413.07-.117 0-.223-.013-.32-.04a.838.838 0 0 1-.248-.115.578.578 0 0 1-.255-.384h-.765ZM.806 13.693c0-.248.034-.46.102-.633a.868.868 0 0 1 .302-.399.814.814 0 0 1 .475-.137c.15 0 .283.032.398.097a.7.7 0 0 1 .272.26.85.85 0 0 1 .12.381h.765v-.072a1.33 1.33 0 0 0-.466-.964 1.441 1.441 0 0 0-.489-.272 1.838 1.838 0 0 0-.606-.097c-.356 0-.66.074-.911.223-.25.148-.44.359-.572.632-.13.274-.196.6-.196.979v.498c0 .379.064.704.193.976.131.271.322.48.572.626.25.145.554.217.914.217.293 0 .554-.055.785-.164.23-.11.414-.26.55-.454a1.27 1.27 0 0 0 .226-.674v-.076h-.764a.799.799 0 0 1-.118.363.7.7 0 0 1-.272.25.874.874 0 0 1-.401.087.845.845 0 0 1-.478-.132.833.833 0 0 1-.299-.392 1.699 1.699 0 0 1-.102-.627v-.495Zm8.239 2.238h-.953l-1.338-3.999h.917l.896 3.138h.038l.888-3.138h.879l-1.327 4Z"
                  />
                </svg>{" "}
                : &nbsp;&nbsp;
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={(e) => setDialogueCsv(e.target.files)}
                />
                <br />
                <br />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  class="bi bi-badge-vo"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.508 11h1.429l1.99-5.999H6.61L5.277 9.708H5.22L3.875 5.001H2.5L4.508 11zM13.5 8.39v-.77c0-1.696-.962-2.733-2.566-2.733-1.604 0-2.571 1.029-2.571 2.734v.769c0 1.691.967 2.724 2.57 2.724 1.605 0 2.567-1.033 2.567-2.724zm-1.204-.778v.782c0 1.156-.571 1.732-1.362 1.732-.796 0-1.363-.576-1.363-1.732v-.782c0-1.156.567-1.736 1.363-1.736.79 0 1.362.58 1.362 1.736z" />
                  <path d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2z" />
                </svg>{" "}
                : &nbsp;&nbsp;
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={(e) => setAudioFiles(e.target.files)}
                />
                <br />
                <br />
                <input
                  placeholder="语音文件夹路径"
                  type="text"
                  onChange={(e) => setAuidoFilesFolder(e.target.value)}
                />
                <br />
                <br />
                <select
                  class="select"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">选择语言</option>
                  <option value="Chinese(CN)">Chinese(CN)</option>
                  <option value="English(US)">English(US)</option>
                  <option value="Japanese(JP)">Japanese(JP)</option>
                </select>
                <br />
                <br />
                <button type="button" onClick={handleOutputDiaCsv}>
                  Output txt
                </button>
                <br />
                <br />
                <button type="button" class="button2" onClick={sendToWwise}>
                  sendToWwise
                </button>
                <br />
                <br />
                <br />
              </p>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingTwo">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              #Reaper Json To Wwise Note
            </button>
          </h2>
          <div
            id="collapseTwo"
            class="accordion-collapse collapse"
            aria-labelledby="headingTwo"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <p class="p1">
                <span id="load_success_message">Connecting...</span>
                <span id="load_success_project"></span>
                <br />
                <br />
                reaperJson:&nbsp;&nbsp;
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={(e) => setReaperJson(e.target.files)}
                />
                <br />
                <br />
                <br />
                <button
                  type="button"
                  class="button2"
                  onClick={handleOutputJson}
                >
                  reaperJSON2Wwise
                </button>
                <br />
                <br />
              </p>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingThree">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseThree"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              #Remote Act Reaper (still building)
            </button>
          </h2>
          <div
            id="collapseThree"
            class="accordion-collapse collapse"
            aria-labelledby="headingThree"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <p class="p1">
                <br />
                <br />
                <div class="row justify-content-center">
                  <div class="col-sm-4">
                    <input
                      class="form-control"
                      list="datalistOptions"
                      id="exampleDataList"
                      placeholder="Type to search..."
                      onChange={(e) => setReaScript(e.target.value)}
                    ></input>
                    <datalist id="datalistOptions">
                      <option value="Giant_MoveWithCursor">
                        Giant_MoveWithCursor
                      </option>
                      <option value="Giant_moveItemStartPosition">
                        Giant_moveItemStartPosition
                      </option>
                      <option value="Giant_Export_ItemList">
                        Giant_Export_ItemList
                      </option>
                      <option value="insert new track from articyJson">
                        insert new track from articyJson
                      </option>
                    </datalist>
                  </div>
                </div>
                <br />
                <br />
                articyJson:&nbsp;&nbsp;
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={(e) => setArticyJson(e.target.files)}
                />
                <br />
                <br />
                <br />
                <button
                  type="button"
                  class="button2"
                  onClick={handleVoiceFiles}
                >
                  createTracks
                </button>
                <br />
                <br />
              </p>
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingFour">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseFour"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              #Json To Rpp
            </button>
          </h2>
          <div
            id="collapseFour"
            class="accordion-collapse collapse"
            aria-labelledby="headingFour"
            data-bs-parent="#accordionExample"
          >
            <div class="accordion-body">
              <div class="container text-center">
                <div class="row">
                  <div class="col">
                    <input
                      class="form-control"
                      type="file"
                      id="formFile"
                      multiple
                      onChange={(e) => setRecordingSession(e.target.files)}
                    />
                    <div id="emailHelp" class="form-text">
                      选择由Excel转换来的Json
                    </div>
                    <button
                      type="button"
                      class="button2"
                      onClick={handleEmptyRPP}
                    >
                      creatRpp
                    </button>
                  </div>
                  <div class="col">
                    <input
                      class="form-control"
                      type="file"
                      id="formFile"
                      multiple
                      onChange={(e) => setRecordingSession(e.target.files)}
                    />
                    <div id="emailHelp" class="form-text">
                      选择由Excel转换来的Json
                    </div>
                    <input
                      class="form-control"
                      type="file"
                      id="formFile"
                      multiple
                      onChange={(e) => setRecordingSession2(e.target.files)}
                    />
                    <div id="emailHelp" class="form-text">
                      选择由Reaper导出的Json
                    </div>
                    <button
                      type="button"
                      class="button2"
                      onClick={handleMergeJson}
                    >
                      mergeJson
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*<a href ="nomal">Nomal Mode</a> */}
    </div>
  );
}

export default Dialogue;
