<script setup>
import { ref } from 'vue';

const fnList = ref([
  '✅ 图片原图下载',
  '✅ 图片直接设置为壁纸(mac已经测试,window暂未测试)',
  '✅ 图片复制分享',
  '✅ 图片搜索',
  '✅ 热度壁纸排行',
  '❌ 分类壁纸',
  '❌ 图片微信分享',
  '❌ 图片裁剪成头像/手机尺寸',
  '❌ 图片提供多种格式下载/预览',
  '🌟 有任何问题可以在评论区留言,如果觉得不错请给个好评~',
]);
</script>

<template>
  <div class="about_wrapper">
    <a-list>
      <template #header> 功能列表 </template>
      <a-list-item
        v-for="item in fnList"
        :key="item">
        {{ item }}
      </a-list-item>
    </a-list>
  </div>
</template>

<style scoped lang="less">
.about_wrapper {
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
}
</style>
