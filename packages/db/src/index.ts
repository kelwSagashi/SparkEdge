import {db, Tables} from './entity';
export * from './services';

try {
const result = db.select().from(Tables.ServersTable).all();
console.log(result)
} catch (e) {
    console.log(e)
}