import React, { useState, useEffect, useRef } from 'react';
import CircleSelection from '../components/CircleSelection';
import {
  randomProgression,
  randomDiatonicTriadGenerator,
  Scale,
  // getDiatonicChords,
  convertChordsToFrequencies,
} from '../lib/progressions';
import Header from '../components/Header';
import ProgressionBar from '../components/ProgressionBar';
import Button from '../components/Button';

const scale = Scale.MAJOR;

// const diatonicMajorScaleChords = getDiatonicChords(scale);

// const PROGRESSION = [
//   diatonicMajorScaleChords[0],
//   diatonicMajorScaleChords[2],
//   diatonicMajorScaleChords[3],
//   diatonicMajorScaleChords[4]];

// const ROOT = 0;

export default function Training() {
  const [input, setInput] = useState(null);
  const [incorrectChords, setIncorrectChords] = useState([]);
  const [isSubmitting, setSubmit] = useState(false);
  const [volume, setVolume] = useState(0.05);
  const [training, setTraining] = useState(false);
  const [progression, setProgression] = useState();

  const mainGainNode = useRef();
  const audioContext = useRef();
  const oscillators = useRef([]);
  const playbackIntervalId = useRef();

  const inputHandler = (newInput) => {
    if (!isSubmitting) setInput(newInput);
  };

  const submitHandler = (inputtedChords) => {
    console.log(inputtedChords);
    console.log(progression);
    setSubmit(true);
    const incorrectIndices = [];
    for (let i = 0; i < progression.length; i++) {
      if (inputtedChords[i].root !== progression[i].root
        && inputtedChords[i].chordSymbol !== progression[i].chordSymbol) {
        incorrectIndices.push(i);
      }
    }
    setIncorrectChords(incorrectIndices);
  };

  const volumeChangeHandler = (event) => {
    setVolume(event.target.value);
    mainGainNode.current.gain.value = event.target.value;
  };

  const pausePlayback = () => {
    clearInterval(playbackIntervalId.current);
    mainGainNode.current.disconnect();
  };

  const handleNext = () => {
    setInput(null);
    setIncorrectChords([]);
    setSubmit(false);
    setProgression(randomProgression(8, () => randomDiatonicTriadGenerator(Scale.MAJOR)));
    pausePlayback();
  };

  const playProgression = (prog) => {
    clearInterval(playbackIntervalId.current);

    prog[0].forEach((freq, index) => {
      oscillators.current[index].frequency.value = freq;
    });
    mainGainNode.current.connect(audioContext.current.destination);

    let progCount = 1;

    playbackIntervalId.current = setInterval(() => {
      if (progCount < prog.length) {
        prog[progCount].forEach((freq, index) => {
          oscillators.current[index].frequency.value = freq;
          // mainGainNode.current.gain.value = 0;
          // mainGainNode.current.gain.exponentialRampToValueAtTime(
          //   volume,
          //   audioContext.current.currentTime + 0.05,
          // );
        });
        progCount++;
      } else {
        mainGainNode.current.disconnect();
        clearInterval(playbackIntervalId.current);
      }
    }, 2000);
  };

  const playHandler = () => {
    playProgression(convertChordsToFrequencies(progression, 2, 4));
  };

  const beginTrainingHandler = () => {
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    setTraining(true);
  };

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.current = context;
    oscillators.current[0] = new OscillatorNode(audioContext.current, {
      type: 'triangle',
    });
    oscillators.current[1] = new OscillatorNode(audioContext.current, {
      type: 'triangle',
    });
    oscillators.current[2] = new OscillatorNode(audioContext.current, {
      type: 'triangle',
    });

    const gainNode = new GainNode(audioContext.current, { gain: volume });
    mainGainNode.current = gainNode;
    oscillators.current.forEach((osc) => {
      osc.connect(mainGainNode.current);
      osc.start();
    });

    setProgression(randomProgression(4, () => randomDiatonicTriadGenerator(Scale.MAJOR)));
  }, []);

  useEffect(() => {
    // resets ProgressionBar's input prop to null to allow consecutive input
    // of previous chord
    setInput(null);
  }, [input]);

  return (
    <div>
      <Header>Progression Training</Header>
      {training
        ? (
          <>
            <ProgressionBar
              amountOfSlots={progression.length}
              submitHandler={submitHandler}
              playHandler={playHandler}
              nextHandler={handleNext}
              input={input}
              incorrectSubmissions={incorrectChords}
              submit={isSubmitting}
            />
            <input type="range" min="0.0" max="0.1" value={volume} onChange={volumeChangeHandler} step="0.01" />
            <CircleSelection scale={scale} sendInput={inputHandler} />
          </>
        )
        : <Button type="round" clickHandler={beginTrainingHandler}>Begin</Button>}
    </div>
  );
}
