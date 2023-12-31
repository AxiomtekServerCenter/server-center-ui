import React from "react";
import "./RebootPage.scss";
import "./reboot.css";
import { useSelector, useAppDispatch } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { EditModal } from "../../component/EditModal";
import { Banner } from "../../component/Banner/Banner";
import { Modal } from "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getServerList,
  getAllServerStatus,
  powerControlAll,
  setApiMode,
  getServerStatus,
  getServerInfo,
  addServer,
  updateServer,
  deleteServer,
  onCreateNewServer,
  setServerChecked,
  unsubscribeAllPushEvent,
} from "../../redux/reboot/slice";

export const RebootPage = () => {
  // React hooks
  const dispatch = useAppDispatch();

  // Redux store
  const debugMode = useSelector((s) => s.reboot.debugMode);
  const serverList = useSelector((s) => s.reboot.serverList);
  const apiMode = useSelector((s) => s.reboot.apiMode);
  const statusApiMode = useSelector((s) => s.reboot.statusApiMode);
  const isLoginAllMode = useSelector((s) => s.reboot.isLoginAllMode);
  const isUsePushEvent = useSelector(s => s.reboot.isUsePushEvent);

  // input values
  const [editUsername, setEditUsername] = useState("");
  const [editServerName, setEditServerName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editChecked, setEditChecked] = useState("");
  const [editIp, setEditIp] = useState("");
  const [newIp, setNewIp] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newServerName, setNewServerName] = useState("");

  // modals
  const [editModal, setEditModal] = useState(null);
  const [addServerModal, setAddServerModal] = useState(null);
  const [deleteIp, setDeleteIp] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);

  // settings
  let [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    dispatch(getServerList());
    setEditModal(new Modal(document.getElementById("editServerModal"), {}));
    setAddServerModal(new Modal(document.getElementById("addServerModal"), {}));
    setDeleteModal(new Modal(document.getElementById("deleteModal"), {}));

    return () => {
      if (isUsePushEvent) {
        dispatch(unsubscribeAllPushEvent());
      }
    };
  }, [dispatch, isUsePushEvent]);

  const onClickGetStatus = (ip) => {
    dispatch(
      getAllServerStatus({
        serverList: serverList,
      })
    );
  };

  const onClickMultiPowerOn = () => {
    dispatch(setApiMode(true));
    localStorage.setItem("api-mode", true);
    const checkedServers = serverList.filter((server) => server.checked);
    dispatch(
      powerControlAll({ selectedServers: checkedServers, resetType: "On" })
    );
  };

  const onClickMultiPowerOff = () => {
    dispatch(setApiMode(true));
    localStorage.setItem("api-mode", true);
    const checkedServers = serverList.filter((server) => server.checked);
    dispatch(
      powerControlAll({
        selectedServers: checkedServers,
        resetType: "ForceOff",
      })
    );
  };

  const onClickEdit = (item) => {
    setErrorMsg("");

    setEditIp(item.ip);
    setEditServerName(item.serverName);
    setEditUsername(item.username);
    setEditPassword(item.password);
    setEditChecked(item.checked);
    editModal.show();
  };

  const onClickSaveEdit = () => {
    if (!editServerName || !editUsername || !editPassword) {
      setErrorMsg("Please fill in the required fields.");

      return;
    }
    const index = serverList.findIndex((server) => server.ip === editIp);
    if (index < 0) return;

    const currServer = serverList[index];

    dispatch(
      updateServer({
        ip: editIp,
        serverName: editServerName,
        username: editUsername,
        password: editPassword,
        checked: editChecked,
      })
    ).then(() => {
      dispatch(
        getServerStatus({
          ip: editIp,
          serverName: editServerName,
          username: editUsername,
          password: editPassword,
          checked: editChecked,
          token: currServer.token,
        })
      );
      dispatch(
        getServerInfo({
          ip: editIp,
          serverName: editServerName,
          username: editUsername,
          password: editPassword,
          checked: editChecked,
          token: currServer.token,
        })
      );
    });

    editModal.hide();
    setErrorMsg("");
    setEditServerName("");
    setEditUsername("");
    setEditPassword("");
    setEditChecked(false);
  };

  const onClickAddServer = () => {
    addServerModal.show();
  };

  const onClickDelete = (ip) => {
    setDeleteIp(ip);
    deleteModal.show();
  };

  const onClickConfirmDelete = (ip) => {
    dispatch(deleteServer({ ip: deleteIp }));
    setDeleteIp("");
    deleteModal.hide();
  };

  const onClickCancelDelete = () => {
    setDeleteIp("");
    deleteModal.hide();
  };

  const onClickSaveNewServer = () => {
    const index = serverList.findIndex((server) => server.ip === newIp);
    if (index !== -1) {
      setErrorMsg("IP " + newIp + " already exists!");

      return;
    }

    if (!newIp || !newUsername || !newPassword || !newServerName) {
      setErrorMsg("Please fill in the required fields.");

      return;
    }

    if (debugMode && newUsername === "aa" && newPassword === "aa") {
      const debugNewUserName = "";
      const debugNewPassword = "";

      dispatch(
        addServer({
          ip: newIp,
          serverName: newServerName,
          username: debugNewUserName,
          password: debugNewPassword,
        })
      ).then(() => {
        dispatch(
          onCreateNewServer({
            ip: newIp,
            username: debugNewUserName,
            password: debugNewPassword,
          })
        );
      });
    } else {
      dispatch(
        addServer({
          ip: newIp,
          serverName: newServerName,
          username: newUsername,
          password: newPassword,
        })
      ).then(() => {
        dispatch(
          onCreateNewServer({
            ip: newIp,
            username: newUsername,
            password: newPassword,
          })
        );
      });
    }
    addServerModal.hide();
    setErrorMsg("");
    setNewIp("");
    setNewUsername("");
    setNewPassword("");
    setNewServerName("");
  };

  const handleCheckChange = ({ target: { itemIp, itemChecked } }, item) => {
    dispatch(setServerChecked({ ip: itemIp, checked: itemChecked }));
    dispatch(
      updateServer({
        ip: itemIp,
        serverName: item.serverName,
        username: item.username,
        password: item.password,
        checked: itemChecked,
      })
    );
  };

  const onChangeNewIp = (ip) => {
    setNewIp(ip);
    const index = serverList.findIndex((server) => server.ip === newIp);
    if (index !== -1) {
      setErrorMsg("IP " + newIp + " already exists!");
    } else {
      setErrorMsg("");
    }
  };

  const onChangeEditUsername = (name) => {
    setEditUsername(name);
  };

  const onChangeEditServerName = (name) => {
    setEditServerName(name);
  };

  const onChangeEditPassword = (password) => {
    setEditPassword(password);
  };

  const onChangeNewPassword = (password) => {
    setNewPassword(password);
  };

  const onChangeNewUsername = (name) => {
    setNewUsername(name);
  };
  const onChangeNewServerName = (name) => {
    setNewServerName(name);
  };

  const getItemStatusStyle = (item) => {
    if (item.status) {
      if (item.status === "on" || item.status === "On") {
        return "status-tag-on";
      }
      if (item.status === "off" || item.status === "Off") {
        return "status-tag-off";
      }
      if (item.status.toLowerCase().includes("error")) {
        return "status-tag-error";
      }
    }

    return "server-card-secondary-text";
  };

  const getApiResultStyle = (item) => {
    if (item.apiResult) {
      if (
        item.apiResult.toLowerCase().includes("error") ||
        item.apiResult.toLowerCase().includes("fail") ||
        item.apiResult.toLowerCase().includes("can't")
      ) {
        return "server-card-api-error";
      }
    }
    return "server-card-api-success";
  };

  const isDisableButton = () => {
    return apiMode || statusApiMode || isLoginAllMode;
  };

  const warningMsg =
    "Warning: Saving passwords to the backend file is not safe. Please protect your file carefully.";
  let editServerTitle = "Edit server: " + editIp;

  const editServerItems = [
    {
      title: "Server Name",
      editValue: editServerName,
      onChangeValue: onChangeEditServerName,
    },
    {
      title: "User Name",
      editValue: editUsername,
      onChangeValue: onChangeEditUsername,
    },
    {
      title: "Password",
      editValue: editPassword,
      onChangeValue: onChangeEditPassword,
    },
  ];
  const addServerItems = [
    { title: "IP", editValue: newIp, onChangeValue: onChangeNewIp },
    {
      title: "Server Name",
      editValue: newServerName,
      onChangeValue: onChangeNewServerName,
    },
    {
      title: "User name",
      editValue: newUsername,
      onChangeValue: onChangeNewUsername,
    },
    {
      title: "Password",
      editValue: newPassword,
      onChangeValue: onChangeNewPassword,
    },
  ];

  return (
    <div className="reboot-root-container">
      <EditModal
        id="editServerModal"
        title={editServerTitle}
        editItems={editServerItems}
        onClickSave={onClickSaveEdit}
        warning={warningMsg}
        errorMsg={errorMsg}
      />
      <EditModal
        id="addServerModal"
        title="Add server"
        editItems={addServerItems}
        onClickSave={onClickSaveNewServer}
        warning={warningMsg}
        errorMsg={errorMsg}
      />

      {/* delete server modal */}
      <div
        className="modal theme-modal-backdrop"
        tabIndex="-1"
        role="dialog"
        id="deleteModal"
        data-bs-backdrop="false"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete server</h5>
            </div>
            <div className="modal-body">
              <span className="text-theme">
                Are you sure you want to delete IP: {deleteIp} ?
              </span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger text-white"
                onClick={onClickConfirmDelete}
              >
                Yes
              </button>
              <button
                type="button"
                className="btn btn-info text-white"
                onClick={onClickCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-fluid-container">
        <Banner title="POWER CONTROL" imgId={1} />
        <div className="content-fixed-width-container">
          <div className="page-title">Power Control</div>

          {/* dashboard - begin */}
          <div className="dashboard-section">
            <div className="operation-button-list-container">
              <div className="operation-guide">
                Operations on the checked servers
              </div>
              <div className="operation-button-list  ">
                <div className="operation-btn-container">
                  <button
                    className="btn btn-primary btn-operation btn-create-server"
                    onClick={onClickAddServer}
                    disabled={isDisableButton()}
                  >
                    <span className="operation-btn-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={["fa", "fa-plus"]} />
                    </span>
                    <div className="btn-operation-inner-text">Create</div>
                  </button>
                  <div className="operation-btn-text">Create</div>
                  <div className="operation-btn-text d-none">by IP</div>
                </div>

                <div className="operation-btn-container">
                  <button
                    className="btn btn-primary btn-operation btn-power-on"
                    onClick={onClickMultiPowerOn}
                    disabled={isDisableButton()}
                  >
                    <span className="operation-btn-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={["fa", "fa-bolt"]} />
                    </span>
                    <div className="btn-operation-inner-text">On</div>
                  </button>
                  <div className="operation-btn-text">Power on</div>
                  <div className="operation-btn-text d-none">servers</div>
                </div>

                <div className="operation-btn-container">
                  <button
                    className="btn btn-primary btn-operation btn-power-off"
                    onClick={onClickMultiPowerOff}
                    disabled={isDisableButton()}
                  >
                    <span className="operation-btn-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={["fa", "fa-power-off"]} />
                    </span>
                    <div className="btn-operation-inner-text">Off</div>
                  </button>
                  <div className="operation-btn-text">Power off</div>
                  <div className="operation-btn-text d-none">servers</div>
                </div>

                <div className="operation-btn-container">
                  <button
                    className="btn btn-primary btn-operation btn-get-status"
                    onClick={(e) => onClickGetStatus()}
                    disabled={isDisableButton()}
                  >
                    <span className="operation-btn-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={["fa", "fa-info"]} />
                    </span>
                    <div className="btn-operation-inner-text">Status</div>
                  </button>
                  <div className="operation-btn-text">Get status</div>
                  <div className="operation-btn-text d-none">status</div>
                </div>
              </div>
            </div>
          </div>
          {/* dashboard - end */}

          <div className="server-cards-section">
            {/* card list - begin*/}
            {serverList.map((item) => (
              <div className="server-card" key={item.ip}>
                {/* --------- server card left box ---------- */}
                <div className="server-card-left-box">
                  <div className="server-card-header server-card-column">
                    <div className="server-card-name server-card-primary-text">
                      {item.serverName}
                    </div>
                    <a
                      className="server-card-secondary-text"
                      href={`https://${item.ip}`}
                      target="_blank"
                      rel="noreferrer noopenner"
                    >
                      {item.ip}
                    </a>
                  </div>

                  {/* overview section*/}
                  <div className="server-card-overview-column server-card-column">
                    {item.overview &&
                      item.overview.SystemInfo &&
                      item.overview.SystemInfo.model && (
                        <div className="server-card-primary-text server-card-model">
                          {item.overview.SystemInfo.model}
                        </div>
                      )}
                    {item.overview &&
                      item.overview.SystemInfo &&
                      !item.overview.SystemInfo.model && (
                        <div className="server-card-primary-text server-card-model">
                          - - - - -
                        </div>
                      )}
                    {(!item.overview || !item.overview.SystemInfo) && (
                      <div className="server-card-primary-text server-card-model">
                        - - - - -
                      </div>
                    )}

                    {item.overview &&
                      item.overview.SystemInfo &&
                      item.overview.SystemInfo.serialNumber && (
                        <div className="server-card-secondary-text server-card-serial-number">
                          {item.overview.SystemInfo.serialNumber}
                        </div>
                      )}
                    {item.overview &&
                      item.overview.SystemInfo &&
                      !item.overview.SystemInfo.serialNumber && (
                        <div className="server-card-secondary-text server-card-serial-number">
                          - - - - -
                        </div>
                      )}
                    {(!item.overview || !item.overview.SystemInfo) && (
                      <div className="server-card-secondary-text server-card-serial-number">
                        - - - - -
                      </div>
                    )}
                  </div>
                  {/* end of overview section*/}
                </div>

                {/* --------- server card right box ---------- */}

                <div className="server-card-right-box">
                  <div className="server-card-status-section server-card-column">
                    <div className="server-card-status">
                      {(item.isLoadingPowerStatus ||
                        (isLoginAllMode && item.isLoadingLogin)) && (
                          <div className="spinner-border text-info" role="status">
                            <span className="sr-only"></span>
                          </div>
                        )}

                      {!(
                        item.isLoadingPowerStatus ||
                        (isLoginAllMode && item.isLoadingLogin)
                      ) && (
                          <div>
                            <span className={getItemStatusStyle(item)}>
                              {item.status}
                            </span>

                            {item.status &&
                              item.status.toLowerCase().includes("error") && (
                                <span className="server-card-secondary-text">
                                  {item.errorMsg}
                                </span>
                              )}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* API result */}
                  <div className="server-card-column server-card-api-status-column">
                    {(!item.isLoadingPowerControlResult ||
                      (item.isLoadingPowerControlResult && !item.checked)) &&
                      item.apiResult && (
                        <div>
                          <div className={getApiResultStyle(item)}>
                            {item.apiResult}
                          </div>
                          {/* <div className="server-card-blank-text"> </div> */}
                        </div>
                      )}

                    {(!item.isLoadingPowerControlResult ||
                      (item.isLoadingPowerControlResult && !item.checked)) &&
                      !item.apiResult && (
                        <div>
                          <div className="server-card-api-no-data">
                            - - - - -
                          </div>
                          {/* <div className="server-card-blank-text"> </div> */}
                        </div>
                      )}

                    {item.checked && item.isLoadingPowerControlResult && (
                      <div className="spinner-border text-info" role="status">
                        <span className="sr-only"></span>
                      </div>
                    )}
                  </div>

                  {/* edit and delete buttons */}
                  <div className="server-card-buttons-column">
                    <div className="server-card-buttons-row">
                      <button
                        type="button"
                        className="btn edit-btn"
                        disabled={isDisableButton()}
                        onClick={(e) => onClickEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn delete-btn"
                        disabled={isDisableButton()}
                        onClick={(e) => onClickDelete(item.ip)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* End of edit and delete buttons */}
                  <div className="card-server-input-container">
                    <input
                      id={item.ip.replaceAll(".", "-") + "-checkbox"}
                      type="checkbox"
                      className="card-server-checkbox"
                      name={item.ip}
                      checked={item.checked}
                      disabled={isDisableButton()}
                      onChange={(e) => {
                        handleCheckChange(
                          {
                            target: {
                              itemIp: e.target.name,
                              itemChecked: e.target.checked,
                            },
                          },
                          item
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
