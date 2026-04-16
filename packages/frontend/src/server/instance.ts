import axios from "axios";

const baseURL = "http://localhost:3009/api";

export const axios_api_instance = axios.create({
    baseURL
});

axios_api_instance.defaults.withCredentials = true;