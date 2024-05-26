const { LambdaClient, ListVersionsByFunctionCommand, ListAliasesCommand, GetAliasCommand } = require("@aws-sdk/client-lambda")

const lambdaClient = new LambdaClient({ region: 'us-east-1'});

const functionName = 'us-east-1-dev-product-dev-getLambdaVersion-lmb';
const aliasName = 'live';

async function getVersionAndCommitId(functionName) {
    try {
        let versionList = [];
        // Create ListVersionsByFunctionCommand with the function name
        const commandOfVersions = new ListVersionsByFunctionCommand({ FunctionName: functionName });

        // Execute the command
        const responseofVersions = await lambdaClient.send(commandOfVersions);

        const revVersionList = responseofVersions.Versions.reverse();

        for (let index = 0; index < 5; index++) {
            const version = revVersionList[index].Version;

            let commitId;
            if (revVersionList[index].Environment.Variables.COMMIT_ID) {
                commitId = revVersionList[index].Environment.Variables.COMMIT_ID;
            }

            versionList = versionList.concat({
                version, commitId
            })
        }
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
        const versionList = await getVersionAndCommitId(functionName);
        const aliasInfo = await getLambdaAliasInfo(functionName, aliasName);

        return {functionName, versionList, aliasInfo};
    } catch (error) {
    console.error("Error retrieving alias information:", error);
  }
}

getInfo(functionName, aliasName).then(info => {
    console.log(JSON.stringify(info));
})
