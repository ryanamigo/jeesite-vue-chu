<template>
  <div id="parent">
    <div class="child">
      <div style="position: relative; display: inline-block;">
        <img id="configuration" class="infoImg" src="/js/static/image/边框1.png" style="display: block; max-width: 100%" />
        <div style="position: absolute; top: 50%; left: 22%; transform: translate(-50%, -50%); color: white; font-size: 20px;">选项配置</div>
      </div>
      <h4 style="margin: 20px 0; color: #91f2f4">录制类型</h4>
      <div style="display: flex; align-items: center; text-align-last: center; text-align: center; margin: 0 10px 20px 5px">
        <select
          id="recordingMode"
          v-model="recordingMode"
          style="height: 40px; font-size: 20px; width: 80%; text-align: center; margin-left: 20px; background-color: #092046; border: solid 1px #494640; box-shadow: 0 0 10px #3c8dbc; color: #91f2f4"
        >
          <option value="automaticRecording">自动录制</option>
          <option value="manualRecording">手动录制</option>
        </select>
      </div>
      <h4 style="margin: 20px 0; color: #91f2f4">任务选择</h4>
      <select
        id="taskSelection"
        v-model="taskSelection"
        @change="onTaskChange"
        style="height: 40px; font-size: 20px; width: 80%; text-align: center; margin-left: 20px; background-color: #092046; border: solid 1px #494640; box-shadow: 0 0 10px #3c8dbc; color: #91f2f4"
      >
        <option value=""></option>
        <option v-for="item in taskOptions" :key="item.testNumber" :value="item.testNumber">{{ item.testNumberName }}</option>
      </select>
      <div id="findVideoStatusByDate">
        <div id="videoStatusTree">
          <table v-if="videoStatus.length">
            <thead>
              <tr>
                <th>姓名</th>
                <th>视频状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in videoStatus" :key="row.pname + '-' + row.status">
                <td>{{ row.pname }}</td>
                <td>{{ statusText(row.status) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else>暂无数据</div>
        </div>
        <div id="refreshStatus">
          <button id="refreshStausBtn" class="btn btn-success btn-sm" @click="getVideoStatus">更新数据</button>
        </div>
      </div>
    </div>

    <div class="child" style="color: #91f2f4">
      <div class="img-container" style="display: flex;">
        <img id="videoImg" class="infoImg" src="/js/static/image/综合数据.png" style="display: block; max-width: 100%" />
        <div id="selfName" @click="switchToVideo" style="position: absolute; top: 50%; left: 5%; transform: translate(-50%, -50%); color: white; font-size: 20px; cursor: pointer;">视频录制</div>
        <div id="statusInfo" class="text-overlay">{{ statusInfo }}</div>
      </div>
      <div id="progressBar">
        <div id="progressFill" :style="{ width: progressFillWidth }"></div>
      </div>
      <video class="video" autoplay muted playsinline ref="video1Ref"></video>
      <video class="video video2" autoplay muted playsinline ref="video2Ref" style="display: none"></video>
      <button class="startButton" id="start-btn" @click="handleStartClick" :disabled="!canStart" v-show="recordingMode === 'manualRecording'">开始录制</button>
      <button id="testInfoButton" @click="handleTestLogin" v-show="recordingMode === 'manualRecording'">测试账号登录</button>
    </div>

    <div class="child">
      <div style="position: relative; display: inline-block;">
        <img id="infoImg" class="infoImg" src="/js/static/image/边框1.png" style="display: block; max-width: 104%; width: 114%" />
        <div id="infoCollection" @click="switchToInfo" style="position: absolute; top: 50%; left: 13%; transform: translate(-50%, -50%); color: white; font-size: 20px; cursor: pointer;">信息采集</div>
      </div>
      <div class="snapshot-container">
        <canvas id="idcanvas" ref="idCanvasRef" width="160" height="150" style="margin-left: 1%"></canvas>
        <canvas id="snapshot" ref="snapshotCanvasRef" width="160" height="150"></canvas>
      </div>
      <button id="snapshotButton" style="width: 55%; margin-left: 26%" @click="takeSnapshot">拍照</button>
      <div class="info-inputs" style="display: flex; flex-direction: column; color: #91f2f4; margin-left: 3%">
        <div style="display: flex; align-items: center; text-align: justify; margin: 0 10% 4% 8%">
          <label for="name" style="width: 20%; margin-right: 5%; font-size: 120%">姓名</label>
          <input style="width: 80%" type="text" id="name" v-model="name" />
        </div>
        <div style="display: flex; align-items: center; text-align: justify; margin: 0 10% 4% 8%">
          <label for="idNumber" style="width: 20%; margin-right: 5%; font-size: 120%">编号</label>
          <input style="width: 80%" type="text" id="idNumber" v-model="idNumber" />
        </div>
        <div style="display: flex; align-items: center; text-align: justify; margin: 0 10% 4% 8%">
          <label for="age" style="width: 20%; margin-right: 5%; font-size: 120%">年龄</label>
          <input style="width: 80%" type="text" id="age" v-model="age" />
        </div>
        <div style="display: flex; align-items: center; text-align: justify; margin: 0 10% 4% 8%">
          <label for="gender" style="width: 20%; margin-right: 5%; font-size: 120%">性别</label>
          <input class="gender" id="male" type="radio" name="gender" value="男" v-model="gender" style="margin-right: 5px" /><span style="font-size: 15px; color: #d7e4ed; margin-right: 20px">男</span>
          <input class="gender" id="female" type="radio" name="gender" value="女" v-model="gender" style="margin-right: 5px" /><span style="font-size: 15px; color: #d7e4ed">女</span>
        </div>
        <div style="display: flex; align-items: center; text-align: justify; margin: 0 10% 4% 8%">
          <label style="width: 20%; margin-right: 5%; font-size: 120%">部别</label>
          <input id="companyName" v-model="companyName" style="height: 40px; width: 200px" />
        </div>
        <div class="info-actions">
          <div>
            <button id="saveInfoButton" style="width: 75%; height: 40px; margin-left: 13%; margin-bottom: 8%; margin-top: 4%" @click="saveInfo">保存信息</button>
            <div id="virtualBox1"></div>
          </div>
          <div>
            <button id="clearInfoButton" style="width: 75%; height: 40px; margin-left: 13%" @click="clearInfo">清空信息</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="display: none">
    <a ref="downloadRef"></a>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'

const video1Ref = ref<HTMLVideoElement | null>(null)
const video2Ref = ref<HTMLVideoElement | null>(null)
const idCanvasRef = ref<HTMLCanvasElement | null>(null)
const snapshotCanvasRef = ref<HTMLCanvasElement | null>(null)
const downloadRef = ref<HTMLAnchorElement | null>(null)

const recordingMode = ref<'automaticRecording' | 'manualRecording'>('automaticRecording')
const taskSelection = ref<string>('')
const taskOptions = ref<any[]>([])
const videoStatus = ref<any[]>([])

const name = ref('')
const idNumber = ref('')
const age = ref('')
const gender = ref<'男' | '女' | ''>('男')
const companyName = ref<string | null>(null)
const companyCode = ref<string | null>(null)

const statusInfo = ref('')
const progressFillWidth = ref('0px')

let cameraStream: MediaStream | null = null
let cameraStream2: MediaStream | null = null
let mediaRecorder: MediaRecorder | null = null
let mediaRecorder2: MediaRecorder | null = null
let videoData: BlobPart[] | Blob = []
let videoData2: BlobPart[] | Blob = []
let shotFile: File | null = null

let informationTimer: number | null = null
let adjustingTimer: number | null = null
let screenTimer: number | null = null
let countdownTimer: number | null = null

let socket: WebSocket | null = null

const isInfoComplete = computed(() => {
  return !!(companyName.value !== null && name.value && idNumber.value && age.value)
})

const isVideoTab = ref(false)
const canStart = computed(() => {
  if (recordingMode.value === 'manualRecording') return isVideoTab.value && isInfoComplete.value && !!taskSelection.value
  return false
})

function statusText(s: number) {
  if (s === 0) return '未解析'
  if (s === 1) return '解析成功'
  if (s === 2) return '解析中'
  if (s === 3) return '无效视频'
  return ''
}

async function fetchTaskOptions() {
  try {
    const { data } = await axios.get('/test/testNumber/findTestNumberByLimit')
    taskOptions.value = Array.isArray(data) ? data : []
  } catch (e) {}
}

async function getVideoStatus() {
  try {
    if (!taskSelection.value) {
      videoStatus.value = []
      return
    }
    const { data } = await axios.post(`/emotion/emotionVideo/findVideoStatusByDate`, null, { params: { testNumber: taskSelection.value } })
    videoStatus.value = Array.isArray(data) ? data : []
  } catch (e) {
    videoStatus.value = []
  }
}

function onTaskChange() {
  getVideoStatus()
}

function switchToVideo() {
  isVideoTab.value = true
  statusInfo.value = ''
}

function switchToInfo() {
  isVideoTab.value = false
}

function clearIntervalSafe(id: number | null) {
  if (id) window.clearInterval(id)
}

function stopSnapshotInterval() {
  clearIntervalSafe(informationTimer)
  informationTimer = null
}

function stopAdjustingTheAngle() {
  clearIntervalSafe(adjustingTimer)
  adjustingTimer = null
}

function stopScreenTimer() {
  clearIntervalSafe(screenTimer)
  screenTimer = null
}

function resetProgress() {
  progressFillWidth.value = '0px'
}

async function startMediaDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const targetDeviceName1 = 'AXZW6C (0c40:0c80)'
    const targetDeviceName2 = 'AXZW6W (0c40:0c81)'
    for (const d of devices) {
      if (d.kind === 'videoinput' && d.label === targetDeviceName1) {
        const constraints: MediaStreamConstraints = { video: { height: 720, width: 1280 } }
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints)
        const v1 = video1Ref.value!
        v1.controls = false
        v1.srcObject = cameraStream
        await v1.play()
      }
    }
    for (const d of devices) {
      if (d.kind === 'videoinput' && d.label === targetDeviceName2) {
        const constraints2: MediaStreamConstraints = { video: { height: 720, width: 1280, deviceId: (d as any).deviceId } as any }
        cameraStream2 = await navigator.mediaDevices.getUserMedia(constraints2)
        const v2 = video2Ref.value!
        v2.controls = false
        v2.srcObject = cameraStream2
        await v2.play()
      }
    }
    setTimeout(() => {
      statusInfo.value = ''
    }, 500)
  } catch (e) {}
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/png'))
}

