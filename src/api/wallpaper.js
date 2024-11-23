import request from '@/utils/request/request';

// 首页壁纸
export const selectWallpaperListByType = (param) => {
  return request({
    method: 'get',
    url: '/selectWallpaperListByType',
    data: param,
  });
};

// 获取分类
export const selectClassifyList = (param) => {
  return request({
    method: 'get',
    url: '/selectClassifyList',
    data: param,
  });
};

// 搜索壁纸
export const globalSearch = (param) => {
  return request({
    method: 'get',
    url: '/globalSearch',
    data: param,
  });
};

// 获取壁纸详情
export const selectWallpaperById = (param) => {
  return request({
    method: 'get',
    url: '/selectWallpaperById',
    data: param,
  });
}
