const { LambdaClient, GetFunctionCommand, ListVersionsByFunctionCommand, ListAliasesCommand} = require("@aws-sdk/client-lambda")

const lambdaClient = new LambdaClient({ region: 'us-east-1' });

// Function to retrieve Lambda function information
async function getLambdaFunctionInfo(functionName) {
    try {
        // Create GetFunctionCommand with the function name
        const command = new GetFunctionCommand({ FunctionName: functionName });

        // Execute the command
        const response = await lambdaClient.send(command);

        // Extract and return function information
        return response.Configuration;
    } catch (error) {
        console.error("Error retrieving Lambda function information:", error);
        throw error;
    }
}

// Function to retrieve Lambda function version information
async function getLambdaVersionInfo(functionName) {
    try {
        // Create ListVersionsByFunctionCommand with the function name
        const command = new ListVersionsByFunctionCommand({ FunctionName: functionName });

        // Execute the command
        const response = await lambdaClient.send(command);

        // Extract and return version information
        return response.Versions;
    } catch (error) {
        console.error("Error retrieving Lambda version information:", error);
        throw error;
    }
}

// Function to retrieve Lambda function version and alias information
async function getLambdaVersionAndAliasInfo(functionName) {
    try {
        // Create ListVersionsByFunctionCommand with the function name
        const versionsCommand = new ListVersionsByFunctionCommand({ FunctionName: functionName });

        // Execute the command to get versions
        const versionsResponse = await lambdaClient.send(versionsCommand);

        // Create ListAliasesCommand with the function name
        const aliasesCommand = new ListAliasesCommand({ FunctionName: functionName });

        // Execute the command to get aliases
        const aliasesResponse = await lambdaClient.send(aliasesCommand);

        // Return version and alias information
        return {
            versions: versionsResponse.Versions,
            aliases: aliasesResponse.Aliases
        };
    } catch (error) {
        console.error("Error retrieving Lambda version and alias information:", error);
        throw error;
    }
}

// Usage example
const functionName = 'us-east-1-dev-product-dev-createCityProduct-lmb';
getLambdaVersionAndAliasInfo(functionName)
    .then(({ versions, aliases }) => {
        console.log("Lambda version information:", versions);
        console.log("Lambda alias information:", aliases);
    })
    .catch(error => {
        console.error("Error:", error);
    });


// getLambdaFunctionInfo(functionName)
//     .then(functionInfo => {
//         console.log("Lambda function information:", functionInfo);
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     });


// async function getLiveTrafficPercentage(lambdaFunctionName) {
//     // Initialize the Lambda client
//     const lambda = new AWS.Lambda();

//     try {
//         // Get the function configuration
//         const functionConfig = await lambda.getFunctionConfiguration({ FunctionName: lambdaFunctionName }).promise();
        
//         // Extract the alias ARN from the function configuration
//         const aliasArn = functionConfig.FunctionArn;
        
//         // Get the alias traffic configuration
//         const aliasTrafficConfig = await lambda.getAlias({ FunctionName: lambdaFunctionName, Name: 'live' }).promise();
        
//         // Extract the percentage of live traffic
//         const liveTrafficPercentage = aliasTrafficConfig.RoutingConfig.AdditionalVersionWeights['0'] || 0.0;
        
//         return liveTrafficPercentage;
//     } catch (error) {
//         console.error('Error retrieving live traffic percentage:', error);
//         throw error;
//     }
// }

// // Usage example
// const functionName = 'us-east-1-dev-product-dev-createCityProduct-lmb';
// getLiveTrafficPercentage(functionName)
//     .then(liveTrafficPercentage => {
//         console.log(`Live traffic percentage for '${functionName}': ${liveTrafficPercentage}%`);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
