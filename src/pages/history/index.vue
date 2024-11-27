<script setup>
import { onMounted, ref } from 'vue';
import { IMAGE_URL_PREFIX } from '@/global/constant.js';
import { readHistory, deleteHistory } from '@/utils/utils/historyStore.js';
import { Notification } from '@arco-design/web-vue';
import PreviewModal from '@/components/previewModal/index.vue';

const historyList = ref([]); // 历史记录列表
const currentType = ref('set'); // 当前选中的历史记录类型
const previewModalRef = ref(null); // 预览图片弹窗实例

const historyType = ref([
  { id: 'set', name: '设置壁纸历史' },
  { id: 'download', name: '下载历史' },
]);

onMounted(() => {
  handleChangeType(currentType.value);
});

// 预览图片
const handlePreviewImage = (item) => {
  previewModalRef.value.showModal(item);
};

// 切换历史记录类型
const handleChangeType = (val) => {
  if (val === 'set') {
    // 获取设置壁纸历史
    historyList.value = readHistory('setWallpaperHistory');
  } else if (val === 'download') {
    // 获取下载历史
    historyList.value = readHistory('downloadHistory');
  }
  // 反转
  historyList.value = historyList.value.reverse();
};

// 删除图片
const handleDeleteImage = (item) => {
  // 删除图片
  historyList.value = historyList.value.filter(
    (historyItem) => historyItem.id !== item.id
  );

  let map = {
    set: 'setWallpaperHistory',
    download: 'downloadHistory',
  };

  // 删除本地存储
  deleteHistory(map[currentType.value], item.id);

  // 更新本地
  handleChangeType(currentType.value);

  Notification.success({
    content: '删除成功',
    title: '提示',
  });
};
</script>

<template>
  <div class="home_wrapper">
    <a-card
      :bordered="false"
      style="min-height: 100vh">
      <template #title>
        <a-radio-group
          v-model="currentType"
          @change="handleChangeType"
          type="button">
          <a-radio
            v-for="item in historyType"
            :value="item.id"
            :key="item.id">
            {{ item.name }}
          </a-radio>
        </a-radio-group>
      </template>

      <template v-if="historyList.length">
        <a-list
          :bordered="false"
          :max-height="440"
          :scrollbar="true">
          <div class="home_content">
            <div
              class="home_content_item"
              v-for="item in historyList"
              :key="item.id">
              <a-image
                :preview="false"
                width="340"
                height="200"
                fit="cover"
                @click="handlePreviewImage(item)"
                class="home_content_item_image"
                show-loader
                :src="`${IMAGE_URL_PREFIX}${item.coverimage}`">
              </a-image>

              <a-popconfirm
                content="确定删除该图片吗?"
                ok-text="继续"
                cancel-text="取消"
                @ok="handleDeleteImage(item)">
                <div class="home_content_item_info">
                  <icon-delete />
                  <div>删除</div>
                </div>
              </a-popconfirm>
            </div>
          </div>
        </a-list>

        <a-back-top
          target-container=".arco-scrollbar-container"
          :style="{ position: 'absolute' }">
          <a-tooltip content="返回顶部">
            <a-button>
              <icon-to-top />
            </a-button>
          </a-tooltip>
        </a-back-top>
      </template>

      <div
        class="home_empty"
        v-else-if="historyList.length === 0">
        <a-empty description="小主,好像没有找到数据诶~" />
      </div>

      <div class="home_footer">
        免责声明：本站所有图片均来自网络收集，如有侵权请联系删除
      </div>

      <PreviewModal ref="previewModalRef" />
    </a-card>
  </div>
</template>

<style scoped lang="less">
.home_wrapper {
  .home_content {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    width: 100%;

    .home_content_item {
      position: relative;
      transition: transform 0.3s;
      margin-bottom: 10px;
      margin-right: 10px;
      &:nth-last-child(1) {
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
    .home_content_item_info {
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      transition: all 0.3s;
      cursor: pointer;
      padding: 4px 10px;
      box-sizing: border-box;
      position: absolute;
      bottom: 0;
      right: 0;
      border-radius: 0 0 4px 0;
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
</style>
