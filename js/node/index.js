const https = require("https");
const Confirm = require("prompt-confirm");
const NeuralNetwork = require("./NeuralNetwork");

const GAMME_API = "https://api.rawg.io/api";
const gameList = [];

const getGames = async () => {
  return new Promise(resolve => {
    https.get(`${GAMME_API}/games`, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        resolve(body.results);
      });
    });
  });
};

const getTags = async () => {
  return new Promise(resolve => {
    https.get(`${GAMME_API}/tags?page_size=10000`, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        const tags = body.results.filter(tag => {
          return tag.games_count > 1000;
        });

        resolve(tags);
      });
    });
  });
};

const getGenres = async () => {
  return new Promise(resolve => {
    https.get(`${GAMME_API}/genres?page_size=10000`, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        const genres = body.results.map(genre => {
          return genre.id;
        });

        resolve(genres);
      });
    });
  });
};

const getBrain = (tags, genre, initialInput = 14) => {
  const inputCount = initialInput + tags.length + genre.length;

  return new NeuralNetwork([inputCount, 50, 25, 7, 1]);
};

const shuffle = array => {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getUserReponse = async () => {
  const prompt = new Confirm({
    name: "response",
    message: "Aimez-vous ce jeu?"
  });

  const response = await prompt.run();

  return response;
};

const train = (brain, responses, nbIteration, tags, genres) => {
  for (let i = 0; i < Math.floor(nbIteration / responses.length); i++) {
    const responsesShuffled = shuffle(responses);

    for (let i = 0; i < responsesShuffled.length; i++) {
      const responseInfos = responsesShuffled[i];
      const target = responseInfos.userAnswer ? [1] : [0];
      const input = getInputFromResponse(responseInfos, tags, genres);

      brain.train(input, target);
    }
  }
};

const getInputFromResponse = (responseInfos, tags, genres) => {
  let initialInput = [
    responseInfos.game.rating,
    responseInfos.game.ratings[0].count,
    responseInfos.game.ratings[1].count,
    responseInfos.game.ratings[2].count,
    responseInfos.game.ratings[3].count,
    responseInfos.game.ratings_count,
    responseInfos.game.metacritic || -1,
    responseInfos.game.added,
    responseInfos.game.added_by_status.yet,
    responseInfos.game.added_by_status.owned,
    responseInfos.game.added_by_status.beaten,
    responseInfos.game.added_by_status.toplay,
    responseInfos.game.added_by_status.dropped,
    responseInfos.game.added_by_status.playing
  ];

  let inputTag = [];
  tags.forEach(tag => {
    const gameTag = responseInfos.game.tags.find(
      currentGameTag => currentGameTag.id === tag.id
    );

    inputTag.push(gameTag ? 1 : 0);
  });

  let inputGenre = [];
  genres.forEach(genre => {
    const gameGenre = responseInfos.game.genres.find(
      currentGameGenre => currentGameGenre.id === genre
    );

    inputGenre.push(gameGenre ? 1 : 0);
  });

  return [...initialInput, ...inputTag, ...inputGenre];
};

const start = async () => {
  // 1. Je récupère la list initales de jeux
  const gammes = await getGames();
  // 2. Je récupère la liste des tags
  const tags = await getTags();
  // 3. Je récupère la liste des genres
  const genres = await getGenres();

  const brain = getBrain(tags, genres);

  const initialResponses = [];

  // Je me fais une première liste de 10 réponses
  for (let i = 0; i < 10; i++) {
    const gameToAsk = gammes[i];

    console.clear();
    console.log(`Jeu numéro ${i + 1}:`);
    console.table([
      {
        Nom: gameToAsk.name,
        "Nombre de notes": gameToAsk.reviews_count,
        "Note métacritique": gameToAsk.metacritic,
        exceptional: `${gameToAsk.ratings[0].percent}%`,
        recommended: `${gameToAsk.ratings[1].percent}%`,
        meh: `${gameToAsk.ratings[2].percent}%`,
        skip: `${gameToAsk.ratings[3].percent}%`
      }
    ]);

    const response = await getUserReponse();

    initialResponses.push({ game: gameToAsk, userAnswer: response });
  }

  console.clear();
  console.log("Training...");

  train(brain, initialResponses, 10000, tags, genres);

  for (let i = 10; i < 20; i++) {
    const gameToAsk = gammes[i];

    console.clear();
    console.log(`Jeu numéro ${i + 1}:`);
    console.table([
      {
        Nom: gameToAsk.name,
        "Nombre de notes": gameToAsk.reviews_count,
        "Note métacritique": gameToAsk.metacritic,
        exceptional: `${gameToAsk.ratings[0].percent}%`,
        recommended: `${gameToAsk.ratings[1].percent}%`,
        meh: `${gameToAsk.ratings[2].percent}%`,
        skip: `${gameToAsk.ratings[3].percent}%`
      }
    ]);

    const input = getInputFromResponse({ game: gameToAsk }, tags, genres);
    const guess = brain.feedforward(input);
    console.log(`Prediction: ${guess}`);

    const response = await getUserReponse();

    train(
      brain,
      [{ game: gameToAsk, userAnswer: response }],
      100,
      tags,
      genres
    );
  }
};

start();
