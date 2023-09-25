import React, { CSSProperties } from 'react'
import Lottie from "react-lottie-player";
import loadingAnime from './loading.json'


export const AnimateIcon = ({style}:{style?:CSSProperties})=>{
    return (
        <Lottie
            loop
            animationData={loadingAnime}
            play
            style={{...style}}
        />);
}