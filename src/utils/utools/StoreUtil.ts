// utools最佳实践 - 数组数据的存储
import {ref} from "vue";
import {defineStore} from "pinia";
import {getFromOne, getFromOneByAsync, removeOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";

export interface StoreIndex {
    id: number;
}

export interface StoreContent {

}

/**
 * 创建一个列表存储
 *
 * @param name 存储的名字
 * @param contentPrefixKey 存储内容的键
 */
export function createListStore<I extends StoreIndex, C extends StoreContent>(name: string, contentPrefixKey: string) {
    return defineStore(name, () => {
        const indexes = ref<Array<I>>([]);
        let rev: undefined | string = undefined;

        /**
         * 初始化方法，此方法需要在程序第一次进入时调用
         */
        async function init() {
            const res = await getFromOneByAsync(name, indexes.value);
            indexes.value = res.record;
            rev = res.rev;
        }

        /**
         * 新增一条记录
         * @param index 索引信息
         * @param content 内容信息
         */
        async function add(index: I, content: C) {
            // 新增加内容
            await saveOneByAsync(contentPrefixKey + index.id, content);
            // 再增加索引
            // @ts-ignore
            indexes.value.push(index);
            // 保存索引
            rev = await saveOneByAsync(name, indexes.value, rev);
        }

        /**
         * 删除一个记录
         * @param id 记录的ID
         */
        async function remove(id: number) {
            // 先查询是否存在
            const index = indexes.value.findIndex(e => e.id === id);
            if (index > 0) {
                // 先删除索引
                indexes.value.splice(index, 1);
                // 保存索引
                rev = await saveOneByAsync(name, indexes.value, rev);
                // 再删除内容
                await removeOneByAsync(contentPrefixKey + id);
            }
        }

        /**
         * 更新数据
         * @param id 数据的ID
         * @param index 索引信息
         * @param content 内容，不存在则不更新
         */
        async function update(id: number, index: Partial<I>, content?: C) {
            // 先查询是否存在
            const idx = indexes.value.findIndex(e => e.id === id);
            if (idx > 0) {
                // 更新索引
                indexes.value[idx] = {
                    ...indexes.value[idx],
                    ...index
                }
                // 保存索引
                rev = await saveOneByAsync(name, indexes.value, rev);
                if (content) {
                    // 再更新内容
                    await saveOneByAsync(contentPrefixKey + id, content);
                }
            }
        }

        async function getContent(id: number): Promise<C | null> {
            const res = await getFromOne<C>(contentPrefixKey + id);
            return res ? res.record : null;
        }

        return {
            indexes,
            init,
            add,
            remove,
            update,
            getContent
        }

    });
}

/**
 * 构建一个设置存储
 * @param name 存储的名字
 * @param defaultValue 默认值。初始值
 */
export function createSettingStore<T extends Record<string, any>>(name: string, defaultValue: () => T) {
    return defineStore(name, () => {
        const setting = ref<T>(defaultValue());
        let rev: undefined | string = undefined;


        async function init() {
            const res = await getFromOne<T>(name);
            if (res) {
                setting.value = ref(res.record).value;
                rev = res.rev;
            }
        }

        async function save(res: T) {
            setting.value = ref(res).value;
            rev = await saveOneByAsync(name, res);
        }

        return {
            setting,
            init,
            save,
        }

    })
}
