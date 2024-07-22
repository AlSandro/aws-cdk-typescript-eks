#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkEksClusterStack } from '../lib/cdk-eks-cluster-stack';
import { defaultCdkEksClusterStackProps, bottlerocketNodeGroup } from '../lib/props';

const app = new cdk.App();

// stack for the EKS cluster
new CdkEksClusterStack(app, 'eks-cluster', defaultCdkEksClusterStackProps, bottlerocketNodeGroup);

app.synth();