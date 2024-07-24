import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { KubectlV28Layer } from '@aws-cdk/lambda-layer-kubectl-v28';
import { CdkEksClusterStackProps } from './props';
import { bottlerocketNodeGroup } from './props';
import { helmCharts } from './helm-charts';

export class CdkEksClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, defaultNodeGroup: CdkEksClusterStackProps, bottlerocketNodeGroup: bottlerocketNodeGroup) {
    super(scope, id, {
      ...defaultNodeGroup,
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: defaultNodeGroup?.region },
    });

    // VPC - public and private subnets
    const vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: defaultNodeGroup?.vpcName,
      ipAddresses: ec2.IpAddresses.cidr(defaultNodeGroup?.vpcCidr.toString() ?? ''),
      maxAzs: defaultNodeGroup?.maxAzs,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'PublicSubnet',
          cidrMask: defaultNodeGroup.publicSubnetCidrMask,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: 'PrivateSubnet',
          cidrMask: defaultNodeGroup.privateSubnetCidrMask,
        },
      ],
    });

    // Initialize a new EKS cluster within the given scope (usually an AWS CDK stack)
    this.cluster = new eks.Cluster(this, 'Cluster', {
      // Specify the VPC where the EKS cluster should be deployed
      vpc: vpc,

      // Define subnet settings for the cluster. Here, it uses private subnets with egress access and ensures one subnet per availability zone
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, onePerAz: true }],

      // Set the Kubernetes version for the cluster, derived from the defaultNodeGroup's eksVersion property
      version: defaultNodeGroup.eksVersion,

      // Add a custom Lambda layer for kubectl commands, allowing you to interact with the cluster. This specifies the version of kubectl to use
      kubectlLayer: new KubectlV28Layer(this, 'kubectl'),

      // Create a new KMS key for encrypting Kubernetes secrets, enhancing the security of sensitive data in your cluster
      secretsEncryptionKey: new kms.Key(this, 'EKS-Secrets-Encryption-Key', {
        enableKeyRotation: true, // Automatically rotate the encryption key to improve security
        description: 'EKS Secrets Encryption Key', // A clear description of the key's purpose
        alias: `EKS-Secrets-Encryption-Key-${defaultNodeGroup.clusterName}`, // A unique alias for the key, incorporating the cluster name for easy identification
      }),

      // Set the name of the cluster, using the clusterName property from defaultNodeGroup
      clusterName: defaultNodeGroup.clusterName,

      // Enable logging for various Kubernetes components to help with monitoring and troubleshooting
      clusterLogging: [
        eks.ClusterLoggingTypes.API,
        eks.ClusterLoggingTypes.AUDIT,
        eks.ClusterLoggingTypes.AUTHENTICATOR,
        eks.ClusterLoggingTypes.CONTROLLER_MANAGER,
        eks.ClusterLoggingTypes.SCHEDULER,
      ],
      // Configure the cluster's API server endpoint access. This setting allows both public and private access
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,

      // Set the default number of worker nodes in the cluster, based on the desiredSize from defaultNodeGroup
      defaultCapacity: defaultNodeGroup.desiredSize,

      // Specify the instance type for the default worker nodes, converting the instanceType from defaultNodeGroup to an ec2.InstanceType object
      defaultCapacityInstance: new ec2.InstanceType(defaultNodeGroup.instanceType.toString()),

      // Apply tags to the EKS cluster resources for organizational, billing, or management purposes
      tags: {
        'Name': `${defaultNodeGroup.clusterName}`, // Name tag with the cluster name
        'Environment': 'dev', // Example environment tag
        'Owner': 'alsandr', // Example owner tag
        ['kubernetes.io/cluster/' + defaultNodeGroup.clusterName]: 'owned', // Tag required by Kubernetes for resource management within the cluster
      },
    });


    // bottlerocket nodegroup with EBS
    const ng_bottlerocket = new eks.Nodegroup(this, 'NodegroupBottlerocket_128', {
      cluster: this.cluster,
      instanceTypes: [new ec2.InstanceType(defaultNodeGroup.instanceType.toString())],
      amiType: eks.NodegroupAmiType.BOTTLEROCKET_X86_64,
      capacityType: eks.CapacityType.SPOT,
      minSize: bottlerocketNodeGroup.minSize,
      maxSize: bottlerocketNodeGroup.maxSize,
      desiredSize: bottlerocketNodeGroup.desiredSize,
      tags: {
        'Name': `${defaultNodeGroup.clusterName}-bottlerocket`,
        ['kubernetes.io/cluster/' + defaultNodeGroup.clusterName]: 'owned',
      },
    });
    const launchTemplate = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        blockDeviceMappings: [
          {
            deviceName: '/dev/xvda',
            ebs: {
              volumeSize: 5,
              deleteOnTermination: true,
              volumeType: 'gp2',
            },
          },
        ],
      },
    });
   
    // Bottlerocket nodegroup
    const ng_bottlerocket_ebs = new eks.Nodegroup(this, 'NodegroupBottlerocketEBS_128', {
      cluster: this.cluster,
      instanceTypes: [new ec2.InstanceType(defaultNodeGroup.instanceType.toString())],
      amiType: eks.NodegroupAmiType.BOTTLEROCKET_X86_64,
      capacityType: eks.CapacityType.SPOT,
      minSize: bottlerocketNodeGroup.minSize,
      maxSize: bottlerocketNodeGroup.maxSize,
      desiredSize: bottlerocketNodeGroup.desiredSize,
      launchTemplateSpec: {
        id: launchTemplate.ref,
        version: launchTemplate.attrLatestVersionNumber,
      },
      tags: {
        'Name': `${defaultNodeGroup.clusterName}-bottlerocket-ebs`,
        ['kubernetes.io/cluster/' + defaultNodeGroup.clusterName]: 'owned',
      },
    });
    


    // Helm charts deployment
    // Single chart 
    // this.cluster.addHelmChart('Prometheus', {
    //   chart: 'kube-prometheus-stack',
    //   repository: 'https://prometheus-community.github.io/helm-charts',
    //   namespace: 'prometheus',
    //   release: 'prometheus',
    //   version: '60.4.0',
    //   wait: false,
    //   values: {},
    // });
    // this.cluster.addHelmChart('ArgoCD', {
    //   chart: 'argo-cd',
    //   repository: 'https://argoproj.github.io/argo-helm',
    //   namespace: 'argocd',
    //   release: 'argocd',
    //   version: '7.3.9',
    //   wait: false,
    //   timeout: cdk.Duration.minutes(15),
    //   values: {
    //       configs:{
    //           params: {
    //               server: {
    //                   insecure: true
    //               }
    //           }
    //       }
    //   },
    // });
    // Multiple charts
    
    // Read the context value
    // --context deployHelmCharts=true
    const deployHelmCharts = this.node.tryGetContext('deployHelmCharts') ?? false;

    if (deployHelmCharts) {
      helmCharts.forEach((chart) => {
          this.cluster.addHelmChart(chart.release, {
          chart: chart.chart,
          repository: chart.repository,
          namespace: chart.namespace,
          version: chart.version,
          wait: chart.wait,
          timeout: chart.timeout,
          values: chart.values,
        });
      });
    }
    // Cluster role and auth configurations
    const eksClusterRole = this.cluster.role;
    eksClusterRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSVPCResourceController'));
    this.cluster.awsAuth.addMastersRole(iam.Role.fromRoleArn(this, 'ExistingRole', eksClusterRole.roleArn, { mutable: true }));
    this.cluster.awsAuth.addUserMapping(iam.User.fromUserName(this, 'ExistingUser', 'awsalsandr'), { username: 'awsalsandr', groups: ['system:masters'] });

    // OIDC and cluster name to SSM parameters
    // new ssm.StringParameter(this, 'OIDCProvider', { parameterName: '/eks/oidc/provider', stringValue: this.cluster.openIdConnectProvider?.openIdConnectProviderArn?.toString() ?? '' });
    // new ssm.StringParameter(this, 'ClusterName', { parameterName: '/eks/cluster/name', stringValue: this.cluster.clusterName });
  }
}