async function takeSnapshot() {
  const v1 = video1Ref.value
  const canvas = snapshotCanvasRef.value
  if (!v1 || !canvas) return
  const ctx = canvas.getContext('2d')!
  canvas.width = v1.videoWidth
  canvas.height = v1.videoHeight
  const off = document.createElement('canvas')
  off.width = v1.videoWidth
  off.height = v1.videoHeight
  const offctx = off.getContext('2d')!
  offctx.save()
  offctx.scale(-1, 1)
  offctx.drawImage(v1, -canvas.width, 0, canvas.width, canvas.height)
  offctx.restore()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve) => off.toBlob((b) => resolve(b as Blob), 'image/png'))
  const form = new FormData()
  form.append('multipartFile', blob, 'snapshot.png')
  try {
    const { data: response } = await axios.post('/face/faceWeb/faceRecognitionTest', form)
    if (response && response.length) {
      const rect = response[0].rect
      const width = rect.right - rect.left
      const height = rect.bottom - rect.top
      if (rect.bottom > 718 || rect.left < -5 || rect.top < 8 || rect.right > 1285) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }
      const image = new Image()
      image.onload = () => {
        const scaleRatio = 1.2
        const expandedWidth = width * scaleRatio
        const expandedHeight = height * scaleRatio
        const expandedLeft = rect.left - (expandedWidth - width) / 2
        const expandedTop = rect.top - (expandedHeight - height) / 2
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, expandedLeft, expandedTop, expandedWidth, expandedHeight, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((b) => {
          if (b) shotFile = new File([b], 'snapshot.png', { type: 'image/png' })
        }, 'image/png')
      }
      image.src = URL.createObjectURL(blob)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  } catch (e) {}
}

