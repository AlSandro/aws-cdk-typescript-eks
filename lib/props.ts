// props for infrastructure

// Path: lib/cdk-eks-cluster-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';

export interface CdkEksClusterStackProps extends cdk.StackProps {
    vpcName: string;
    vpcCidr: string;
    maxAzs: number;
    region: string;
    clusterName: string;
    publicSubnetCidrMask: number;
    privateSubnetCidrMask: number;
    eksVersion: eks.KubernetesVersion;
    instanceType: ec2.InstanceType;
    minSize: number;
    maxSize: number;
    desiredSize: number;
}

export interface bottlerocketNodeGroup extends cdk.StackProps {
    vpcName: string;
    vpcCidr: string;
    maxAzs: number;
    region: string;
    clusterName: string;
    publicSubnetCidrMask: number;
    privateSubnetCidrMask: number;
    eksVersion: eks.KubernetesVersion;
    instanceType: ec2.InstanceType;
    minSize: number;
    maxSize: number;
    desiredSize: number;
}
export interface IStackTags {
    [key: string]: string;
}

export const defaultStackTags: IStackTags = {
    'eks:cluster-name': 'eks-cluster-alsandr',
    'eks:nodegroup-name': 'eks-nodegroup-1',
    'org': 'alsandr',
};

export const bottlerocketNodeGroup: bottlerocketNodeGroup = {
    vpcName: 'eks-vpc',
    vpcCidr: '10.0.0.0/20',
    region: 'us-west-2',
    maxAzs: 2,
    clusterName: 'eks-cluster-alsandr',
    publicSubnetCidrMask: 24,
    privateSubnetCidrMask: 24,
    eksVersion: eks.KubernetesVersion.V1_28,
    instanceType: new ec2.InstanceType('t2.micro'),
    minSize: 3,
    maxSize: 7,
    desiredSize: 6,
}; 

export const defaultCdkEksClusterStackProps: CdkEksClusterStackProps = {
    vpcName: 'eks-vpc',
    vpcCidr: '10.0.0.0/20',
    region: 'us-west-2',
    maxAzs: 2,
    clusterName: 'eks-cluster-alsandr',
    publicSubnetCidrMask: 24,
    privateSubnetCidrMask: 24,
    eksVersion: eks.KubernetesVersion.V1_28,
    instanceType: new ec2.InstanceType('t2.micro'),
    minSize: 3,
    maxSize: 7,
    desiredSize: 6,
};


