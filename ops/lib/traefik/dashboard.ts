import { hostedZone, traefikNamespace, traefikBasicAuthString } from "../constants";

export const dashboardAuth = {
  apiVersion: "v1",
  kind: "Secret",
  metadata: {
    name: "traefik-dashboard-basicauth-secret",
    namespace: traefikNamespace,
  },
  data: {
    users: traefikBasicAuthString,
  },
};

export const dashboardMiddleware = {
  apiVersion: "traefik.containo.us/v1alpha1",
  kind: "Middleware",
  metadata: {
    name: "traefik-dashboard-basicauth",
    namespace: traefikNamespace,
  },
  spec: {
    basicAuth: {
      secret: dashboardAuth.metadata.name,
    },
  },
};

export const dashboardIngressRoute = {
  apiVersion: "traefik.containo.us/v1alpha1",
  kind: "IngressRoute",
  metadata: {
    name: "traefik-dashboard",
    namespace: traefikNamespace,
  },
  spec: {
    entrypoints: ["websecure"],
    routes: [
      {
        kind: "Rule",
        match: `Host("traefik.${hostedZone}")`,
        middlewares: [
          {
            name: dashboardMiddleware.metadata.name,
            namespace: traefikNamespace,
          },
        ],
        services: [
          {
            kind: "TraefikService",
            name: "api@internal",
          },
        ],
      },
    ],
  },
};
