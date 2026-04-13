import { ImageSourcePropType } from 'react-native';

export const DECK_IMAGES: Record<string, ImageSourcePropType> = {
  'Food & Drink': require('../../assets/images/blobs-food-and-drink.png'),
  'General': require('../../assets/images/blobs-general.png'),
  'Harry Potter': require('../../assets/images/blobs-harry-potter.png'),
  'History & Geography': require('../../assets/images/blobs-history-and-geography.png'),
  'Music': require('../../assets/images/blobs-music.png'),
  'Sci-Fi & Fantasy': require('../../assets/images/blobs-sci-fi-and-fantasy.png'),
  'Science & Nature': require('../../assets/images/blobs-science-and-nature.png'),
  'Sports & Leisure': require('../../assets/images/blobs-sports-and-leisure.png'),
  'TV & Movies': require('../../assets/images/blobs-tv-and-movies.png'),
  'Theater': require('../../assets/images/blobs-theater.png'),
  'Video Games': require('../../assets/images/blobs-video-games.png'),
  'Wordplay': require('../../assets/images/blobs-wordplay.png'),
};

export const getBlobImage = (deckName: string | undefined): ImageSourcePropType => {
  if (deckName && DECK_IMAGES[deckName]) {
    return DECK_IMAGES[deckName];
  }
  return DECK_IMAGES['General'];
};
