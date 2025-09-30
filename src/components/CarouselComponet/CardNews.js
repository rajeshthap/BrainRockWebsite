import React from "react";
import cx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import TextInfoContent from "@mui-treasury/components/content/textInfo";
import { useN01TextInfoContentStyles } from "@mui-treasury/styles/textInfoContent/n01";
import { useBouncyShadowStyles } from "@mui-treasury/styles/shadow/bouncy";
import Group1 from "../../../src/assets/images/Group 2-1.png"
import Group2 from "../../../src/assets/images/Group 2-2.png"
import Group3 from "../../../src/assets/images/Group 2-3.png"
import Star from "../../components/CarouselComponet/Star";
  const cardsData = [
    {
      image: Group1,
      heading: "Beautiful Beaches",
      body: "Thailand is home to stunning beaches with crystal-clear waters.",
      stars: 5,
    },
    {
      image: Group2,
      heading: "Street Food Paradise",
      body: "Bangkok’s street food is world-famous for its variety and taste.",
      stars: 4,
    },
    {
      image: Group1,
      heading: "Cultural Heritage",
      body: "Explore temples, traditions, and centuries of rich history.",
      stars: 5,
    },
    {
      image: Group1,
      heading: "Adventure Activities",
      body: "From scuba diving to trekking, Thailand has it all.",
      stars: 3,
    },
    {
      image: Group1,
      heading: "Warm Hospitality",
      body: "Thai culture is known for its welcoming and friendly people.",
      stars: 5,
    },
  ];
const useStyles = makeStyles(() => ({
  root: {
    maxWidth: 304,
    width: 400,
    margin: "auto",
    boxShadow: "none",
    borderRadius: 30,
    textAlign: "center", 
  },
  media: {
    width: 120,           
    height: 120,
    borderRadius: "50%",  
    margin: "20px auto",  
    objectFit: "cover",   
  },
  content: {
    padding: 24,
  },
}));

export const CardNews = React.memo(function NewsCard({ image, heading, body, stars }) {
  const styles = useStyles();
  const textCardContentStyles = useN01TextInfoContentStyles();
  const shadowStyles = useBouncyShadowStyles();
  const n = 5;
  return (
    <Card className={cx(styles.root, shadowStyles.root)}>
      <CardMedia component="img" className={styles.media} image={Group1} />
      <CardContent className={styles.content}>
        <div>
          {[...Array(n)].map((_, i) => (
            <span key={i}>
              <Star height="20px" />
            </span>
          ))}
        </div>
        <TextInfoContent
          classes={textCardContentStyles}
          heading={cardsData.heading}
          body="Kayaks crowd Three Sisters Springs, where people and manatees maintain controversial coexistence."
        />
      </CardContent>
    </Card>
  );
});

export default CardNews;
