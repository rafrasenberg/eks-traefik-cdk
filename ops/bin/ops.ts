#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { OpsStack } from '../lib/ops-stack';
import { envEU } from "../lib/constants"

const app = new cdk.App();
new OpsStack(app, 'OpsStack', { env: envEU });
