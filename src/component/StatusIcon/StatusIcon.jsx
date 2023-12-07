
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./StatusIcon.scss";

export const StatusIcon = ({ status }) => {

    const getIcon = () => {
        switch (status) {
            case "success":
                return "fa-check";
            case "warning":
                return "fa-exclamation";
            case "danger":
                return "fa-x";
            default:
                return "fa-check";
        }
    }

    const getStyleClass = () => {
        switch (status) {
            case "success":
                return "status-icon-success";
            case "warning":
                return "status-icon-warning";
            case "danger":
                return "status-icon-danger";
            default:
                return "status-icon-success";
        }
    }

    return (
        <div className={`status-icon ${getStyleClass()}`}>
            <FontAwesomeIcon icon={["fa", getIcon()]} />
        </div>
    );
}
