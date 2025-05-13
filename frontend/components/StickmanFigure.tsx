import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

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

        {accessories.includes('1') && (
            <Circle cx="30" cy="10" r="6" fill="black" />
        )}
        {accessories.includes('2') && (
            <Line x1="20" y1="20" x2="40" y2="20" stroke="black" strokeWidth="3" />
        )}

    </Svg>
);

export default StickmanFigure;