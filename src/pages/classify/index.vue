<script setup>
import { ref, onMounted } from 'vue';
import { selectClassifyList } from '@/api/wallpaper';
import { IMAGE_URL_PREFIX } from '@/global/constant.js';
import { useRouter } from 'vue-router';
const router = useRouter();

const classifyList = ref([]);

// 获取分类
const getClassifyData = async () => {
  const res = await selectClassifyList({
    zone_id: 1,
  });
  classifyList.value = res.map((item) => {
    return {
      ...item,
      image: IMAGE_URL_PREFIX + item.image,
    };
  });
};

// 点击分类
const handleClassifyClick = async ({ id }) => {
  router.push({
    path: '/classifyDetails',
    query: {
      classify_id: id,
    },
  });
};

onMounted(() => {
  getClassifyData();
});
</script>

<template>
  <div class="classify_wrapper">
    <div
      class="classify_item"
      v-for="item in classifyList"
      @click="handleClassifyClick(item)"
      :key="item.id">
      <img
        class="classify_img"
        :src="item.image"
        :alt="item.name" />
      <div class="classify_name">{{ item.name }}</div>
    </div>
  </div>
</template>

<style scoped lang="less">
.classify_wrapper {
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
  .classify_item {
    display: inline-block;
    width: 170px;
    height: 80px;
    text-align: center;
    padding: 10px;
    box-sizing: border-box;
    .classify_img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
      transition: all 0.3s;
      border-radius: 6px;
      &:hover {
        cursor: pointer;
        transform: scale(1.05);
      }
    }
    .classify_name {
      margin-top: 10px;
    }
  }
}
</style>
