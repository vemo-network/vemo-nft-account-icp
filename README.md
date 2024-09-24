# Vemo NFT Account Frontend
This is FE of NFT Account module, refer here for more information https://docs.vemo.network/

ICP prod link: https://2lb5e-kqaaa-aaaag-ameva-cai.icp0.io/

## 🚀 Deploy

# In a new terminal window:
```bash
dfx deploy # Deploy smart contract locally
```

The smart contract will be reachable under `http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943`.
Call the smart contract using `curl` on the command line: 

```bash
# contacts endpoint
curl http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943/contacts
# price-oracle endpoint
curl -X POST http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943/price-oracle -H 'content-type: application/json' -d '{"pair": "ICP-USD"}'
```
You can also use tools like Postman or HTTPie to interact with the smart contract.
To redeploy the smart contract, run `dfx deploy` again.

When ready, run `dfx deploy --ic` to deploy your application to the ICP mainnet.
The command will print a different canister URL for mainnet, ending in `.raw.icp0.io`.
You can make calls to the smart contract on mainnet just like to the local one!

## 🛠️ Technology Stack

- [Azle CDK](https://demergent-labs.github.io/azle/): the Canister Development Kit for JS/TS
- [Vite](https://vitejs.dev/): high-performance tooling for front-end web development
- [React](https://reactjs.org/): a component-based UI library
- [TypeScript](https://www.typescriptlang.org/): JavaScript extended with syntax for types
- [Sass](https://sass-lang.com/): an extended syntax for CSS stylesheets

## 📚 Documentation

- [Azle book](https://demergent-labs.github.io/azle/the_azle_book.html)
- [Internet Computer docs](https://internetcomputer.org/docs/current/developer-docs/ic-overview)
- [Internet Computer wiki](https://wiki.internetcomputer.org/)
- [Internet Computer forum](https://forum.dfinity.org/)
- [Vite developer docs](https://vitejs.dev/guide/)
- [React quick start guide](https://react.dev/learn)
- [`dfx.json` reference schema](https://internetcomputer.org/docs/current/references/dfx-json-reference/)
- [Developer Experience Feedback Board](https://dx.internetcomputer.org/)


## 💡 Tips and Tricks

- When developing remotely, navigating to the canister's frontend in the browser will not work.
Use `curl` on the command line instead, or develop locally.

- Note that you might need to disable CORS in your browser to make backend calls from `localhost`.
For example, for Chrome, run `open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security`
 to disable CORS.

- If you get an error "Error: An error happened during communication with the replica: ... Connection refused", run `dfx start --clean` to start dfx.
