import { db, Tables } from "../db";
import { DefaultServerTypes } from "types";
async function main() {

    for (const serverType of DefaultServerTypes) {
        await db.insert(Tables.ServerTypesTable)
            .values(serverType).onConflictDoUpdate({
                target: Tables.ServerTypesTable.id,
                set: serverType,
            }).run();
    }
}

main().catch((error) => {
    console.error("Error running seed:", error);
});
