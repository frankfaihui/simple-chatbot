import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';

export class ChatbotApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Step 1: Create a VPC
    const vpc = new ec2.Vpc(this, 'ChatbotApiVpc', {
      maxAzs: 2, // Number of Availability Zones
    });

    // Step 2: Create an ECS Cluster
    const cluster = new ecs.Cluster(this, 'ChatbotApiCluster', {
      vpc,
    });

    // Step 3: Build and Push Docker Image
    const dockerImage = new ecrAssets.DockerImageAsset(this, 'ChatbotApiImage', {
      directory: '../chatbot-api', // Directory containing the Dockerfile
      platform: ecrAssets.Platform.LINUX_AMD64
    });

    // Step 4: Create Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ChatbotApiTaskDef');
    const container = taskDefinition.addContainer('ChatbotApiContainer', {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      memoryLimitMiB: 512,
      cpu: 256,
      environment: {
        // Add any environment variables for your FastAPI app here
      },
    });

    // Map container port to host
    container.addPortMappings({
      containerPort: 8000,
    });

    // Step 5: Create ECS Service
    const service = new ecs.FargateService(this, 'ChatbotApiService', {
      cluster,
      taskDefinition,
      desiredCount: 1, // Number of instances
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Step 6: Add an Application Load Balancer (ALB)
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ChatbotApiALB', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
    });

    // Register ECS Service as a Target for the ALB
    listener.addTargets('EcsTarget', {
      port: 8000,
      targets: [
        service.loadBalancerTarget({
          containerName: 'ChatbotApiContainer',
          containerPort: 8000,
        }),
      ],
      healthCheck: {
        path: '/health', // Ensure this endpoint exists in your FastAPI app
        interval: cdk.Duration.seconds(30),
      },
    });

    // Output the Load Balancer DNS
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
