const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

app.listen(3000, () => {
  console.log("server is running http://localhost:300/");
});

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  let requestQuery = `
   SELECT 
   movie_name
   FROM
   MOVIE
   `;

  let store = await db.all(requestQuery);
  response.send(store.map((eachMovie) => convertObject(eachMovie)));
});

//post

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  let requestQuery = `
   INSERT INTO
   MOVIE(director_id,movie_name,lead_actor)
   VALUES( ${directorId}, '${movieName}', '${leadActor}')
   `;

  let store = await db.run(requestQuery);
  console.log(store);
  response.send("Movie Successfully Added");
});

//specific

const convertObject1 = (store) => {
  return {
    movieId: store.movie_id,
    directorId: store.director_id,
    movieName: store.movie_name,
    leadActor: store.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let requestQuery = `
   SELECT 
   *
   FROM
   MOVIE
   WHERE
    movie_id = ${movieId};
   `;

  let store = await db.get(requestQuery);
  response.send(convertObject1(store));
});

//update

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  let { movieId } = request.params;
  let requestQuery = `
   UPDATE 
   MOVIE
   SET
   director_id= ${directorId},
   movie_name='${movieName}',
   lead_actor='${leadActor}'
   WHERE
      movie_id = ${movieId};
   `;

  await db.run(requestQuery);
  response.send("Movie Details Updated");
});

//delete

app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;

  let requestQuery = `
   DELETE
   FROM
   MOVIE
   WHERE
    movie_id = ${movieId};
   `;

  await db.get(requestQuery);
  response.send("Movie Removed");
});

//director table

const convertObject3 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  let requestQuery = `
   SELECT 
   *
   FROM
   director;
   `;

  let store = await db.all(requestQuery);
  response.send(store.map((eachMovie) => convertObject3(eachMovie)));
});

//

const convertObject4 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  let requestQuery = `
   SELECT 
   movie_name
   FROM
    movie
   WHERE director_id = ${directorId};
   `;

  let store = await db.all(requestQuery);
  console.log(store);
  response.send(store.map((eachMovie) => convertObject4(eachMovie)));
});

module.exports = app;
