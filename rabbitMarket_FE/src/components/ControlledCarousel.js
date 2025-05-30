
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Carousel from 'react-bootstrap/Carousel';

const ControlledCarousel = (props) => {
  return (
    <Carousel>
      <Carousel.Item interval={1000}>
  <a href="http://localhost:3000/" target="_blank" rel="noopener noreferrer">
    <img
      className="d-block w-100"
      src="https://i.ibb.co/SX43HfQ0/adver1.png"
      alt="First slide"
    />
  </a>
  <Carousel.Caption></Carousel.Caption>
</Carousel.Item>

      <Carousel.Item interval={500}> 
  <a href="https://www.instagram.com/market_sku_official?igsh=MTQ3YWY1bWR6ZG82cA==" target="_blank" rel="noopener noreferrer">
    <img
      className="d-block w-100"
      src="https://i.ibb.co/zVYQqg3h/adver2.png"
      alt="Second slide"
    />
  </a>
  <Carousel.Caption></Carousel.Caption>
</Carousel.Item>

      <Carousel.Item>
  <a href="https://www.sungkyul.ac.kr/sungkyulice/index.do" target="_blank" rel="noopener noreferrer">
    <img
      className="d-block w-100"
      src="https://i.ibb.co/b5kj71Cf/adver3.png"
      alt="Third slide"
    />
  </a>
  <Carousel.Caption></Carousel.Caption>
</Carousel.Item>

    </Carousel>
  );
};

export default ControlledCarousel;