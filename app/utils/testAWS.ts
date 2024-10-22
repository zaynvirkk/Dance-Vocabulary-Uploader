import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { awsConfig } from './config';

const dynamoClient = new DynamoDBClient({
    region: awsConfig.region,
    credentials: {
        accessKeyId: awsConfig.accessKeyId!,
        secretAccessKey: awsConfig.secretAccessKey!
    }
});

export async function testAWSConnection() {
    try {
        console.log('Testing DynamoDB connection...');
        const listCommand = new ListTablesCommand({});
        const listResponse = await dynamoClient.send(listCommand);
        console.log('DynamoDB Tables:', listResponse.TableNames);

        if (listResponse.TableNames?.includes('dance_moves')) {
            const describeCommand = new DescribeTableCommand({ TableName: 'dance_moves' });
            const describeResponse = await dynamoClient.send(describeCommand);
            console.log('dance_moves table details:', describeResponse.Table);
        } else {
            console.log('dance_moves table not found');
        }

        return 'AWS connection successful';
    } catch (error) {
        console.error('Error testing AWS connection:', error);
        return 'AWS connection failed';
    }
}
