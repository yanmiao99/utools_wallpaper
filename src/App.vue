<template>
  <a-layout :class="{ main: true, 'bg-color': true, detach: detach }">
    <a-layout-sider
      collapsed
      style="z-index: 50">
      <a-menu
        style="width: 200px; height: 100%"
        breakpoint="xl"
        v-model:selected-keys="selectedKeys">
        <a-menu-item key="/home">
          <template #icon>
            <IconApps />
          </template>
          主页
        </a-menu-item>

        <a-menu-item key="/classify">
          <template #icon>
            <iconStorage />
          </template>
          分类
        </a-menu-item>

        <a-menu-item key="/about">
          <template #icon>
            <IconRobot />
          </template>
          关于
        </a-menu-item>

        <a-menu-item key="/setting">
          <template #icon>
            <IconSettings />
          </template>
          设置
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content class="container">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDark } from '@vueuse/core';
import { detach } from '@/store/AppStore';

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

watch(
  () => selectedKeys.value,
  (value) => router.push(value[0])
);

watch(
  () => route.path,
  (value) => {
    if (value !== selectedKeys.value[0]) {
      selectedKeys.value[0] = value;
    }
  }
);

useDark({
  selector: 'body',
  attribute: 'arco-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storage: utools.dbStorage,
});

utools.onPluginEnter((action) => {
  detach.value = utools.getWindowType() !== 'main';
});
</script>

<style scoped lang="less">
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--color-text-1);

  & > .container {
    position: relative;
    height: 100%;
    width: 100%;
  }
}
</style>
