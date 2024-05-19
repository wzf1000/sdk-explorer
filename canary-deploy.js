const { CodeDeployClient, CreateDeploymentCommand } = require('@aws-sdk/client-codedeploy');
const { LambdaClient, UpdateAliasCommand } = require('@aws-sdk/client-lambda');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const codeDeployClient = new CodeDeployClient({ region: 'us-east-1'});
const lambdaClient = new LambdaClient({ region: 'us-east-1'});

const aliasName = "live"; // Alias name you want to use
const functionName = "us-east-1-dev-product-dev-createCityProduct-lmb";

const deployLambdaAliasGradually = async () => {
  try {
    const deploymentParams = {
      applicationName: 'ProductStatelessStack-CreateCityProductLambdaDeploymentGroupApplication0FB9F04C-b3hFMrnKhLyK', // Replace with your application name
      deploymentGroupName: 'ProductStatelessStack-CreateCityProductLambdaDeploymentGroupA09E315F-4BQVALLRRJG7', // Replace with your deployment group name
      revision: {
        revisionType: "AppSpecContent",
        appSpecContent: {
            content: JSON.stringify({
                version: "0.0",
                "Resources": [
                    {
                        functionName: {
                            "Type": "AWS::Lambda::Function",
                            "Properties": {
                                "Name": functionName,
                                "Alias": aliasName,
                                "CurrentVersion": "3",
                                "TargetVersion": "2"
                            }
                        }
                    }
                ]
            }),
        }
      },
      deploymentConfigName: 'CodeDeployDefault.LambdaLinear10PercentEvery1Minute', // Deployment configuration for gradual deployment
      description: 'Deploying new version of Lambda function gradually',
    };

    const command = new CreateDeploymentCommand(deploymentParams);
    const response = await codeDeployClient.send(command);
    console.log('Deployment initiated:', response);
  } catch (error) {
    console.error('Error creating deployment:', error);
  }
};

// Call the function to initiate the deployment
deployLambdaAliasGradually();
