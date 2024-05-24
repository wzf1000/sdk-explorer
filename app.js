const { LambdaClient, GetFunctionCommand, GetAliasCommand, ListVersionsByFunctionCommand, ListAliasesCommand } = require("@aws-sdk/client-lambda")

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
const functionName = 'us-east-1-dev-product-dev-getLambdaVersion-lmb';
const aliasName = 'live';
// getLambdaVersionAndAliasInfo(functionName)
//     .then(({ versions, aliases }) => {
//         console.log("Lambda version information:", versions);
//         console.log("Lambda alias information:", aliases);
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     });


// getLambdaFunctionInfo(functionName)
//     .then(functionInfo => {
//         console.log("Lambda function information:", functionInfo);
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     });


async function getTrafficPercentage(functionName, aliasName) {
  try {
    // Create the command with the function name and alias name
    const command = new GetAliasCommand({ FunctionName: functionName, Name: aliasName });

    // Send the command to AWS Lambda
    const response = await lambdaClient.send(command);

    console.log(JSON.stringify(response));

    // Check if routing configuration exists and calculate the traffic percentage
    if (response.RoutingConfig && response.RoutingConfig.AdditionalVersionWeights) {
      let totalWeight = 0;
      for (const version in response.RoutingConfig.AdditionalVersionWeights) {
        totalWeight += response.RoutingConfig.AdditionalVersionWeights[version];
      }
      const primaryWeight = 1 - totalWeight;
      console.log(`Primary version traffic percentage: ${primaryWeight * 100}%`);
      for (const version in response.RoutingConfig.AdditionalVersionWeights) {
        console.log(`Version ${version} traffic percentage: ${response.RoutingConfig.AdditionalVersionWeights[version] * 100}%`);
      }
    } else {
      console.log("No routing configuration found. All traffic is going to the primary version.");
    }
  } catch (error) {
    console.error("Error retrieving alias information:", error);
  }
}

getTrafficPercentage(functionName, aliasName)
    .then(liveTrafficPercentage => {
        console.log(`Live traffic percentage for '${functionName}': ${liveTrafficPercentage}%`);
    })
    .catch(error => {
        console.error('Error:', error);
    });
