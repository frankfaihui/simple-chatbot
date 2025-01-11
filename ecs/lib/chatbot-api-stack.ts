import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

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
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? ''
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
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
    });

    // Step 6: Add an Application Load Balancer (ALB)
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ChatbotApiALB', {
      vpc,
      internetFacing: true,
    });

    // Step 7: Obtain an SSL/TLS Certificate
    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:us-west-2:874128104192:certificate/956ff71b-76b8-470d-90a0-9db981e083b5'); // Replace with your ACM certificate ARN

    // Add an HTTPS Listener
    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      certificates: [certificate],
    });

    httpsListener.addTargets('HttpsEcsTarget', {
      port: 8000,
      targets: [
        service.loadBalancerTarget({
          containerName: 'ChatbotApiContainer',
          containerPort: 8000,
        }),
      ],
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(60),
      },
    });

    // Add an HTTP Listener that Redirects to HTTPS
    alb.addListener('HttpListener', {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
      }),
    });

    // Output the Load Balancer DNS
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
