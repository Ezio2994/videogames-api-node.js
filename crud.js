const admin = require("firebase-admin");

const serviceAccount = require("./videogames-api-firebase-adminsdk-tpvym-880c6b2c79.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const privateKey = serviceAccount.private_key_id;

const db = admin.firestore();
const games = db.collection('games');


const parseDoc = (doc) => {
    return {
        id: doc.id,
        ...doc.data()
    }
}


const listGames = async () => {
    let allowedQueries = ["serie", "category", "developer", "name", "year", "urlImg"]
    const randomize = Math.floor(Math.random() * 6)
    console.log(randomize);
    const order = randomize < 2 ? undefined : "desc"
    let items = await games.orderBy(allowedQueries[randomize], order).limit(25).get();

    return items.docs.map(doc => parseDoc(doc));
}

const queryGames = async (query) => {
    let firestoreQuery = games;
    let allowedQueries = ["serie", "category", "developer", "name"]

    allowedQueries.forEach(currentQuery => {
        if (query.hasOwnProperty(currentQuery)) {
            const q = query[currentQuery].split(" ");
            const prova = q.map((q) => {
                if (q !== "of" && q !== "the") {
                    return q[0].toUpperCase() + q.substring(1)
                } else {
                    return q
                }
            }).join(" ");
            console.log(prova);
            firestoreQuery = firestoreQuery.where(currentQuery, '>=', prova)
            // collectionRef.where('name', '>=', queryText).where('name', '<=', queryText+ '\uf8ff').
            console.log(currentQuery);
            console.log(prova);
        }
    })


    let checkingQuery = Object.keys(query)
    // console.log(checkingQuery);
    checkingQuery = checkingQuery.filter(val => !allowedQueries.includes(val));


    if (checkingQuery.length) {
        const noun = checkingQuery.length === 1 ? "is" : "are";
        throw `${checkingQuery.join(" and ")} ${noun} not included on the searchable properties`
    }

    const results = await firestoreQuery.get();
    return results.docs.map(doc => parseDoc(doc));
}

const getGames = async (id) => {
    let docref = games.doc(id);
    let doc = await docref.get();

    if (!doc.exists) {
        throw `Document with id: ${id} doesn't exists`;
    }

    return parseDoc(doc);
}

const deleteGames = async (id) => {
    let docref = games.doc(id);
    let doc = await docref.delete();

    if (!doc.exists) {
        throw `Document with id: ${id} was deleted`;
    }

    return parseDoc(doc);
}

const createGames = async (body) => {
    const requiredObject = {
        name: "string",
        year: "number",
        category: "string",
        developer: "string",
        serie: "string",
        mode: "string",
        urlImg: "string"
    }

    const required = Object.keys(requiredObject);
    let validatedObject = {};

    let notFound = [];

    for (let i = 0; i < required.length; i++) {
        let currentKey = required[i];
        let expectedType = requiredObject[currentKey];

        if (!body.hasOwnProperty(currentKey)) {
            notFound.push(currentKey);
            continue;
        }

        if (typeof body[currentKey] !== expectedType) {
            throw `${currentKey} needs to be a ${expectedType}`;
        }

        validatedObject[currentKey] = body[currentKey];
    }

    if (notFound.length) {
        const noun = notFound.length === 1 ? "key is" : "keys are";
        throw `${notFound.join(", ")} ${noun} required`;
    }

    const docref = await games.add(validatedObject);
    const doc = await docref.get();
    return parseDoc(doc);
}

const updateGames = async (id, body) => {
    const allowedTypes = {
        name: "string",
        year: "number",
        category: "string",
        developer: "string",
        serie: "string",
        mode: "string",
        urlImg: "string"
    };

    const allowed = Object.keys(allowedTypes);
    const bodyKeys = Object.keys(body);

    const validate = (key) => {
        return allowed.indexOf(key) !== -1
            && typeof body[key] === allowedTypes[key]
    }

    if (!bodyKeys.every(validate)) {
        const fieldTypes = Object.keys(allowedTypes).map(key => {
            return `${key} => ${allowedTypes[key]}`
        }).join(', ');

        throw {
            reason: "Bad Payload",
            message: `Can only accept ${fieldTypes}`
        }
    }

    const docref = games.doc(id);
    let doc = await docref.get()

    if (!doc.exists) {
        throw {
            reason: "Not Found",
            message: `Document with id => ${id}, does not exist`
        };
    }

    await docref.update(body);

    doc = await docref.get()
    return parseDoc(doc);
}


module.exports = {
    listGames,
    queryGames,
    getGames,
    deleteGames,
    createGames,
    updateGames,
    privateKey
};