import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { MongoClient, ServerApiVersion } from "mongodb";

const getMongoPassword = async () => {
    const client = new SecretsManagerClient({
        region: "us-east-1",
    });

    let response;

    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: "nba-shot-prediction-mongodb",
                VersionStage: "AWSCURRENT",
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    return response.SecretString;
};

const mongoPassword = await getMongoPassword();
const uri = `mongodb+srv://lambda:${mongoPassword}@cluster0.mepcupu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const createResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(body),
    };
};

export const handler = async (event) => {
    const database = client.db('nbadb');
    const games = database.collection('games');

    if (event.pathParameters && event.pathParameters.game) {
        const game_id = event.pathParameters.game
        const gamesEvents = database.collection('gamesEvents')
        const result = await gamesEvents.find({ game_id }, { projection: { _id: false, event_id: true } }).toArray();

        if (result == null) {
            return createResponse(404, "Game not found");
        }

        return createResponse(200, result);
    }

    // Get all games
    const gameList = await games.find({}, { projection: { _id: false, description: true } }).toArray();
    const gameDescriptions = gameList.map((game) => game.description);

    return createResponse(200, gameDescriptions);
};
