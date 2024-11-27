<script setup lang="jsx">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  selectLabelListbyClassify,
  selectWallpaperByLabelId,
} from '@/api/wallpaper';
import { IMAGE_URL_PREFIX, APPID } from '@/global/constant.js';
import { useRoute, useRouter } from 'vue-router';
import PreviewModal from '@/components/previewModal/index.vue';
import { throttle } from '@/utils/utils/index.js';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  // 获取分类
  const classify_id = route.query.classify_id;
  getSmallClassifyData(classify_id);
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

onUnmounted(() => {});

const smallClassifyList = ref([]); // 小分类
const currentClassify = ref(''); // 当前分类

const imageList = ref([]); // 图片列表
const imageListTotal = ref(0); // 图片总数
const imageListCurrent = ref(1); // 当前页
const imageListPageSize = ref(20); // 每页显示数量

const imageLoading = ref(false); // 加载状态
const isBottom = ref(false); // 是否到达底部
const previewModalRef = ref(null); // 预览图片弹窗实例

// 预览图片
const handlePreviewImage = async (item) => {
  previewModalRef.value.showModal(item);
};

// 获取图片数据
const getImageData = async () => {
  if (isBottom.value) return;
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
    if (res.list.length === 0) {
      imageList.value = [];
      return;
    }

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
    isBottom.value = imageListTotal.value === imageList.value.length;
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
  currentClassify.value = value || tagTypeList.value[0].type_id;
  imageList.value = [];
  isBottom.value = false;
  getImageData();
};

// 分页
const handlePageChange = throttle(() => {
  imageListCurrent.value += 1;
  getImageData();
}, 500);
</script>

<template>
  <div class="home_wrapper">
    <a-spin
      style="width: 100%"
      :loading="imageLoading && imageListCurrent === 1"
      tip="数据加载中...">
      <a-card
        style="min-height: 100vh"
        :loading="imageLoading">
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
        </template>

        <template v-if="imageList.length">
          <a-list
            :max-height="440"
            scrollbar
            :bordered="false"
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
                  :src="`${IMAGE_URL_PREFIX}${item.coverimage}`">
                </a-image>
              </div>
            </div>
          </a-list>
        </template>

        <div
          class="home_empty"
          v-else-if="!imageLoading && imageList.length === 0">
          <a-empty description="小主,好像没有找到数据诶~" />
        </div>

        <div class="home_footer">
          免责声明：本站所有图片均来自网络收集，如有侵权请联系删除
        </div>
      </a-card>
    </a-spin>

    <PreviewModal ref="previewModalRef" />
  </div>
</template>

<style scoped lang="less">
.home_wrapper {
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
</style>
