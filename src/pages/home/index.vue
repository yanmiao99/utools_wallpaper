<script setup lang="jsx">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import {
  selectWallpaperListByType,
  globalSearch,
  selectWallpaperById,
} from '@/api/wallpaper';
import { Notification, Modal } from '@arco-design/web-vue';
import { useSubInput } from '@/hooks/SubInput';
import { IMAGE_URL_PREFIX, APPID } from '@/global/constant.js';
import { useLoading } from '@/hooks/useLoading.js';
import { throttle } from '@/utils/utils/index.js';
const { isLoading, loadingText, showLoading, hideLoading } = useLoading();
const { subInput, setSubInput, onChanged, onSearch, onClear } = useSubInput(
  '',
  '搜一搜，回车键确认',
  true
);

onChanged((val) => {});

onClear(() => {
  handleSearchBack();
  preViewVisible.value = false;
});

const userSearchKeyword = ref(''); // 用户输入的搜索关键词

onSearch((val) => {
  userSearchKeyword.value = val;
  imageListCurrent.value = 1;
  imageList.value = [];
  handleSearchKeywordData();
  preViewVisible.value = false;
});

const tagTypeList = ref([
  { name: '最近更新', type_id: 1 },
  { name: '24H热门', type_id: 2 },
  { name: '本周排行', type_id: 3 },
  { name: '当月排行', type_id: 4 },
  { name: '热门下载', type_id: 5 },
  { name: '热门使用', type_id: 6 },
]);

onMounted(() => {
  getImageData();
});

onUnmounted(() => {});

const currentTag = ref(tagTypeList.value[0].type_id); // 当前标签
const imageList = ref([]); // 图片列表

const imageListTotal = ref(0); // 页总数
const imageListCurrent = ref(0); // 当前页
const imageListPageSize = ref(20); // 每页显示数量

const imageLoading = ref(false); // 加载状态

const timestamp = ref(''); // 时间戳

const preViewVisible = ref(false); // 预览图片弹窗
const preViewDetails = ref({}); // 预览图片详情

const isBottom = ref(false); // 是否到达底部

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
  if (imageLoading.value) return;
  if (isBottom.value) return;

  timestamp.value = Date.now();
  imageLoading.value = true;
  try {
    let param = {
      page: imageListCurrent.value,
      pagesize: imageListPageSize.value,
      type_id: currentTag.value,
      appid: APPID,
      zone_id: 1,
    };
    const res = await selectWallpaperListByType(param);
    imageList.value.push(...res.list);
    imageListTotal.value = res.total;

    // 判断是否到达底部
    isBottom.value = imageListTotal.value === imageList.value.length;
  } finally {
    imageLoading.value = false;
  }
};

// 搜索关键词
const handleSearchKeywordData = async () => {
  if (imageLoading.value) return;
  if (isBottom.value) return;

  timestamp.value = Date.now();
  imageLoading.value = true;
  try {
    const res = await globalSearch({
      page: imageListCurrent.value,
      pagesize: imageListPageSize.value,
      sort: 1,
      label_id: '',
      appid: APPID,
      zone_id: 1,
      keyword: userSearchKeyword.value,
    });
    const tempList = [];
    res.list.forEach((item) => {
      tempList.push({
        id: item.wallpaper.id,
        coverimage: item.wallpaper.coverimage,
        coverimageDetail: item.wallpaper.coverimageDetail,
      });
    });
    imageList.value.push(...tempList);
    imageListTotal.value = res.total;

    // 判断是否到达底部
    isBottom.value = imageListTotal.value === imageList.value.length;
  } finally {
    imageLoading.value = false;
  }
};

// 返回标签
const handleSearchBack = () => {
  userSearchKeyword.value = '';
  setSubInput('');
  imageListCurrent.value = 1;
  imageList.value = [];
  getImageData();
};

// 切换标签
const handleChangeType = (value) => {
  setSubInput('');
  imageListCurrent.value = 1;
  currentTag.value = value;
  imageList.value = [];
  getImageData();
};

// 滚动加载分页
const handlePageChange = throttle(() => {
  imageListCurrent.value += 1;
  if (userSearchKeyword.value) {
    handleSearchKeywordData();
  } else {
    getImageData();
  }
}, 500);

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
</script>

<template>
  <div class="home_wrapper">
    <a-card style="min-height: 100vh">
      <template #title>
        <div
          class="home_search_tips"
          v-if="userSearchKeyword.length">
          <a-tooltip content="点击返回标签">
            <icon-left-circle
              class="home_search_back"
              @click="handleSearchBack" />
          </a-tooltip>
          <span>当前正在搜索 :</span>
          <span class="home_search_text">{{ userSearchKeyword }}</span>
        </div>

        <div
          class="home_tabList"
          v-else>
          <a-radio-group
            v-model="currentTag"
            @change="handleChangeType"
            type="button">
            <a-radio
              v-for="item in tagTypeList"
              :value="item.type_id"
              :key="item.type_id">
              {{ item.name }}
            </a-radio>
          </a-radio-group>
        </div>
      </template>
      <template v-if="imageList.length">
        <a-list
          :max-height="440"
          scrollbar
          @reach-bottom="handlePageChange">
          <template #scroll-loading>
            <div v-if="isBottom">
              <a-space size="middle">
                <icon-thunderbolt />
                <span>小主,已经没有更多的数据了 ~ </span>
              </a-space>
            </div>
            <a-spin
              v-else
              dot />
          </template>
          <div class="home_content">
            <div
              class="home_content_item"
              @click="handlePreviewImage(item)"
              v-for="item in imageList"
              :key="item.id">
              <a-image
                :preview="false"
                width="340"
                height="200"
                fit="cover"
                class="home_content_item_image"
                show-loader
                :src="`${IMAGE_URL_PREFIX}${item.coverimage}?timestamp=${timestamp}`">
              </a-image>
            </div>
          </div>
        </a-list>
      </template>

      <div
        class="home_empty"
        v-else>
        <a-empty description="小主,好像没有找到数据诶~" />
      </div>

      <div class="home_footer">
        免责声明：本站所有图片均来自网络收集，如有侵权请联系删除
      </div>
    </a-card>
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
  .home_tabList {
    width: 100%;
  }
  .home_search_tips {
    display: flex;
    align-items: center;
    .home_search_back {
      cursor: pointer;
      margin-right: 6px;
      font-size: 22px;
    }
    .home_search_text {
      font-weight: bold;
      margin-left: 6px;
      color: #1890ff;
    }
  }

  .home_content {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    padding: 13px;
    box-sizing: border-box;

    .home_content_item {
      position: relative;
      transition: transform 0.3s;
      margin-bottom: 10px;
      margin-right: 10px;
      &:nth-child(2n) {
        margin-right: 0;
      }
      &:hover {
        transform: scale(1.01);
      }
      .home_content_item_image {
        cursor: pointer;
        border-radius: 4px;
      }
    }
  }
  .home_empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .home_footer {
    text-align: center;
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
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