function informationMatching() {
  stopSnapshotInterval()
  informationTimer = window.setInterval(async () => {
    if (!isVideoTab.value || recordingMode.value !== 'automaticRecording') return
    if (!taskSelection.value) return
    const v1 = video1Ref.value
    if (!v1) return
    const canvas = document.createElement('canvas')
    canvas.width = v1.videoWidth
    canvas.height = v1.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(v1, 0, 0, canvas.width, canvas.height)
    const blob = await canvasToBlob(canvas)
    const form = new FormData()
    form.append('multipartFile', blob, 'snapshot.png')
    try {
      const { data: response } = await axios.post('/face/faceWeb/faceRecognitionTest', form)
      if (response && response[0] && response[0].name) {
        stopSnapshotInterval()
        statusInfo.value = response[0].name
        name.value = response[0].name
        idNumber.value = response[0].pidcard
        age.value = response[0].age
        gender.value = (response[0].gender === '男' ? '男' : '女') as any
        companyName.value = response[0].position
        setTimeout(adjustingTheAngle, 500)
      } else {
        stopSnapshotInterval()
        statusInfo.value = '未检测到人脸信息'
        isVideoTab.value = false
      }
    } catch (e) {}
  }, 1500)
}

function itExists(pidcard: string) {
  axios
    .post(`/subject/subjectInformation/judgePerson`, null, { params: { pidCard: pidcard } })
    .then(({ data }) => {
      if (data === 'true') {
        statusInfo.value = name.value
        setTimeout(adjustingTheAngle, 500)
      } else {
        statusInfo.value = ''
      }
    })
}

