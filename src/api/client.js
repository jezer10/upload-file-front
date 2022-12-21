import axios from "axios";

export const client = axios.create({
  baseURL: "http://3.237.7.43:3000",
  headers: {},
});
