const { readFile, createWriteStream, unlinkSync,readdirSync } = require('fs');
const { basename, join } = require('path');
const { execSync } = require('child_process');
const https = require('https');

function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

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
 * @return {Promise<Array<File>>} 返回文件对象
 */
async function openFile(options) {
  const paths = utools.showOpenDialog(options);
  const files = [];
  for (const path of paths) {
    const data = await readFileAsync(path);
    const name = basename(path);
    const type = 'application/octet-stream';
    const blob = new Blob([data], { type: type });
    const file = new File([blob], name, { type: type });
    files.push(file);
  }
  return files;
}

// 下载文件
async function downloadFile(currentFile, fileName, userSavePath) {
  return new Promise((resolve, reject) => {
    // 如果是http协议, 则转为https
    if (currentFile.startsWith('http://')) {
      currentFile = currentFile.replace('http://', 'https://');
    }
    const downloadPath = join(userSavePath, fileName);
    const file = createWriteStream(downloadPath);
    https
      .get(currentFile, function (response) {
        response.pipe(file);
        file.on('finish', function () {
          file.close();
          resolve(downloadPath);
        });
        file.on('error', function (err) {
          unlinkSync(downloadPath);
          reject(err);
        });
      })
      .on('error', function (err) {
        reject(err);
      });
  });
}

// 设置图片为壁纸
async function setWallpaper(imagePath) {
  return new Promise(async (resolve, reject) => {
    try {
      // 下载图片到本地 , 然后返回保存的路径
      const path = utools.getPath('pictures');
      const suffix = imagePath.match(/\.(jpg|png|jpeg|webp|gif)$/)[0];
      const random = Math.floor(Math.random() * 1000000);
      const fileName = `wallpaper_${random}${suffix}`;
      const userLocalPath = await downloadFile(imagePath, fileName, path);

      // 更换壁纸
      if (process.platform === 'win32') {
        // Windows平台
        try {
          // 使用 execSync 相关的方法, 执行windows 更换壁纸的命令 , 并且需要兜底处理, 防止出错
          execSync(`reg add "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d "${userLocalPath}" /f`);
          execSync(`RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters`);
          resolve('Windows壁纸更换成功');
        } catch (error) {
          reject('Windows更换壁纸失败');
        }
      } else if (process.platform === 'darwin') {
        // macOS平台
        try {
          // 使用AppleScript设置壁纸
          const script = `tell application "Finder" to set desktop picture to POSIX file "${escapeImagePath(
            userLocalPath
          )}"`;
          execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
          resolve('macOS壁纸更换成功');
        } catch (error) {
          reject('macOS更换壁纸失败');
        }
      } else {
        reject('该功能不支持当前操作系统');
      }
    } catch (error) {
      reject(error);
    }
  });
}

// 转义文件路径
function escapeImagePath(path) {
  return path.replace(/\\/g, '\\\\').replace(/ /g, '\\ ');
}

// 清空图片文件夹中所有 wallpaper_ 开头的文件
async function clearWallpaper() {
  return new Promise((resolve, reject) => {
    try {
      // 使用 node 的 fs 模块, 读取文件夹中的所有文件, 然后删除以 wallpaper_ 开头的文件
      const path = utools.getPath('pictures');
      const files = readdirSync(path || '');

      files.forEach((file) => {
        if (file.startsWith('wallpaper_') && /\.(jpg|png|jpeg|webp|gif)$/.test(file)) {
          unlinkSync(join(path, file));
        }
      });
      resolve('清空壁纸文件夹成功');
    } catch (error) {
      reject('清空壁纸文件夹失败');
    }
  });
}

window.preload = {
  openFile,
  downloadFile,
  setWallpaper,
  clearWallpaper
};