function videoAnalyticsOnce() {
  const v1 = video1Ref.value
  const v2 = video2Ref.value
  if (!v1 || !v2) return
  const canvas1 = document.createElement('canvas')
  canvas1.width = v1.videoWidth
  canvas1.height = v1.videoHeight
  const c1 = canvas1.getContext('2d')!
  c1.drawImage(v1, 0, 0, canvas1.width, canvas1.height)
  const canvas2 = document.createElement('canvas')
  canvas2.width = v2.videoWidth
  canvas2.height = v2.videoHeight
  const c2 = canvas2.getContext('2d')!
  c2.drawImage(v2, 0, 0, canvas2.width, canvas2.height)
  Promise.all([canvasToBlob(canvas1), canvasToBlob(canvas2)]).then(([b1, b2]) => {
    const form = new FormData()
    form.append('nirFile', b1, 'snapshot1.jpg')
    form.append('rbgFile', b2, 'snapshot2.jpg')
    axios
      .post('/face/faceWeb/adjustingTheAngle1', form)
      .then(({ data: response }) => {
        if (response === 0) {
          statusInfo.value = '没有人脸或多个人脸'
        } else if (response === 1) {
          statusInfo.value = '亮度过高请远离'
        } else if (response === 2) {
          statusInfo.value = '亮度过低请靠近'
        } else if (response === 3) {
          statusInfo.value = `${name.value}录制中,请保持位置20秒`
          startVideo()
        }
      })
  })
}

function adjustingTheAngle() {
  stopAdjustingTheAngle()
  videoAnalyticsOnce()
  adjustingTimer = window.setInterval(() => {
    videoAnalyticsOnce()
  }, 1000)
}

function startCountdown(duration: number) {
  resetProgress()
  let timer = duration
  const progressBarEl = document.getElementById('progressBar') as HTMLElement
  const total = progressBarEl ? progressBarEl.offsetWidth : 0
  countdownTimer = window.setInterval(() => {
    const filled = ((duration - timer) / duration) * (total || 0)
    progressFillWidth.value = `${filled}px`
    const minutes = String(Math.floor(timer / 60)).padStart(2, '0')
    const seconds = String(timer % 60).padStart(2, '0')
    statusInfo.value = `${minutes}:${seconds}`
    timer--
    if (timer < 0) {
      window.clearInterval(countdownTimer!)
      countdownTimer = null
      stopSnapshotInterval()
      stopScreenTimer()
      if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
      if (mediaRecorder2 && mediaRecorder2.state === 'recording') mediaRecorder2.stop()
    }
  }, 1000)
}

