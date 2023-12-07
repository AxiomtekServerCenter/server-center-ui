import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { useSelector, useAppDispatch } from "../redux/hooks";

export const EditModal = ({ id, title, editItems, onClickSave, warning, errorMsg, type = "", description = "",
  showSaveBtn = true, completeMsg = "",
  saveBtnStr = "Save changes"

}) => {

  const [showPassword, setShowPassword] = useState(true);
  // const lineNotifyPort = useSelector((s) => s.lineNotify.lineNotifyPort);


  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }



  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      onClickSave();
    }
  }




  const showItem = (item) => {
    // if (item.title === LINE_NOTIFY_MODAL_TITLE_AUTH_CODE && !item.editValue) {
    //   return false;
    // }

    return "true";
  }


  return (
    <div className="">

      <div className="modal theme-modal-backdrop" tabIndex="-1" id={id} data-bs-backdrop="false">
        <div className="modal-dialog" >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
            </div>
            <div className="modal-body py-5 px-5">
              {description &&
                <div className="font-m-plus mb-5">
                  {description}
                </div>
              }
              {editItems.map(item => (

                <div key={item.title} className={`input-group reboot-input-group mb-4 ${showItem(item) ? "" : "d-none"}`}>
                  <span className="input-group-text theme-input-group-text">{item.title}</span>
                  <input
                    type={(item.title === "Password" && showPassword) ? "password" : "text"}
                    className="form-control theme-form-control d-inline "
                    value={item.editValue}
                    onChange={(e) => {
                      item.onChangeValue(e.target.value);
                    }}
                    onKeyDown={onKeyPress}

                  />
                  {item.title === "Password" &&
                    <span className="input-group-text theme-input-group-text">
                      <button className="btn fa-solid" onClick={toggleShowPassword}> <div className="fa fa-eye"></div></button>
                    </span>
                  }
                </div>
              ))
              }


              <div className="text-danger mt-5 mb-2 error-msg">{errorMsg}</div>

              {warning &&
                <div className="bg-warning mt-3 mb-2">{warning}</div>
              }

              {completeMsg &&
                <div className="mb-5">{completeMsg}</div>
              }

              {/* {type && type === "lineNotify" && !showSaveBtn &&
                < button className="btn line-notify-subscribe-button">
                  <a className="line-notify-subscribe-a" href={`https://127.0.0.1:${lineNotifyPort}/login`}
                    target="_blank" rel="noreferrer">Subscribe LINE Notify</a>

                </button>
              } */}



            </div>


            <div className="modal-footer">

              {showSaveBtn &&
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onClickSave}
                >
                  {saveBtnStr}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div >
  );


};
