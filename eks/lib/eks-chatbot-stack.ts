import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kubectl from '@aws-cdk/lambda-layer-kubectl-v31';

export class EksChatbotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    // const vpc = new ec2.Vpc(this, 'ChatbotVpc');

    // const mastersRole = new cdk.aws_iam.Role(this, 'MastersRole', {
    //   assumedBy: new cdk.aws_iam.ArnPrincipal('arn:aws:iam::874128104192:user/frank-work-mac'),
    // });

    // // Create an EKS cluster
    // const cluster = new eks.FargateCluster(this, 'ChatbotCluster', {
    //   mastersRole,
    //   vpc,
    //   // defaultCapacity: 0, // Disable EC2 nodes
    //   // defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
    //   version: eks.KubernetesVersion.V1_31,
    //   kubectlLayer: new kubectl.KubectlV31Layer(this, 'kubectl'),
    //   clusterName: 'ChatbotCluster',
    // });

    // cluster.addFargateProfile('ChatbotFargateProfile', {
    //   selectors: [{ namespace: 'default' }],
    // });

    // Define Docker image as an asset
    const chatbotImage = new ecr_assets.DockerImageAsset(this, 'ChatbotImage', {
      directory: '../chatbot-api',
      platform: ecr_assets.Platform.LINUX_AMD64,
    });

    // Create App Runner service
    new cdk.aws_apprunner.CfnService(this, 'ChatbotApiService', {
      sourceConfiguration: {
        imageRepository: {
          imageIdentifier: chatbotImage.imageUri,
          imageRepositoryType: 'ECR',
        },
        autoDeploymentsEnabled: true,
      },
      instanceConfiguration: {
        cpu: '1024',
        memory: '2048',
      },
      serviceName: 'ChatbotApiService',
    });

    // // Application labels
    // const appLabel = { app: 'chatbot' };

    // // Kubernetes Deployment manifest
    // // const deployment = cluster.addManifest('ChatbotDeployment', {
    // //   apiVersion: 'apps/v1',
    // //   kind: 'Deployment',
    // //   metadata: { name: 'chatbot-deployment' },
    // //   spec: {
    // //     replicas: 2,
    // //     selector: { matchLabels: appLabel },
    // //     template: {
    // //       metadata: { labels: appLabel },
    // //       spec: {
    // //         containers: [
    // //           {
    // //             name: 'chatbot-api',
    // //             image: chatbotImage.imageUri, // Use the built image URI
    // //             ports: [{ containerPort: 8000 }],
    // //           },
    // //         ],
    // //       },
    // //     },
    // //   },
    // // });
    // const deployment = cluster.addManifest('ChatbotDeployment', {
    //   apiVersion: 'apps/v1',
    //   kind: 'Deployment',
    //   metadata: { name: 'chatbot-deployment' },
    //   spec: {
    //     replicas: 1,
    //     selector: { matchLabels: appLabel },
    //     template: {
    //       metadata: { labels: appLabel },
    //       spec: {
    //         containers: [
    //           {
    //             name: 'hello-k8s',
    //             image: 'paulbouwer/hello-kubernetes:1.8',
    //             ports: [{ containerPort: 8080 }],
    //           },
    //         ],
    //       },
    //     },
    //   },
    // });

    // // Kubernetes Service manifest
    // // const service = cluster.addManifest('ChatbotService', {
    // //   apiVersion: 'v1',
    // //   kind: 'Service',
    // //   metadata: { name: 'chatbot-service' },
    // //   spec: {
    // //     type: 'LoadBalancer',
    // //     ports: [{ port: 80, targetPort: 8000 }],
    // //     selector: appLabel,
    // //   },
    // // });
    // const service = cluster.addManifest('ChatbotService', {
    //   apiVersion: 'v1',
    //   kind: 'Service',
    //   metadata: { name: 'chatbot-service' },
    //   spec: {
    //     type: 'ClusterIP',
    //     ports: [{ port: 80, targetPort: 8080 }],
    //     selector: appLabel,
    //   },
    // });

    // // Ensure service depends on the deployment
    // service.node.addDependency(deployment);

    // // Install AWS Load Balancer Controller using Helm
    // cluster.addHelmChart('NginxIngress', {
    //   chart: 'ingress-nginx',
    //   repository: 'https://kubernetes.github.io/ingress-nginx',
    //   namespace: 'ingress-nginx',
    //   values: {
    //     controller: {
    //       service: {
    //         type: 'LoadBalancer',
    //       },
    //     },
    //   },
    // });


    // Kubernetes Ingress manifest
    // const ingress = cluster.addManifest('ChatbotIngress', {
    //   apiVersion: 'networking.k8s.io/v1',
    //   kind: 'Ingress',
    //   metadata: {
    //     name: 'chatbot-ingress',
    //     annotations: {
    //       'alb.ingress.kubernetes.io/scheme': 'internet-facing', // Internet-facing ALB
    //       'alb.ingress.kubernetes.io/target-type': 'ip',         // Fargate pods use IP targets
    //     },
    //   },
    //   spec: {
    //     ingressClassName: 'alb', // Use spec.ingressClassName instead of the annotation
    //     rules: [
    //       {
    //         http: {
    //           paths: [
    //             {
    //               path: '/',
    //               pathType: 'Prefix',
    //               backend: {
    //                 service: {
    //                   name: 'chatbot-service',
    //                   port: {
    //                     number: 80,
    //                   },
    //                 },
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     ],
    //   },
    // });


    // // Ensure Ingress depends on the Service
    // ingress.node.addDependency(service);



    // Output the LoadBalancer URL
    // new cdk.CfnOutput(this, 'ServiceURL', {
    //   value: `http://${cluster.getServiceLoadBalancerAddress('default', 'chatbot-service')}`,
    // });
  }
}






