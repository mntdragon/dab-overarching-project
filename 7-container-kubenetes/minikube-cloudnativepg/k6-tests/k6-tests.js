import http from "k6/http";

export const options = {
  duration: "30s",
  vus: 10,
};

export default function () {
// minikube service minikube-demo-server-service --url
  http.get("http://127.0.0.1:50332");
}