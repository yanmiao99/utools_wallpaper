<template>
  <a-modal
    :esc-to-close="false"
    draggable
    @before-cancel="closeModal"
    v-model:visible="preViewVisible">
    <template #title> 预览图片 </template>

    <a-spin
      v-if="JSON.stringify(preViewDetails) !== '{}'"
      style="width: 100%"
      :loading="isLoading"
      :tip="loadingText">
      <div class="preView_content">
        <a-image
          :preview="false"
          class="preView_img"
          width="100%"
          height="300"
          show-loader
          fit="contain"
          :src="`${IMAGE_URL_PREFIX}${preViewDetails?.coverimage}`">
        </a-image>

        <div class="preView_info">
          <div class="preView_text">
            <span>图片尺寸：</span>
            <span>
              {{ preViewDetails.imagewidth }}
              x
              {{ preViewDetails.imageheight }}
            </span>
          </div>

          <div class="preView_text">
            <span>原图大小：</span>
            <span>
              {{ (preViewDetails.newimagefilesize / 1024 / 1024).toFixed(2) }}
              MB
            </span>
          </div>
        </div>
      </div>
    </a-spin>
    <template #footer>
      <div class="preView_btn_group">
        <a-image-preview-action
          name="下载高清原图到本地"
          :disabled="isLoading"
          @click="handleDownloadImage(preViewDetails)">
          <icon-download />
          下载原图
        </a-image-preview-action>

        <a-image-preview-action
          name="复制图片到剪贴板中"
          :disabled="isLoading"
          @click="handleCopyImage(preViewDetails)">
          <icon-copy />
          复制图片
        </a-image-preview-action>

        <a-image-preview-action
          name="可将图片直接设置为壁纸"
          :disabled="isLoading"
          @click="handleSetWallpaper(preViewDetails)">
          <icon-send />
          设为壁纸
        </a-image-preview-action>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="jsx">
import { ref, onMounted } from 'vue';
import { selectWallpaperById } from '@/api/wallpaper';
import { Notification, Modal } from '@arco-design/web-vue';
import { useLoading } from '@/hooks/useLoading.js';
const { isLoading, loadingText, showLoading, hideLoading } = useLoading();
import { IMAGE_URL_PREFIX, APPID } from '@/global/constant.js';

const props = defineProps([]);
const emits = defineEmits([]);

const preViewVisible = ref(false); // 预览图片弹窗
const preViewDetails = ref({}); // 预览图片详情

onMounted(() => {});

// 预览图片
const getPreviewImage = async ({ id }) => {
  const res = await selectWallpaperById({
    page: 1,
    pagesize: 5,
    wallpaper_id: id,
    openid: 'oGkO_5d8kqjhyH-BS_FMR2vMGdJU',
    appid: APPID,
    isshowad: 0,
    label_id: '',
  });
  preViewDetails.value = res.info;
  preViewVisible.value = true;
};

// 下载图片
const handleDownloadImage = (item) => {
  if (isLoading.value) return;

  const downloadImagePath = IMAGE_URL_PREFIX + item.image;

  Modal.confirm({
    title: '提示',
    content: `原图较大,共(${(item.newimagefilesize / 1024 / 1024).toFixed(
      2
    )})MB, 确认下载该图片吗？`,
    onOk() {
      showLoading('壁纸下载中...');
      Notification.info({
        id: 'downloadImage',
        content: '原图比较大,需要一些时间下载,请稍等...',
        title: '提示',
        duration: 4000,
      });
      // 获取下载路径
      let path = '';
      const downloadPath = window.utools.dbStorage.getItem('downloadPath');
      if (downloadPath) {
        path = downloadPath;
      } else {
        path = utools.getPath('downloads');
      }

      // 匹配图片后缀是否有 .jpg .png .jpeg .webp .git
      const suffix = downloadImagePath.match(/\.(jpg|png|jpeg|webp|gif)$/)[0];
      const name = `${item.id}${suffix}`;
      window.preload
        .downloadFile(downloadImagePath, name, path)
        .then(() => {
          Notification.success({
            id: 'downloadImage',
            content: '图片下载成功',
            title: '提示',
            duration: 5000,
            footer: (
              <div
                onClick={() => {
                  utools.shellOpenItem(path);
                }}>
                点击打开下载目录
              </div>
            ),
          });
        })
        .catch(() => {
          Notification.error({
            id: 'downloadImage',
            content: '图片下载失败',
            title: '提示',
          });
        })
        .finally(() => {
          hideLoading();
        });
    },
  });
};

// 复制图片
const handleCopyImage = (item) => {
  if (isLoading.value) return;

  const downloadImagePath = IMAGE_URL_PREFIX + item.coverimage;

  // 将 webp 使用 canvas 转换成 base64
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = downloadImagePath;
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const base64 = canvas.toDataURL('image/png');
    utools.copyImage(base64);
    Notification.success({
      id: 'copyImage',
      content: '图片复制成功',
      title: '提示',
    });
  };
};

// 设为壁纸
const handleSetWallpaper = (item) => {
  if (isLoading.value) return;
  const downloadImagePath = IMAGE_URL_PREFIX + item.coverimage;

  Modal.confirm({
    title: '提示',
    content:
      '确认将该图片设置为壁纸吗？(提示 : 如果设置不成功, 请手动下载原图自行设置)',
    onOk() {
      showLoading('壁纸设置中...');
      Notification.info({
        id: 'setWallpaper',
        content: '壁纸原图比较大,需要一些时间设置,请稍等...',
        title: '提示',
        duration: 4000,
      });
      window.preload
        .setWallpaper(downloadImagePath)
        .then(() => {
          Notification.success({
            id: 'setWallpaper',
            content: '壁纸设置成功',
            title: '提示',
          });
        })
        .catch(() => {
          Notification.error({
            id: 'setWallpaper',
            content: '壁纸设置失败',
            title: '提示',
          });
        })
        .finally(() => {
          hideLoading();
        });
    },
  });
};

// 显示弹窗
const showModal = (id) => {
  if (!id) {
    Notification.error({
      content: '小主,不要意思,出错了',
      title: '提示',
    });
    return;
  }

  getPreviewImage(id);
};

// 关闭弹窗
const closeModal = () => {
  // 判断是否有图片正在下载
  if (isLoading.value) {
    Modal.confirm({
      title: '提示',
      content: '图片正在下载中, 确认关闭吗？',
      onOk() {
        preViewVisible.value = false;
      },
    });
    return;
  }

  preViewVisible.value = false;
};

// 暴露给父组件的方法
defineExpose({
  showModal,
  closeModal,
});
</script>

<style lang="less" scoped>
.preView_content {
  position: relative;
  .preView_img {
    object-fit: contain;
    user-select: none;
    border-radius: 4px;
  }
  .preView_info {
    display: flex;
    align-content: center;
    justify-content: space-between;
    margin-top: 10px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    padding: 6px;
    border-radius: 4px;
  }
}

.preView_btn_group {
  display: flex;
  align-content: center;
  justify-content: center;
}
</style>
