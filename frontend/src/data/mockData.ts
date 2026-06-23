export type CategoryKey = 'spot' | 'food' | 'stay' | 'fest'
export type PlaceCategory = 'Spot' | 'Food' | 'Stay' | 'Festival'
export type MoveMode = 'Car' | 'Walk' | 'Bus' | 'Flight'

export interface Category {
  key: 'all' | CategoryKey
  label: 'All' | PlaceCategory
  icon: string
}

export interface Place {
  id: string
  cat: PlaceCategory
  title: string
  region: string
  rating: number
  reviews: number
  meta: string
  img: string
  tags: string[]
  desc: string
}

export interface PlanMove {
  mode: MoveMode
  time: string
  cost: number
}

export interface PlanItem {
  uid?: string
  time: string
  title: string
  cat: PlaceCategory
  note: string
  img: string
  cost: number
  move?: PlanMove
}

export interface PlanDay {
  day: number
  theme: string
  items: PlanItem[]
}

export interface AiPlan {
  period: string
  style: string
  days: PlanDay[]
  fixedCost: {
    rental: number
    fuel: number
  }
}

export interface TripLog {
  id: string
  title: string
  author: string
  avatar: string
  region: string
  period: string
  style: string
  cover: string
  photos: string[]
  route: string[]
  rating: number
  likes: number
  saves: number
  comments: number
  days: number
  places: number
  date: string
  excerpt: string
  visibility?: 'public' | 'private'
  plan?: AiPlan
}

export interface JournalEntry {
  id: string
  photos: string[]
  text: string
  rating: number
  date: string
}

const img = (seed: string) => `/images/img_${seed}.jpg`

export const regions = ['All', 'Seoul', 'Jeju', 'Busan', 'Gangneung', 'Gyeongju'] as const

export const categories: Category[] = [
  { key: 'all', label: 'All', icon: 'compass' },
  { key: 'spot', label: 'Spot', icon: 'mountain' },
  { key: 'food', label: 'Food', icon: 'utensils' },
  { key: 'stay', label: 'Stay', icon: 'bed' },
  { key: 'fest', label: 'Festival', icon: 'sparkles' },
]

export const places: Place[] = [
  {
    id: 'p1',
    cat: 'Spot',
    title: 'Seongsan Ilchulbong',
    region: 'Jeju Seogwipo',
    rating: 4.8,
    reviews: 1204,
    meta: '15 min by car',
    img: img('seongsan'),
    tags: ['sunrise', 'unesco', 'oreum'],
    desc: 'A sunrise landmark on the east side of Jeju.',
  },
  {
    id: 'p2',
    cat: 'Spot',
    title: 'Hyeopjae Beach',
    region: 'Jeju City',
    rating: 4.7,
    reviews: 980,
    meta: '8 min by car',
    img: img('hyeopjae'),
    tags: ['beach', 'walk', 'clear water'],
    desc: 'A bright beach with calm water and a clear view of Biyangdo.',
  },
  {
    id: 'p3',
    cat: 'Food',
    title: 'Jeju Noodle Street',
    region: 'Jeju City',
    rating: 4.6,
    reviews: 642,
    meta: '3 min walk',
    img: img('noodle'),
    tags: ['noodle', 'local', 'lunch'],
    desc: 'A reliable stop for Jeju pork noodles.',
  },
  {
    id: 'p4',
    cat: 'Stay',
    title: 'Ocean View Stay',
    region: 'Jeju Seogwipo',
    rating: 4.9,
    reviews: 312,
    meta: 'Check-in 15:00',
    img: img('staysea'),
    tags: ['ocean view', 'breakfast', 'quiet'],
    desc: 'A calm stay with a direct ocean view.',
  },
  {
    id: 'p5',
    cat: 'Festival',
    title: 'Jeju Fire Festival',
    region: 'Jeju Aewol',
    rating: 4.5,
    reviews: 220,
    meta: 'March',
    img: img('festival'),
    tags: ['night', 'festival', 'fire'],
    desc: 'A seasonal festival inspired by Jeju field traditions.',
  },
  {
    id: 'p6',
    cat: 'Spot',
    title: 'Camellia Hill',
    region: 'Jeju Andeok',
    rating: 4.6,
    reviews: 540,
    meta: '20 min by car',
    img: img('camellia'),
    tags: ['garden', 'photo', 'camellia'],
    desc: 'A garden route with flowers and easy walking paths.',
  },
]

export const aiPlan: AiPlan = {
  period: '2 nights 3 days',
  style: 'Relaxed',
  days: [
    {
      day: 1,
      theme: 'Beach and check-in',
      items: [
        { time: '09:00', title: 'Hyeopjae Beach', cat: 'Spot', note: 'Morning beach walk', img: img('hyeopjae'), cost: 0, move: { mode: 'Car', time: '40 min from airport', cost: 0 } },
        { time: '12:30', title: 'Jeju Noodle Street', cat: 'Food', note: 'Local lunch', img: img('noodle'), cost: 9000, move: { mode: 'Car', time: '25 min', cost: 0 } },
        { time: '19:00', title: 'Ocean View Stay', cat: 'Stay', note: 'Check-in and rest', img: img('staysea'), cost: 180000, move: { mode: 'Car', time: '30 min', cost: 0 } },
      ],
    },
    {
      day: 2,
      theme: 'Forest and local food',
      items: [
        { time: '10:00', title: 'Camellia Hill', cat: 'Spot', note: 'Garden walk', img: img('camellia'), cost: 10000, move: { mode: 'Car', time: '35 min', cost: 0 } },
        { time: '17:30', title: 'Seongsan Ilchulbong', cat: 'Spot', note: 'Sunset view', img: img('seongsan'), cost: 5000, move: { mode: 'Car', time: '40 min', cost: 0 } },
      ],
    },
    {
      day: 3,
      theme: 'Wrap up',
      items: [
        { time: '09:30', title: 'Jeju Fire Festival', cat: 'Festival', note: 'Seasonal event check', img: img('festival'), cost: 0, move: { mode: 'Car', time: '1 hr', cost: 0 } },
      ],
    },
  ],
  fixedCost: { rental: 90000, fuel: 30000 },
}

export const tripLogs: TripLog[] = [
  {
    id: 't1',
    title: 'Easy Jeju 3-day route',
    author: 'Jimin',
    avatar: 'jimin',
    region: 'Jeju',
    period: '2 nights 3 days',
    style: 'Relaxed',
    cover: img('jejueast'),
    photos: [img('jejueast'), img('seongsan'), img('hyeopjae')],
    route: ['Hyeopjae Beach', 'Jeju Noodle Street', 'Seongsan Ilchulbong'],
    rating: 4.8,
    likes: 342,
    saves: 128,
    comments: 24,
    days: 3,
    places: 6,
    date: '3 days ago',
    excerpt: 'A calm Jeju route with beach, local food, and easy views.',
    visibility: 'private',
  },
]

export const journalSeed: Record<string, JournalEntry[]> = {
  'Hyeopjae Beach': [
    {
      id: 'j1',
      photos: [],
      text: 'Clear water and an easy start to the trip.',
      rating: 5,
      date: 'Day 1',
    },
  ],
}

export default { regions, categories, places, tripLogs, aiPlan, journalSeed }
