import { WhopServerSdk } from "@whop/api";

export const whop = WhopServerSdk({
  appId: "app_Fn5FUvON6J4bM2",
  appApiKey: "mPGFgOTzxHHuCfJgrcolQtEa6sQa2ikOnO4sOg4CvT8",
  onBehalfOfUserId: "user_7Uv6sK6Czt1bn",
  companyId: "biz_Lt8j3jKB0MLRx7"
  // companyId: process.env.WHOP_COMPANY_ID,
});