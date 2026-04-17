import { useCallback, useEffect, useState } from "react";
import { instance } from "../api.js";
import { useCookies } from "react-cookie";

const useAxios = (url, options = {}) => {
  const {
    method = "GET",
    body = null,
    headers = {},
    auto = true,
    params = {},
  } = options;

  const [cookies] = useCookies(["token"]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(
    method === "GET" && auto ? true : false
  );
  const [error, setError] = useState(null);

  const request = useCallback(
    async (config = {}) => {
      const finalUrl = config.url || url;
      if (!finalUrl) return;

      setLoading(true);
      setError(null);

      try {
        const finalMethod = (config.method || method).toUpperCase();
        const finalBody = config.hasOwnProperty("body")
          ? config.body
          : body;

        const token = cookies.token;

        const { data } = await instance({
          method: finalMethod,
          url: finalUrl,
          data: finalBody !== null ? finalBody : undefined,
          params: config.params || params,
          headers: {
            ...headers,
            ...config.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        setData(data);
        return data;
      } catch (err) {
        setError(err);
        console.error("Algo salió mal:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      method,
      url,
      JSON.stringify(body),
      JSON.stringify(params),
      JSON.stringify(headers),
      cookies.token,
    ]
  );

  useEffect(() => {
    if (!url) return;

    if (auto && method.toUpperCase() === "GET") {
      request();
    }
  }, [url, auto, method, request]);

  return { data, loading, error, request };
};

export default useAxios;
