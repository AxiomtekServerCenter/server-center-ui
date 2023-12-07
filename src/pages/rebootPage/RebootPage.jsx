import React from "react";
import "./RebootPage.scss";
import "./reboot.css";
import { useSelector, useAppDispatch } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { EditModal } from "../../component/EditModal";
import { Banner } from "../../component/Banner/Banner";
import { Modal } from "bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerList } from "../../redux/reboot/slice";

export const RebootPage = () => {
  // React hooks
  const dispatch = useAppDispatch();

  // Redux store
  const serverList = useSelector((s) => s.reboot.serverList);
  const statusApiMode = useSelector((s) => s.reboot.statusApiMode);
  const isLoginAllMode = useSelector((s) => s.reboot.isLoginAllMode);

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
  const showTag = true;
  let [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    dispatch(getServerList());
    setEditModal(new Modal(document.getElementById("editServerModal"), {}));
    setAddServerModal(new Modal(document.getElementById("addServerModal"), {}));
    setDeleteModal(new Modal(document.getElementById("deleteModal"), {}));
  }, []);

  // TODO: onClickGetStatus
  const onClickGetStatus = () => {
    // TODO:
  };

  // TODO: onClickMultiPowerOn
  const onClickMultiPowerOn = () => {
    // TODO:
  };

  // TODO: onClickMultiPowerOff
  const onClickMultiPowerOff = () => {
    // TODO:
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

  // TODO: onClickSaveEdit
  const onClickSaveEdit = () => {
    // TODO:
  };

  const onClickAddServer = () => {
    addServerModal.show();
  };

  const onClickDelete = (ip) => {
    setDeleteIp(ip);
    deleteModal.show();
  };

  // TODO: onClickConfirmDelete
  const onClickConfirmDelete = () => {
    // TODO:
  };

  // TODO: onClickCancelDelete
  const onClickCancelDelete = () => {
    // TODO:
  };

  // TODO: onClickSaveNewServer
  const onClickSaveNewServer = () => {
    // TODO:
  };

  // TODO: handleCheckChange
  const handleCheckChange = () => {
    // TODO
  };
  // TODO: onChangeNewIp

  const onChangeNewIp = (ip) => {
    /// TODO:
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

  // TODO: getItemStatusStyle
  const getItemStatusStyle = () => {
    // todo:
  };

  // TODO: getApiResultStyle
  const getApiResultStyle = () => {
    // todo:
  };

  // TODO: powerApiMode
  const isDisableButton = () => {
    return statusApiMode || isLoginAllMode;
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
                    {/* </div> */}
                  </div>
                </div>

                {/* --------- server card right box ---------- */}

                <div className="server-card-right-box">
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
