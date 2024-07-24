import { Template } from '@aws-cdk/assertions';
import { CdkEksClusterStack } from '../lib/cdk-eks-cluster-stack';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';

// test('Stack creates VPC with correct subnets', () => {
//   const app = new cdk.App();
//   const stack = new CdkEksClusterStack(app, 'MyTestStack', {
//     vpcName: 'eks-vpc',
//     vpcCidr: '10.0.0.0/20',
//     region: 'us-west-2',
//     maxAzs: 2,
//     clusterName: 'eks-cluster-alsandr',
//     publicSubnetCidrMask: 24,
//     privateSubnetCidrMask: 24,
//     eksVersion: eks.KubernetesVersion.V1_28,
//     instanceType: new ec2.InstanceType('t2.micro'),
//     minSize: 1,
//     maxSize: 3,
//     desiredSize: 2,
//   }, {
//     vpcName: 'eks-vpc',
//     vpcCidr: '10.0.0.0/20',
//     region: 'us-west-2',
//     maxAzs: 2,
//     clusterName: 'eks-cluster-alsandr',
//     publicSubnetCidrMask: 24,
//     privateSubnetCidrMask: 24,
//     eksVersion: eks.KubernetesVersion.V1_28,
//     instanceType: new ec2.InstanceType('t2.micro'),
//     minSize: 1,
//     maxSize: 3,
//     desiredSize: 2,
//   });

//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::EC2::VPC', {
//     CidrBlock: '10.0.0.0/20',
//   });

//   template.hasResourceProperties('AWS::EC2::Subnet', {
//     CidrBlock: '10.0.0.0/24',
//     MapPublicIpOnLaunch: true,
//   });
// });

test('Stack creates EKS cluster with correct settings', () => {
  const app = new cdk.App();
  const stack = new CdkEksClusterStack(app, 'MyTestStack', {
    vpcName: 'eks-vpc',
    vpcCidr: '10.0.0.0/20',
    region: 'us-west-2',
    maxAzs: 2,
    clusterName: 'eks-cluster-alsandr',
    publicSubnetCidrMask: 24,
    privateSubnetCidrMask: 24,
    eksVersion: eks.KubernetesVersion.V1_28,
    instanceType: new ec2.InstanceType('t2.micro'),
    minSize: 1,
    maxSize: 3,
    desiredSize: 2,
  }, {
    vpcName: 'eks-vpc',
    vpcCidr: '10.0.0.0/20',
    region: 'us-west-2',
    maxAzs: 2,
    clusterName: 'eks-cluster-alsandr',
    publicSubnetCidrMask: 24,
    privateSubnetCidrMask: 24,
    eksVersion: eks.KubernetesVersion.V1_28,
    instanceType: new ec2.InstanceType('t2.micro'),
    minSize: 1,
    maxSize: 3,
    desiredSize: 2,
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::EKS::Cluster', {
    Version: '1.28',
    EncryptionConfig: [{
      Provider: {
        KeyId: {
          Ref: 'EKS-Secrets-Encryption-Key'
        }
      },
      Resources: ['secrets']
    }],
    Logging: {
      ClusterLogging: [
        { LogType: 'api' },
        { LogType: 'audit' },
        { LogType: 'authenticator' },
        { LogType: 'controllerManager' },
        { LogType: 'scheduler' },
      ]
    }
  });
});

// test('Stack creates Bottlerocket nodegroup with EBS volume', () => {
//   const app = new cdk.App();
//   const stack = new CdkEksClusterStack(app, 'MyTestStack', {
//     vpcName: 'eks-vpc',
//     vpcCidr: '10.0.0.0/20',
//     region: 'us-west-2',
//     maxAzs: 2,
//     clusterName: 'eks-cluster-alsandr',
//     publicSubnetCidrMask: 24,
//     privateSubnetCidrMask: 24,
//     eksVersion: eks.KubernetesVersion.V1_28,
//     instanceType: new ec2.InstanceType('t2.micro'),
//     minSize: 1,
//     maxSize: 3,
//     desiredSize: 2,
//   }, {
//     vpcName: 'eks-vpc',
//     vpcCidr: '10.0.0.0/20',
//     region: 'us-west-2',
//     maxAzs: 2,
//     clusterName: 'eks-cluster-alsandr',
//     publicSubnetCidrMask: 24,
//     privateSubnetCidrMask: 24,
//     eksVersion: eks.KubernetesVersion.V1_28,
//     instanceType: new ec2.InstanceType('t2.micro'),
//     minSize: 1,
//     maxSize: 3,
//     desiredSize: 2,
//   });

//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::EC2::LaunchTemplate', {
//     LaunchTemplateData: {
//       BlockDeviceMappings: [
//         {
//           DeviceName: '/dev/xvda',
//           Ebs: {
//             VolumeSize: 5,
//             VolumeType: 'gp2',
//           },
//         },
//       ],
//     },
//   });
// });
