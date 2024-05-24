const { LambdaClient, ListVersionsByFunctionCommand, ListAliasesCommand, GetAliasCommand } = require("@aws-sdk/client-lambda")

const lambdaClient = new LambdaClient({ region: 'us-east-1'});

const functionName = 'us-east-1-dev-product-dev-getLambdaVersion-lmb';
const aliasName = 'live';

// Function to retrieve Lambda function version information
async function getLambdaVersionInfo(functionName) {
    try {
        let versionList = [];
        // Create ListVersionsByFunctionCommand with the function name
        const commandOfVersions = new ListVersionsByFunctionCommand({ FunctionName: functionName });
       
        // Execute the command
        const responseofVersions = await lambdaClient.send(commandOfVersions);
        
        // Create ListAliasesCommand with the function name
        const requestOfAlias = new ListAliasesCommand({ FunctionName: functionName });

        // Execute the command
        const responseOfAlias = await lambdaClient.send(requestOfAlias);
        let aliasList = responseOfAlias.Aliases;

        // remove 'live' alias
        aliasList = aliasList.filter(obj => obj.Name !== aliasName);

        for (let index = 1; index < responseofVersions.Versions.length; index++) {
            const version = responseofVersions.Versions[index].Version;

            const alias = aliasList.find(alias => alias.FunctionVersion === version);

            let aliasName;
            if (alias) {
                aliasName = alias.Name
            }

            versionList = versionList.concat({
                version, aliasName
            })        
        }
        
        // Extract and return version information
        return versionList;
    } catch (error) {
        console.error("Error retrieving Lambda version information:", error);
        throw error;
    }
}

async function getLambdaAliasInfo(functionName, aliasName) {
    try {
        // Create the command with the function name and alias name
        const command = new GetAliasCommand({ FunctionName: functionName, Name: aliasName });

        // Send the command to AWS Lambda
        const response = await lambdaClient.send(command);

        const primaryVersion = response.FunctionVersion;
        let primaryWeight = 1; 
        let additionalVersion, additionalWeight;

        if (response.RoutingConfig && response.RoutingConfig.AdditionalVersionWeights) {
            for (const version in response.RoutingConfig.AdditionalVersionWeights) {
                additionalVersion = version;
                additionalWeight = response.RoutingConfig.AdditionalVersionWeights[version];
                primaryWeight = 1 - additionalWeight;
            }
        }
        
        return {primaryVersion, primaryWeight, additionalVersion, additionalWeight};
    } catch (error) {
    console.error("Error retrieving alias information:", error);
  }
}

async function getInfo(functionName, aliasName) {
    try {
        const versionList = await getLambdaVersionInfo(functionName);
        const aliasInfo = await getLambdaAliasInfo(functionName, aliasName);

        return {functionName, versionList, aliasInfo};
    } catch (error) {
    console.error("Error retrieving alias information:", error);
  }
}

getInfo(functionName, aliasName).then(info => {
    console.log(JSON.stringify(info));
})