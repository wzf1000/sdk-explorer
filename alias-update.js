const { LambdaClient, UpdateAliasCommand } = require("@aws-sdk/client-lambda");

// Create an instance of the LambdaClient
const client = new LambdaClient({ region: "us-east-1" });

const aliasName = "live"; // Alias name you want to use
const functionName = "us-east-1-dev-product-dev-getLambdaVersion-lmb";

async function updateAlias () {
    const params = {
        FunctionName: functionName, // Replace with your Lambda function name
        Name: aliasName, // Replace with your alias name
        FunctionVersion: "9", // Replace with the version you want to point the alias to
        // Optionally, you can provide a description
        //Description: "Updated alias to point to version 2"

        // Additional weight
        RoutingConfig: {
            AdditionalVersionWeights: {
            // "4": 0.3, // additional version number and set the desired weight
            },
        },
    };

    const command = new UpdateAliasCommand(params);

    try {
        const data = await client.send(command);
        console.log("Alias Updated:", data);
    } catch (err) {
        console.error("Error updating alias:", err);
    }
};

updateAlias();