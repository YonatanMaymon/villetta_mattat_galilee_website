import { AirVent, Archive, BedDouble, Blinds, Shirt, Sofa, Tv, Wine, type LucideIcon } from 'lucide-react'

export const VILLETTA_HERO = {
  image: '/assets/hero-jacuzzi.jpg',
  title: 'על הוילטה',
  subtitle: 'תקבלו שהות מרפאה ומלאת כל טוב.',
}

export interface Amenity {
  icon: LucideIcon
  text: string
}

export interface AmenityGroup {
  id: string
  title: string
  items: Amenity[]
}

export const AMENITIES_HEADING = {
  title: 'מה יש בוילטה?',
  subtitle: 'בבקשה תמצאו את המתחמים הבאים :',
}

// The live site cycles the same five icons (tv, sofa, shirt, air-vent, wine) down every
// list, so e.g. the stove shows a TV. Kept as-is to match it; change `icon` to fix per item.
export const AMENITY_GROUPS: AmenityGroup[] = [
  {
    id: 'bedroom',
    title: 'חדר שינה',
    items: [
      { icon: BedDouble, text: 'מיטה גדולה מפנקת מצעים כותנה מצרית צפופה' },
      { icon: Shirt, text: 'ארון בגדים+ תליה' },
      { icon: Tv, text: 'טלויזיה oled חכמה מחוברת לנטפליקס ויו טיוב.' },
      { icon: AirVent, text: 'מזגן' },
      { icon: Archive, text: 'שידת מגירות' },
      { icon: Blinds, text: 'וילונות החשכה' },
      { icon: Wine, text: 'בקבוק יין שגדל ויוצר אצלינו' },
    ],
  },
  {
    id: 'living-room',
    title: 'סלון',
    items: [
      { icon: Tv, text: 'טלויזיה oled חכמה מחוברת לנטפליקס ויו טיוב.' },
      { icon: Sofa, text: 'ספה' },
      { icon: Shirt, text: 'פינת ישיבה' },
      { icon: AirVent, text: 'מזגן' },
      { icon: Wine, text: 'ערסל נדנדה' },
    ],
  },
  {
    id: 'kitchen',
    title: 'מטבח',
    items: [
      { icon: Tv, text: 'כיריים חשמליות' },
      { icon: Sofa, text: 'מקרר קטן' },
      { icon: Shirt, text: 'מכונת קפה' },
      { icon: AirVent, text: 'כלי בישול' },
      { icon: Wine, text: 'מיקרוגל' },
      { icon: Wine, text: 'פינת קפה ותה' },
      { icon: Wine, text: 'פינת אוכל' },
      { icon: Wine, text: 'מטבח מתאים לבישול קל' },
      { icon: Wine, text: 'קומקום חשמלי' },
    ],
  },
  {
    id: 'private-outdoor',
    title: 'מתחם חוץ פרטי',
    items: [
      { icon: Tv, text: 'מרפסת צמודה' },
      { icon: Sofa, text: 'סאונה יבשה' },
      { icon: Shirt, text: "ח' רחצה צמוד" },
      { icon: AirVent, text: "ג'קוזי-ספא בגודל 2X2 מטר" },
      { icon: Wine, text: 'פינת ישיבה מקורה' },
      { icon: Wine, text: 'פינת ישיבה' },
    ],
  },
  {
    id: 'spa',
    title: 'חדר טיפולים ובריאות',
    items: [
      { icon: Tv, text: 'שתי מיטות טיפולים' },
      { icon: Sofa, text: 'חדר כושר' },
      { icon: Shirt, text: 'שירותי אורחים' },
    ],
  },
]

export const PRIVACY = {
  title: 'והעיקר.. הפרטיות,',
  subtitle: 'רק אתם והטבע שמקיף ועוטף אתכם.',
  intervalMs: 5000,
  images: [
    { src: '/assets/gallery-01.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-02.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-03.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-04.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-05.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-06.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-07.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-08.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-09.jpg', alt: 'וילטה מתת גליל' },
    { src: '/assets/gallery-10-breakfast.jpg', alt: 'ארוחת בוקר בוילטה' },
    { src: '/assets/gallery-11.jpg', alt: 'וילטה מתת גליל' },
  ],
}
