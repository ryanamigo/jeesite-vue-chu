<template>
  <div id="parent">
    <!-- 左 -->
    <div class="child">
      <!-- 顶部标题 -->
      <div style="position: relative; display: inline-block;">
        <img id="configuration" class="infoImg" src="/js/static/image/边框1.png" style="display: block; max-width: 100%" />
        <div
          style="position: absolute; top: 50%; left:22%; transform: translate(-50%, -50%); color: white; font-size: 20px;">
          选项配置
        </div>
      </div>
      <!-- 录制类型 -->
      <h4 style=" margin:20px 0 20px 0;color: #91f2f4">录制类型</h4>
      <div style="display: flex;align-items: center;text-align-last: center;text-align: center; margin:0 10px 20px 5px">
        <select
          style="height: 40px; font-size: 20px ; width: 80%;text-align: center;margin-left: 20px; background-color: #092046;border: solid 1px #494640;box-shadow: 0 0 10px #3c8dbc;color: #91f2f4"
          id="recordingMode"
          @change="toggleInfoInputs"
        >
          <option style="text-align: center;" value="automaticRecording">自动录制</option>
          <option style="text-align: center;" value="manualRecording">手动录制</option>
        </select>
      </div>
      <!-- 任务选择 -->
      <h4 style=" margin:20px 0 20px 0;color: #91f2f4">任务选择</h4>
      <select
        id="taskSelection"
        style="height: 40px; font-size: 20px ; width: 80%;text-align: center;margin-left: 20px; background-color: #092046;border: solid 1px #494640;box-shadow: 0 0 10px #3c8dbc;color: #91f2f4"
        @change="renderVideoStatus"
      >
        <option v-for="item in taskList" :key="item.id" :value="item.testNumber">{{item.testNumberName}}</option>
      </select>
      <!-- 更新数据 -->
      <div id="findVideoStatusByDate">
        <div id="videoStatusTree"></div>
        <div id="refreshStatus">
          <button id="refreshStausBtn" class="btn btn-success btn-sm" @click="renderVideoStatus">更新数据</button>
        </div>
      </div>
    </div>

    <!-- 中 -->
    <div class="child" style="color: #91f2f4">
      <!-- 顶部标题 -->
      <div class="img-container" style="display: flex;">
        <img id="videoImg" class="infoImg" src="/js/static/image/综合数据.png" style="display: block; max-width: 100%" />
        <div id="selfName" style="position: absolute; top: 50%;left: 5%; transform: translate(-50%, -50%); color: white; font-size: 20px;cursor: pointer;" @click="onClickSelfName">
          视频录制
        </div>
        <div id="statusInfo" class="text-overlay"></div>
      </div>
      <div id="progressBar"></div>
      <video class="video" autoplay id="video" ref="videoRef"></video>
      <video class="video video2" autoplay id="video2" style="display: none"></video>
      <button @click="startRecording" :disabled="startBtnDisabled" class="startButton" id="start-btn" style="display: none;">开始录制</button>
      <button id="testInfoButton" style="display: none;" @click="handleTestInfoLogin">测试账号登录</button>
    </div>

    <!-- 右 -->
    <div class="child">
      <!-- 信息采集 -->
      <div style="position: relative; display: inline-block;">
        <img id="infoImg" class="infoImg" src="/js/static/image/边框1.png" style="display: block; max-width: 104%;width: 114%;" />
        <div id="infoCollection" style="position: absolute; top: 50%;left: 13%; transform: translate(-50%, -50%); color: white; font-size: 20px;cursor: pointer;" @click="onClickInfoCollection">
          信息采集
        </div>
      </div>
      <!-- 照片 -->
      <div class="snapshot-container">
        <canvas id="idcanvas" width="160" height="150" style="margin-left: 1%">证件照</canvas>
        <!-- 添加用于显示视频截图的画布 -->
        <canvas id="snapshot" width="160" height="150" ref="snapshotCanvasRef">近期照</canvas>
      </div>
      <button id="snapshotButton" style="width: 55%;margin-left: 26%;" @click="handleSnapshot">拍照</button>
      <!-- 个人信息 -->
      <div class="info-inputs" style="display: flex; flex-direction: column;color: #91f2f4;margin-left: 3%;">
        <div style="display: flex; align-items: center; text-align: justify; margin:0 10% 4% 8% ">
          <label for="name" style="width: 20%;margin-right: 5%;font-size: 120%"> 姓名 </label>
          <input style="width: 80%;" type="text" id="name" name="name" v-model="pername"/>
        </div>
        <div style="display: flex; align-items: center;text-align: justify;margin:0 10% 4% 8% ">
          <label for="idNumber" style="width: 20%;margin-right: 5%;font-size: 120%"> 编号 </label>
          <input style="width: 80%;" type="text" id="idNumber" name="idNumber" v-model="peridNumber"  />
        </div>
        <div style="display: flex; align-items: center;text-align: justify; margin:0 10% 4% 8% ">
          <label for="age" style="width: 20%;margin-right: 5%;font-size: 120%"> 年龄 </label>
          <input style="width: 80%;" type="text" id="age" name="age" v-model="perage"/>
        </div>
        <div style="display: flex; align-items: center;text-align: justify;margin:0 10% 4% 8% ">
          <label for="gender" style="width: 20%;margin-right: 5%;font-size: 120%"> 性别 </label>
          <input class="gender" id="male" type="radio" checked name="gender" value="男" style="margin-right: 5px" />
          <span style="font-size: 15px;color: #d7e4ed;margin-right: 20px">男</span>
          <input class="gender" id="female" type="radio" name="gender" value="女" style="margin-right: 5px" />
          <span style="font-size: 15px;color: #d7e4ed">女</span>
        </div>
        <div style="display: flex; align-items: center;text-align: justify;margin:0 10% 4% 8% ">
          <label for="jobTitle" style="width: 20%;margin-right: 5%;font-size: 120%"> 部别 </label>
          <!-- Treeselect 服务端标签占位，前端先用占位下拉替代 -->
          <select style="height:40px;width:200px; background-color: #092046;border: solid 1px #494640;box-shadow: 0 0 10px #3c8dbc;color: #91f2f4">
            <option value="">请选择</option>
          </select>
        </div>
        <div class="info-actions">
          <div>
            <button id="saveInfoButton" style="width: 75%;height: 40px;margin-left: 13%;margin-bottom: 8%;margin-top: 4%;" @click="saveInfo"> 保存信息 </button>
            <div id="virtualBox1"></div>
          </div>
          <div>
            <button id="clearInfoButton" style="width: 75%;height: 40px;margin-left: 13%;" @click="clearInfo"> 清空信息 </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { faceRecognitionBySnapshot, getTasksData, getVideoStatus,insertOrModifyInformation } from '../../../api/emption/vedio';
