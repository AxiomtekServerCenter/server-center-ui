import powerControlBnner from "../../img/power-control-banner.png"
import icBanner from "../../img/ic-banner.png"
import "./Banner.scss";


export function Banner({ title, imgId }) {
    const images = {
        1: powerControlBnner,
        2: icBanner,
    }


    return (
        <div className={"banner " + (imgId === 1 ? 'banner-power-control' : '')}>
            <div className={"banner-title " + (imgId === 1 ? 'banner-title-power-control' : '')}>
                {title}
            </div>
            <img className="banner-img" src={images[imgId]} alt="banner" />
        </div>

    );
}