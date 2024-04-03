/**
 * 解析文件名字，去除拓展名
 * @param fileName 文件名字
 */
export function parseFileName(fileName: string): string {
    const indexOf = fileName.lastIndexOf(".");
    if (indexOf > -1) {
        return fileName.substring(0, indexOf);
    } else {
        return fileName;
    }
}


export function pathJoin(...paths: string[]): string {
    return paths.join(utools.isWindows() ? '\\' : '/');
}

export function extname(fileName: string): string {
    return fileName.split('.').pop() || '';
}

export function basename(fileName: string): string {
    const s = fileName.split('/').pop() || '';
    const t = fileName.split("\\").pop() || '';
    return s.length > t.length ? t : s;
}

/**
 * 读取文件内容
 * @param file 文件
 */
export function readAsText(file: File): Promise<string> {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onload = function () {
            const text = fileReader.result as string;
            resolve(text);
        }
        fileReader.onerror = function (e) {
            reject(e);
        }
        fileReader.readAsText(file);
    });
}

/**
 * 字符串转换为 Blob 对象
 * @param str 字符串
 */
export function stringToBlob(str: string): Blob {
    return new Blob([str], { type: 'text/plain' });
}
