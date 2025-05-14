import React from 'react';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

type Props = {
    color: string;
    accessories: string[];
}

const StickmanFigure: React.FC<Props> = ({ color, accessories }) => (
    <Svg height="150" width="90" viewBox='0 0 60 100'>
        <Circle cx="30" cy="20" r="10" stroke={color} strokeWidth="2" fill="none" />
        <Line x1="30" y1="30" x2="30" y2="60" stroke={color} strokeWidth="2" />
        <Line x1="30" y1="40" x2="10" y2="40" stroke={color} strokeWidth="2" />
        <Line x1="30" y1="40" x2="50" y2="40" stroke={color} strokeWidth="2" />
        <Line x1="30" y1="60" x2="15" y2="80" stroke={color} strokeWidth="2" />
        <Line x1="30" y1="60" x2="45" y2="80" stroke={color} strokeWidth="2" />
        

         {/* 🎩 Hatt */}
        {accessories.includes('1') && (
            <Circle cx="30" cy="10" r="6" fill="black" />
        )}
        {/* 🕶️ Briller */}
        {accessories.includes('2') && (
            <Line x1="20" y1="20" x2="40" y2="20" stroke="black" strokeWidth="3" />
        )}
        {/* 👕 T-skjorte */}
         {accessories.includes('3') && (
            <Rect x="20" y="20" width="20" height="15" fill="skyblue" />
        )}
        {/* 👖 Bukse */}
         {accessories.includes('4') && (
            <>
            <Rect x="13" y="60" width="6" height="20" fill="blue" />
            <Rect x="41" y="60" width="6" height="20" fill="blue" />
            </>
        )}
        {/* 🩳 Shorts */}
         {accessories.includes('5') && (
            <Rect x="22" y="55" width="16" height="10" fill="blue" />
        )}
        {/* 👟 Sko */}
         {accessories.includes('6') && (
            <>
            <Rect x="11" y="80" width="8" height="5" fill="black" />
            <Rect x="41" y="80" width="8" height="5" fill="black" />
            </>
        )}
        

    </Svg>
);

export default StickmanFigure;