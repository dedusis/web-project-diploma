const API_BASE = '';
function ajax(method, url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.onload = () => {
      const isJson = (xhr.getResponseHeader("Content-Type") || "").includes("application/json");
      const body = isJson ? JSON.parse(xhr.responseText || '{}') : xhr.responseText;
      xhr.status >= 200 && xhr.status < 300 ? resolve(body) : reject(body);
    };
    xhr.onerror = () => reject("Network error");
    xhr.send(data ? JSON.stringify(data) : null);
  });
}

export function login(username,password){
    return ajax("POST",`${API_BASE}/auth/login`,{username,password});
}

export function getProfile(token){
    return ajax("GET",`${API_BASE}/auth/me`,null,{Authorization: `Bearer ${token}`});
}


