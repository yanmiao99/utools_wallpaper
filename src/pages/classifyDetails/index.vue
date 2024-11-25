<script setup lang="jsx">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import {
  selectLabelListbyClassify,
  selectWallpaperByLabelId,
  selectWallpaperById,
} from '@/api/wallpaper';
import { Notification, Modal } from '@arco-design/web-vue';
import { IMAGE_URL_PREFIX, APPID } from '@/global/constant.js';
import { useLoading } from '@/hooks/useLoading.js';
const { isLoading, loadingText, showLoading, hideLoading } = useLoading();
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

onMounted(() => {
  // 获取分类
  const classify_id = route.query.classify_id;
  getSmallClassifyData(classify_id);
  document.addEventListener('keydown', handleKeyDown);
});

// 获取小分类数据
const getSmallClassifyData = async (classify_id) => {
  const res = await selectLabelListbyClassify({
    classify_id,
  });
  // 最多只取 res 的前8条数据
  smallClassifyList.value = res.slice(0, 8);
  currentClassify.value = res[0].lable_id;
  getImageData();
};

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

const smallClassifyList = ref([]); // 小分类
const currentClassify = ref(''); // 当前分类

const imageList = ref([]); // 图片列表
const imageListTotal = ref(0); // 图片总数

const imageListCurrent = ref(1); // 当前页
const imageListPageSize = ref(4); // 每页显示数量

const imageLoading = ref(false); // 加载状态

const timestamp = ref(''); // 时间戳

const preViewVisible = ref(false); // 预览图片弹窗
const preViewDetails = ref({}); // 预览图片详情

// 预览图片
const handlePreviewImage = async (item) => {
  const res = await selectWallpaperById({
    page: 1,
    pagesize: 5,
    wallpaper_id: item.id,
    openid: 'oGkO_5d8kqjhyH-BS_FMR2vMGdJU',
    appid: APPID,
    isshowad: 0,
    label_id: '',
  });
  preViewDetails.value = res.info;
  preViewVisible.value = true;
};

// 获取图片数据
const getImageData = async () => {
  timestamp.value = Date.now();
  imageLoading.value = true;
  try {
    let param = {
      page: imageListCurrent.value,
      pagesize: imageListPageSize.value,
      label_id: currentClassify.value,
      appid: APPID,
      zone_id: 1,
      sort: 1,
    };
    const res = await selectWallpaperByLabelId(param);
    const tempList = [];
    res.list.forEach((item) => {
      tempList.push({
        id: item.wallpaper.id,
        coverimage: item.wallpaper.coverimage,
        coverimageDetail: item.wallpaper.coverimageDetail,
      });
    });
    imageList.value = tempList;
    imageListTotal.value = res.total;
  } finally {
    imageLoading.value = false;
  }
};

// 返回标签
const handleSearchBack = () => {
  router.back();
};

// 切换标签
const handleChangeType = (value) => {
  imageListCurrent.value = 1;
  currentClassify.value = value;
  getImageData();
};

// 分页
const handlePageChange = (value) => {
  imageListCurrent.value = value;
  getImageData();
};

