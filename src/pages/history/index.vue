<script setup>
import { onMounted, ref } from 'vue';
import { IMAGE_URL_PREFIX } from '@/global/constant.js';
import { readHistory, deleteHistory } from '@/utils/utils/historyStore.js';
import { Notification } from '@arco-design/web-vue';
import PreviewModal from '@/components/previewModal/index.vue';
import WallpaperCard from '@/components/wallpaperCard/index.vue';

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

      <WallpaperCard
        :image-list="historyList"
        :show-delete="true"
        @delete="handleDeleteImage" />

      <div class="home_footer">
        免责声明：本站所有图片均来自网络收集，如有侵权请联系删除
      </div>
    </a-card>
  </div>
</template>

<style scoped lang="less">
.home_wrapper {
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
