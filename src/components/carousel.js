import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom';
import mapImage1 from '../assets/map1.png';

const LiveMapCarousel = () => {
  const mapPages = [
    { id: 1, mapUrl: '/map1', imageUrl: mapImage1, altText: 'Live Map 1' },
    { id: 2, mapUrl: '/sociomap', imageUrl: require('../assets/map1.png'), altText: 'Live Map 2' },
    { id: 3, mapUrl: '/sociomap', imageUrl: require('../assets/map1.png'), altText: 'Live Map 3' }
  ];

  return (
    <Carousel showArrows={true} infiniteLoop={true} autoPlay={true} interval={5000} showThumbs={false}>
      {mapPages.map((map, index) => (
        <div key={index}>
          <Link to={map.mapUrl} style={{ display: 'block', height: '100%' }}>
            <img src={map.imageUrl} alt={map.altText}/>
          </Link>
        </div>
      ))}
    </Carousel>
  );
};

export default LiveMapCarousel;
