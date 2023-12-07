
import React, { useEffect, useState, useRef, forwardRef } from "react";
import { useSelector, useAppDispatch } from "../redux/hooks";
import { deleteToast } from "../redux/ToastStack/slice";
import { Toast } from "bootstrap";
import { getSecondDiff } from "../helpers/DateTime";
import "./ToastStack.scss"

const toastStayTime = 5;

export const ToastStack = forwardRef((props, ref) => {
    const dispatch = useAppDispatch();
    const toastList = useSelector((s) => s.toastStack.toastList);
    const servers = useSelector((s) => s.reboot.serverList);

    const getServerName = (ip) => {
        const index = servers.findIndex(s => s.ip === ip);
        if (index >= 0) {
            return servers[index].serverName;
        }
        return "--";
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (toastList?.length > 0) {
                toastList.forEach((toast) => {
                    if (getSecondDiff(toast.beginTime, now) >= toastStayTime) {
                        dispatch(deleteToast(toast));
                    }
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    });


    useEffect(() => {
        if (toastList.length === 0) return;
        toastList.forEach((toast) => {
            const toastElement = document.getElementById(toast.id);
            if (toastElement) {
                setTimeout(() => {
                    const bsToast = new Toast(toastElement, { autohide: false })
                    bsToast.show();
                }, 100)
            }
        })
    }, [toastList]);


    const onClickClose = (toast) => {
        dispatch(deleteToast(toast));
    }

    return (
        <div className="toast-container">
            {toastList.map((toast) =>
                <div
                    key={toast.id}
                    id={toast.id}
                    className="toast"
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="toast-header">
                        <strong className="me-auto">{getServerName(toast.ip)}</strong>
                        <small className="text-muted">{toast.ip}</small>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="toast"
                            aria-label="Close"
                            onClick={() => onClickClose(toast)}
                        ></button>
                    </div>
                    <div className="toast-body">{toast.message}</div>
                </div>
            )}



        </div>
    );
});