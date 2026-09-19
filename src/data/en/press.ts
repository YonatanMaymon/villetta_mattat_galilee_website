import { PRESS_ARTICLES as HE_ARTICLES, PRESS_HERO as HE_HERO, type PressArticle } from '../press'
import { translateItems } from './util'

export const PRESS_HERO = {
  image: HE_HERO.image,
  title: 'Written About Us',
  subtitle: 'See what people write about us',
}

export const PRESS_ARTICLES: PressArticle[] = translateItems(HE_ARTICLES, [
  {
    published: 'Published 19/01/23',
    title: '"A hotel inside a villa": the most beautiful guest villas in Israel',
    excerpt:
      'From an urban villa high in the Galilee, through an 11th-century Crusader building, to a wild desert fantasy – five villas that bring a fresh design message, perfect views and dreamy quiet',
  },
  {
    published: 'Published 02/23',
    title: 'A guesthouse in Mattat: the outside is the inside',
    excerpt:
      'On a mountain ridge, merging with a magnificent view, stands the "Villetta" guesthouse, whose essence is the interplay between outside and inside. Large iron openings bring nature indoors and, together with a high wooden ceiling, create a wild feeling in a small space.',
  },
])
