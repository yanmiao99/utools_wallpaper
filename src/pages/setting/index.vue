<script setup>
import { ref, onMounted } from 'vue';
import { Notification } from '@arco-design/web-vue';

// 默认保存路径
const defaultSavePath = ref('');

onMounted(() => {
  // 获取下载路径
  const downloadPath = window.utools.dbStorage.getItem('downloadPath');
  if (downloadPath) {
    defaultSavePath.value = downloadPath;
  } else {
    defaultSavePath.value = utools.getPath('downloads');
  }
});

// 设置默认保存路径
const setDefaultSavePath = () => {
  // 获取用户的下载路径
  const userPath = window.utools.showOpenDialog({
    title: '选择保存路径',
    defaultPath: './downloads',
    buttonLabel: '确认',
    properties: ['openDirectory'],
  });

  // 存储下载路径到本地
  window.utools.dbStorage.setItem('downloadPath', userPath[0]);

  defaultSavePath.value = userPath[0];

  // 弹出提示
  Notification.success({
    title: '成功',
    content: '壁纸默认下载保存路径设置成功',
  });
};
</script>

<template>
  <div class="setting_wrapper">
    <a-space
      direction="vertical"
      style="width: 100%">
      <div style="font-weight: bold">壁纸默认下载保存路径 :</div>
      <div style="display: flex; align-items: center">
        <a-input
          readonly
          placeholder="请选择壁纸默认下载保存路径"
          v-model="defaultSavePath">
        </a-input>
        <a-button
          type="primary"
          @click="setDefaultSavePath">
          选择路径
        </a-button>
      </div>
    </a-space>
  </div>
</template>

<style scoped lang="less">
.setting_wrapper {
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
  min-height: 100vh;
}
</style>
