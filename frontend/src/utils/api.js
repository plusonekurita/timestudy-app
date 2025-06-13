// src/utils/api.js

const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * API通信を行う共通関数
 * @param {string} path - APIのパス（例：/get-time-records）
 * @param {object} options - 設定オプション
 * @returns {Promise<any>} - レスポンスJSON
 */
export const apiFetch = async (path, options = {}) => {
  const { method = "GET", headers = {}, body = null, auth = true } = options;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      let message = "API Error";
      if (res.status === 404) {
        message = "指定されたAPIエンドポイントが見つかりません。";
      } else if (data?.detail) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (typeof data.detail === "object") {
          message = `${data.detail.error || ""}: ${data.detail.detail || ""}`;
        }
      } else if (data?.error) {
        message = data.error;
      } else {
        message = res.statusText;
      }

      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError") {
      // ネットワーク障害やCORSなど
      throw new Error(
        "通信エラーが発生しました。ネットワークをご確認ください。"
      );
    }
    throw err;
  }
};
