import axios from "axios";

const baseURL = "/api";

export const axios_api_instance = axios.create({
    baseURL
});

axios_api_instance.defaults.withCredentials = true;
