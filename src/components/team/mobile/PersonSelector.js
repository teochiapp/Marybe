import React from 'react';
import styled from 'styled-components';

const PersonSelector = ({ people, currentIndex, onSelect }) => {
  return (
    <SelectorContainer>
      <PeopleGrid>
        {people.map((person, index) => (
          <PersonItem
            key={index}
            $isActive={index === currentIndex}
            onClick={() => onSelect(index)}
          >
            <PersonAvatar
              src={person.image}
              alt={person.name}
              $isActive={index === currentIndex}
            />
            <PersonName>{person.surname}</PersonName>
          </PersonItem>
        ))}
      </PeopleGrid>
    </SelectorContainer>
  );
};

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  height: max-content;
  background: transparent;
`;

const PeopleGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    justify-content: center;
    padding: 10px 0;
    background: radial-gradient(black, transparent);
    border: 0.5px solid var(--primary-color);
    border-radius: 13px;
`;

const PersonItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isActive ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent'};
  border: 2px solid ${props => props.$isActive ? 'var(--secondary-color)' : 'transparent'};
  &:hover {
    background: rgba(var(--primary-color-rgb), 0.05);
    transform: translateX(3px);
  }
`;

const PersonAvatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.$isActive ? 'var(--secondary-color)' : 'transparent'};
  transition: all 0.3s ease;
  
  ${PersonItem}:hover & {
    border-color: var(--secondary-color);
  }
`;

const PersonName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default PersonSelector; 