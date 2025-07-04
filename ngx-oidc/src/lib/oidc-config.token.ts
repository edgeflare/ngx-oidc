import { InjectionToken } from "@angular/core";
import { UserManagerSettings } from "oidc-client-ts";

export const OIDC_CONFIG_TOKEN = new InjectionToken<UserManagerSettings>('OIDC_CONFIG');
