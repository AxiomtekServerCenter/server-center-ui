import "./Header.scss";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import powerImg from "../../img/power-off-icon.png"
import bookImg from "../../img/book-icon.png"
import menuImg from "../../img/menu-icon.png"
import chatImg from "../../img/chat-icon.png"

const POWER_CONTROL = "powerControl";
const GUIDE = "guide";
const LINE_NOTIFY = "lineNotify";

export const Header = () => {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(POWER_CONTROL);

    const location = useLocation();

    useEffect(() => {
        switch (location.pathname) {
            case '/guide':
                setCurrentTab(GUIDE);
                break;
            case '/reboot':
                setCurrentTab(POWER_CONTROL);
                break;
            case '/line-notify':
                setCurrentTab(LINE_NOTIFY);
                break;
            default:
                break;
        }

    }, [location]);

    const OnClickPowerControl = () => {
        setCurrentTab(POWER_CONTROL);
        navigate("/reboot");
    };

    const OnClickGuide = () => {
        setCurrentTab(GUIDE);
        navigate("/guide");
    };

    const OnClickLineNotify = () => {
        setCurrentTab(LINE_NOTIFY);
        navigate("/line-notify");
    };

    return (
        <div className="header-root-container">
            <div className="header-left-container">

                <a href="https://www.axiomtek.com/"
                    target="_blank"
                    rel="noreferrer noopenner"
                >
                    {/* <div className="header-logo"></div> */}
                    <button className="btn-offical btn">Axtiomtek</button>
                </a>
                {/* <SocialLink /> */}
            </div>
            <div className="header-right-container">
                <div className="header-nav-item-list">
                    <div className="header-nav-icon-container">
                        <button className={`btn header-nav-btn shadow-none`} onClick={OnClickPowerControl}>
                            {/* <BiPowerOff /> */}
                            <img className="header-nav-icon" src={powerImg} alt="" />
                        </button>
                        <div className="tooltip-title">power</div>

                    </div>
                    <div className="header-nav-icon-container">

                        <button className={`btn header-nav-btn shadow-none`} onClick={OnClickGuide}>
                            {/* <BiBookBookmark /> */}
                            <img className="header-nav-icon" src={bookImg} alt="" />

                        </button>
                        <div className="tooltip-title">guide</div>

                    </div>


                    <div className="header-nav-icon-divider"></div>
                    <div className="header-nav-icon-container">
                        {/* <BiMenuAltRight /> */}
                        <img className="header-nav-icon" src={menuImg} alt="" />

                    </div>

                </div>

                {/* <div className="header-decor-box"></div> */}
            </div>
        </div>

    );
}
