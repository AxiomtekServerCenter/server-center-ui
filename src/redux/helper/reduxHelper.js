import { login } from "../reboot/slice";
import axios from "axios";

const retryApi = async ({
  dispatch,
  getState,
  server,
  params = {},
  api,
  method = "POST",
}) => {
  let retryResult;
  let retrySuccess = false;

  await dispatch(login(server)).then(async () => {
    const index = getState().reboot.serverList.findIndex(
      (s) => s.ip === server.ip
    );
    const newToken = getState().reboot.serverList[index].token;

    const axiosInstance = axios.create({
      baseURL: "https://" + getState().reboot.backendIp,
      timeout: 8000,
    });
    const serverObj = {
      username: server.username,
      password: server.password,
      ip: server.ip,
      token: newToken,
    };
    const body = { ...serverObj, ...params };
    let axiosObj;

    if (method === "POST") {
      axiosObj = axiosInstance.post(api, body);
    } else if (method === "GET") {
      axiosObj = axiosInstance.get(api, body);
    }

    await axiosObj
      .then((response) => {
        retrySuccess = true;
        retryResult = { ip: server.ip, response: response };
        retryResult = { ...retryResult, ...params };
      })
      .catch((err) => {

        console.error(err);
        retrySuccess = false;
        retryResult = {
          ip: server.ip,
          response: err.response ? err.response : err.code,
        };
      });
  });


  return { retrySuccess: retrySuccess, retryResult: retryResult };
};

export { retryApi };
