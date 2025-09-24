# Vercel Deployment Fix - Bundle Size Issue

## Completed Steps

- [x] **Analyze the issue**: Identified that Solana libraries (`@solana/web3.js` and `@solana/spl-token`) in `lib/solana.ts` and used in `app/api/reward/route.ts` are causing the bundle size to exceed 250 MB.
- [x] **Update API route**: Modified `app/api/reward/route.ts` to remove Solana logic and deprecate the endpoint since minting is now handled client-side.
- [x] **Update Solana utilities**: Refactored `lib/solana.ts` to include client-side compatible functions and added a mock `mintRewardToWallet` function.
- [x] **Update frontend component**: Modified `components/GamePanel.tsx` to import and use the client-side minting function in the `claimReward` function.

## Next Steps

- [ ] **Test the changes**: Run the development server and test the reward claiming functionality to ensure it works without the API route.
- [ ] **Deploy to Vercel**: Attempt to deploy the updated code to Vercel and verify that the bundle size issue is resolved.
- [ ] **Implement real minting**: Replace the mock `mintRewardToWallet` function with actual Solana program interaction if needed.
- [ ] **Add Vercel configuration**: If further optimizations are needed, create a `vercel.json` file to configure function settings.

## Notes

- The Solana libraries are still in `package.json` and used in client-side code, but they won't be bundled into serverless functions anymore.
- The `mintRewardToWallet` function is currently a mock. In a production environment, you'd need to implement proper minting logic, possibly by calling a Solana program or using a backend service.
