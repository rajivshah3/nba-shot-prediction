const { SecretsManagerClient, GetSecretValueCommand} = require("@aws-sdk/client-secrets-manager")
const { MongoClient, ServerApiVersion } = require('mongodb');

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
}

exports.handler = async (event) => {
    const mongoPassword = await getMongoPassword();
    const uri = `mongodb+srv://lambda:${mongoPassword}@cluster0.mepcupu.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverApi: ServerApiVersion.v1,
    });
    const database = client.db('nbadb');
    const teams = database.collection('teams');
    console.log("Connected to MongoDB");

    const teamAbbreviations = await teams.find({}, { projection: { _id: false, abbreviation: true } }).toArray();
    const abbreviationsList = teamAbbreviations.map((team) => team.abbreviation);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(abbreviationsList),
    }
}
