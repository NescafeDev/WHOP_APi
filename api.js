import { WhopServerSdk } from "@whop/api";

export const whop = WhopServerSdk({
  appId: process.env.WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  companyId: process.env.WHOP_COMPANY_ID,
});