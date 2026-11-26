export type TriviaCategory = 'General Knowledge' | 'Sports' | 'Music' | 'Movies';

export interface TriviaQuestion {
  id: number;
  category: TriviaCategory;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // General Knowledge (14)
  {
    id: 1,
    category: 'General Knowledge',
    question: 'Which country is the natural birthplace of Arabica coffee?',
    options: ['Brazil', 'Ethiopia', 'Colombia', 'Yemen'],
    correctIndex: 1,
  },
  {
    id: 2,
    category: 'General Knowledge',
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
    correctIndex: 2,
  },
  {
    id: 3,
    category: 'General Knowledge',
    question: 'Which planet in our solar system has the most moons?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    correctIndex: 1,
  },
  {
    id: 4,
    category: 'General Knowledge',
    question: 'How many hearts does an octopus have?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctIndex: 2,
  },
  {
    id: 5,
    category: 'General Knowledge',
    question: 'What is the capital city of Japan?',
    options: ['Kyoto', 'Osaka', 'Tokyo', 'Yokohama'],
    correctIndex: 2,
  },
  {
    id: 6,
    category: 'General Knowledge',
    question: 'Which African country has the highest number of UNESCO World Heritage sites?',
    options: ['Egypt', 'Morocco', 'South Africa', 'Ethiopia'],
    correctIndex: 3,
  },
  {
    id: 7,
    category: 'General Knowledge',
    question: 'Which chemical element has the symbol "Au"?',
    options: ['Silver', 'Gold', 'Aluminum', 'Argon'],
    correctIndex: 1,
  },
  {
    id: 8,
    category: 'General Knowledge',
    question: 'What is the longest river in Africa?',
    options: ['Congo River', 'Niger River', 'Nile River', 'Zambezi River'],
    correctIndex: 2,
  },
  {
    id: 9,
    category: 'General Knowledge',
    question: 'Which country gifted the Statue of Liberty to the United States?',
    options: ['Spain', 'United Kingdom', 'Italy', 'France'],
    correctIndex: 3,
  },
  {
    id: 10,
    category: 'General Knowledge',
    question: 'What is the hardest naturally occurring mineral on Earth?',
    options: ['Quartz', 'Diamond', 'Topaz', 'Sapphire'],
    correctIndex: 1,
  },
  {
    id: 11,
    category: 'General Knowledge',
    question: 'In which city is the headquarters of the African Union located?',
    options: ['Nairobi', 'Cairo', 'Addis Ababa', 'Lagos'],
    correctIndex: 2,
  },
  {
    id: 12,
    category: 'General Knowledge',
    question: 'How many time zones does mainland China officially observe?',
    options: ['One', 'Three', 'Four', 'Five'],
    correctIndex: 0,
  },
  {
    id: 13,
    category: 'General Knowledge',
    question: 'Which spice is the most expensive in the world by weight?',
    options: ['Cardamom', 'Vanilla', 'Saffron', 'Star Anise'],
    correctIndex: 2,
  },
  {
    id: 14,
    category: 'General Knowledge',
    question: 'Which continent has the largest number of sovereign countries?',
    options: ['Asia', 'Europe', 'Africa', 'South America'],
    correctIndex: 2,
  },

