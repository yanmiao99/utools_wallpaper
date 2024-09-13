const fs = require('fs');

/**
 * 获取一个文件
 * @param options {options: {
 *     title?: string,
 *     defaultPath?: string,
 *     buttonLabel?: string,
 *     filters?: { name: string, extensions: string[] }[],
 *     properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>,
 *     message?: string,
 *     securityScopedBookmarks?: boolean
 *   }} 参数
 * @return {Promise<Blob>} 返回blob对象
 */
function openFile(options) {
    return new Promise((resolve, reject) => {
        const path = utools.showOpenDialog(options)
        if (path) {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(new Blob([data], { type: 'application/octet-stream' }));
            })
        }
    })
}

window.preload = {
    openFile
}
