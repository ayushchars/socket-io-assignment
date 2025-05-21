import axios from "axios";

const BASE_URL =  import.meta.env.VITE_REACT_APP_BASEURL

export const withoutAuthAxios = () => {
  return axios.create({
    baseURL: BASE_URL,
  });
};

export const authAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token || '',
    },
  });
};
