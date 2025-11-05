<template>
<div id="parent">
<!--            左-->
            <div class="child">
<!--                顶部标题-->
                <div style="position: relative; display: inline-block;">
                    <img id="configuration" class="infoImg" src="/js/static/image/边框1.png"
                        style="display: block; max-width: 100%">
                    <div
                        style="position: absolute;
                        top: 50%; left:22%;
                        transform: translate(-50%, -50%);
                        color: white;
                         font-size: 20px;">
                        选项配置
                    </div>
                </div>
<!--                录制类型-->
                <h4 style=" margin:20px 0 20px 0;color: #91f2f4">录制类型</h4>
                <div
                    style="display: flex;align-items: center;text-align-last: center;text-align: center; margin:0 10px 20px 5px">
                    <select style="height: 40px; font-size: 20px ; width: 80%;text-align: center;margin-left: 20px;
            background-color: #092046;border: solid 1px #494640;box-shadow: 0 0 10px #3c8dbc;color: #91f2f4"
                        id="recordingMode" onchange="toggleInfoInputs()">
                        <option style="text-align: center;" value="automaticRecording">自动录制</option>
                        <option style="text-align: center;" value="manualRecording">手动录制</option>
                    </select>
                </div>
<!--                任务选择-->
                <h4 style=" margin:20px 0 20px 0;color: #91f2f4">任务选择</h4>
                <select id="taskSelection" style="height: 40px; font-size: 20px ; width: 80%;text-align: center;margin-left: 20px;
            background-color: #092046;border: solid 1px #494640;box-shadow: 0 0 10px #3c8dbc;color: #91f2f4"></select>
<!--                更新数据-->
                <div id="findVideoStatusByDate">
                    <div id="videoStatusTree"></div>
                    <div id="refreshStatus">
                        <button id="refreshStausBtn" class="btn btn-success btn-sm">更新数据</button>
                    </div>
                </div>
            </div>
<!--            中-->
            <div class="child" style="color: #91f2f4">
<!--                顶部标题-->
                <div class="img-container" style="display: flex;">
                    <img id="videoImg" class="infoImg" src="/js/static/image/综合数据.png"
                        style="display: block; max-width: 100%">
                    <div id="selfName"
                        style="position: absolute; top: 50%;left: 5%; transform: translate(-50%, -50%); color: white; font-size: 20px;cursor: pointer;">
                        视频录制
                    </div>
                    <div id="statusInfo" class="text-overlay"></div>
                </div>
<!--                -->
                <div id="progressBar"></div>
                <video class="video" autoPlay id="video"></video>
                <video class="  video video2" autoPlay id="video2" style="display: none"></video>
                <button @click="startRecording" :disabled="startBtnDisabled" class="startButton" id="start-btn" style="display: none;">开始录制</button>
                <button id="testInfoButton" style="display: none;"> 测试账号登录 </button>
            </div>
<!--            右-->
            <div class="child">
<!--                信息采集-->
                <div style="position: relative; display: inline-block;">
                    <img id="infoImg" class="infoImg" src="/js/static/image/边框1.png"
                        style="display: block; max-width: 104%;width: 114%;">
                    <div id="infoCollection"
                        style="position: absolute; top: 50%;left: 13%; transform: translate(-50%, -50%); color: white; font-size: 20px;cursor: pointer;">
                        信息采集</div>
                </div>
<!--                照片-->
                <div className="snapshot-container">
                    <canvas id="idcanvas" width="160" height="150" style="margin-left: 1%">证件照</canvas>
                    <!-- 添加用于显示视频截图的画布 -->
                    <canvas id="snapshot" width="160" height="150">近期照</canvas> <!-- 添加用于显示视频截图的画布 -->
                </div>
                <button id="snapshotButton" style="width: 55%;margin-left: 26%;">拍照</button>
