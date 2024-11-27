// 存储历史记录
export const saveHistory = (key, item) => {
  let history = window.utools.dbStorage.getItem(key);
  if (!history) {
    history = [];
    history.push(item);
    window.utools.dbStorage.setItem(key, JSON.stringify(history));
  } else {
    history = JSON.parse(history);
    const isExist = history.some((historyItem) => historyItem.id === item.id);
    if (!isExist) {
      history.push(item);
      window.utools.dbStorage.setItem(key, JSON.stringify(history));
    }
  }
};

// 读取历史记录
export const readHistory = (key) => {
  const history = window.utools.dbStorage.getItem(key);
  return history ? JSON.parse(history) : [];
};

// 删除一条历史记录
export const deleteHistory = (key, id) => {
  const history = window.utools.dbStorage.getItem(key);
  if (history) {
    const newHistory = JSON.parse(history).filter((item) => item.id !== id);
    window.utools.dbStorage.setItem(key, JSON.stringify(newHistory));
  }
};