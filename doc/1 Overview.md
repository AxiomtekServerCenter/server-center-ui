## Overview


&nbsp;


&nbsp;


Axiomtek Server Center provides a website that empowers users to control multiple OpenBMC devices using Redfish APIs. Before delving into the features of Axiomtek Server Center, let's examine OpenBMC's native website, [webui-vue](https://github.com/openbmc/webui-vue). Initially designed for communicating with a single device through Redfish APIs, limitations arise when attempting one-to-multi device control.

&nbsp;


Consider a scenario where accessing the website https://10.1.20.101 from a laptop with IP https://1.1.1.1 is desired. This direct communication between the two IPs is not allowed because web browsers enforce 'CORS' policy (Cross-Origin Resource Sharing). CORS restricts cross-origin (and thus cross-IP) API calls from browsers. To adhere to this policy, the front-end website must utilize a proxy IP to make the browser believe that https://1.1.1.1 is equivalent to https://10.1.20.101. So now, front-end (https://1.1.1.1  proxied as https://10.1.20.101) can call APIs on the device with IP https://10.1.20.101 because the browser perceives their IPs as identical. [OpenBMC website (webui-vue)](https://github.com/openbmc/webui-vue) also employs this proxy approach to overcome the CORS limitation.

&nbsp;


However, this approach still has limitations. A single website can only act as a proxy for one IP at a time. Therefore, while it can proxy https://1.1.1.1 as https://10.1.20.101, it can't simultaneously proxy https://1.1.1.1 as https://10.1.20.118. As a result, the website can only display data from one single IP at a time.


&nbsp;



![](https://drive.google.com/uc?id=1YvGoDNO1q68TNKY3oBc9hbdhuy82w2Go)

&nbsp;

&nbsp;

Besides proxy settings, an alternative solution to overcome CORS policy is setting the 'Access-Control-Allow-Origin' header on the backend server of https://10.1.20.101 and adding https://1.1.1.1 to its whitelist. However, for security reasons, the source code of [OpenBMC webui-vue](https://github.com/openbmc/webui-vue) turns off the flag for the 'Access-Control-Allow-Origin' header.

&nbsp;



Axiomtek Server Center provides a solution to overcome these challenges. In our approach, a node.js server layer is introduced between the front-end and the OpenBMC server. This intermediary layer can communicate with multiple OpenBMC devices concurrently.

&nbsp;


Why does it work? Because, although cross-origin API calls are not allowed in browsers, they are permitted on the Node.js server. This capability enables Axiomtek Server Center to display and control data from various OpenBMC devices simultaneously.

&nbsp;


![axiomtek-server-center-CORS.png](https://drive.google.com/uc?id=1grSJ89AatWYhYPMm56KhXbFffsq4iQDD)


&nbsp;


&nbsp;


## Development guide

&nbsp;


To demonstrate the implementation process, we present the commit history of both the front-end (React.js) and back-end (Node.js) projects.
The commit titles of the two projects are synchronized. For instance, the front-end commit 'feat: login OpenBMC API' corresponds to the back-end commit 'feat: login OpenBMC API'.

&nbsp;


![](https://drive.google.com/uc?id=1YtVK_2P-BBmR6NxhBcheKTk_CWniQYCt)

&nbsp;


Additionally, for reference on the Redfish APIs, please clone the OpenBMC webui-vue project.

&nbsp;


[OpenBMC webui-vue project](https://github.com/openbmc/webui-vue)



&nbsp;


&nbsp;

## Project directory

Currently, you have installed Axiomtek Server Center, so the source code is located in the `\server-center` and `\server-center-ui` folders under `C:\Users<Your User Name>\AppData\Roaming\AxiomtekServerCenter` directory . However, this source code is not organized by us. Therefore, when you start developing and modifying Axiomtek Server Center, it is recommended to clone the latest version from GitHub and make modifications instead of directly altering the source code in the installation path.

During development, please ensure to stop the two Windows services: AxiomtekServerCenter and AxiomtekServerCenterUI because these services respectively occupy ports 6001 and 3006.

After completing your development, if you wish your program to be automatically started by the Windows service every time the system boots, there are two approaches. 

### Approach 1: replace the installation projects
The first approach is to replace the `\server-center` and `\server-center-ui` folders in `C:\Users<Your User Name>\AppData\Roaming\AxiomtekServerCenter` with your modified versions. 


### Approach 2: alter script files
The second approach is to go into the `C:\Users<Your User Name>\AppData\Roaming\AxiomtekServerCenter` directory and edit the paths in the `nssm.ps1,` `frontend_boot.bat` and `backend_boot.bat` files to match your project's path.




&nbsp;


&nbsp;

