import "./GuidePage.scss";
import "./GuidePage.css";
import { Banner } from "../../component/Banner/Banner";
import serverManagementImg from "../../img/server-mgmt.png"
import stationIpImg from "../../img/station-ip.png"

export const GuidePage = () => {

    // const guideTexts = [
    //     "1. Please download the installation zip file, and unzip it.",
    //     "2. In the unzipped folder, there is an NVM setup wizard.  Please install NVM  with it. Just follow the defalt settings of the installation wizard. ",
    //     "3. Please install Axiomtek Server Center with the Axiomtek Server Center setup wizard, which is also in the unzipped folder. Note that the NVM installation must be done before the installation of Axiom Server Center. Just follow the defalt settings of the installation wizard. ",
    //     "4. Please reboot the computer.",
    //     "5. After the computer is rebooted, please open the Chrome browser, and go to http://127.0.0.1:3006/#/reboot." +
    //     "The webpage initialization may take some time, so please wait until the webpage of Axiomtek Server Center can show content.",
    //     "6. By this time, the webpage can't access data yet because the backend server has not been set up. So please use the Chrome browser to go to https://127.0.0.1:6001. "
    //     + "Chrome will show warnings, and please click the 'advanced' button to allow the connection with this url.",
    //     "7. Now the webpage and the backend server are both setup, so you can begin to add servers on the webpage. " +
    //     "The format of the ip only contains numbers, so please don't add the 'https://' prefix  or the '/' postfix. The correct example of ip may be like: " +
    //     "10.1.10.1, and the wrong format may be like: https://10.1.10.1, or 10.1.10.1/"
    // ];

    const guideTexts = [

        'Front-end program files are located at "C:\\Users\\<Your User Name>\\AppData\\Roaming\\AxiomtekServerCenter\\server-center-ui"',
        'Backend files are located at "C:\\Users\\<Your User Name>\\AppData\\Roaming\\AxiomtekServerCenter\\server-center"',
        "Front-end cannot call OpenBMC Redfish APIs because browsers block cross-origin requests according to the CORS policy. " +
        "The workaround is that Axiomtek front-end sends requests to a node/Express backend server instead of the OpenBMC server. " +
        "Then, this node/Express backend server will send requests to the OpenBMC server and return the result from OpenBMC to front-end.",
        "Both front-end and backend servers are installed as Windows background services." +
        "If you want to delete all data directly in the backend data file, please don't let the file content become totally empty; instead, please write an empty array, i.e, [], into the file.",
        "If your computers use DHCP, the values of their IPs may change, which may cause API errors when the front-end is trying to send requests to backend.",
        "Other reasons that may lead to API errors may be that the usernames/passwords are wrong," +
        ' or the format of the IP is wrong. Wrong format examples: "https://10.1.10.1", or "10.1.10.1/". ' +
        'Correct example: "10.1.10.1", which means that there is no "https://" prefix or "/" postfix',
        "When the Axiomtek Server Center webpage can't connect to an IP, one way to examine this issue is to paste the IP onto the browser (https://<IP value>). " +
        "If the OpenBMC website of that IP can't be shown, it means that there may be some issues of the IP itself. But if the OpenBMC website can be opened successfully, " +
        "while the Axiomtek Server Center webpage still can't connect to that IP, please contact us. Thank you"
    ];

    const ipGuideSteps = [
        {
            text: "1. Connect a screen and a keyboard with the motherboard.",
            img: "",
        },
        {
            text: "2. Turn on the motherboard. When an logo image shows up on the screen, please keep pressing the delete key until the BIOS page appears.",
            img: "",
        },
        {
            text: "3. Go to tab page 'Server Mgmt'. Go to 'BMC network configuration'. ",
            img: serverManagementImg,
        },
        {
            text: "4. The IP address value will be shown in the 'Station IP address' field. ",
            img: stationIpImg,
        }
    ]



    return (
        <div className="guide-page-root">
            <div className="content-fluid-container">
                <Banner title="GUIDE" imgId={2} />
                {/* development guide */}
                <div className="content-fixed-width-container">
                    <table className="table-root">
                        <tbody>
                            <tr>
                            </tr>
                            {guideTexts.map((item) => (
                                <tr className="table-td-row" key={item}>
                                    <td className="table-td">{item}</td>

                                </tr>
                            ))
                            }
                        </tbody>
                    </table>

                    {/* IP guide */}
                    <div className="ip-guide-title">How to get IP</div>
                    {ipGuideSteps.map(item => (
                        <div className="ip-guide-step" key={item.text}>
                            <div className="ip-guide-text">{item.text} </div>
                            {item.img && <img className="ip-guide-img" src={item.img} alt={item.text}></img>}
                        </div>
                    ))
                    }
                </div>
            </div>
        </div >

    );
}