import { log } from 'console';

const startBtnDisabled = ref(true);

let cameraStream: MediaStream | null = null;
let cameraStream2: MediaStream | null = null;
let intervalId: number | null = null;
let startinformationMatching: number | null = null;
let readIDIntervalId: number | null = null;
let isclearInfo = false;
let companyName: string | null = null;
let companyCode: string | null = null;
let formData2: FormData | null = null;
let socket: WebSocket | null = null;
let shotFile: File | null = null;

const getEl = (id: string) => document.getElementById(id) as HTMLElement;
const getInput = (id: string) => document.getElementById(id) as HTMLInputElement;

const videoRef = ref<HTMLVideoElement | null>(null);
const snapshotCanvasRef = ref<HTMLCanvasElement | null>(null);

const notifyWarn = (msg: string) => {
  try { (window as any).toastr?.warning(msg); } catch {}
};

const clearInfo = () => {
  formData2 = new FormData();
  const startBtn = getEl('start-btn') as HTMLButtonElement;
  if (startBtn) startBtn.disabled = true;
  const name = getInput('name');
  const idNumber = getInput('idNumber');
  const age = getInput('age');
  if (name) name.value = '';
  if (idNumber) idNumber.value = '';
  if (age) age.value = '';
  clearTreeSelect();
  const idCanvas = document.getElementById('idcanvas') as HTMLCanvasElement | null;
  const snapshot = document.getElementById('snapshot') as HTMLCanvasElement | null;
  if (idCanvas) { const ctx = idCanvas.getContext('2d'); ctx?.clearRect(0, 0, idCanvas.width, idCanvas.height); }
  if (snapshot) { const ctx2 = snapshot.getContext('2d'); ctx2?.clearRect(0, 0, snapshot.width, snapshot.height); }
  try { autoReadIDCard(); } catch {}
};
const notifyError = (msg: string) => {
  try { (window as any).toastr?.error(msg); } catch { console.error(msg); }
};

