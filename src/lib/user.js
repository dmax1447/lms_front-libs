import axios from "axios";

function login() {
  const payload = {
    username: "kminchelle",
    password: "0lelplR",
  };
  return axios.post("https://dummyjson.com/auth/login", payload);
}

export { login };
