export const getValue = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    // 値が存在しない場合は defaultValue を返す
    if (item === null) {
      return defaultValue;
    }
    // 値が存在する場合はパースして返す
    return JSON.parse(item);
  } catch (error) {
    console.error(
      `ローカルストレージからの取得/パースに失敗しました (キー: ${key}):`,
      error
    );
    return defaultValue;
  }
};

export const setItem = (key, value) => {
  try {
    const stringifiedValue = JSON.stringify(value);
    localStorage.setItem(key, stringifiedValue);
    return true; // 保存成功
  } catch (error) {
    console.error(
      `ローカルストレージへの保存/文字列化に失敗しました (キー: ${key}):`,
      error
    );
    return false; // 保存失敗
  }
};
