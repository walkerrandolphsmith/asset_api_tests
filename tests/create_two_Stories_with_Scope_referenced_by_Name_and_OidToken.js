"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asset_api_helper_1 = require("../lib/asset-api-helper");
const commands = [
    {
        type: 'yaml',
        payload: `
AssetType: Story
Name: My First Story
Scope: System (All Projects)
---
AssetType: Story
Name: My Second Story
Scope: Scope:0
`
    },
    {
        type: 'json',
        payload: `
[
    {
      "AssetType": "Story",
      "Name": "My First Story",
      "Scope": "System (All Projects)"
    },
    {
      "AssetType": "Story",
      "Name": "My Second Story",
      "Scope": "Scope:0"
    }
]
`
    }
];
for (const command of commands) {
    asset_api_helper_1.test(`Create two Stories with Scope referenced by Name and OidToken (${command.type})`, async (t) => {
        const res = await asset_api_helper_1.assetApiPost(command.payload, command.type);
        t.is(res.status, 200, "Expected 200 OK");
        t.is(res.data.assetsCreated.count, 2, "Expected 2 Assets to be created");
        const [firstAssetOidToken, secondAssetOidToken] = res.data.assetsCreated.oidTokens;
        const query = `
from: Story
filter:
- ID='${firstAssetOidToken}','${secondAssetOidToken}'
select:
- Name
- Scope.Name
- Scope.ID
`;
        const verifyExpectation = [[
                {
                    "_oid": firstAssetOidToken,
                    "Name": "My First Story",
                    "Scope.Name": "System (All Projects)",
                    "Scope.ID": {
                        "_oid": "Scope:0"
                    }
                },
                {
                    "_oid": secondAssetOidToken,
                    "Name": "My Second Story",
                    "Scope.Name": "System (All Projects)",
                    "Scope.ID": {
                        "_oid": "Scope:0"
                    }
                }
            ]];
        const verfication = await asset_api_helper_1.assetApiPost(query);
        t.deepEqual(verfication.data.queryResult.results, verifyExpectation);
    });
}
//# sourceMappingURL=create_two_Stories_with_Scope_referenced_by_Name_and_OidToken.js.map