<script setup>
import { ref } from 'vue';
import { IMAGE_URL_PREFIX } from '@/global/constant.js';
import PreviewModal from '@/components/previewModal/index.vue';

const props = defineProps({
  // 图片列表数据
  imageList: {
    type: Array,
    default: () => [],
  },
  // 是否显示删除按钮
  showDelete: {
    type: Boolean,
    default: false,
  },
  // 是否正在加载
  loading: {
    type: Boolean,
    default: false,
  },
  // 是否已到底部
  isBottom: {
    type: Boolean,
    default: false,
  },
  // 是否显示第一页loading
  firstLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['delete', 'reach-bottom']);

const previewModalRef = ref(null);

// 预览图片
const handlePreviewImage = (item) => {
  previewModalRef.value.showModal(item);
};

// 删除图片
const handleDeleteImage = (item) => {
  emit('delete', item);
};

// 滚动到底部
const handleReachBottom = () => {
  emit('reach-bottom');
};
</script>

<template>
  <div class="wallpaper-card">
    <a-spin
      style="width: 100%"
      :loading="firstLoading"
      tip="数据加载中...">
      <template v-if="imageList.length">
        <a-list
          :max-height="440"
          :scrollbar="true"
          :bordered="false"
          @reach-bottom="handleReachBottom">
          <template #scroll-loading>
            <div v-if="isBottom">
              <a-space size="middle">
                <icon-thunderbolt />
                <span>小主,已经没有更多的数据了 ~ </span>
              </a-space>
            </div>
            <a-spin
              v-else-if="loading"
              dot />
          </template>

          <div class="wallpaper-content">
            <div
              class="wallpaper-item"
              v-for="item in imageList"
              :key="item.id">
              <a-image
                :preview="false"
                width="340"
                height="200"
                fit="cover"
                @click="handlePreviewImage(item)"
                class="wallpaper-image"
                show-loader
                :src="`${IMAGE_URL_PREFIX}${item.coverimage}`">
              </a-image>

              <a-popconfirm
                v-if="showDelete"
                content="确定删除该图片吗?"
                ok-text="继续"
                cancel-text="取消"
                @ok="handleDeleteImage(item)">
                <div class="wallpaper-delete">
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
        class="wallpaper-empty"
        v-else-if="!loading && imageList.length === 0">
        <a-empty description="小主,好像没有找到数据诶~" />
      </div>



    </a-spin>

    <PreviewModal ref="previewModalRef" />
  </div>
</template>

<style scoped lang="less">
.wallpaper-card {
  .wallpaper-content {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    width: 100%;

    .wallpaper-item {
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
      .wallpaper-image {
        cursor: pointer;
        border-radius: 4px;
      }
    }

    .wallpaper-delete {
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

  .wallpaper-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
