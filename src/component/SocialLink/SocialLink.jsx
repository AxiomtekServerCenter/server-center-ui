import "./SocialLink.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export function SocialLink({ direction }) {

    const getContainerStyle = () => {
        if (direction === "vertical") {
            return "social-link-container-vertical";
        }

        return "social-link-container";
    }
    return (
        <div className={getContainerStyle()}>
            <a
                className="social-link-a"
                href="https://www.linkedin.com/company/axiomtek/"
                target="_blank"
                rel="noreferrer noopenner"
            >
                {" "}
                <div className="social-link social-link-linkedin">
                    {" "}
                    <FontAwesomeIcon icon={["fab", "linkedin"]} />
                </div>{" "}
            </a>
            <a
                className="social-link-a"
                href="https://www.youtube.com/c/AxiomtekChannel"
                target="_blank"
                rel="noreferrer noopenner"
            >
                <div className="social-link social-link-youtube">
                    {" "}
                    <FontAwesomeIcon icon={["fab", "youtube"]} />{" "}
                </div>
            </a>
            <a
                className="social-link-a"
                href="http://www.facebook.com/AxiomtekTW"
                target="_blank"
                rel="noreferrer noopenner"
            >
                <div className="social-link social-link-facebook">
                    {" "}
                    <FontAwesomeIcon icon={["fab", "facebook"]} />{" "}
                </div>
            </a>
            <a
                className="social-link-a"
                href="https://twitter.com/Axiomtek"
                target="_blank"
                rel="noreferrer noopenner"
            >
                <div className="social-link social-link-twitter">
                    {" "}
                    <FontAwesomeIcon icon={["fab", "twitter"]} />{" "}
                </div>
            </a>
        </div>

    );
}