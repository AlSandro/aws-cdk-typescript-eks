import * as cdk from 'aws-cdk-lib';
// import props
import { CdkEksClusterStackProps, defaultCdkEksClusterStackProps } from './props';


interface HelmChart {
  chart: string;
  repository?: string;
  namespace: string;
  release: string;
  version: string;
  wait: boolean;
  timeout?: cdk.Duration;
  values?: { [key: string]: any };
}

const helmCharts: HelmChart[] = [

    {
    chart: './charts/wiremock',
    namespace: 'wiremock',
    release: 'wiremock',
    version: '9.4.1',
    wait: false,
    timeout: cdk.Duration.minutes(15),
    }
    ,
    {
    chart: 'kube-prometheus-stack',
    repository: 'https://prometheus-community.github.io/helm-charts',
    namespace: 'prometheus',
    release: 'prometheus',
    version: '60.4.0',
    wait: false,
    timeout: cdk.Duration.minutes(15),
    }, 
    {
    chart: 'argo-cd',
    repository: 'https://argoproj.github.io/argo-helm',
    namespace: 'argocd',
    release: 'argocd',
    version: '7.3.9',
    wait: false,
    timeout: cdk.Duration.minutes(15),
    values: {
        configs:{
            params: {
                server: {
                    insecure: true
                }
            }
        },
    },
  },

  // cluster autoscaler
//   {
//      chart: 'cluster-autoscaler',
//     release: 'cluster-autoscaler',
//     namespace: 'kube-system',
//     repository: 'https://kubernetes.github.io/autoscaler',
//     version: '9.28.0',
//     values: {
//       autoDiscovery: {
//         clusterName: `${defaultCdkEksClusterStackProps.clusterName}`,
//       },
//       'node-group-auto-discovery': `k8s.io/cluster-autoscaler/${defaultCdkEksClusterStackProps.clusterName},'k8s.io/cluster-autoscaler/enabled'`,
//       awsRegion: `${defaultCdkEksClusterStackProps.region}`,
//       rbac: {
//         create: 'true',
//         serviceAccount: {
//           create: false,
//           name: 'cluster-autoscaler',
//         },
//       },
//     },
//     wait: true,
//     timeout: (cdk.Duration.minutes(15)),
//   },   
  // Secrets Store CSI driver
//   {
//     chart: 'secrets-store-csi-driver',
//     repository: 'https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts',
//     namespace: 'kube-system',
//     release: 'secrets-store-csi-driver',
//     version: '1.3.3',
//     values: {
//     syncSecret: {
//       enabled: true
//     },
//     enableSecretRotation: true,
//     enableSecretRotationWebhook: true,
//   },
//     wait: true,
//     timeout: cdk.Duration.minutes(15),
//   },
  // Secrets Store AWS Provider
//   {
//     chart: 'secrets-store-csi-driver-provider-aws',
//     repository: 'https://aws.github.io/secrets-store-csi-driver-provider-aws',
//     namespace: 'kube-system',
//     release: 'secrets-store-csi-driver-provider-aws',
//     version: '0.3.3',
//     wait: true,
//     timeout: cdk.Duration.minutes(15),
//   },
  // metrics-server
//   {
//     chart: 'metrics-server',
//     release: 'metrics-server',
//     namespace: 'kube-system',
//     repository: 'https://kubernetes-sigs.github.io/metrics-server/',
//     version: '3.10.0',
//     wait: true,
//     timeout: (cdk.Duration.minutes(15)),
//   },
];

export { helmCharts };
