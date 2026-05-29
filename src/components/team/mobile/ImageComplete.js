import React from 'react';
import styled from 'styled-components';

const ImageComplete = ({ name, role, image, onClick, surname }) => {
  
  return (
    <ImageContainer onClick={onClick}>
      <ImageWrapper>
        <PersonImage src={image} alt={name} />
        <ImageOverlay>
          <PersonInfo>
            <PersonName>{surname || name}</PersonName>
            <PersonRole>{role}</PersonRole>
          </PersonInfo>
        </ImageOverlay>
      </ImageWrapper>
    </ImageContainer>
  );
};

const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const PersonImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  padding: 20px;
  color: white;
`;

const PersonInfo = styled.div`
  text-align: left;
`;

const PersonName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 3px 0;
  color: var(--primary-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const PersonRole = styled.p`
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  color: var(--text-color);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
`;

export default ImageComplete; 