const { request, response } = require('express');
const express = require('express');
const router = express.Router();

const { listGames, getGames, deleteGames, createGames, updateGames, queryGames, privateKey } = require("./crud.js");

router.get('/test', (request, response) => {
    response.status(200).send({ "message": "custom message" });
});


router.get('/games', async (request, response) => {
    const query = request.query;

    try {

        if (Object.keys(query).length > 0) {
            const filteredGames = await queryGames(query);

            response.json(filteredGames);
            return;

        }

    } catch (error) {
        return response.status(404).send({
            message: error
        });
    }

    let gamesList = await listGames();
    response.json(gamesList);
});


router.get("/games/:id", async (request, response) => {
    const id = request.params.id;

    console.log(request.params);
    try {
        const doc = await getGames(id);
        return response.json(doc);
    } catch (error) {
        return response.status(404).send({
            message: error
        });
    }
})

router.post(`${privateKey}/games`, async (request, response) => {
    const content = request.body;

    try {
        const doc = await createGames(content);
        response.json(doc);
    } catch (error) {
        return response.status(400).send({
            message: error
        });
    }
})

router.patch(`${privateKey}/games/:id`, async (request, response) => {
    const gameId = request.params.id;
    const requestBody = request.body;

    try {
        const doc = await updateGames(gameId, requestBody);
        response.json(doc);
    } catch (error) {
        if (error.reason === "Not Found") {
            return response.status(404).send({
                message: error.message
            });
        }

        return response.status(400).send({
            message: error.message
        });
    }
})

router.delete(`/${privateKey}/games/delete/:id`, async (request, response) => {
    const id = request.params.id;
    try {
        const doc = await deleteGames(id);
        return response.json(doc);
    } catch (error) {
        return response.status(404).send({
            message: error
        });
    }
})

module.exports = {
    router
};