// 下载图片
const handleDownloadImage = (item) => {
  console.log('item=======>', item);

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

// 云盘超高清图
// const handleCloudDown = (item) => {
//   // 提取 link 中 surl= 后面的字符
//   const cloudLink = item.baiduwangpan1.match(/surl=([^&]*)/)[1];
//   const resLink = `https://pan.baidu.com/s/${cloudLink}`;
//   utools.shellOpenExternal(resLink);
// }

// 监听 preViewVisible , 然后执行 hideLoading
watch(preViewVisible, (val) => {
  if (!val) {
    hideLoading();
  }
});

// 按下左右按键翻页
const handleKeyDown = (e) => {
  if (e.keyCode === 37) {
    if (imageListCurrent.value > 1) {
      imageListCurrent.value -= 1;
      handlePageChange(imageListCurrent.value);
    }
  } else if (e.keyCode === 39) {
    if (
      imageListCurrent.value <
      Math.ceil(imageListTotal.value / imageListPageSize.value)
    ) {
      imageListCurrent.value += 1;
      handlePageChange(imageListCurrent.value);
    }
  }
};
</script>

<template>
  <div class="home_wrapper">
    <a-spin
      class="home_spin"
      :loading="imageLoading"
      tip="数据加载中...">
      <a-card class="home_card">
        <template #title>
          <div class="home_search_tips">
            <a-tooltip content="点击返回标签">
              <div
                class="home_search_box"
                @click="handleSearchBack">
                <icon-left-circle class="home_search_back" />
                <span class="home_search_text">返回</span>
              </div>
            </a-tooltip>

            <div class="home_tabList">
              <a-radio-group
                v-model="currentClassify"
                @change="handleChangeType"
                type="button">
                <a-radio
                  v-for="item in smallClassifyList"
                  :value="item.lable_id"
                  :key="item.lable_id">
                  {{ item.label.name }}
                </a-radio>
              </a-radio-group>
            </div>
          </div>
        </template>
        <template v-if="imageList.length">
          <div class="home_content">
            <div
              class="home_content_item"
              v-for="item in imageList"
              @click="handlePreviewImage(item)"
              :key="item.id">
              <a-image
                :preview="false"
                width="340"
                height="200"
                fit="cover"
                class="home_content_item_image"
                show-loader
                :src="`${IMAGE_URL_PREFIX}${item.coverimage}?timestamp=${timestamp}`">
                <template #loader>
                  <img
                    width="340"
                    height="200"
                    loading="lazy"
                    :src="`${IMAGE_URL_PREFIX}${item.coverimage}`"
                    :style="{
                      filter: 'blur(5px)',
                      objectFit: 'cover',
                    }" />
                </template>
              </a-image>
            </div>
          </div>

          <a-tooltip content="按下键盘左右键可翻页(← 上一页, → 下一页)">
            <div class="home_footer">
              <a-pagination
                @change="handlePageChange"
                :total="imageListTotal"
                v-model:current="imageListCurrent"
                v-model:page-size="imageListPageSize"
                show-jumper />
            </div>
          </a-tooltip>
        </template>

        <a-empty
          description="暂无数据"
          v-else />
      </a-card>
    </a-spin>

    <a-modal
      :esc-to-close="false"
      v-model:visible="preViewVisible">
      <template #title> 预览图片 </template>

      <a-spin
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
            :src="`${IMAGE_URL_PREFIX}${preViewDetails?.coverimage}?timestamp=${timestamp}`">
            <template #loader>
              <img
                width="100%"
                height="300"
                loading="lazy"
                :src="`${IMAGE_URL_PREFIX}${preViewDetails?.coverimage}`"
                :style="{
                  filter: 'blur(5px)',
                  objectFit: 'contain',
                }" />
            </template>
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
  </div>
</template>

<style scoped lang="less">
.home_wrapper {
  overflow: hidden;
  .home_spin {
    width: 100%;
    height: 100vh;
    .home_card {
      height: 100vh;
      .home_tabList {
        width: 100%;
      }
      .home_search_tips {
        display: flex;
        align-items: center;
        cursor: pointer;
        .home_search_box {
          display: flex;
          align-items: center;
          cursor: pointer;
          .home_search_back {
            margin-right: 6px;
            font-size: 22px;
          }
          .home_search_text {
            font-size: 16px;
            margin-right: 6px;
          }
        }
      }
      .home_content {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        .home_content_item {
          position: relative;
          margin: 5px;
          transition: transform 0.3s;
          &:hover {
            transform: scale(1.01);
          }
          .home_content_item_image {
            cursor: pointer;
            border-radius: 4px;
          }
        }
      }
      .home_footer {
        display: flex;
        justify-content: center;
        margin-top: 6px;
      }
    }
  }
}

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
