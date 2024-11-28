<script setup lang="jsx">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { selectWallpaperListByType, globalSearch } from '@/api/wallpaper';
import { useSubInput } from '@/hooks/SubInput';
import { IMAGE_URL_PREFIX, APPID } from '@/global/constant.js';
import { throttle } from '@/utils/utils/index.js';
import PreviewModal from '@/components/previewModal/index.vue';
import WallpaperCard from '@/components/wallpaperCard/index.vue';
const { subInput, setSubInput, onChanged, onSearch, onClear } = useSubInput(
  '',
  '搜一搜，回车键确认',
  true
);

onChanged((val) => {});

onClear(() => {
  handleSearchBack();
  previewModalRef.value.closeModal();
});

const userSearchKeyword = ref(''); // 用户输入的搜索关键词

onSearch((val) => {
  userSearchKeyword.value = val;
  imageListCurrent.value = 1;
  imageList.value = [];
  isBottom.value = false;
  handleSearchKeywordData();
  previewModalRef.value.closeModal();
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
const imageListCurrent = ref(1); // 当前页
const imageListPageSize = ref(20); // 每页显示数量

const imageLoading = ref(false); // 加载状态
const isBottom = ref(false); // 是否到达底部
const previewModalRef = ref(null); // 预览图片弹窗实例

// 预览图片
const handlePreviewImage = (item) => {
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
      type_id: currentTag.value,
      appid: APPID,
      zone_id: 1,
    };
    const res = await selectWallpaperListByType(param);
    imageList.value.push(...res.list);
    imageListTotal.value = res.total;
    isBottom.value = imageListTotal.value === imageList.value.length;
  } finally {
    imageLoading.value = false;
  }
};

// 搜索关键词
const handleSearchKeywordData = async () => {
  if (isBottom.value) return;
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
  userSearchKeyword.value = '';
  handleChangeType(tagTypeList.value[0].type_id);
};

// 切换标签
const handleChangeType = (value) => {
  setSubInput('');
  imageListCurrent.value = 1;
  currentTag.value = value || tagTypeList.value[0].type_id;
  imageList.value = [];
  isBottom.value = false;
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
</script>

<template>
  <div class="home_wrapper">
    <a-card
      :bordered="false"
      style="min-height: 100vh">
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
        <a-radio-group
          v-else
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
      </template>

      <WallpaperCard
        :image-list="imageList"
        :loading="imageLoading"
        :is-bottom="isBottom"
        :first-loading="imageLoading && imageListCurrent === 1"
        @reach-bottom="handlePageChange" />

      <div class="home_footer">
        免责声明：本站所有图片均来自网络收集，如有侵权请联系删除
      </div>
    </a-card>
  </div>
</template>

<style scoped lang="less">
.home_wrapper {
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
