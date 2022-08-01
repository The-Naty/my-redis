const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
client.connect().then(() => {
  console.log("Connected to redis");
});
const app = express();

function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

async function getRepos(req, res, next) {
  try {
    console.log("Fetching Data...");

    const { username } = req.params;

    const respone = await fetch(`https://api.github.com/users/${username}`);

    const data = await respone.json();

    const repos = data.public_repos;

    const result = await client.set(username, repos, "EX", 3600);

    res.send(setResponse(username, repos));
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}

app.get("/repos/:username", getRepos);

app.listen(5000, () => {
  console.log(`Server running on port ${PORT}`);
});
