import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as ec2 from "@aws-cdk/aws-ec2";

import { ingressControllerConfig } from "./traefik/ingress";
import { dashboardIngressRoute, dashboardMiddleware, dashboardAuth } from "./traefik/dashboard";
import { hostedZone } from "./constants";

export class OpsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lookup hosted zone
    const zone = route53.HostedZone.fromLookup(this, "MyCoolHostedZone", { domainName: hostedZone });

    // Create a wildcard certificate for our hosted zone
    const cert = new acm.Certificate(this, "MySecureWildcardCert", {
      domainName: `*.${hostedZone}`,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    // New VPC
    const vpc = new ec2.Vpc(this, "MyAwesomeVPC", { maxAzs: 2, natGateways: 1 });

    // Provision an EKS cluster
    const cluster = new eks.Cluster(this, "MySuperCluster", {
      version: eks.KubernetesVersion.V1_19,
      vpc,
    });

    // Pass certificate to Traefik Ingress configuration and add Helm chart
    ingressControllerConfig.values.service.annotations["service.beta.kubernetes.io/aws-load-balancer-ssl-cert"] =
      cert.certificateArn;
    const controller = cluster.addHelmChart("MyTraefikIngress", ingressControllerConfig);

    // Add middleware with dependency to make sure the Ingress is ready
    const middleware = cluster.addManifest("TraefikMiddleWare", dashboardAuth, dashboardMiddleware);
    middleware.node.addDependency(controller);

    // Add the Traefik dashboard Ingress route & dependency on middleware
    const dashboard = cluster.addManifest("TraefikDashboard", dashboardIngressRoute);
    dashboard.node.addDependency(middleware);
  }
}
