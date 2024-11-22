import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { createEventHook, useDocumentVisibility } from '@vueuse/core';

/**
 * 子输入框hook
 * @param [initialValue] {string} 子输入框初始值
 * @param [placeholder] {string} 占位符
 * @param [isFocus] {boolean} 是否聚焦，默认true
 */
export function useSubInput(initialValue = '', placeholder, isFocus) {
  // 是否在注册中
  let registering = false;

  // 子输入框的值
  const subInput = ref(initialValue);
  // 子输入的包装值
  const subInputWrap = computed(() => subInput.value);

  // 当数据变化的hook
  const onChangedHook = createEventHook();
  // 当搜索时的hook
  const onSearchHook = createEventHook();
  // 当搜索时的hook
  const onClearHook = createEventHook();

  // 键盘按下的事件监听
  function handleKeyDown(e) {
    if (e.key === 'Enter' && subInput.value) {
      onSearchHook.trigger(subInput.value);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function register() {
    if (registering) {
      return;
    }
    registering = true;
    // 先移除之前的
    utools.removeSubInput();
    // 注册新的
    const interval = setInterval(() => {
      let res = utools.setSubInput(
        ({ text }) => {
          if (subInput.value !== text) {
            subInput.value = text;
            onChangedHook.trigger(text);
            if (!text) {
              onClearHook.trigger();
            }
          }
        },
        placeholder,
        isFocus
      );
      // 如果注册成功
      if (res) {
        // 设置初始值
        if (initialValue) {
          utools.setSubInputValue(initialValue);
        }
        // 清除定时器
        clearInterval(interval);
        registering = false;
      }
    }, 100);
  }

  onMounted(() => {
    // 注册子输入框
    register();
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    utools.removeSubInput();
    window.removeEventListener('keydown', handleKeyDown);
  });

  function setSubInput(val) {
    subInput.value = val;
    utools.setSubInputValue(subInput.value);
  }

  const documentVisibility = useDocumentVisibility();

  watch(documentVisibility, (isVisible) => {
    if (isVisible === 'hidden') {
      utools.removeSubInput();
      window.removeEventListener('keydown', handleKeyDown);
    } else {
      register();
      window.addEventListener('keydown', handleKeyDown);
    }
  });

  return {
    value: subInputWrap,
    setSubInput,
    register,
    onChanged: onChangedHook.on,
    onSearch: onSearchHook.on,
    onClear: onClearHook.on,
  };
}
