import { WhopServerSdk } from "@whop/api";

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});