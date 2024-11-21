import request from '@/utils/request/360_request';

// 查询壁纸
export const get360Wallpaper = (param) => {
	return request({
		method: 'get',
		url: '/index.php',
		data: param,
	});
};
