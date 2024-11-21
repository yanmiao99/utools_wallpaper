<script setup>
import { ref, watch, onMounted } from 'vue';
import { get360Wallpaper } from '@/api/360_wallpaper';
import { Notification, Modal } from '@arco-design/web-vue';
import { useSubInput } from '@/hooks/SubInput';

const { subInput, setSubInput, onChanged, onSearch, onClear } = useSubInput(
  '',
  '搜一搜，例如：赵露思',
  true
);

onChanged((val) => {
  // console.log('子输入框内容变更：', val);
});

onClear(() => {
  currentTypeMode.value = 'getAppsByCategory';
  let params = {
    cid: currentTag.value,
  };
  getImageData(params);
});

const userSearchKeyword = ref(''); // 用户输入的搜索关键词

onSearch((val) => {
  userSearchKeyword.value = val;
  currentTypeMode.value = 'search';
  imageListCurrent.value = 0;
  let params = {
    kw: val,
  };
  getImageData(params);
});

const tagTypeList = ref([
  { name: '游戏', cid: 5 },
  { name: '文字', cid: 35 },
  { name: '美女', cid: 6 },
  { name: '4K', cid: 36 },
  { name: '清新', cid: 15 },
  { name: '动漫', cid: 26 },
  { name: '明星', cid: 11 },
  { name: '萌宠', cid: 14 },
  { name: '影视', cid: 7 },
  { name: '军事', cid: 22 },
]);

onMounted(() => {
  currentTypeMode.value = 'getAppsByCategory';
  let params = {
    cid: currentTag.value,
  };
  getImageData(params);
});

const currentTag = ref(tagTypeList.value[0].cid); // 当前标签

const imageList = ref([]); // 图片列表
const imageListTotal = ref(0); // 图片总数

const imageListCurrent = ref(0); // 当前页
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
    imageList.value = res.data.sort(() => Math.random() - 0.5);
    imageListTotal.value = Number(res.total);
  } finally {
    imageLoading.value = false;
  }
};

// 切换标签
const handleSearchKeyword = (value) => {
  currentTypeMode.value = 'getAppsByCategory';
  setSubInput('');
  imageListCurrent.value = 0;
  currentTag.value = value;
  let params = {
    cid: value,
  };
  getImageData(params);
};

// 分页
const handlePageChange = (value) => {
  imageListCurrent.value = value;
  let params = {};

  if (currentTypeMode.value === 'search') {
    params.kw = userSearchKeyword.value;
  } else {
    params.cid = currentTag.value;
  }

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
        <template v-if="imageList.length">
          <div class="home_content">
            <div
              class="home_content_item"
              v-for="item in imageList"
              :key="item.id">
              <a-image
                width="220"
                height="130"
                class="home_content_item_image"
                show-loader
                :alt="item.utag"
                :preview-props="{
                  defaultScale: 0.7,
                  actionsLayout: [''],
                }"
                :src="`${item.url_thumb}?timestamp=${timestamp}`">
                <template #preview-actions>
                  <a-image-preview-action
                    name="下载高清原图到本地"
                    @click="handleDownloadImage(item)">
                    <icon-cloud-download />
                    下载原图
                  </a-image-preview-action>

                  <a-image-preview-action
                    name="复制图片到剪贴板中"
                    @click="handleCopyImage(item)">
                    <icon-copy />
                    复制图片
                  </a-image-preview-action>

                  <a-image-preview-action
                    name="可将图片直接设置为壁纸"
                    @click="handleSetWallpaper(item)">
                    <icon-send />
                    设为壁纸
                  </a-image-preview-action>
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
              show-jumper />
          </div>
        </template>

        <a-empty
          description="暂无数据,请切换标签或搜索关键词"
          v-else />
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
          transition: transform 0.3s;
          &:hover {
            transform: scale(1.01);
          }
          .home_content_item_image {
            cursor: pointer;
            border-radius: 6px;
          }
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
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
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
