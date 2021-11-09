import axios from "axios";
import { logger } from "./winston";
import cron from "node-cron";

const { STAR_URL } = process.env;

async function getMovies(): Promise<void> {
 try {
  logger.info("running cron job");
  const { data } = await axios.get(STAR_URL);

  if (data) {
   let movies = [];
   const lists = data.results;
   let ids = [];

   for (const list of lists) {
    const { title, opening_crawl, episode_id, release_date, characters } = list;
    let newCharacters = [];
    ids = [...ids, episode_id];
    for (const character of characters) {
     const { name, gender, height, mass, hair_colour, eye_colour } = (await axios.get(character)).data;
     newCharacters = [...newCharacters, { name, gender, height, mass, hair_colour, eye_colour }];
    }
    movies = [...movies, { title, opening_crawl, episode_id, release_date, characters: newCharacters }];
   }

   globalThis.movies = {
    ids,
    movies,
    count: data.count,
   };
  }

  logger.info("server ready for request");
 } catch (e) {
  logger.error(e);
 }
}

cron.schedule("* * * * *", () => getMovies());

export { getMovies };
