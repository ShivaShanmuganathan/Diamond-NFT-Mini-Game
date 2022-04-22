import React from "react";
import * as LottiePlayer from "@lottiefiles/lottie-player";

const PageLoader = () => {
    return (
        <lottie-player
            autoplay
            loop
            mode="normal"
            src="https://assets3.lottiefiles.com/packages/lf20_jjmto1qp.json"
            style={{ width: "320px" }}
        ></lottie-player>
    )
}

export default PageLoader