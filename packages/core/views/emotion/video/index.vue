<template>
    <div class = "borderMix">
        <!-- 选项配置 -->
        <div class="borderSelect">

        </div>
        <!-- 视频录制 -->
        <div class="borderVideo">

        </div>
        <!-- 信息采集 -->
        <div class="borderInfo">

        </div>
    </div>
</template>
<script lang="ts">

</script>   

<style lang="scss" scoped>
    .borderMix {
        height: 100%;
        width: 100%;
        border: 1px solid #ccc;
        display: flex;
    }
    .borderSelect {
        display: inline-block;
        height: 100%;
        width: 15%;
        border: 1px solid #ccc;
    }
    .borderVideo {
        display: inline-block;
        height: 100%;
        width: 60%;
        border: 1px solid #ccc;
    }
    .borderInfo {
        display: inline-block;
        height: 100%;
        width: 25%;
        border: 1px solid #ccc;
    }
</style>