function screenCart(formData: FormData) {
  axios.post('/face/faceWeb/savePictrue', formData)
}

function startVideo() {
  stopAdjustingTheAngle()
  if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
  if (mediaRecorder2 && mediaRecorder2.state === 'recording') mediaRecorder2.stop()
  videoData = []
  videoData2 = []
  mediaRecorder = new MediaRecorder(cameraStream as MediaStream, { mimeType: 'video/webm' })
  mediaRecorder2 = new MediaRecorder(cameraStream2 as MediaStream, { mimeType: 'video/webm' })
  mediaRecorder.start()
  mediaRecorder2.start()
  mediaRecorder.addEventListener('dataavailable', (ev) => {
    ;(videoData as BlobPart[]).push(ev.data)
  })
  mediaRecorder2.addEventListener('dataavailable', (ev) => {
    if (ev.data && ev.data.size > 0) (videoData2 as BlobPart[]).push(ev.data)
  })
  mediaRecorder.addEventListener('stop', () => {
    videoData = new Blob(videoData as BlobPart[])
    if ((videoData as Blob).size === 0) return
    statusInfo.value = ''
    download()
  })
  mediaRecorder2.addEventListener('stop', () => {
    videoData2 = new Blob(videoData2 as BlobPart[])
  })
  startCountdown(20)
  let i = 0
  screenTimer = window.setInterval(async () => {
    const v1 = video1Ref.value
    const v2 = video2Ref.value
    if (!v1 || !v2) return
    const c1 = document.createElement('canvas')
    c1.width = v1.videoWidth
    c1.height = v1.videoHeight
    c1.getContext('2d')!.drawImage(v1, 0, 0, c1.width, c1.height)
    const c2 = document.createElement('canvas')
    c2.width = v2.videoWidth
    c2.height = v2.videoHeight
    c2.getContext('2d')!.drawImage(v2, 0, 0, c2.width, c2.height)
    const [b1, b2] = await Promise.all([canvasToBlob(c1), canvasToBlob(c2)])
    const form = new FormData()
    form.append('name', name.value)
    form.append('pidCard', idNumber.value)
    form.append('nirFile', b1, 'snapshot1.jpg')
    form.append('rbgFile', b2, 'snapshot2.jpg')
    const form2 = new FormData()
    form2.append('multipartFile', b1, 'snapshot1.jpg')
    form2.append('name', name.value)
    form2.append('pidcard', idNumber.value)
    form2.append('taskSelection', taskSelection.value)
    form2.append('flag', String(i))
    if (i < 4) {
      screenCart(form2)
      i += 1
    }
    axios.post('/face/faceWeb/adjustingTheAngle', form).then(({ data: response }) => {
      if (response === 1) {
        statusInfo.value = '亮度过高请远离'
      } else if (response === 2) {
        statusInfo.value = '亮度过低请靠近'
      } else if (response === 0) {
        statusInfo.value = '画面出现多个或无人脸'
      } else if (response === 3) {
        statusInfo.value = '人脸晃动'
      } else if (response === 4) {
        statusInfo.value = '请摆正人脸'
      }
    })
  }, 500)
}

async function download() {
  if (!(videoData as Blob).size) return
  const form = new FormData()
  form.append('nirVideoFile', videoData2 as Blob)
  form.append('videoFile', videoData as Blob)
  form.append('pname', name.value)
  form.append('pidCard', idNumber.value)
  const testNumber = taskSelection.value
  const testNumberName = taskOptions.value.find((i) => i.testNumber === testNumber)?.testNumberName || ''
  try {
    await axios.post(`/emotion/emotionVideo/insertVideoInformation`, form, { params: { testNumber, testNumberName } })
    recordingEnds()
  } catch (e) {
    recordingEnds()
  }
}

function recordingEnds() {
  name.value = ''
  idNumber.value = ''
  age.value = ''
  gender.value = '男'
  companyName.value = null
  const c1 = idCanvasRef.value
  const c2 = snapshotCanvasRef.value
  if (c1) c1.getContext('2d')!.clearRect(0, 0, c1.width, c1.height)
  if (c2) c2.getContext('2d')!.clearRect(0, 0, c2.width, c2.height)
  resetProgress()
  isVideoTab.value = true
}