<!--                个人信息-->
                <div className="info-inputs"
                    style="display: flex; flex-direction: column;color: #91f2f4;margin-left: 3%;">
                    <div style="display: flex; align-items: center; text-align: justify; margin:0 10% 4% 8% ">
                        <label htmlFor="name" style="width: 20%;margin-right: 5%;font-size: 120%"> 姓名 </label>
                        <input style="width: 80%;" type="text" id="name" name="name">
                    </div>
                    <div style="display: flex; align-items: center;text-align: justify;margin:0 10% 4% 8% ">
                        <label htmlFor="idNumber" style="width: 20%;margin-right: 5%;font-size: 120%"> 编号 </label>
                        <input style="width: 80%;" type="text" id="idNumber" name="idNumber">
                    </div>
                    <div style="display: flex; align-items: center;text-align: justify; margin:0 10% 4% 8% ">
                        <label htmlFor="age" style="width: 20%;margin-right: 5%;font-size: 120%"> 年龄 </label>
                        <input style="width: 80%;" type="text" id="age" name="age">
                    </div>
                    <div style="display: flex; align-items: center;text-align: justify;margin:0 10% 4% 8% ">
                        <label htmlFor="gender" style="width: 20%;margin-right: 5%;font-size: 120%"> 性别 </label>
                        <input class="gender" id="male" type="radio" checked="checked" name="gender" value="男"
                            style="margin-right: 5px"><span
                            style="font-size: 15px;color: #d7e4ed;margin-right: 20px">男</span>
                        <input class="gender" id="female" type="radio" name="gender" value="女"
                            style="margin-right: 5px"><span style="font-size: 15px;color: #d7e4ed">女</span>
                    </div>
                    <div style="display: flex; align-items: center;text-align: justify;margin:0 10% 4% 8% ">
                        <label htmlFor="jobTitle" style="width: 20%;margin-right: 5%;font-size: 120%"> 部别 </label>
                        <#form:treeselect id="company" title="${text('部职别选择')}" style="height:40px;width:200px;"
                            path="employee.company.companyCode" labelPath="employee.company.companyName"
                            url="${ctx}/sys/company/treeData?ctrlPermi=2" callbackFuncName="treeselectCallback"
                            btnClass="" allowClear="true" canSelectRoot="true" canSelectParent="true" />
                    </div>
                    <div class="info-actions">
                        <div>
                            <button id="saveInfoButton"
                                style="width: 75%;height: 40px;margin-left: 13%;margin-bottom: 8%;margin-top: 4%;"> 保存信息
                            </button>
                            <div id="virtualBox1"></div>
                        </div>
                        <div>
                            <button id="clearInfoButton" style="width: 75%;height: 40px;margin-left: 13%;"> 清空信息
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
            .video {
                border: 2px solid #49A3F525;
                width: calc(100% - 5px);
                /* 调整窗口大小距离边缘5px */
                height: calc(100% - 120px);
                /* 调整窗口大小距离边缘5px */
                position: absolute;
                /*margin-left: 3px;*/
                transform: scaleX(-1);
                /* 水平镜像 */

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

            /* 开始录制按钮样式设置 */
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

            /* 修改倒计时框为进度条样式 */
            #progressBar {
                border: 2px solid #49A3F525;
                /* 黑色边框 */
                width: 99%;
                /* 进度条长度调整为与视频窗口相同 */
                height: 20px;
                /* 进度条高度 */
                background-color: #102155;
                /* 进度条背景色 */
                text-align: center;
                line-height: 20px;
                /* 使文本垂直居中 */
                color: white;
                /* 文本颜色 */
                font-size: 15px;
                /* 文本大小 */
                position: relative;
                /* 为进度条内部的填充设置定位基点 */
                margin: 2px 5px 1px 3px;
            }

            #progressFill {
                height: 100%;
                /* 填充整个高度 */
                background-color: rgb(5, 148, 183);
                /* 填充颜色 */
                text-align: center;
                line-height: 30px;
                /* 使文本垂直居中 */
                color: white;
                /* 文本颜色 */
                position: absolute;
                /* 相对于父元素定位 */
                left: 0;
                top: 0;
            }

            .info-inputs select {
                display: block;
                /* 使每个输入框独占一行 */
                margin-bottom: 10px;
                /* 输入框间距 */
            }

            .info-inputs label {
                margin-bottom: 5px;
                /* 标签与输入框的间距 */
            }

            * {
                margin: 0;
            }

            html,
            body {
                height: 100%;
            }

            #parent {
                background-color: #FFFFFF;
                height: 100%;
                display: flex;
                box-shadow: 5px 1px 5px 1px #999;
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
                /* 添加相对定位以适应视频窗口的绝对定位 */
            }

            .child:nth-child(3) {
                width: 25%;
                margin-left: 5px;
                border: 2px solid #49A3F525;
            }

            .videoOverlay {
                position: absolute;
                top: 55%;
                /* 垂直居中 */
                left: 50%;
                /* 水平居中 */
                transform: translate(-45%, -50%);
                /* 精确居中 */
                width: 27%;
                /* 方框宽度 */
                height: 45%;
                /* 方框高度 */
                border: 4px solid red;
                /* 红色边框 */
                background-color: #FFFFFF00;
                /* 设置透明背景色 */
                z-index: 1;
                /* 确保方框位于视频上层 */
            }

            input[type="text"] {
                border: 0;
                outline: 0;
                border: solid 1px #494640;
                box-shadow: 0 0 10px #3c8dbc;
                border-radius: 4px;
                background-color: transparent;
                caret-color: #ffffff;
                /* 光标颜色 */
                width: 140px;
                height: 40px;
                color: #d7e4ed;
                text-align: left;
            }

            input[type="text"]:focus {
                outline: 1px solid #39949b;
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
                color: #FFFFFF;
                font-size: 20px;
                margin-bottom: 10px;
                background-color: rgb(5 148 183);
            }

            button {
                cursor: pointer;
                /* 显示鼠标指针为手型 */
            }

            button:active {
                transform: translateY(2px);
                /* 按下时按钮向下移动2px */
            }

            button:disabled {
                opacity: 0.5;
                /* 降低按钮透明度表示禁用状态 */
                cursor: not-allowed;
                /* 鼠标指针显示为禁止符号 */
            }

            #brightnessSlider {
                -webkit-appearance: none;
                /* 覆盖默认外观 */
                width: 100%;
                /* 滑块宽度 */
                height: 10px;
                /* 滑块高度 */
                background: #ddd;
                /* 滑块背景色 */
                outline: none;
                /* 去除轮廓 */
                opacity: 0.7;
                /* 透明度设置 */
                border-radius: 10%;
                /* 圆形 */
                transition: opacity .2s;
                /* 过渡效果 */
            }

            #brightnessSlider:hover {
                opacity: 1;
                /* 鼠标悬停时不透明 */
            }

            #brightnessSlider::-webkit-slider-thumb {
                -webkit-appearance: none;
                /* 覆盖默认外观 */
                appearance: none;
                width: 25px;
                /* 滑块手柄的宽度 */
                height: 25px;
                /* 滑块手柄的高度 */
                background: #4e7bcc;
                /* 滑块手柄的背景色 */
                border-radius: 50%;
                /* 圆形 */
                cursor: pointer;
                /* 光标形状 */
            }

            #brightnessSlider::-moz-range-thumb {
                width: 25px;
                /* 滑块手柄的宽度 */
                height: 25px;
                /* 滑块手柄的高度 */
                background: #4e7bcc;
                /* 滑块手柄的背景色 */
                border-radius: 50%;
                /* 圆形 */
                cursor: pointer;
                /* 光标形状 */
            }

            #sliderTicks {
                display: flex;
                justify-content: space-between;
                padding: 0 10px;
            }

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

            #snapshot,
            #idcanvas {
                border: 2px solid #91F4E500;
                /* 设置边框为红色，宽度为2px */
                background-color: #1c477e;
            }

            #snapshot {
                margin-left: 5px;
                width: 175px;
                /* 视频截图宽度调整为容器的宽度 */
                height: 230px;
                /* 高度自适应 */
            }

            #idcanvas {
                width: 190px;
                /* 视频截图宽度调整为容器的宽度 */
                height: 230px;
                /* 高度自适应 */
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

            #parent {
                background-image: url('/js/static/image/win2.jpg');
                height: 100%;
                width: 100%;
                background-size: cover;
                /* 可选：设置背景图大小 */
                background-position: center;
                /* 可选：设置背景图位置 */
            }

            .configuration {
                background-size: contain;
                /* 设置背景图大小为包含在div中 */
                width: 100%;
                background-position: center;
                /* 可选：设置背景图位置 */
                max-width: 100%
            }

            .videoImg {
                background-size: cover;
                /* 设置背景图大小为覆盖整个元素 */
                width: 100%;
                height: 100%;
                background-position: center;
                /* 设置背景图位置为中心 */
                background-repeat: no-repeat;
                /* 禁止背景图重复 */
            }

            img {
                height: 50px;
            }

            img:nth-child(1) {
                height: 50px;
            }

            .img-container::after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 20px;
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

            #addElement #addElementConfirm #addElementClear:focus {
                outline: 1px solid #39949b;
            }

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
                /* 水平居中 */
                align-items: center;
                /* 垂直居中 */
            }

            #videoStatusTree {
                color: #ffffff;
                border-collapse: separate;
                /* 使用独立的边框模型 */
                border-spacing: 10px;
                /* 设置表格单元格之间的间距为10px */
                justify-content: center;
                /* 水平居中 */
                align-items: center;
                /* 垂直居中 */
                max-height: 88%;
                /* 设置最大高度，超出部分将显示滚动条 */
                overflow: auto;
                /* 显示滚动条 */
            }

            #videoStatusTree th {
                padding: 5px;
                /* 设置表格单元格的内边距为5px */

            }

            #videoStatusTree td {
                padding: 5px;
                /* 设置表格单元格的内边距为5px */
            }

            table {
                border-collapse: separate;
                /* 使用独立的边框模型 */
                border-spacing: 10px;
                /* 设置表格单元格之间的间距为10px */
                margin: 0 auto;
                /* 水平居中 */
            }

            th,
            td {
                padding: 5px;
                /* 设置表格单元格的内边距为5px */
                text-align: center;
                /* 内容居中对齐 */
            }

            #parent {
                position: relative;
                /* 父级容器设置为相对定位 */
            }

            #findVideoStatusByDate {
                position: relative;
                /* 设置为相对定位 */
            }

            #refreshStatus {
                position: absolute;
                bottom: 0;
                /* 放置在底部 */
                left: 50%;
                /* 水平居中 */
                transform: translateX(-50%);
                /* 水平居中对齐 */
            }

            /* 鼠标移上去后修改下拉菜单链接颜色 */
            #recordingMode option:hover {
                background-color: rgb(5, 148, 183);
            }

            .fa-search {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 28px;

            }

            .btn-success {
                background-color: #0594B7;
                border-color: #0594B7;
            }
        </style>
