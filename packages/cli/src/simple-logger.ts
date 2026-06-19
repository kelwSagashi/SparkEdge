import { Service } from "spark-edge-di";

@Service()
export class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}
