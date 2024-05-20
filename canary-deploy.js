const { CodeDeployClient, CreateDeploymentCommand } = require('@aws-sdk/client-codedeploy');
const { LambdaClient, UpdateAliasCommand } = require('@aws-sdk/client-lambda');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const codeDeployClient = new CodeDeployClient({ region: 'us-east-1'});
const lambdaClient = new LambdaClient({ region: 'us-east-1'});

async function deployLambdaAliasGradually (functionName, aliasName, applicationName, deploymentGroupName) {
  try {
    const deploymentParams = {
      applicationName: applicationName, // Replace with your application name
      deploymentGroupName: deploymentGroupName, // Replace with your deployment group name
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
                                "CurrentVersion": "5",
                                "TargetVersion": "4"
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
const functionName = "us-east-1-dev-product-dev-getLambdaVersion-lmb";
const aliasName = "live"; // Alias name you want to use
const applicationName = "ProductStatelessStack-GetLambdaVersionLambdaDeploymentGroupApplicationC594A2F5-OyClvGM3GFf7"; // Replace with your actual application name
const deploymentGroupName = "ProductStatelessStack-GetLambdaVersionLambdaDeploymentGroupE7506443-1QTEVHAFGJ6T3";

deployLambdaAliasGradually(functionName, aliasName, applicationName, deploymentGroupName);
