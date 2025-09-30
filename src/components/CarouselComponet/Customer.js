import "../../assets/css/cards.css";
import Carousel from "react-spring-3d-carousel";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import Card from "./Card";
import NewsCardDemo, { CardNews } from "./CardNews";
import Carroussel from "./Carroussel";

import { useSpring, animated } from "@react-spring/web";



export default function Customer() {
  let cards = [
    {
      key: uuidv4(),
      content: <CardNews />
    },
    {
      key: uuidv4(),
      content: <CardNews />
    },
    {
      key: uuidv4(),
      content: <CardNews />
    },
    {
      key: uuidv4(),
      content: <CardNews />
    },
    {
      key: uuidv4(),
      content: <CardNews />
    },
    {
      key: uuidv4(),
      content: <CardNews />
    },
    {
      key: uuidv4(),
      content: <CardNews />
    }
  ]; /*.map((element, index) => {
    return { ...element, onClick: () => setGoToSlide(index) };
  });*/

  return (
    <div className="App">
      {/*<div style={{ width: "80%", height: "500px", margin: "0 auto" }}>
        <Carousel
          slides={cards}
          goToSlide={goToSlide}
          offsetRadius={offsetRadius}
          showNavigation={showArrows}
          animationConfig={config.gentle}
        />
  </div>*/}
      <Carroussel
        cards={cards}
        height="500px"
        width="90%"
        margin="0 auto"
        offset={2}
        showArrows={false}
      />
    </div>
  );
}