function clearInfo() {
  name.value = ''
  idNumber.value = ''
  age.value = ''
  companyName.value = null
  const c1 = idCanvasRef.value
  const c2 = snapshotCanvasRef.value
  if (c1) c1.getContext('2d')!.clearRect(0, 0, c1.width, c1.height)
  if (c2) c2.getContext('2d')!.clearRect(0, 0, c2.width, c2.height)
}

async function saveInfo() {
  if (!isInfoComplete.value) return
  const form = new FormData()
  form.append('pname', name.value)
  form.append('pidcard', idNumber.value)
  form.append('age', String(parseInt(age.value)))
  form.append('pgender', gender.value)
  form.append('companyName', companyName.value as string)
  if (companyCode.value) form.append('companyCode', companyCode.value)
  if (shotFile) form.append('shotFile', shotFile)
  try {
    await axios.post('/face/faceInformation/insertOrModifyInformation', form)
    name.value = ''
    idNumber.value = ''
    age.value = ''
    const c1 = idCanvasRef.value
    const c2 = snapshotCanvasRef.value
    if (c1) c1.getContext('2d')!.clearRect(0, 0, c1.width, c1.height)
    if (c2) c2.getContext('2d')!.clearRect(0, 0, c2.width, c2.height)
    openReader1()
  } catch (e) {}
}

function handleStartClick() {
  if (!taskSelection.value) return
  if (companyName.value !== null && name.value && idNumber.value && age.value) {
    itExists(idNumber.value)
  }
}

function handleTestLogin() {
  stopSnapshotInterval()
  isVideoTab.value = true
  name.value = '测试账号'
  idNumber.value = '测试身份证号'
  statusInfo.value = '现在进行姿势调整,调整完毕后自动开始录制视频'
  if (!taskSelection.value) return
  setTimeout(() => adjustingTheAngle(), 1000)
}

