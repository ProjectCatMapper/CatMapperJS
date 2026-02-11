import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom';
import mapImage1 from '../assets/map1.webp';
import mapImage2 from '../assets/map2.webp';
import mapImage3 from '../assets/map3.webp';
import './LiveMapCarousel.css';

const LiveMapCarousel = () => {
  const mapPages = [
    //{ id: 1, mapUrl: '/map1', imageUrl: mapImage1, altText: 'Live Map 1', title: 'All datasets by region' },
    { id: 1, mapUrl: '/map4', imageUrl: mapImage3, altText: 'Live Map 4', title: 'All ethnicities' },
    { id: 2, mapUrl: '/map2', imageUrl: mapImage2, altText: 'Live Map 2', title: 'All languages' },
    // { id: 3, mapUrl: '/map3', imageUrl: require('../assets/map1.webp'), altText: 'Live Map 3' }
  ];

  return (
    <Carousel showArrows={true} infiniteLoop={true} autoPlay={true} interval={5000} showThumbs={false}>
      {mapPages.map((map, index) => (
        <div key={index}>
          <Link to={map.mapUrl} className="carousel-link">
            <img src={map.imageUrl} alt={map.altText} className="carousel-image" />
            <div className="carousel-title">{map.title}</div>
          </Link>
        </div>
      ))}
    </Carousel>
  );
};

export default LiveMapCarousel;
