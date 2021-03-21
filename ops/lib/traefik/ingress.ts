export const ingressControllerConfig = {
  chart: "traefik",
  repository: "https://helm.traefik.io/traefik",
  namespace: "traefik",
  values: {
    ingressRoute: {
      dashboard: {
        enabled: true,
      },
    },
    ports: {
      web: {
        redirectTo: "websecure",
      },
    },
    service: {
      annotations: {
        "service.beta.kubernetes.io/aws-load-balancer-type": "nlb",
        "service.beta.kubernetes.io/aws-load-balancer-ssl-cert": "<your-dynamically-created-wildcard-certificate-arn>",
        "service.beta.kubernetes.io/aws-load-balancer-ssl-ports": "443",
      },
      spec: {
        externalTrafficPolicy: "Cluster",
      },
    },
  },
};

