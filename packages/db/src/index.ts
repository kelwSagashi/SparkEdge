import {db, Tables} from './schema';

try {
const result = db.select().from(Tables.ServersTable).all();
console.log(result)
} catch (e) {
    console.log(e)
}