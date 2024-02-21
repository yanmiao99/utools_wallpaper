import {defineStore} from "pinia";
import {ref} from "vue";
import {getItem} from "@/utils/utools/DbStorageUtil";

function renderIsDark(theme: number | null) {
    switch (theme) {
        case 1:
            // 白天
            return false;
        case 2:
            // 黑夜
            return true;
        default:
            // 跟随系统
            return utools.isDarkColors();
    }
}

const key = "utools-theme";

export const useAppStore = defineStore('app', () => {
    let dark = ref(false);
    let themeType = 0;

    function init() {
        // 初始化主题
        themeType = getItem<number>(key) || 0;
        dark.value = renderIsDark(themeType);
    }

    function isDarkColors() {
        return dark.value;
    }

    function getThemeType() {
        return themeType;
    }

    function saveThemeType(res: number) {
        themeType = res;
        dark.value = renderIsDark(themeType);
        utools.dbStorage.setItem(key, themeType);
    }

    return {dark, init, isDarkColors, getThemeType, saveThemeType}

})