  // Sports (14)
  {
    id: 15,
    category: 'Sports',
    question: 'Who won the 1960 Rome Olympic marathon running barefoot?',
    options: ['Haile Gebrselassie', 'Abebe Bikila', 'Mamo Wolde', 'Kenenisa Bekele'],
    correctIndex: 1,
  },
  {
    id: 16,
    category: 'Sports',
    question: 'Which country won the 2022 FIFA World Cup in Qatar?',
    options: ['France', 'Brazil', 'Argentina', 'Croatia'],
    correctIndex: 2,
  },
  {
    id: 17,
    category: 'Sports',
    question: 'How many players from one team are on a standard basketball court at once?',
    options: ['Four', 'Five', 'Six', 'Seven'],
    correctIndex: 1,
  },
  {
    id: 18,
    category: 'Sports',
    question: 'Which tennis Grand Slam is played on clay courts?',
    options: ['Wimbledon', 'US Open', 'Australian Open', 'French Open'],
    correctIndex: 3,
  },
  {
    id: 19,
    category: 'Sports',
    question: 'Which club has won the most UEFA Champions League titles?',
    options: ['AC Milan', 'Liverpool', 'Real Madrid', 'Bayern Munich'],
    correctIndex: 2,
  },
  {
    id: 20,
    category: 'Sports',
    question: 'Who holds the all-time NBA scoring record?',
    options: ['Michael Jordan', 'Kobe Bryant', 'Kareem Abdul-Jabbar', 'LeBron James'],
    correctIndex: 3,
  },
  {
    id: 21,
    category: 'Sports',
    question: 'Which Ethiopian runner broke the women’s marathon world record in Berlin in 2023?',
    options: ['Tigst Assefa', 'Tirunesh Dibaba', 'Letesenbet Gidey', 'Meseret Defar'],
    correctIndex: 0,
  },
  {
    id: 22,
    category: 'Sports',
    question: 'In football, how long is a standard match excluding stoppage time?',
    options: ['80 minutes', '90 minutes', '100 minutes', '120 minutes'],
    correctIndex: 1,
  },
  {
    id: 23,
    category: 'Sports',
    question: 'Which country has won the most Africa Cup of Nations (AFCON) titles?',
    options: ['Cameroon', 'Nigeria', 'Ghana', 'Egypt'],
    correctIndex: 3,
  },
  {
    id: 24,
    category: 'Sports',
    question: 'What is the maximum score possible with a single dart in darts?',
    options: ['50', '60', '75', '100'],
    correctIndex: 1,
  },
  {
    id: 25,
    category: 'Sports',
    question: 'In Formula 1, what color flag signals the end of the race?',
    options: ['Green', 'White', 'Checkered black and white', 'Red'],
    correctIndex: 2,
  },
  {
    id: 26,
    category: 'Sports',
    question: 'Which sprinter set the 100m world record of 9.58 seconds in 2009?',
    options: ['Yohan Blake', 'Justin Gatlin', 'Usain Bolt', 'Tyson Gay'],
    correctIndex: 2,
  },
  {
    id: 27,
    category: 'Sports',
    question: 'How many rings are featured on the Olympic Games flag?',
    options: ['Four', 'Five', 'Six', 'Seven'],
    correctIndex: 1,
  },
  {
    id: 28,
    category: 'Sports',
    question: 'Which Premier League club is nicknamed "The Gunners"?',
    options: ['Chelsea', 'Tottenham Hotspur', 'Arsenal', 'West Ham United'],
    correctIndex: 2,
  },

  // Music (14)
  {
    id: 29,
    category: 'Music',
    question: 'Who is widely known as the father of Ethio-jazz?',
    options: ['Mahmoud Ahmed', 'Mulatu Astatke', 'Tilahun Gessesse', 'Alemayehu Eshete'],
    correctIndex: 1,
  },
  {
    id: 30,
    category: 'Music',
    question: 'Which artist released the global hit album "Thriller"?',
    options: ['Prince', 'Stevie Wonder', 'Michael Jackson', 'Lionel Richie'],
    correctIndex: 2,
  },
  {
    id: 31,
    category: 'Music',
    question: 'How many keys are on a standard full-size piano?',
    options: ['76', '84', '88', '92'],
    correctIndex: 2,
  },
  {
    id: 32,
    category: 'Music',
    question: 'Which Ethiopian singer released the iconic album "Yasteseryal"?',
    options: ['Teddy Afro', 'Gossaye Tesfaye', 'Rophnan', 'Neway Debebe'],
    correctIndex: 0,
  },
  {
    id: 33,
    category: 'Music',
    question: 'Which Canadian artist released the smash single "Blinding Lights"?',
    options: ['Drake', 'The Weeknd', 'Justin Bieber', 'Shawn Mendes'],
    correctIndex: 1,
  },
  {
    id: 34,
    category: 'Music',
    question: 'Which traditional Ethiopian stringed instrument is played with a bow?',
    options: ['Krar', 'Begena', 'Masinko', 'Washint'],
    correctIndex: 2,
  },
  {
    id: 35,
    category: 'Music',
    question: 'Which Nigerian artist won a Grammy for Best Global Music Album with "Twice as Tall"?',
    options: ['Wizkid', 'Davido', 'Burna Boy', 'Rema'],
    correctIndex: 2,
  },
  {
    id: 36,
    category: 'Music',
    question: 'Which iconic rock band performed "Bohemian Rhapsody"?',
    options: ['The Beatles', 'Queen', 'Pink Floyd', 'Led Zeppelin'],
    correctIndex: 1,
  },
  {
    id: 37,
    category: 'Music',
    question: 'Which singer holds the record for the most Grammy Awards ever won?',
    options: ['Adele', 'Taylor Swift', 'Beyoncé', 'Stevie Wonder'],
    correctIndex: 2,
  },
  {
    id: 38,
    category: 'Music',
    question: 'What nationality was reggae legend Bob Marley?',
    options: ['Trinidadian', 'Barbadian', 'Jamaican', 'Bahamian'],
    correctIndex: 2,
  },
  {
    id: 39,
    category: 'Music',
    question: 'Which instrument does a percussionist typically NOT play?',
    options: ['Snare drum', 'Marimba', 'Cello', 'Timpani'],
    correctIndex: 2,
  },
  {
    id: 40,
    category: 'Music',
    question: 'Which album by Kendrick Lamar won the Pulitzer Prize for Music in 2018?',
    options: ['good kid, m.A.A.d city', 'To Pimp a Butterfly', 'DAMN.', 'Mr. Morale'],
    correctIndex: 2,
  },
  {
    id: 41,
    category: 'Music',
    question: 'Which singer is famous for the 2011 ballad "Someone Like You"?',
    options: ['Rihanna', 'Adele', 'Sia', 'Amy Winehouse'],
    correctIndex: 1,
  },
  {
    id: 42,
    category: 'Music',
    question: 'What does "tempo" refer to in music?',
    options: ['Volume', 'Pitch height', 'Speed of the beat', 'Number of instruments'],
    correctIndex: 2,
  },