const fetchJSON = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${res.status}`);
  try { return await res.json(); } catch { return null as any; }
};

const renderVideoStatus = async () => {
  const select = document.getElementById('taskSelection') as HTMLSelectElement;
  const v = select?.value || '';
  try {
    const resp = await getVideoStatus(v)
    const container = getEl('videoStatusTree');
    if (!container) return;
    if (resp && resp.length > 0) {
      let html = '<table><thead><tr><th>姓名</th><th>视频状态</th></tr></thead><tbody>';
      html += resp.map((row: any) => {
        let statusText = '';
        switch (row.status) {
          case 0: statusText = '未解析'; break;
          case 1: statusText = '解析成功'; break;
          case 2: statusText = '解析中'; break;
          case 3: statusText = '无效视频'; break;
          default: statusText = ''; break;
        }
        return `<tr><td>${row.pname ?? ''}</td><td>${statusText}</td></tr>`;
      }).join('');
      html += '</tbody></table>';
      container.innerHTML = html;
    } else {
      container.innerHTML = '暂无数据';
    }
  } catch (e) {
    notifyError('获取视频状态失败');
  }
};

const clearTreeSelect = () => {
  try {
    const code = getInput('companyCode');
    const name = getInput('companyName');
    if (code) code.value = '';
    if (name) name.value = '';
    companyName = null;
  } catch {}
};

const toggleInfoInputs = () => {
  const selfName = getEl('selfName');
  const statusInfo = getEl('statusInfo');
  const name = getInput('name');
  const idNumber = getInput('idNumber');
  const age = getInput('age');
  const startBtn = getEl('start-btn') as HTMLButtonElement;
  const testInfoButton = getEl('testInfoButton');
  const progressBar = getEl('progressBar');
  if (selfName) selfName.innerHTML = '视频录制';
  if (selfName) (selfName as HTMLElement).style.left = '5%';
  if (statusInfo) statusInfo.innerHTML = '';
  if (name) name.value = '';
  if (idNumber) idNumber.value = '';
  if (age) age.value = '';
  clearTreeSelect();
  if (progressBar) progressBar.innerHTML = '<div id="progressFill"></div>';
  const mode = (document.getElementById('recordingMode') as HTMLSelectElement)?.value;
  if (startBtn) startBtn.style.display = 'block';
  if (mode === 'manualRecording') {
    if (startBtn) startBtn.disabled = true;
    if (testInfoButton) testInfoButton.style.display = 'block';
    const checker = window.setInterval(() => {
      const selectedTask = (document.getElementById('taskSelection') as HTMLSelectElement)?.value || '';
      if (!selectedTask) return;
      if (companyName !== null && name?.value && idNumber?.value && age?.value) {
        window.clearInterval(checker);
        if (startBtn) startBtn.disabled = false;
      }
    }, 1000);
  } else {
    if (isclearInfo) informationMatching();
    if (startBtn) startBtn.disabled = true;
    if (name) name.value = '';
    if (idNumber) idNumber.value = '';
    if (age) age.value = '';
    clearTreeSelect();
    const selectedTask = (document.getElementById('taskSelection') as HTMLSelectElement)?.value || '';
    if (!selectedTask) notifyWarn('请选择任务批次');
    if (startBtn) startBtn.style.display = 'none';
    if (testInfoButton) testInfoButton.style.display = 'none';
  }
};

const setStyles = (elementId: string, backgroundColor: string, borderRadius: string) => {
  const el = getEl(elementId);
  if (!el) return;
  (el as HTMLElement).style.backgroundColor = backgroundColor;
  (el as HTMLElement).style.borderRadius = borderRadius;
};

const autoReadIDCard = () => {
  try {
    if (socket && socket.readyState === 1) {
      socket.send('EST_Reader_ReadIDCard#|1');
    } else {
      try { (window as any).toastr?.warning('未找到控件，请检查控件是否安装.'); } catch {}
    }
  } catch {
    try { (window as any).toastr?.warning('连接异常,请检查是否成功安装控件.'); } catch {}
  }
};

const stopAutoReadIDCard = () => {
  try {
    if (socket && socket.readyState === 1) {
      socket.send('EST_StopReadIDCard#');
    } else {
      try { (window as any).toastr?.warning('未找到控件，请检查控件是否安装.'); } catch {}
    }
  } catch {
    try { (window as any).toastr?.warning('连接异常,请检查是否成功安装控件.'); } catch {}
  }
};

let idFile: File | null = null;

const openReader1 = () => {
  try {
    const host = 'ws://127.0.0.1:33666';
    if (!socket) {
      socket = new WebSocket(host);
    }
    socket.onopen = () => {
      autoReadIDCard();
    };
    socket.onclose = () => {};
    socket.onerror = () => {};
    socket.onmessage = (msg: MessageEvent) => {
      if (typeof msg.data === 'string') {
        const msgJson = JSON.parse(String(msg.data));
        switch (msgJson.fun) {
          case 'EST_Reader_ReadIDCard#': {
            if (msgJson.rCode === '0') {
              const name = getInput('name');
              const idNumber = getInput('idNumber');
              if (name) name.value = msgJson.name || '';
              if (idNumber) idNumber.value = msgJson.certNo || '';

              const idCanvas = document.getElementById('idcanvas') as HTMLCanvasElement | null;
              if (idCanvas) {
                const ctx = idCanvas.getContext('2d');
                const img = new Image();
                img.src = 'data:image/jpeg;base64,' + (msgJson.base64Data || '');
                img.onload = () => {
                  ctx?.clearRect(0, 0, idCanvas.width, idCanvas.height);
                  ctx?.drawImage(img, 0, 0, idCanvas.width, idCanvas.height);
                  idCanvas.toBlob((blob) => {
                    if (!blob) return;
                    try {
                      idFile = new File([blob], 'idFile.png', { type: 'image/png' });
                      if (!formData2) formData2 = new FormData();
                      formData2.append('idFile', idFile);
                    } catch {}
                  }, 'image/png');
                };
              }

              const snapshotCanvas = document.getElementById('snapshot') as HTMLCanvasElement | null;
              if (snapshotCanvas) {
                const ctx2 = snapshotCanvas.getContext('2d');
                const img2 = new Image();
                img2.src = 'data:image/jpeg;base64,' + (msgJson.base64Data || '');
                img2.onload = () => {
                  ctx2?.clearRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
                  ctx2?.drawImage(img2, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
                  snapshotCanvas.toBlob((blob) => {
                    if (!blob) return;
                    try { shotFile = new File([blob], 'snapshot.png', { type: 'image/png' }); } catch {}
                  }, 'image/png');
                };
              }

              try {
                if (msgJson.birth && typeof msgJson.birth === 'string' && msgJson.birth.length >= 8) {
                  const currentDate = new Date();
                  const birthYear = parseInt(msgJson.birth.substring(0, 4));
                  const birthMonth = parseInt(msgJson.birth.substring(4, 6)) - 1;
                  const birthDay = parseInt(msgJson.birth.substring(6, 8));
                  const birthDate = new Date(birthYear, birthMonth, birthDay);
                  let age = currentDate.getFullYear() - birthDate.getFullYear();
                  if (
                    currentDate.getMonth() < birthDate.getMonth() ||
                    (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())
                  ) {
                    age--;
                  }
                  const ageInput = getInput('age');
                  if (ageInput) ageInput.value = String(age);
                }
              } catch {}

              try {
                if (msgJson.sex === '男') {
                  (document.getElementById('male') as HTMLInputElement).checked = true;
                  (document.getElementById('female') as HTMLInputElement).checked = false;
                } else if (msgJson.sex === '女') {
                  (document.getElementById('male') as HTMLInputElement).checked = false;
                  (document.getElementById('female') as HTMLInputElement).checked = true;
                }
              } catch {}

              stopAutoReadIDCard();
            } else if (msgJson.rCode === '1') {
              // 已停止自动读卡
            } else if (msgJson.rCode === '-2') {
              // 请放身份证
            } else {
              // 其他错误
            }
            break;
          }
        }
      }
    };
  } catch {
    try { (window as any).toastr?.warning('连接异常,请检查是否成功安装控件.'); } catch {}
  }
};

const stopSnapshotInterval = () => {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
};

const startMediaDevices = () => {
  const targetDeviceName = 'AXZW6C (0c40:0c80)';
  navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      devices.forEach(function (device) {
        if (device.kind === 'videoinput' && device.label === targetDeviceName) {
          // 申请视频和音频的参数
          const constraints = {
            video: {
              height: 720,
              width: 1280,
            },
          };
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            cameraStream = stream;
            const videoEl = document.getElementById('video') as HTMLVideoElement;
            if (videoEl) {
              // 禁用 video 的控制组件
              videoEl.controls = false;
              // 把媒体流传给 video 的 srcObject
              videoEl.srcObject = cameraStream;
              // 播放画面和声音
              videoEl.play();
            }
          }).catch(info => {
            notifyError('错误' + info);
          })
        }
      });
    })
    .catch(function (err) {
      console.error('获取设备信息时出错:', err);
    });

  const targetDeviceName2 = 'AXZW6W (0c40:0c81)';
  navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      devices.forEach(function (device) {
        if (device.kind === 'videoinput' && device.label === targetDeviceName2) {
          const constraints2 = {
            video: {
              height: 720,
              width: 1280,
              deviceId: device.deviceId,
            },
          };
          // 申请摄像头和麦克风权限
          navigator.mediaDevices.getUserMedia(constraints2).then(stream => {
            cameraStream2 = stream;
            const videoEl2 = document.getElementById('video2') as HTMLVideoElement;
            if (videoEl2) {
              videoEl2.controls = false;
              // 把媒体流传给 video 的 srcObject
              videoEl2.srcObject = cameraStream2;
              // 检查视频轨道是否存在且激活
              const videoTracks = stream.getVideoTracks();
              if (videoTracks.length === 0 || !videoTracks[0].enabled) {
                throw new Error('No video track available');
              }
              videoEl2.play();
            }
          }).catch(info => {
            notifyError('错误' + info);
          })
        }
      });
    })
    .catch(function (err) {
      console.error('获取设备信息时出错:', err);
    });

  setTimeout(() => {
    const statusInfo = document.getElementById('statusInfo');
    if (statusInfo) {
      statusInfo.innerHTML = '';
    }
  }, 500)
};

const informationMatching = () => {
  isclearInfo = false;
  if (startinformationMatching) window.clearInterval(startinformationMatching);
  startinformationMatching = window.setInterval(async () => {
    const selfName = getEl('selfName');
    const mode = (document.getElementById('recordingMode') as HTMLSelectElement)?.value;
    if (selfName && (selfName as HTMLElement).style.backgroundColor === 'rgb(5, 148, 183)') {
      if (mode === 'automaticRecording') {
        const selectedTask = (document.getElementById('taskSelection') as HTMLSelectElement)?.value || '';
        if (!selectedTask) return;
        isclearInfo = true;
        if (startinformationMatching) { window.clearInterval(startinformationMatching); startinformationMatching = null; }
        const videoEl = document.getElementById('video') as HTMLVideoElement;
        console.log('Video element:', videoEl);
        console.log('Video width:', videoEl?.videoWidth, 'height:', videoEl?.videoHeight);
        console.log('Video readyState:', videoEl?.readyState);
        if (!videoEl || !videoEl.videoWidth) {
          console.error('Video element not ready or no dimensions');
          return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error('Canvas toBlob failed - no blob generated');
            return;
          }
          console.log('Blob generated:', blob.size, 'bytes, type:', blob.type);
          try {
            const resp = await faceRecognitionBySnapshot(blob);
            if (resp && resp[0] && resp[0].name) {
              stopSnapshotInterval();
              const statusInfo = getEl('statusInfo');
              if (statusInfo) statusInfo.innerHTML = resp[0].name;
              const startBtn = getEl('start-btn') as HTMLButtonElement;
              if (startBtn) startBtn.disabled = true;
              (document.getElementById('name') as HTMLInputElement)?.value !== undefined && ((document.getElementById('name') as HTMLInputElement).value = resp[0].name || '');
              (document.getElementById('idNumber') as HTMLInputElement)?.value !== undefined && ((document.getElementById('idNumber') as HTMLInputElement).value = resp[0].pidcard || '');
              (document.getElementById('age') as HTMLInputElement)?.value !== undefined && ((document.getElementById('age') as HTMLInputElement).value = resp[0].age || '');
              if (resp[0].gender === '男') {
                (document.getElementById('male') as HTMLInputElement).checked = true;
                (document.getElementById('female') as HTMLInputElement).checked = false;
              } else if (resp[0].gender === '女') {
                (document.getElementById('male') as HTMLInputElement).checked = false;
                (document.getElementById('female') as HTMLInputElement).checked = true;
              }
            }
          } catch {}
        }, 'image/png');
      }
    }
  }, 1000);
};

const itExists = async (pidcard: string) => {
  try {
    const data = await fetchJSON(`${(window as any).ctx || ''}/subject/subjectInformation/judgePerson?pidCard=${encodeURIComponent(pidcard)}`, { method: 'POST' });
    if (data === 'true' || data === true) {
      const statusInfo = getEl('statusInfo');
      const name = getInput('name');
      if (statusInfo && name) statusInfo.innerHTML = name.value;
      window.setTimeout(() => { /* 姿态调整入口占位 */ }, 500);
    } else {
      try {
        (window as any).Swal?.fire({ title: '提示', text: '无此人信息，请先进行信息采集', icon: 'warning', showCancelButton: false, confirmButtonText: '确定' });
      } catch {}
      const startBtn = getEl('start-btn') as HTMLButtonElement;
      if (startBtn) startBtn.disabled = false;
    }
  } catch (e) {
    notifyError('校验人员失败');
  }
};

const startRecording = () => {
  const selfName = getEl('selfName');
  if (selfName && (selfName as HTMLElement).style.backgroundColor === 'rgb(5, 148, 183)') {
    startBtnDisabled.value = true;
    const statusInfo = getEl('statusInfo');
    if (statusInfo) statusInfo.innerHTML = '';
    const selectedTaski = (document.getElementById('taskSelection') as HTMLSelectElement)?.value || '';
    const name = getInput('name');
    const idNumber = getInput('idNumber');
    const age = getInput('age');
    if (companyName !== null && name?.value && idNumber?.value && age?.value) {
      if (!selectedTaski) notifyWarn('请选择任务批次');
    } else {
      if (!selectedTaski) notifyWarn('请选择任务批次和填写个人信息'); else notifyWarn('请填写个人信息');
    }
    const checker = window.setInterval(() => {
      const selectedTask = (document.getElementById('taskSelection') as HTMLSelectElement)?.value || '';
      if (!selectedTask) return;
      if (companyName !== null && name?.value && idNumber?.value && age?.value) {
        window.clearInterval(checker);
        itExists(idNumber.value);
      }
    }, 5000);
  }
};

const handleSnapshot = () => {
  const Canvas = snapshotCanvasRef.value || (document.getElementById('snapshot') as HTMLCanvasElement);
  const context = Canvas?.getContext('2d');
  const video = videoRef.value || (document.getElementById('video') as HTMLVideoElement);
  if (!Canvas || !context || !video) return;
  // 摄像头就绪校验
  if (!video.videoWidth || !video.videoHeight) {
    notifyWarn('摄像头未就绪，请稍后再试');
    return;
  }

  // 画布尺寸与清空
  Canvas.width = video.videoWidth;
  Canvas.height = video.videoHeight;
  context.clearRect(0, 0, Canvas.width, Canvas.height);

  // 先将当前帧即时绘制到预览（镜像以保持与视频一致的观感）
  context.save();
  context.scale(-1, 1);
  context.drawImage(video, -Canvas.width, 0, Canvas.width, Canvas.height);
  context.restore();

  // 使用离屏画布生成上传用的 Blob
  const offscreenCanvas = document.createElement('canvas');
  const offscreenContext = offscreenCanvas.getContext('2d');
  if (!offscreenContext) return;
  offscreenCanvas.width = video.videoWidth;
  offscreenCanvas.height = video.videoHeight;
  offscreenContext.save();
  offscreenContext.scale(-1, 1);
  offscreenContext.drawImage(video, -offscreenCanvas.width, 0, offscreenCanvas.width, offscreenCanvas.height);
  offscreenContext.restore();

  offscreenCanvas.toBlob(async (blob) => {
    // debugger
    // if (!blob) return;
    try {
      const rectData = await faceRecognitionBySnapshot(blob);
      const rect = rectData[0].rect;
      
      if (rect && rectData.length) {
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        
        // 判断照片中人像位置是否居中
        if (rect.bottom > 718) {
          context.clearRect(0, 0, Canvas.width, Canvas.height); notifyWarn('照片不合格，人员过于靠下，请靠上拍照');
          return
        }
        if (rect.left < -5) {
          context.clearRect(0, 0, Canvas.width, Canvas.height); notifyWarn('照片不合格，人员过于靠左，请靠右拍照');
          return
        }
        if (rect.top < 8) {
          context.clearRect(0, 0, Canvas.width, Canvas.height); notifyWarn('照片不合格，人员过于靠上，请靠下拍照');
          return
        }
        if (rect.right > 1285) {
          context.clearRect(0, 0, Canvas.width, Canvas.height); notifyWarn('照片不合格，人员过于靠右，请靠左拍照');
          return
        }
        const image = new Image();
        image.onload = function () {
          // 计算需要扩大的比例
          const scaleRatio = 1.2; // 假设扩大比例为1.2

          // 计算扩大后的宽高度
          const expandedWidth = width * scaleRatio;
          const expandedHeight = height * scaleRatio;

          // 计算扩大后的起始点
          const expandedLeft = rect.left - (expandedWidth - width) / 2;
          const expandedTop = rect.top - (expandedHeight - height) / 2;

          // 清空画布
          context.clearRect(0, 0, Canvas.width, Canvas.height);

          // 绘制扩大后的画面到 Canvas 上
          context.drawImage(image, expandedLeft, expandedTop, expandedWidth, expandedHeight, 0, 0, Canvas.width, Canvas.height);

          // 将画布内容转换为 Blob 对象
          Canvas.toBlob(function (blob) {
            shotFile = new File([blob], 'snapshot.png', { type: 'image/png' });
          }, 'image/png');
        };
        image.src = URL.createObjectURL(blob); // 将Blob对象转换为URL        
      } else {
        // 接口未返回有效结果，保留本地预览
        notifyWarn('照片不合格，请调整姿态后重试');
      }
    } catch (e) {
      // 接口失败，保留本地预览
      notifyError('照片上传失败');
    }
  }, 'image/png');
};

const onClickSelfName = () => {
  const taskSel = document.getElementById('taskSelection') as HTMLSelectElement;
  setStyles('infoCollection', '', '');
  setStyles('selfName', 'rgb(5, 148, 183)', '5px');
  const saveBtn = getEl('saveInfoButton') as HTMLButtonElement;
  if (saveBtn) saveBtn.disabled = true;
  const mode = (document.getElementById('recordingMode') as HTMLSelectElement)?.value;
  if (mode === 'automaticRecording') {
    const selectedTask = taskSel?.value || '';
    if (!selectedTask) notifyWarn('请选择任务批次');
    const checker = window.setInterval(() => {
      const v = taskSel?.value || '';
      if (!v) return;
      window.clearInterval(checker);
      window.setTimeout(() => informationMatching(), 1000);
    }, 1000);
  } else {
    const selectedTask = taskSel?.value || '';
    if (!selectedTask) notifyWarn('请选择任务批次和填写个人信息');
    const name = getInput('name');
    const idNumber = getInput('idNumber');
    const age = getInput('age');
    const checker = window.setInterval(() => {
      const v = taskSel?.value || '';
      if (!v) return;
      if (companyName !== null && name?.value && idNumber?.value && age?.value) {
        window.clearInterval(checker);
        const startBtn = getEl('start-btn') as HTMLButtonElement;
        if (startBtn) startBtn.disabled = false;
      }
    }, 5000);
  }
};

const onClickInfoCollection = () => {
  stopSnapshotInterval();
  setStyles('selfName', '', '');
  setStyles('infoCollection', 'rgb(5, 148, 183)', '5px');
  const saveBtn = getEl('saveInfoButton') as HTMLButtonElement;
  if (saveBtn) saveBtn.disabled = false;
  const startBtn = getEl('start-btn') as HTMLButtonElement;
  if (startBtn) startBtn.disabled = true;
  openReader1();
};

const handleTestInfoLogin = () => {
  stopSnapshotInterval();
  // 启用开始按钮（手动录制）
  startBtnDisabled.value = false;
  const startBtn = getEl('start-btn') as HTMLButtonElement;
  if (startBtn) startBtn.disabled = false;
  // 填充测试账号信息
  const name = getInput('name');
  const idNumber = getInput('idNumber');
  if (name) name.value = '测试账号';
  if (idNumber) idNumber.value = '测试身份证号';
  // 提示姿态调整
  const statusInfo = getEl('statusInfo');
  if (statusInfo) statusInfo.innerHTML = '现在进行姿势调整,调整完毕后自动开始录制视频';
  // 任务校验
  const selectedTask = (document.getElementById('taskSelection') as HTMLSelectElement)?.value || '';
  if (!selectedTask) {
    notifyWarn('请选择任务批次');
    return;
  }
  // 预留姿态调整/自动开始逻辑（与原 HTML 中 adjustingTheAngle 行为对齐）
  window.setTimeout(() => {
    // 此处可接入姿态调整或直接触发后续流程
  }, 1000);
};

let pername = ref('');
let peridNumber = ref('');
let perage = ref('');

let formData3 = new FormData();


const saveInfo = async () => {
  try {
    formData3.append('name', perage.value);
    formData3.append('idNumber', peridNumber.value);
    formData3.append('age', perage.value);
    formData3.append('shotFile', shotFile);
    formData3.append('idFile', shotFile);
    formData3.append('gender',"女");
    formData3.append('company',null);
    insertOrModifyInformation(formData3)
  } finally {
    try { autoReadIDCard(); } catch {}
  }
};


const taskList = ref([])
onMounted(async () => {
  try {
    const companyNameEl = getEl('companyName');
    const companyButton = getEl('companyButton');
    if (companyNameEl) { (companyNameEl as HTMLElement).style.width = '211px'; (companyNameEl as HTMLElement).style.height = '40px'; }
    if (companyButton) { (companyButton as HTMLElement).style.height = '40px'; }
  } catch {}

  await nextTick();
  formData2 = new FormData();
  await startMediaDevices();
  informationMatching();
  // await getTasksData();
  const taskDataList = await getTasksData()
  taskList.value = taskDataList

  const progressBar = getEl('progressBar');
  if (progressBar) progressBar.innerHTML = '<div id="progressFill"></div>';
});

onBeforeUnmount(() => {
  stopSnapshotInterval();
  if (startinformationMatching) window.clearInterval(startinformationMatching);
  if (readIDIntervalId) window.clearInterval(readIDIntervalId);
  try {
    if (socket && socket.readyState === 1) {
      socket.send('EST_StopReadIDCard#');
      socket.close();
    }
  } catch {}
  socket = null;
  cameraStream?.getTracks().forEach(t => t.stop());
  cameraStream2?.getTracks().forEach(t => t.stop());
});

const tasks = ref();
</script>
<style scoped>
.video {
  border: 2px solid #49A3F525;
  width: calc(100% - 5px);
  height: calc(100% - 120px);
  position: absolute;
  transform: scaleX(-1);
}

#testInfoButton,
.startButton,
.playButton,
.exportButton {
  width: 150px;
  border: 0;
  border-radius: 22px;
  background-color: rgb(5, 148, 183);
  box-shadow: 0 0 15px #97bdd4;
  color: #FFFFFF;
  font-size: 15px;
  margin-bottom: 4px;
}

.startButton {
  bottom: 13px;
  position: fixed;
  left: 40%;
  height: 25px;
}

.exportButton {
  bottom: 13px;
  position: fixed;
  left: 28%;
  height: 25px;
  width: 100px;
}

#testInfoButton {
  bottom: 13px;
  position: fixed;
  left: 55%;
  height: 25px;
  width: 150px;
}

#progressBar {
  border: 2px solid #49A3F525;
  width: 99%;
  height: 20px;
  background-color: #102155;
  text-align: center;
  line-height: 20px;
  color: white;
  font-size: 15px;
  position: relative;
  margin: 2px 5px 1px 3px;
}

#progressFill {
  height: 100%;
  background-color: rgb(5, 148, 183);
  text-align: center;
  line-height: 30px;
  color: white;
  position: absolute;
  left: 0;
  top: 0;
}

.info-inputs select {
  display: block;
  margin-bottom: 10px;
}

.info-inputs label {
  margin-bottom: 5px;
}

* { margin: 0; }

html, body { height: 100%; }

#parent {
  background-color: #FFFFFF;
  height: 100%;
  display: flex;
  box-shadow: 5px 1px 5px 1px #999;
  background-image: url('/js/static/image/win2.jpg');
  width: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.child {
  height: 99%;
  flex: 1 1 auto;
  border: 5px #49A3F5B2;
  background-color: #091F4300;
}

.child:nth-child(1) {
  width: 15%;
  border: 2px solid #49A3F525;
  margin-right: 5px;
}

.child:nth-child(2) {
  width: 60%;
  border: 2px solid #49A3F525;
  position: relative;
}

.child:nth-child(3) {
  width: 25%;
  margin-left: 5px;
  border: 2px solid #49A3F525;
}

.videoOverlay {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-45%, -50%);
  width: 27%;
  height: 45%;
  border: 4px solid red;
  background-color: #FFFFFF00;
  z-index: 1;
}

input[type="text"] {
  border: 0;
  outline: 0;
  border: solid 1px #494640;
  box-shadow: 0 0 10px #3c8dbc;
  border-radius: 4px;
  background-color: transparent;
  caret-color: #ffffff;
  width: 140px;
  height: 40px;
  color: #d7e4ed;
  text-align: left;
}

input[type="text"]:focus { outline: 1px solid #39949b; }

#saveInfoButton,
#snapshotButton,
#clearInfoButton {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 22px;
  background-color: #494640;
  box-shadow: 0 0 15px #97bdd4;
  color: #FFFFFF;
  font-size: 20px;
  margin-bottom: 10px;
  background-color: rgb(5 148 183);
}

button { cursor: pointer; }
button:active { transform: translateY(2px); }
button:disabled { opacity: 0.5; cursor: not-allowed; }

#brightnessSlider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 10px;
  background: #ddd;
  outline: none;
  opacity: 0.7;
  border-radius: 10%;
  transition: opacity .2s;
}
#brightnessSlider:hover { opacity: 1; }
#brightnessSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4e7bcc;
  border-radius: 50%;
  cursor: pointer;
}
#brightnessSlider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #4e7bcc;
  border-radius: 50%;
  cursor: pointer;
}

#sliderTicks { display: flex; justify-content: space-between; padding: 0 10px; }
#sliderTicks span {
  position: relative;
  display: block;
  text-align: center;
  width: 1px;
  background: #39b1e8;
  height: 10px;
  color: rgba(255, 255, 255, 0.1);
  font-size: 0px;
}

#snapshot, #idcanvas {
  border: 2px solid #91F4E500;
  background-color: #1c477e;
}

#snapshot {
  margin-left: 5px;
  width: 175px;
  height: 230px;
}

#idcanvas {
  width: 190px;
  height: 230px;
}

#snapshotButton {
  text-align: center;
  align-items: center;
  margin-left: 110px;
  margin-top: 5px;
  margin-bottom: 20px;
  height: 30px;
  width: 150px;
}

.configuration { background-size: contain; width: 100%; background-position: center; max-width: 100% }
.videoImg { background-size: cover; width: 100%; height: 100%; background-position: center; background-repeat: no-repeat; }

img { height: 50px; }
img:nth-child(1) { height: 50px; }

.img-container::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
}

.img-container { position: relative; }

.text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
}

.treeselect .form-control,
.form-control.laydate {
  background-color: transparent !important;
  color: #d7e4ed;
  width: 100px;
  height: 30px;
}

.input-group-btn .btn,
.treeSearchInput button,
.treeSearchInput button:hover,
.treeSearchInput button:focus {
  border: solid 1px #494640;
  box-shadow: 0 0 10px #3c8dbc;
  border-radius: 4px;
  background-color: transparent !important;
  color: #d7e4ed;
  height: 30px;
}

#addElement #addElementConfirm #addElementClear:focus { outline: 1px solid #39949b; }

#addElement,
#addElementConfirm,
#addElementClear,
#addElementCancel {
  border: 0;
  outline: 0;
  border: solid 1px #494640;
  box-shadow: 0 0 10px #3c8dbc;
  border-radius: 4px;
  background-color: transparent;
  width: 60px;
  height: 30px;
  color: #d7e4ed;
  font-size: 15px;
}

#findVideoStatusByDate {
  width: 80%;
  height: 43%;
  border: solid 2px #3c8dbc;
  box-shadow: 0 0 10px #3c8dbc;
  border-radius: 4px;
  margin: 10% 0 0 10%;
  background-color: #0b61a78f;
  justify-content: center;
  align-items: center;
  position: relative;
}

#videoStatusTree {
  color: #ffffff;
  border-collapse: separate;
  border-spacing: 10px;
  justify-content: center;
  align-items: center;
  max-height: 88%;
  overflow: auto;
}

#videoStatusTree th { padding: 5px; }
#videoStatusTree td { padding: 5px; }

table {
  border-collapse: separate;
  border-spacing: 10px;
  margin: 0 auto;
}

th, td {
  padding: 5px;
  text-align: center;
}

#refreshStatus {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

#recordingMode option:hover { background-color: rgb(5, 148, 183); }

.fa-search { display: flex; align-items: center; justify-content: center; height: 28px; }

.btn-success { background-color: #0594B7; border-color: #0594B7; }
</style>
