<script setup>
import { ref, watch, onMounted } from 'vue';
import { get360Wallpaper } from '@/api/360_wallpaper';
import { Notification, Modal } from '@arco-design/web-vue';

const tagTypeList = ref([
  { name: '美女', cid: 6 },
  { name: '4K', cid: 36 },
  { name: '清新', cid: 15 },
  { name: '动漫', cid: 26 },
  { name: '明星', cid: 11 },
  { name: '萌宠', cid: 14 },
  { name: '游戏', cid: 5 },
  { name: '影视', cid: 7 },
]);

onMounted(() => {
  let params = {
    cid: currentTag.value,
  };
  getImageData(params);
});

const currentTag = ref(tagTypeList.value[0].cid); // 当前标签

const imageList = ref([]); // 图片列表
const imageListTotal = ref(0); // 图片总数

const imageListCurrent = ref(1); // 当前页
const imageListPageSize = ref(9); // 每页显示数量

const currentTypeMode = ref('getAppsByCategory'); // 当前模式  // getAppsByCategory // search

const imageLoading = ref(false); // 加载状态

const timestamp = ref(''); // 时间戳

// 获取图片数据
const getImageData = async (params) => {
  timestamp.value = Date.now();
  imageLoading.value = true;
  try {
    let param = {
      ...params,
      c: 'WallPaper',
      a: currentTypeMode.value,
      start: imageListCurrent.value * imageListPageSize.value,
      count: imageListPageSize.value,
    };
    const res = await get360Wallpaper(param);
    imageList.value = res.data;
    imageListTotal.value = Number(res.total);
  } finally {
    imageLoading.value = false;
  }
};

// 切换标签
const handleSearchKeyword = (value) => {
  imageListCurrent.value = 1;
  currentTag.value = value;
  let params = {
    cid: value,
  };
  getImageData(params);
};

// 分页
const handlePageChange = (value) => {
  imageListCurrent.value = value;
  let params = {
    cid: currentTag.value,
  };
  getImageData(params);
};

// 下载图片
const handleDownloadImage = (item) => {
  Notification.info({
    id: 'downloadImage',
    content: '图片下载中,请稍等...',
    title: '提示',
  });
  const path = utools.getPath('downloads');
  const suffix = item.url.split('.').pop();
  const name = `${item.id}.${suffix}`;
  window.preload
    .downloadFile(item.url, name, path)
    .then(() => {
      Notification.success({
        id: 'downloadImage',
        content: '图片下载成功',
        title: '提示',
      });
    })
    .catch(() => {
      Notification.error({
        id: 'downloadImage',
        content: '图片下载失败',
        title: '提示',
      });
    });
};

// 复制图片
const handleCopyImage = (item) => {
  window.preload
    .toLocalPath(item.url)
    .then((res) => {
      window.utools.copyImage(res);
      Notification.success({
        id: 'copyImage',
        content: '图片复制成功',
        title: '提示',
      });
    })
    .catch(() => {
      Notification.error({
        id: 'copyImage',
        content: '图片复制失败',
        title: '提示',
      });
    });
};

// 设为壁纸
const handleSetWallpaper = (item) => {
  Modal.confirm({
    title: '提示',
    content: '确认将该图片设置为壁纸吗？',
    onOk() {
      Notification.info({
        id: 'setWallpaper',
        content: '壁纸设置中,请稍等...',
        title: '提示',
      });
      window.preload
        .setWallpaper(item.url)
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
        });
    },
  });
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
          <div class="home_tabList">
            <a-radio-group
              v-model="currentTag"
              @change="handleSearchKeyword"
              type="button">
              <a-radio
                v-for="item in tagTypeList"
                :value="item.cid"
                :key="item.cid">
                {{ item.name }}
              </a-radio>
            </a-radio-group>
          </div>
        </template>
        <div class="home_content">
          <div
            class="home_content_item"
            v-for="item in imageList"
            :key="item.id">
            <a-image
              width="220"
              height="130"
              show-loader
              :alt="item.utag"
              :preview-props="{
                defaultScale: 0.7,
                actionsLayout: [''],
              }"
              :src="`${item.url_thumb}?timestamp=${timestamp}`">
              <template #preview-actions>
                <a-image-preview-action
                  name="下载原图"
                  @click="handleDownloadImage(item)">
                  <icon-cloud-download />
                </a-image-preview-action>

                <a-image-preview-action
                  name="复制图片"
                  @click="handleCopyImage(item)">
                  <icon-copy />
                </a-image-preview-action>

                <a-image-preview-action
                  name="设为壁纸"
                  @click="handleSetWallpaper(item)">
                  <icon-send />
                </a-image-preview-action>
              </template>

              <template #loader>
                <img
                  width="220"
                  height="130"
                  :src="item.url_thumb"
                  style="filter: blur(2px)" />
              </template>
            </a-image>

            <div class="home_content_item_info">
              {{ item.resolution }}
            </div>
          </div>
        </div>

        <div class="home_footer">
          <a-pagination
            @change="handlePageChange"
            :total="imageListTotal"
            v-model:current="imageListCurrent"
            v-model:page-size="imageListPageSize"
            show-total
            show-jumper />
        </div>
      </a-card>
    </a-spin>
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
      .home_content {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        .home_content_item {
          position: relative;
          margin: 5px;
          .home_content_item_info {
            display: flex;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            font-size: 12px;
            padding: 2px 0;
            position: absolute;
            bottom: 0;
            width: 100%;
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
</style>
