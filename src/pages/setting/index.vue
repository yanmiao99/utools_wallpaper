<script setup lang="jsx">
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

// 清空壁纸缓存
const clearWallpaperCache = () => {
  window.preload
    .clearWallpaper()
    .then(() => {
      Notification.success({
        title: '成功',
        content: '壁纸缓存清空成功',
      });
    })
    .catch((err) => {
      Notification.error({
        title: '失败',
        content: '壁纸缓存清空失败',
      });
    });
};
</script>

<template>
  <a-card
    :bordered="false"
    style="min-height: 100vh">
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

    <a-divider></a-divider>

    <a-space
      direction="vertical"
      style="width: 100%">
      <div style="font-weight: bold">清空壁纸缓存 :</div>

      <a-popconfirm
        content="确认清空壁纸缓存吗？"
        ok-text="继续"
        cancel-text="取消"
        @ok="clearWallpaperCache">
        <a-button type="primary"> 清空缓存 </a-button>
      </a-popconfirm>
    </a-space>
  </a-card>
</template>

<style scoped lang="less"></style>
