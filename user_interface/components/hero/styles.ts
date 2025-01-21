import styled, { keyframes } from 'styled-components';
import { GOLDEN_RATIO, FIBONACCI_NUMBERS } from './constants';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const HeroContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #080A2E, #1A1B4D);
  overflow: hidden;
  padding: 0 2rem;
`;

export const ContentWrapper = styled.div`
  width: ${100 / GOLDEN_RATIO}vw;
  position: absolute;
  top: ${61.8}vh;
  text-align: center;
  backdrop-filter: blur(5px);
  padding: 1rem;
  border-radius: 10px;
`;

export const Title = styled.h1`
  color: #00FFCC;
  font-family: 'Orbitron', sans-serif;
  font-size: 4rem;
  margin: 0;
  animation: ${fadeIn} 1.618s ease-out;
  transition: color 0.3s ease-out;

  &:hover {
    color: #ffffff;
  }
`;

export const Subtitle = styled.p`
  color: #9674d4;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  margin-top: ${FIBONACCI_NUMBERS.SUBTITLE_SPACING}px;
  animation: ${fadeIn} 2.618s ease-out;
`;

export const CTAButton = styled.button`
  margin-top: ${FIBONACCI_NUMBERS.BUTTON_SPACING}px;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid #00FFCC;
  color: #00FFCC;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.3s ease-out, background 0.3s ease-out;

  &:hover {
    transform: scale(${1 / GOLDEN_RATIO});
    background: rgba(0, 255, 204, 0.2);
    box-shadow: 0 0 10px #00FFCC;
  }

  &:active {
    transform: scale(${1 / (GOLDEN_RATIO * 1.1)});
  }
`;
