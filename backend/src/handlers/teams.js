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

export const handler = async (event) => {
    const database = client.db('nbadb');
    const teams = database.collection('teams');
    
    if (event.pathParameters && event.pathParameters.team) {
        const teamAbbreviation = event.pathParameters.team;
        const result = await teams.findOne({ abbreviation: teamAbbreviation });
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result),
        };
    }

    // Get all team abbreviations
    const teamAbbreviations = await teams.find({}, { projection: { _id: false, abbreviation: true } }).toArray();
    const abbreviationsList = teamAbbreviations.map((team) => team.abbreviation);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(abbreviationsList),
    };
};
