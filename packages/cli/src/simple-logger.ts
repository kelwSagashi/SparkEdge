import { Service } from "@nmg8/di";

@Service()
export class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}