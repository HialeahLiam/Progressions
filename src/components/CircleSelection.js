import React from 'react';
import PropTypes from 'prop-types';
import ChordNode from './ChordNode';
import { Scale, getDiatonicChords } from '../lib/progressions';
import '../styles/CircleSelection.css';
import Button from './Button';

const RADIUS_OF_NODES = 33;
export default function CircleSelection({ scale, sendInput, radius }) {
  const chords = getDiatonicChords(scale);
  const nodes = [];
  for (let i = 0; i < chords.length; i++) {
    // clockwise angle between node and top of circle
    const angle = 2 * Math.PI * (i / chords.length);
    const x = radius * Math.sin(angle) + radius - RADIUS_OF_NODES;
    const y = radius - radius * Math.cos(angle);
    nodes.push(<ChordNode
      key={chords[i]}
      chord={chords[i]}
      sendInput={sendInput}
      position={{ x, y }}
      radius={RADIUS_OF_NODES}
    />);
  }

  return (
    <div className="circle">
      <div
        className="container"
        style={{
          width: `${2 * radius}px`,
          height: `${2 * radius + RADIUS_OF_NODES * 2}px`,
        }}
      >
        {nodes}
        <Button type="round" clickHandler={() => null}>root</Button>
      </div>
    </div>
  );
}

CircleSelection.defaultProps = {
  radius: 130,
};

CircleSelection.propTypes = {
  scale: PropTypes.oneOf(Object.keys(Scale).map((e) => Scale[e])).isRequired,
  sendInput: PropTypes.func.isRequired,
  radius: PropTypes.number,
};