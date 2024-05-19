const { CodeDeployClient, ListDeploymentsCommand, GetDeploymentCommand }  = require('@aws-sdk/client-codedeploy');

const client = new CodeDeployClient({ region: "us-east-1" });

const listDeploymentsForApplication = async (applicationName, deploymentGroupName) => {
  let deploymentIds = [];
  let nextToken;

  do {
    const params = {
      applicationName: applicationName,
      deploymentGroupName: deploymentGroupName,
      nextToken: nextToken,
    };

    try {
      const command = new ListDeploymentsCommand(params);
      const response = await client.send(command);
      deploymentIds = deploymentIds.concat(response.deployments);
      nextToken = response.nextToken;
    } catch (error) {
      console.error("Error listing deployments for application:", error);
      break;
    }
  } while (nextToken);

  return deploymentIds;
};

const getDeploymentStatus = async (deploymentId) => {
    let status;
  const params = {
    deploymentId: deploymentId,
  };

  try {
    const command = new GetDeploymentCommand(params);
    const response = await client.send(command);
    console.log(JSON.stringify(response));
    status = response.deploymentInfo.status;
  } catch (error) {
    console.error("Error getting deployment status:", error);
  }
  return status;
};

const listDeploymentsAndStatuses = async (applicationName, deploymentGroupName) => {
  const deploymentIds = await listDeploymentsForApplication(applicationName, deploymentGroupName);
  const deploymentsWithStatus = [];

  for (const id of deploymentIds) {
    const status = await getDeploymentStatus(id);
    deploymentsWithStatus.push({ id, status });
  }

  return deploymentsWithStatus;
};
// Example usage
const applicationName = "ProductStatelessStack-GetLambdaVersionLambdaDeploymentGroupApplicationC594A2F5-OyClvGM3GFf7"; // Replace with your actual application name
const deploymentGroupName = "ProductStatelessStack-GetLambdaVersionLambdaDeploymentGroupE7506443-1QTEVHAFGJ6T3";
// listDeploymentsForApplication(applicationName, deploymentGroupName).then(deploymentIds => {
//   console.log("Deployment IDs for application:", deploymentIds);
// });
listDeploymentsAndStatuses(applicationName, deploymentGroupName).then(deploymentsWithStatus => {
  console.log("Deployment IDs for application:", deploymentsWithStatus);
});




