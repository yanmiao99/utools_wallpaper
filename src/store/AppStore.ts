import {defineStore} from "pinia";
import {ref} from "vue";
import {getItem} from "@/utils/utools/DbStorageUtil";

function renderIsDark(theme: ThemeType | null) {
    switch (theme) {
        case ThemeType.LIGHT:
            // 白天
            return false;
        case ThemeType.DARK:
            // 黑夜
            return true;
        default:
            // 跟随系统
            return utools.isDarkColors();
    }
}

const key = "utools-theme";

/**
 * 主题类型
 */
export enum ThemeType {

    /**
     * 跟随系统
     */
    AUTO = 0,

    /**
     * 白天
     */
    LIGHT = 1,

    /**
     * 黑夜
     */
    DARK = 2

}

export const useAppStore = defineStore('app', () => {
    let dark = ref(false);
    let themeType = ThemeType.AUTO;

    function init() {
        // 初始化主题
        themeType = getItem<number>(key) || ThemeType.AUTO;
        dark.value = renderIsDark(themeType);
    }

    function isDarkColors() {
        return dark.value;
    }

    function getThemeType() {
        return themeType;
    }

    function saveThemeType(res: ThemeType) {
        themeType = res;
        dark.value = renderIsDark(themeType);
        utools.dbStorage.setItem(key, themeType);
    }

    return {dark, init, isDarkColors, getThemeType, saveThemeType}

})
