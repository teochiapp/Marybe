import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 10px 0;
  margin-top: 10px;
  margin-bottom: 20px;
`;

const TrackWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: #ECE9E4;
  border-radius: 2px;
`;

const TrackHighlight = styled.div`
  position: absolute;
  height: 100%;
  background-color: var(--color-bordo-secundario);
  border-radius: 2px;
`;

const Thumb = styled.input`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  background: none;
  pointer-events: none;
  appearance: none;
  margin: 0;
  z-index: 3;
  outline: none;

  &::-webkit-slider-thumb {
    pointer-events: auto;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--color-bordo-secundario);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  &::-moz-range-thumb {
    pointer-events: auto;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: var(--color-bordo-secundario);
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`;

const ValuesDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #535353;
`;

export default function PriceRangeSlider({ min, max, value, onChange, onFinalChange }) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxVal - 1);
    setMinVal(value);
    minValRef.current = value;
    onChange?.([value, maxVal]);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
    onChange?.([minVal, value]);
  };

  const handleMouseUp = () => {
    if (onFinalChange) {
      onFinalChange([minVal, maxVal]);
    }
  };

  const getPercent = (val) => Math.round(((val - min) / (max - min)) * 100);

  return (
    <SliderContainer>
      <TrackWrapper>
        <TrackHighlight
          style={{
            left: `${getPercent(minVal)}%`,
            width: `${getPercent(maxVal) - getPercent(minVal)}%`,
          }}
        />
        <Thumb
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />
        <Thumb
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          style={{ zIndex: 4 }}
        />
      </TrackWrapper>
      <ValuesDisplay>
        <span>${minVal.toLocaleString('es-AR')}</span>
        <span>-</span>
        <span>${maxVal.toLocaleString('es-AR')}</span>
      </ValuesDisplay>
    </SliderContainer>
  );
}