  // Movies (14)
  {
    id: 43,
    category: 'Movies',
    question: 'Who directed the sci-fi heist thriller "Inception"?',
    options: ['Denis Villeneuve', 'Christopher Nolan', 'Ridley Scott', 'James Cameron'],
    correctIndex: 1,
  },
  {
    id: 44,
    category: 'Movies',
    question: 'Which South Korean film became the first non-English movie to win Best Picture at the Oscars?',
    options: ['Oldboy', 'Minari', 'Parasite', 'Train to Busan'],
    correctIndex: 2,
  },
  {
    id: 45,
    category: 'Movies',
    question: 'In "The Matrix", which color pill does Neo choose to learn the truth?',
    options: ['Blue', 'Red', 'Green', 'White'],
    correctIndex: 1,
  },
  {
    id: 46,
    category: 'Movies',
    question: 'What is the fictional African nation in Marvel’s "Black Panther"?',
    options: ['Genosha', 'Zamunda', 'Wakanda', 'Sokovia'],
    correctIndex: 2,
  },
  {
    id: 47,
    category: 'Movies',
    question: 'Which 1994 animated Disney classic features the song "Circle of Life"?',
    options: ['Aladdin', 'The Lion King', 'Mulan', 'Tarzan'],
    correctIndex: 1,
  },
  {
    id: 48,
    category: 'Movies',
    question: 'Who played the Joker in "The Dark Knight" (2008)?',
    options: ['Joaquin Phoenix', 'Jared Leto', 'Jack Nicholson', 'Heath Ledger'],
    correctIndex: 3,
  },
  {
    id: 49,
    category: 'Movies',
    question: 'Which movie holds the all-time worldwide box office record?',
    options: ['Avengers: Endgame', 'Titanic', 'Avatar', 'Star Wars: The Force Awakens'],
    correctIndex: 2,
  },
  {
    id: 50,
    category: 'Movies',
    question: 'In "Interstellar", what is the name of the massive black hole near Miller’s planet?',
    options: ['Cygnus', 'Gargantua', 'Hyperion', 'Vortex'],
    correctIndex: 1,
  },
  {
    id: 51,
    category: 'Movies',
    question: 'Which animated Pixar film follows a rat who dreams of becoming a chef in Paris?',
    options: ['Soul', 'Coco', 'Ratatouille', 'Up'],
    correctIndex: 2,
  },
  {
    id: 52,
    category: 'Movies',
    question: 'Who plays Paul Atreides in Denis Villeneuve’s "Dune" films?',
    options: ['Tom Holland', 'Timothée Chalamet', 'Austin Butler', 'Robert Pattinson'],
    correctIndex: 1,
  },
  {
    id: 53,
    category: 'Movies',
    question: 'Which classic 1993 dinosaur film was directed by Steven Spielberg?',
    options: ['Godzilla', 'King Kong', 'Jurassic Park', 'The Lost World'],
    correctIndex: 2,
  },
  {
    id: 54,
    category: 'Movies',
    question: 'What is the name of the AI computer in "2001: A Space Odyssey"?',
    options: ['JARVIS', 'Skynet', 'HAL 9000', 'GLaDOS'],
    correctIndex: 2,
  },
  {
    id: 55,
    category: 'Movies',
    question: 'Which Studio Ghibli film features a young girl named Chihiro trapped in a spirit world?',
    options: ['My Neighbor Totoro', 'Spirited Away', 'Howl’s Moving Castle', 'Princess Mononoke'],
    correctIndex: 1,
  },
  {
    id: 56,
    category: 'Movies',
    question: 'In "Spider-Man: Into the Spider-Verse", who is the main protagonist?',
    options: ['Peter Parker', 'Miles Morales', 'Miguel O’Hara', 'Gwen Stacy'],
    correctIndex: 1,
  },
];

export function pickRandomTriviaSet(count = 5): TriviaQuestion[] {
  const pool = [...TRIVIA_QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
