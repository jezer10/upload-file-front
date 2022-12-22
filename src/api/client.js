import axios from "axios";

export const client = axios.create({
  baseURL: "http://100.25.120.101",
  headers: {},
});
