"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asset_api_helper_1 = require("../lib/asset-api-helper");
const types = ['yaml', 'json'];
for (const type of types) {
    asset_api_helper_1.test(`Update Owners relational Attribute on single Story, adding two new owners by OIDToken (${type})`, async (t) => {
        const setupCommand = `
from: Story
where:
 Scope.Name: Add two owners
execute: Delete
---
from: Scope
where:
 Name: Add two owners
execute: Delete
---
from: Member
where:
 Name: User3
execute: Delete
---
AssetType: Scope
Name: Add two owners
Parent: Scope:0
BeginDate: ${new Date().toJSON()}
Workitems:
- AssetType: Story
  Name: I need an Owner!
---
AssetType: Member
Name: User3
Password: User3
Nickname: User3
Username: User3
DefaultRole: Role.Name'Project Admin
Scopes: Add two owners
`;
        let res = await asset_api_helper_1.assetApiPost(setupCommand);
        t.is(res.status, 200, "Expected 200 OK");
        t.is(res.data.assetsCreated.count, 3, "Expected 3 Assets to be created");
        const [scopeOidToken, firstStoryOidToken, memberOidToken] = res.data.assetsCreated.oidTokens;
        // TODO: don't hardcode the Member:1040
        const commands = {
            yaml: `
from: ${firstStoryOidToken}
update:
 Owners:
 - Member:20
 - ${memberOidToken}
`,
            json: `
{
    "from": "${firstStoryOidToken}",
    "update": {
        "Owners": [
            "Member:20",
            "${memberOidToken}"
        ]
    }
}
`
        };
        const payload = commands[type];
        res = await asset_api_helper_1.assetApiPost(payload, type);
        t.is(res.status, 200, "Expected 200 OK");
        t.is(res.data.assetsModified.count, 1, "Expected 1 Assets to be modified");
        const query = `
from: ${firstStoryOidToken}
select:
- Owners
`;
        const verifyExpectation = [[
                {
                    "_oid": firstStoryOidToken,
                    "Owners": [{
                            "_oid": "Member:20"
                        },
                        {
                            "_oid": memberOidToken
                        }
                    ]
                }
            ]];
        const verfication = await asset_api_helper_1.assetApiPost(query);
        t.deepEqual(verfication.data.queryResult.results, verifyExpectation);
    });
}
//# sourceMappingURL=update_Owners_relational_Attribute_on_single_Story_adding_two_new_owner_by_OIDToken.js.map