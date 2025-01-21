import React from 'react';
import FlowerOfLife from './FlowerOfLife';
import {
  HeroContainer,
  ContentWrapper,
  Title,
  Subtitle,
  CTAButton
} from './styles';

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <FlowerOfLife />
      <ContentWrapper>
        <Title>NeoSnipe</Title>
        <Subtitle>Discover tokens through sacred geometry</Subtitle>
        <CTAButton>Enter the Matrix</CTAButton>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default HeroSection;