function openReader1() {
  const host = 'ws://127.0.0.1:33666'
  if (!socket) socket = new WebSocket(host)
  socket.onopen = function () {
    autoReadIDCard()
  }
  socket.onmessage = function (msg) {
    if (typeof msg.data === 'string') {
      const msgJson = JSON.parse(String(msg.data))
      if (msgJson.fun === 'EST_Reader_ReadIDCard#') {
        if (msgJson.rCode === '0') {
          name.value = msgJson.name
          idNumber.value = msgJson.certNo
          const c1 = idCanvasRef.value!
          const ctx1 = c1.getContext('2d')!
          const img1 = new Image()
          img1.src = 'data:image/jpeg;base64,' + msgJson.base64Data
          img1.onload = function () {
            ctx1.clearRect(0, 0, c1.width, c1.height)
            ctx1.drawImage(img1, 0, 0, c1.width, c1.height)
            c1.toBlob((blob) => {
              if (blob) {
                const idFile = new File([blob], 'idFile.png', { type: 'image/png' })
              }
            }, 'image/png')
          }
          const c2 = snapshotCanvasRef.value!
          const ctx2 = c2.getContext('2d')!
          const img2 = new Image()
          img2.src = 'data:image/jpeg;base64,' + msgJson.base64Data
          img2.onload = function () {
            ctx2.clearRect(0, 0, c2.width, c2.height)
            ctx2.drawImage(img2, 0, 0, c2.width, c2.height)
            c2.toBlob((blob) => {
              if (blob) shotFile = new File([blob], 'snapshot.png', { type: 'image/png' })
            }, 'image/png')
          }
          const currentDate = new Date()
          const birthYear = parseInt(msgJson.birth.substring(0, 4))
          const birthMonth = parseInt(msgJson.birth.substring(4, 6)) - 1
          const birthDay = parseInt(msgJson.birth.substring(6, 8))
          const birthDate = new Date(birthYear, birthMonth, birthDay)
          let a = currentDate.getFullYear() - birthDate.getFullYear()
          if (currentDate.getMonth() < birthDate.getMonth() || (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
            a--
          }
          age.value = String(a)
          if (msgJson.sex === '男') gender.value = '男'
          else if (msgJson.sex === '女') gender.value = '女'
          stopAutoReadIDCard()
        }
      }
    }
  }
}

function autoReadIDCard() {
  try {
    if (socket && socket.readyState === 1) {
      socket.send('EST_Reader_ReadIDCard#|1')
    }
  } catch (e) {}
}

function stopAutoReadIDCard() {
  try {
    if (socket && socket.readyState === 1) socket.send('EST_StopReadIDCard#')
  } catch (e) {}
}

onMounted(() => {
  fetchTaskOptions()
  startMediaDevices()
  isVideoTab.value = false
  const idc = idCanvasRef.value
  const snap = snapshotCanvasRef.value
  if (idc) {
    const ctx = idc.getContext('2d')!
    ctx.font = '19px 宋体'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText('证', idc.width / 2, idc.height / 2 - 25)
    ctx.fillText('件', idc.width / 2, idc.height / 2)
    ctx.fillText('照', idc.width / 2, idc.height / 2 + 25)
  }
  if (snap) {
    const ctx = snap.getContext('2d')!
    ctx.font = '19px 宋体'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText('近', snap.width / 2, snap.height / 2 - 25)
    ctx.fillText('期', snap.width / 2, snap.height / 2)
    ctx.fillText('照', snap.width / 2, snap.height / 2 + 25)
  }
  openReader1()
  informationMatching()
})

onBeforeUnmount(() => {
  stopSnapshotInterval()
  stopAdjustingTheAngle()
  stopScreenTimer()
  if (countdownTimer) window.clearInterval(countdownTimer)
  if (socket) socket.close()
  cameraStream?.getTracks().forEach((t) => t.stop())
  cameraStream2?.getTracks().forEach((t) => t.stop())
})

watch([recordingMode, isInfoComplete, taskSelection], () => {
  if (recordingMode.value === 'automaticRecording' && isVideoTab.value) {
    informationMatching()
  }
})
</script>

<style scoped>
.video {
  border: 2px solid #49a3f525;
  width: calc(100% - 5px);
  height: calc(100% - 120px);
  position: absolute;
  transform: scaleX(-1);
}

#progressBar {
  border: 2px solid #49a3f525;
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

* {
  margin: 0;
}

html,
body {
  height: 100%;
}

#parent {
  background-color: #ffffff;
  height: 100%;
  display: flex;
  box-shadow: 5px 1px 5px 1px #999;
  background-image: url('/js/static/image/win2.jpg');
  width: 100%;
  background-size: cover;
  background-position: center;
}

.child {
  height: 99%;
  flex: 1 1 auto;
  border: 5px #49a3f5b2;
  background-color: #091f4300;
}

.child:nth-child(1) {
  width: 15%;
  border: 2px solid #49a3f525;
  margin-right: 5px;
}

.child:nth-child(2) {
  width: 60%;
  border: 2px solid #49a3f525;
  position: relative;
}

.child:nth-child(3) {
  width: 25%;
  margin-left: 5px;
  border: 2px solid #49a3f525;
}

.videoOverlay {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-45%, -50%);
  width: 27%;
  height: 45%;
  border: 4px solid red;
  background-color: #ffffff00;
  z-index: 1;
}

input[type='text'] {
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

#saveInfoButton,
#snapshotButton,
#clearInfoButton {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 22px;
  background-color: #494640;
  box-shadow: 0 0 15px #97bdd4;
  color: #ffffff;
  font-size: 20px;
  margin-bottom: 10px;
  background-color: rgb(5 148 183);
}

button {
  cursor: pointer;
}

button:active {
  transform: translateY(2px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#snapshot,
#idcanvas {
  border: 2px solid #91f4e500;
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

.img-container {
  position: relative;
}

.text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 20px;
}

.btn-success {
  background-color: #0594b7;
  border-color: #0594b7;
}

.startButton {
  bottom: 13px;
  position: fixed;
  left: 40%;
  height: 25px;
}

#testInfoButton {
  bottom: 13px;
  position: fixed;
  left: 55%;
  height: 25px;
  width: 150px;
}

</style>
